package main

import (
	"fmt"
	"log"
	"net/http"
	"time"
)

func main() {
	// Initialize WebSocket hub, log hub, and node store
	hub := NewWSHub()
	logHub := NewLogHub()
	store := NewNodeStore()

	// Create local node (your machine in Orlando)
	localNode := &NetworkNode{
		ID:       "local",
		Name:     "Local Machine (Orlando)",
		IPAddress: "192.168.1.192", // Your local IP
		Type:     "endpoint",
		Location: Location{Lat: 28.5383, Lng: -81.3792}, // Orlando coordinates
		Status:   "online",
		Connections: 0,
		FirstSeen: time.Now(),
		LastSeen:  time.Now(),
	}
	store.Nodes["local"] = localNode

	// Start WebSocket hubs in background
	go hub.Run()
	go logHub.Run()

	// Start monitoring loop in background
	go monitorConnections(hub, logHub, store)

	// Set up HTTP routes
	http.HandleFunc("/ws", HandleWebSocket(hub, store))
	http.HandleFunc("/logs", HandleLogStream(logHub))
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Start HTTP server
	log.Println("NetOps backend starting on :8081")
	log.Println("WebSocket endpoint: ws://localhost:8081/ws")
	log.Println("Log stream endpoint: ws://localhost:8081/logs")
	logHub.BroadcastLog("info", "NetOps backend started on :8081")
	if err := http.ListenAndServe(":8081", nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

// monitorConnections periodically scans network connections
func monitorConnections(hub *WSHub, logHub *LogHub, store *NodeStore) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	log.Println("Network monitoring started (scanning every 5 seconds)")
	logHub.BroadcastLog("info", "Network monitoring started (scanning every 5 seconds)")

	for range ticker.C {
		connections, err := CaptureConnections()
		if err != nil {
			errMsg := fmt.Sprintf("Failed to capture connections: %v", err)
			log.Printf(errMsg)
			logHub.BroadcastLog("error", errMsg)
			continue
		}

		statusMsg := fmt.Sprintf("Found %d active connections", len(connections))
		log.Printf(statusMsg)
		logHub.BroadcastLog("info", statusMsg)

		// Track which IPs we've seen this scan and count connections per IP
		seenIPs := make(map[string]int) // IP -> connection count

		// Process each connection
		for _, conn := range connections {
			ip := conn.RemoteIP
			seenIPs[ip]++

			// Check if we already have this node
			if node, exists := store.Nodes[ip]; exists {
				// Update existing node
				node.LastSeen = time.Now()
				node.Status = "online"
				if conn.Process != "" && node.Process == "" {
					node.Process = conn.Process
				}
			} else {
				// New node - perform GeoIP lookup
				discoveryMsg := fmt.Sprintf("Discovering new node: %s", ip)
				log.Printf(discoveryMsg)
				logHub.BroadcastLog("info", discoveryMsg)

				geoInfo, err := LookupGeoIP(ip)
				if err != nil {
					errMsg := fmt.Sprintf("GeoIP lookup failed for %s: %v", ip, err)
					log.Printf(errMsg)
					logHub.BroadcastLog("warn", errMsg)
					continue
				}

				// Classify node type
				nodeType := ClassifyNode(conn.RemotePort, geoInfo.ASN, geoInfo.Owner, geoInfo.Hostname)

				// Create new node
				node := &NetworkNode{
					ID:          ip,
					Name:        GetNodeName(geoInfo),
					IPAddress:   ip,
					Type:        nodeType,
					Location:    geoInfo.Location,
					Owner:       geoInfo.Owner,
					ASN:         geoInfo.ASN,
					Status:      "online",
					Connections: 1,
					Process:     conn.Process,
					FirstSeen:   time.Now(),
					LastSeen:    time.Now(),
				}

				// Add to store
				store.Nodes[ip] = node

				// Broadcast to clients
				nodeMsg := fmt.Sprintf("New node added: %s (%s) - %s", node.Name, node.IPAddress, node.Type)
				log.Printf(nodeMsg)
				logHub.BroadcastLog("info", nodeMsg)
				hub.BroadcastNodeAdd(node)
			}
		}

		// Update connection counts and build connection list
		wsConnections := []WSConnection{}
		for ip, count := range seenIPs {
			if node, exists := store.Nodes[ip]; exists {
				node.Connections = count
				// Create connection from local to this node
				wsConnections = append(wsConnections, WSConnection{
					From: "local",
					To:   ip,
				})
			}
		}

		// Broadcast updated state with connections
		hub.BroadcastConnectionUpdate(wsConnections)

		// Mark nodes as offline if not seen
		now := time.Now()
		for ip, node := range store.Nodes {
			if ip == "local" {
				continue // Skip local node
			}
			if _, seen := seenIPs[ip]; !seen {
				// If not seen for 30 seconds, mark as offline
				if now.Sub(node.LastSeen) > 30*time.Second {
					if node.Status != "offline" {
						node.Status = "offline"
						hub.BroadcastNodeUpdate(node)
						offlineMsg := fmt.Sprintf("Node marked offline: %s (%s)", node.Name, node.IPAddress)
						log.Printf(offlineMsg)
						logHub.BroadcastLog("warn", offlineMsg)
					}

					// If offline for 5 minutes, remove it
					if now.Sub(node.LastSeen) > 5*time.Minute {
						delete(store.Nodes, ip)
						hub.BroadcastNodeRemove(ip)
						removeMsg := fmt.Sprintf("Node removed: %s (%s)", node.Name, node.IPAddress)
						log.Printf(removeMsg)
						logHub.BroadcastLog("warn", removeMsg)
					}
				}
			}
		}
	}
}
