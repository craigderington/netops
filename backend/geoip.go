package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// GeoIPCache caches GeoIP lookups
type GeoIPCache struct {
	cache map[string]*GeoIPInfo
	mu    sync.RWMutex
}

// GeoIPInfo contains geographic and network information
type GeoIPInfo struct {
	IP       string   `json:"ip"`
	City     string   `json:"city"`
	Region   string   `json:"region"`
	Country  string   `json:"country"`
	Loc      string   `json:"loc"` // "lat,lng" format
	Org      string   `json:"org"` // "AS12345 Organization Name"
	Hostname string   `json:"hostname"`
	Location Location `json:"-"`
	ASN      string   `json:"-"`
	Owner    string   `json:"-"`
}

var geoCache = &GeoIPCache{
	cache: make(map[string]*GeoIPInfo),
}

// LookupGeoIP performs GeoIP lookup using ipinfo.io
func LookupGeoIP(ip string) (*GeoIPInfo, error) {
	// Check cache first
	geoCache.mu.RLock()
	if cached, ok := geoCache.cache[ip]; ok {
		geoCache.mu.RUnlock()
		return cached, nil
	}
	geoCache.mu.RUnlock()

	// Make API request
	url := fmt.Sprintf("https://ipinfo.io/%s/json", ip)
	client := &http.Client{Timeout: 5 * time.Second}

	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("geoip lookup failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("geoip lookup returned status %d", resp.StatusCode)
	}

	var info GeoIPInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("failed to decode geoip response: %w", err)
	}

	// Parse location
	if info.Loc != "" {
		parts := strings.Split(info.Loc, ",")
		if len(parts) == 2 {
			fmt.Sscanf(parts[0], "%f", &info.Location.Lat)
			fmt.Sscanf(parts[1], "%f", &info.Location.Lng)
		}
	}

	// Parse ASN and Owner from Org field
	// Format: "AS15169 Google LLC"
	if info.Org != "" {
		parts := strings.SplitN(info.Org, " ", 2)
		if len(parts) >= 1 {
			info.ASN = parts[0]
		}
		if len(parts) >= 2 {
			info.Owner = parts[1]
		}
	}

	// Cache the result
	geoCache.mu.Lock()
	geoCache.cache[ip] = &info
	geoCache.mu.Unlock()

	return &info, nil
}

// IsIPv6 checks if an IP address is IPv6
func IsIPv6(ip string) bool {
	return strings.Contains(ip, ":")
}

// GetNodeName generates a friendly name for the node
func GetNodeName(info *GeoIPInfo) string {
	if info.Hostname != "" && !strings.Contains(info.Hostname, "unknown") {
		return info.Hostname
	}

	parts := []string{}
	if info.City != "" {
		parts = append(parts, info.City)
	}
	if info.Region != "" && info.Region != info.City {
		parts = append(parts, info.Region)
	}
	if info.Country != "" {
		parts = append(parts, info.Country)
	}

	if len(parts) > 0 {
		return strings.Join(parts, ", ")
	}

	return info.IP
}
