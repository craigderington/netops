package main

import "strings"

// ClassifyNode determines the type of network node
func ClassifyNode(port int, asn, owner, hostname string) string {
	// Normalize for comparison
	asnLower := strings.ToLower(asn + " " + owner)
	hostLower := strings.ToLower(hostname)

	// Cloud providers
	if strings.Contains(asnLower, "amazon") || strings.Contains(hostLower, "amazonaws") || strings.Contains(asnLower, "aws") {
		return "server" // AWS cloud server
	}
	if strings.Contains(asnLower, "google") && (strings.Contains(hostLower, "google") || strings.Contains(asnLower, "cloud")) {
		return "server" // Google Cloud
	}
	if strings.Contains(asnLower, "microsoft") && strings.Contains(asnLower, "azure") {
		return "server" // Azure
	}

	// CDN providers
	if strings.Contains(asnLower, "cloudflare") {
		return "load-balancer" // Cloudflare CDN
	}
	if strings.Contains(asnLower, "akamai") {
		return "load-balancer" // Akamai CDN
	}
	if strings.Contains(asnLower, "fastly") {
		return "load-balancer" // Fastly CDN
	}

	// By port
	switch port {
	case 22:
		return "firewall" // SSH
	case 53:
		return "router" // DNS
	case 80, 8080, 3000, 5000, 8000:
		return "server" // HTTP
	case 443, 8443:
		return "server" // HTTPS
	case 3306, 5432, 27017, 6379:
		return "server" // Databases
	case 25, 587, 465, 143, 993, 110, 995:
		return "server" // Mail
	}

	// Default
	return "server"
}

// GetNodeIcon returns emoji icon for node type
func GetNodeIcon(nodeType string) string {
	switch nodeType {
	case "server":
		return "🖥️"
	case "firewall":
		return "🛡️"
	case "router":
		return "📡"
	case "switch":
		return "🔀"
	case "endpoint":
		return "💻"
	case "load-balancer":
		return "⚖️"
	default:
		return "🖥️"
	}
}
