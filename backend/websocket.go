package main

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for development
	},
}

// WSHub manages WebSocket connections
type WSHub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan WSMessage
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.RWMutex
}

func NewWSHub() *WSHub {
	return &WSHub{
		clients:    make(map[*websocket.Conn]bool),
		broadcast:  make(chan WSMessage, 256),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
	}
}

// Run starts the WebSocket hub
func (h *WSHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client connected. Total clients: %d", len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
			}
			h.mu.Unlock()
			log.Printf("Client disconnected. Total clients: %d", len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				err := client.WriteJSON(message)
				if err != nil {
					log.Printf("Error sending to client: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// BroadcastNodeAdd sends node_add message
func (h *WSHub) BroadcastNodeAdd(node *NetworkNode) {
	h.broadcast <- WSMessage{
		Type: "node_add",
		Node: node,
	}
}

// BroadcastNodeUpdate sends node_update message
func (h *WSHub) BroadcastNodeUpdate(node *NetworkNode) {
	h.broadcast <- WSMessage{
		Type: "node_update",
		Node: node,
	}
}

// BroadcastNodeRemove sends node_remove message
func (h *WSHub) BroadcastNodeRemove(id string) {
	h.broadcast <- WSMessage{
		Type: "node_remove",
		ID:   id,
	}
}

// BroadcastConnectionUpdate sends connection update message
func (h *WSHub) BroadcastConnectionUpdate(connections []WSConnection) {
	h.broadcast <- WSMessage{
		Type:        "connections_update",
		Connections: connections,
	}
}

// HandleWebSocket handles WebSocket connections
func HandleWebSocket(hub *WSHub, store *NodeStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Printf("WebSocket upgrade failed: %v", err)
			return
		}

		// Register new client
		hub.register <- conn

		// Send initial state
		nodes := make([]*NetworkNode, 0, len(store.Nodes))
		for _, node := range store.Nodes {
			nodes = append(nodes, node)
		}

		initialState := struct {
			Type  string         `json:"type"`
			Nodes []*NetworkNode `json:"nodes"`
		}{
			Type:  "initial_state",
			Nodes: nodes,
		}

		if err := conn.WriteJSON(initialState); err != nil {
			log.Printf("Error sending initial state: %v", err)
			hub.unregister <- conn
			return
		}

		// Keep connection alive and handle close
		go func() {
			defer func() {
				hub.unregister <- conn
			}()

			for {
				_, _, err := conn.ReadMessage()
				if err != nil {
					break
				}
			}
		}()
	}
}
