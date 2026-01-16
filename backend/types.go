package main

import "time"

// Connection represents a network connection
type Connection struct {
	LocalIP    string `json:"localIp"`
	LocalPort  int    `json:"localPort"`
	RemoteIP   string `json:"remoteIp"`
	RemotePort int    `json:"remotePort"`
	State      string `json:"state"`
	Process    string `json:"process,omitempty"`
}

// Location represents geographic coordinates
type Location struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// NetworkNode represents a discovered network endpoint
type NetworkNode struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	IPAddress   string    `json:"ipAddress"`
	Type        string    `json:"type"`
	Location    Location  `json:"location"`
	Owner       string    `json:"owner,omitempty"`
	ASN         string    `json:"asn,omitempty"`
	Status      string    `json:"status"`
	Connections int       `json:"connections"`
	Process     string    `json:"process,omitempty"`
	FirstSeen   time.Time `json:"firstSeen"`
	LastSeen    time.Time `json:"lastSeen"`
}

// WSMessage represents a WebSocket message
type WSMessage struct {
	Type        string         `json:"type"`
	Node        *NetworkNode   `json:"node,omitempty"`
	Nodes       []*NetworkNode `json:"nodes,omitempty"`
	Connections []WSConnection `json:"connections,omitempty"`
	ID          string         `json:"id,omitempty"`
}

// WSConnection represents a connection relationship
type WSConnection struct {
	From string `json:"from"` // node id
	To   string `json:"to"`   // node id
}

// NodeStore manages active nodes
type NodeStore struct {
	Nodes map[string]*NetworkNode
}

func NewNodeStore() *NodeStore {
	return &NodeStore{
		Nodes: make(map[string]*NetworkNode),
	}
}

// LogMessage represents a log entry to be sent to clients
type LogMessage struct {
	Level   string `json:"level"`   // info, warn, error
	Message string `json:"message"` // log message
}
