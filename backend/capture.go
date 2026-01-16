package main

import (
	"bufio"
	"fmt"
	"net"
	"os/exec"
	"strconv"
	"strings"
)

// CaptureConnections captures active network connections
func CaptureConnections() ([]Connection, error) {
	// Use ss (socket statistics) to get connections
	// ss is the modern replacement for netstat on Linux
	cmd := exec.Command("ss", "-tan")
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("ss command failed: %w", err)
	}

	connections := []Connection{}
	scanner := bufio.NewScanner(strings.NewReader(string(output)))

	lineCount := 0
	parsedCount := 0
	includedCount := 0

	for scanner.Scan() {
		line := scanner.Text()
		lineCount++

		// Skip header line
		if strings.Contains(line, "State") && strings.Contains(line, "Recv-Q") {
			continue
		}

		// Skip lines without addresses
		if !strings.Contains(line, ":") {
			continue
		}

		conn := parseNetstatLine(line)
		if conn != nil {
			parsedCount++
			if shouldInclude(conn) {
				connections = append(connections, *conn)
				includedCount++
			}
		}
	}

	fmt.Printf("Debug: processed %d lines, parsed %d connections, included %d after filtering\n", lineCount, parsedCount, includedCount)

	return connections, nil
}

// parseNetstatLine parses a ss (socket statistics) output line
func parseNetstatLine(line string) *Connection {
	fields := strings.Fields(line)
	if len(fields) < 5 {
		return nil
	}

	// ss output format:
	// State Recv-Q Send-Q Local-Address:Port Peer-Address:Port
	// Example: ESTAB 0 0 192.168.1.192:37518 34.107.243.93:443
	state := fields[0]
	localAddr := fields[3]
	remoteAddr := fields[4]

	// Skip if no addresses
	if localAddr == "" || remoteAddr == "" {
		return nil
	}

	localIP, localPort := parseAddress(localAddr)
	remoteIP, remotePort := parseAddress(remoteAddr)

	if localIP == "" || remoteIP == "" {
		return nil
	}

	return &Connection{
		LocalIP:    localIP,
		LocalPort:  localPort,
		RemoteIP:   remoteIP,
		RemotePort: remotePort,
		State:      state,
	}
}

// parseAddress splits IP:port or IP.port
func parseAddress(addr string) (string, int) {
	// Handle IPv6 format [ip]:port
	if strings.HasPrefix(addr, "[") {
		closeBracket := strings.Index(addr, "]")
		if closeBracket > 0 {
			ip := addr[1:closeBracket]
			portStr := strings.TrimPrefix(addr[closeBracket+1:], ":")
			port, _ := strconv.Atoi(portStr)
			return ip, port
		}
	}

	// Handle IPv4 ip:port
	lastColon := strings.LastIndex(addr, ":")
	if lastColon > 0 {
		ip := addr[:lastColon]
		portStr := addr[lastColon+1:]
		port, _ := strconv.Atoi(portStr)
		return ip, port
	}

	// Handle IPv4 ip.port (some netstat formats)
	lastDot := strings.LastIndex(addr, ".")
	if lastDot > 0 && strings.Count(addr[:lastDot], ".") == 3 {
		ip := addr[:lastDot]
		portStr := addr[lastDot+1:]
		port, _ := strconv.Atoi(portStr)
		return ip, port
	}

	return "", 0
}

// shouldInclude filters out local/private connections
func shouldInclude(conn *Connection) bool {
	// Skip localhost
	if conn.RemoteIP == "127.0.0.1" || conn.RemoteIP == "::1" || conn.RemoteIP == "localhost" {
		return false
	}

	// Skip if remote IP is empty or wildcard
	if conn.RemoteIP == "" || conn.RemoteIP == "0.0.0.0" || conn.RemoteIP == "*" || conn.RemoteIP == "::" {
		return false
	}

	// Skip private IP ranges
	ip := net.ParseIP(conn.RemoteIP)
	if ip == nil {
		return false
	}

	if isPrivateIP(ip) {
		return false
	}

	// Skip listening connections (not established)
	if strings.Contains(strings.ToUpper(conn.State), "LISTEN") {
		return false
	}

	return true
}

// isPrivateIP checks if IP is in private range
func isPrivateIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}

	// Check private IPv4 ranges
	privateRanges := []string{
		"10.0.0.0/8",
		"172.16.0.0/12",
		"192.168.0.0/16",
	}

	for _, cidr := range privateRanges {
		_, subnet, _ := net.ParseCIDR(cidr)
		if subnet != nil && subnet.Contains(ip) {
			return true
		}
	}

	return false
}
