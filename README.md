# NetOps Visual 🌐

<div align="center">

**A Real-Time Cyberpunk Network Topology Visualizer**

[![Built with React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Go Backend](https://img.shields.io/badge/Go-1.22+-00ADD8?logo=go&logoColor=white)](https://golang.org/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre-5.16-396CB2?logo=maplibre&logoColor=white)](https://maplibre.org/)

*Transform your infrastructure monitoring from boring metrics into an engaging, animated cyberpunk experience*

</div>

---

## 🎯 Overview

NetOps Visual is a cutting-edge network topology visualization tool that combines real-time network discovery, geographic mapping, and a stunning cyberpunk terminal aesthetic. Watch your network come alive as nodes pulse with CPU activity, connections flow with data, and threats glow with urgency.

### ✨ Key Features

- **🗺️ Real-Time Geographic Mapping** - Watch network nodes appear on a world map as they're discovered
- **🔄 Live Network Discovery** - Automatically discovers and tracks active network connections
- **🎨 Cyberpunk Terminal Aesthetic** - Matrix-inspired green terminal theme with neon accents
- **📊 Live Backend Terminal ⭐ NEW!** - Floating terminal button with real-time log streaming from the backend
- **⚡ WebSocket-Powered Updates** - Instant updates without page refreshes
- **🌐 GeoIP Integration** - Automatically geolocates discovered network nodes
- **🎭 Device Classification** - Smart classification of endpoints (servers, routers, firewalls, etc.)
- **🔒 Security Zone Visualization** - Visual polygons for DMZ, internal, public, and private zones
- **⚠️ Threat Intelligence** - Overlay threat events with severity indicators
- **📈 Resource Metrics** - Monitor CPU, memory, bandwidth, and connection counts
- **💫 Animated Connections** - See data flowing between nodes in real-time
- **🎯 Interactive UI** - Click nodes for detailed information, filter by zones
- **📸 Export Capabilities** - Save topologies as JSON, screenshots, or reports

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  React Frontend (Vite + TypeScript)             │
│  ├─ MapLibre GL (Dark Matter Style)             │
│  ├─ WebSocket Client (Real-time Updates)        │
│  ├─ Zustand Store (State Management)            │
│  ├─ shadcn/ui Components                        │
│  └─ Terminal Panel (Backend Log Streaming)      │
└──────────────────┬──────────────────────────────┘
                   │ WebSocket
┌──────────────────▼──────────────────────────────┐
│  Go Backend (:8081)                              │
│  ├─ Network Connection Monitor                  │
│  ├─ GeoIP Lookup (MaxMind)                      │
│  ├─ Device Classification Engine                │
│  ├─ WebSocket Hub (/ws)                         │
│  └─ Log Stream Hub (/logs)                      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Your Network                                    │
│  ├─ Active TCP/UDP Connections                  │
│  ├─ Remote Endpoints                            │
│  └─ Network Interfaces                          │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (for frontend development)
- **Go 1.22+** (for backend)
- **MaxMind GeoLite2 Database** (for GeoIP lookups)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd netops

# Install frontend dependencies
npm install

# Build the Go backend
cd backend
go build -o netops-backend

# Download GeoIP database (optional but recommended)
# Download GeoLite2-City.mmdb from MaxMind and place in backend/
```

### Running the Application

**Terminal 1 - Start the Backend:**
```bash
cd backend
sudo ./netops-backend  # Requires root for network monitoring
```

**Terminal 2 - Start the Frontend:**
```bash
npm run dev
```

**Open your browser:**
```
http://localhost:5173
```

**Pro Tip:** Look for the glowing green terminal button in the bottom-right corner! Click it to watch live backend logs stream in real-time with color-coded messages. It's the perfect way to see your network discovery in action! 🚀

---

## 🎮 Features Deep Dive

### 1. 🗺️ Real-Time Geographic Map

The heart of NetOps Visual is the interactive MapLibre GL map with a dark "Dark Matter" base style perfect for the cyberpunk aesthetic.

**Features:**
- Pan, zoom, and rotate controls
- Automatic node positioning based on GeoIP data
- Clustering for overlapping nodes at the same location
- Smooth animations when nodes appear/disappear

**Map Controls:**
- **Left Click + Drag**: Pan the map
- **Scroll Wheel**: Zoom in/out
- **Right Click + Drag**: Rotate (pitch)
- **Click Node**: View detailed information

### 2. 🔄 Live Network Discovery

The Go backend continuously monitors your machine's active network connections using system APIs:

**Discovery Process:**
1. Every 5 seconds, scans active TCP/UDP connections
2. Extracts remote IP addresses
3. Performs GeoIP lookup for location data
4. Classifies device type based on port, ASN, and hostname
5. Broadcasts updates to all connected clients via WebSocket

**Node Lifecycle:**
- **New Connection**: Node appears with fade-in animation
- **Active**: Node pulses with green glow
- **Idle >30s**: Node marked offline (gray)
- **Idle >5min**: Node removed from map

### 3. 🎨 Cyberpunk Terminal Aesthetic

NetOps Visual embraces a retro-futuristic terminal aesthetic inspired by classic sci-fi and cyberpunk culture.

**Color Palette:**
- **Terminal Green (#00ff41)**: Healthy/online status, connections
- **Terminal Amber (#ffb000)**: Warnings, DMZ zones
- **Terminal Blue (#00d9ff)**: HTTP/HTTPS connections, IPv4
- **Terminal Red (#ff0055)**: Critical alerts, failed connections
- **Terminal Purple (#bd00ff)**: Database connections, IPv6

**Visual Effects:**
- Monospace font (JetBrains Mono / Fira Code)
- Subtle scanline overlay
- Pulsing glow animations for online nodes
- Particle flow animations along connection lines
- Neon borders and shadows

### 4. 📊 Live Backend Terminal ⭐ NEW!

**The slide-out terminal panel gives you a real-time window into your backend's activity.**

Watch your network monitoring come alive! A beautiful floating terminal button sits in the bottom-right corner, ready to reveal all backend operations as they happen.

**Features:**
- **Real-time log streaming** via WebSocket (`ws://localhost:8081/logs`)
- **Color-coded log levels**: INFO (green), WARN (amber), ERROR (red)
- **Precise timestamps** for every log entry
- **Auto-scroll** to latest logs as they arrive
- **Clear logs** button to start fresh
- **Non-intrusive slide-out design** - doesn't obstruct the map view
- **Floating button** with cyberpunk glow effect

**How to Access:**
Look for the **glowing green circular button** with a terminal icon in the **bottom-right corner** of the screen. Click it to slide out the terminal panel from the right side.

**What You'll See:**
- Connection scan results: `"Found X active connections"`
- New node discoveries: `"Discovering new node: 1.2.3.4"`
- Node additions: `"New node added: Google (142.250.80.46) - server"`
- Status changes: `"Node marked offline: ..."`
- GeoIP lookup results and errors
- All backend activity in real-time

**Why It's Awesome:**
This feature transforms network monitoring from a black box into a transparent, observable system. Watch nodes being discovered, classified, and tracked in real-time. Perfect for debugging, learning, or just enjoying the Matrix-like visualization of your network activity!

### 5. 🎯 Node Types & Classification

NetOps Visual intelligently classifies discovered endpoints:

| Type | Icon | Detection Logic |
|------|------|-----------------|
| **Server** | 🖥️ | Common server ports (80, 443, 8080), datacenter ASNs |
| **Firewall** | 🛡️ | Security appliance vendors, specific ports |
| **Router** | 📡 | ISP ASNs, gateway addresses |
| **Switch** | 🔀 | Layer 2 devices |
| **Endpoint** | 💻 | Default for unclassified connections |
| **Load Balancer** | ⚖️ | Cloud provider ASNs, specific hostnames |

### 6. 🌐 Connection Visualization

Connection lines show relationships between nodes:

**Line Styles:**
- **Solid Green**: Active HTTPS connections
- **Dashed Green**: SSH tunnels
- **Solid Blue**: HTTP connections
- **Dotted Purple**: Database connections
- **Thick Amber**: VPN tunnels

**Animation:**
- Lines pulse and animate to show data flow
- Brightness indicates connection activity
- Hover for latency and bandwidth metrics

### 7. 🔒 Security Zones

Visualize network security boundaries with colored polygons:

- **DMZ (Amber)**: Demilitarized zone, public-facing services
- **Internal (Green)**: Trusted internal network
- **Public (Red)**: Internet-facing, untrusted
- **Private (Purple)**: Highly restricted, sensitive data

**Usage:**
Define security zone polygons in your topology JSON to see them overlaid on the map.

### 8. 📊 Node Metrics & Details

Click any node to see detailed information:

- **Name & IP Address**: Hostname or owner information
- **Device Type**: Classification icon and label
- **Status**: Online, Offline, Warning, Critical
- **Location**: City, Country, Coordinates
- **ASN & Owner**: Autonomous System Number and organization
- **Connection Count**: Number of active connections
- **Process**: Local process making the connection (if available)
- **First Seen / Last Seen**: Discovery and last activity timestamps
- **Metrics**:
  - CPU usage (percentage)
  - Memory usage (percentage)
  - Bandwidth (Mbps)
  - Active connections

### 9. 🎛️ Control Panels

**Legend Panel** (Top Left):
- Color-coded status indicators
- Device type icons
- Connection type legend

**Status Panel** (Top Left):
- Total node count
- Active connections count
- System health indicators

**Filters Panel** (Top Left):
- Filter by security zone
- Filter by device type
- Search by IP or hostname

**Node Details Panel** (Right Slide-out):
- Opens when clicking a node
- Full metrics and metadata
- Historical data (if available)

---

## 🛠️ Configuration

### Backend Configuration

Edit `backend/main.go` to customize:

```go
// Scan interval (default: 5 seconds)
ticker := time.NewTicker(5 * time.Second)

// Offline threshold (default: 30 seconds)
if now.Sub(node.LastSeen) > 30*time.Second {
    node.Status = "offline"
}

// Removal threshold (default: 5 minutes)
if now.Sub(node.LastSeen) > 5*time.Minute {
    delete(store.Nodes, ip)
}
```

### Frontend Configuration

Edit `src/hooks/useWebSocket.ts` to change backend URL:

```typescript
const WS_URL = 'ws://localhost:8081/ws'
```

### Map Style

Edit `src/components/map/NetOpsMap.tsx` to change map style:

```typescript
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
```

Other great dark styles:
- `https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json`
- `https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json`

---

## 📁 Project Structure

```
netops/
├── backend/                   # Go backend
│   ├── main.go                # Main entry point, monitoring loop
│   ├── websocket.go           # WebSocket hubs (data + logs)
│   ├── capture.go             # Network connection capture
│   ├── geoip.go               # GeoIP lookup logic
│   ├── classifier.go          # Device type classification
│   ├── types.go               # Type definitions
│   └── GeoLite2-City.mmdb     # GeoIP database (not included)
│
├── src/
│   ├── components/
│   │   ├── map/
│   │   │   ├── NetOpsMap.tsx         # Main map component
│   │   │   ├── ConnectionLine.tsx    # Connection visualization
│   │   │   ├── SecurityZone.tsx      # Security zone polygons
│   │   │   └── ThreatMarker.tsx      # Threat event markers
│   │   │
│   │   ├── panels/
│   │   │   ├── LegendPanel.tsx       # Map legend
│   │   │   ├── StatusPanel.tsx       # System status
│   │   │   ├── NodeDetailsPanel.tsx  # Node info slide-out
│   │   │   ├── FiltersPanel.tsx      # Filtering controls
│   │   │   └── TerminalPanel.tsx     # Backend log terminal
│   │   │
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── sheet.tsx
│   │       └── ... (other shadcn components)
│   │
│   ├── hooks/
│   │   └── useWebSocket.ts           # WebSocket connection hook
│   │
│   ├── lib/
│   │   ├── types.ts                  # TypeScript type definitions
│   │   ├── store.ts                  # Zustand state management
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── data/
│   │   └── sample-topology.ts        # Sample network data
│   │
│   ├── styles/
│   │   └── cyberpunk-theme.css       # Custom cyberpunk styling
│   │
│   ├── App.tsx                       # Root component
│   ├── main.tsx                      # React entry point
│   └── index.css                     # Base Tailwind styles
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🔌 WebSocket API

### Data WebSocket (`ws://localhost:8081/ws`)

**Client → Server:**
- No messages needed, read-only connection

**Server → Client:**

```typescript
// Initial state on connection
{
  "type": "initial_state",
  "nodes": [NetworkNode, ...]
}

// New node discovered
{
  "type": "node_add",
  "node": NetworkNode
}

// Node status/metrics updated
{
  "type": "node_update",
  "node": NetworkNode
}

// Node removed (offline too long)
{
  "type": "node_remove",
  "id": "node_id"
}

// Connection topology updated
{
  "type": "connections_update",
  "connections": [
    { "from": "node_id_1", "to": "node_id_2" },
    ...
  ]
}
```

### Log WebSocket (`ws://localhost:8081/logs`)

**Server → Client:**

```typescript
{
  "level": "info" | "warn" | "error",
  "message": "Log message text"
}
```

---

## 🎨 Customization

### Adding Custom Node Types

1. **Backend** - Edit `backend/classifier.go`:
```go
func ClassifyNode(port int, asn string, owner string, hostname string) string {
    if strings.Contains(owner, "My Custom Service") {
        return "custom-type"
    }
    // ... existing logic
}
```

2. **Frontend** - Edit `src/components/map/NetOpsMap.tsx`:
```typescript
function getDeviceIcon(type: NetworkNode['type']): string {
  switch (type) {
    case 'custom-type': return '🎯'
    // ... existing cases
  }
}
```

### Changing Colors

Edit `src/styles/cyberpunk-theme.css`:

```css
:root {
  --terminal-green: #00ff41;  /* Change these! */
  --terminal-amber: #ffb000;
  --terminal-blue: #00d9ff;
  --terminal-red: #ff0055;
  --terminal-purple: #bd00ff;
}
```

---

## 📊 Data Models

### NetworkNode

```typescript
interface NetworkNode {
  id: string                    // Unique identifier (usually IP address)
  type: DeviceType              // server, firewall, router, switch, endpoint, load-balancer
  name: string                  // Hostname or descriptive name
  location: Location            // { lat: number, lng: number }
  ipAddress: string             // IPv4 or IPv6 address
  securityZone?: SecurityZoneType  // dmz, internal, public, private
  status: NodeStatus            // online, offline, warning, critical
  metrics?: NetworkMetrics      // cpu, memory, bandwidth, connections
  owner?: string                // Organization name
  asn?: string                  // Autonomous System Number
  connections?: number          // Active connection count
  process?: string              // Process name (if local)
  firstSeen?: string            // ISO timestamp
  lastSeen?: string             // ISO timestamp
}
```

### Connection

```typescript
interface Connection {
  id: string                    // Unique identifier
  from: string                  // Source node ID
  to: string                    // Destination node ID
  type: ConnectionType          // ssh, http, https, database, vpn
  latency: number               // Milliseconds
  bandwidth: number             // Mbps
  status: ConnectionStatus      // active, inactive, degraded
}
```

---

## 🧪 Development

### Frontend Development

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

```bash
cd backend

# Run with live reload (requires 'air' or similar)
go run .

# Build optimized binary
go build -o netops-backend -ldflags="-s -w"

# Cross-compile for Linux
GOOS=linux GOARCH=amd64 go build -o netops-backend-linux
```

### Adding New shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

---

## 🐛 Troubleshooting

### Backend doesn't discover nodes

**Issue**: No nodes appearing on map.

**Solutions:**
- Ensure backend is running with `sudo` (requires root for network monitoring)
- Check that you have active network connections (`netstat -an`)
- Verify GeoIP database is present (`backend/GeoLite2-City.mmdb`)
- Check backend logs for errors

### WebSocket connection fails

**Issue**: Frontend can't connect to backend.

**Solutions:**
- Verify backend is running on port 8081
- Check firewall rules allow localhost:8081
- Ensure WebSocket URL in `useWebSocket.ts` matches backend port
- Look for CORS errors in browser console

### Map doesn't load

**Issue**: Black screen, no map visible.

**Solutions:**
- Check browser console for MapLibre GL errors
- Verify internet connection (map tiles load from CDN)
- Try a different map style URL
- Check if `maplibregl` CSS is imported

### Terminal button not visible

**Issue**: Can't see the floating terminal button.

**Solutions:**
- Check that TerminalPanel component is imported in NetOpsMap.tsx
- Verify z-index is high enough (should be 2000)
- Check browser console for React rendering errors
- Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Inspect page elements to see if button exists but is hidden

### Terminal panel shows no logs

**Issue**: Terminal panel opens but remains empty.

**Solutions:**
- Check log WebSocket connection at `ws://localhost:8081/logs`
- Verify backend's log hub is running (should see "Log stream endpoint" message on startup)
- Look for WebSocket errors in browser console
- Ensure backend is running with `sudo` (needs root permissions)
- Try refreshing the page

---

## 🚢 Deployment

### Production Build

```bash
# Build frontend
npm run build
# Output: dist/

# Build backend
cd backend
go build -o netops-backend -ldflags="-s -w"
```

### Docker Compose Deployment 🐳

Running NetOps Visual in Docker requires special consideration for **network monitoring**.

#### 🚨 Critical Docker Networking Challenge

**The Problem**: Network monitoring tools need to see the *host's* network connections, not the container's isolated network namespace. By default, containers only see their own network traffic.

**The Solution**: Use `network_mode: host` for the backend container, giving it access to the host's network stack. This is essential for discovering actual network connections.

#### Quick Start with Docker Compose

```bash
# Build and start the stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the stack
docker-compose down
```

#### Docker Compose Configuration

The provided `docker-compose.yml` includes:

**Backend Service:**
- Uses `network_mode: host` to monitor host network traffic
- Requires `CAP_NET_RAW` and `CAP_NET_ADMIN` capabilities
- Mounts GeoIP database from host
- Healthcheck on `:8081/health`

**Frontend Service:**
- Nginx serving the built React app on port 5173
- Connects to backend at `localhost:8081` (via host network)
- Includes caching and security headers

#### Files Included

```
docker-compose.yml         # Main orchestration file
backend/Dockerfile         # Backend Go service
Dockerfile.frontend        # Frontend React + Nginx
nginx.conf                 # Nginx configuration for SPA
.dockerignore             # Build optimization
```

#### Important Notes

**Security Considerations:**
- Backend runs with elevated privileges (required for network monitoring)
- In production, use specific capabilities instead of `privileged: true`
- Consider network policies and firewall rules

**Host Network Mode Implications:**
- Backend container shares the host's network namespace
- Port 8081 is directly exposed on the host (no port mapping needed)
- Container can see all host network interfaces and connections
- This is the ONLY way to monitor real network traffic from Docker

**Alternative Approach (Not Recommended):**
If you can't use host network mode, you could:
1. Run backend directly on host (not in container)
2. Use a privileged container with network namespace sharing
3. Deploy as a DaemonSet in Kubernetes with `hostNetwork: true`

#### Docker Compose Advanced Options

**Custom GeoIP Database Location:**
```yaml
volumes:
  - /path/to/your/GeoLite2-City.mmdb:/app/GeoLite2-City.mmdb:ro
```

**Environment Variables:**
```yaml
environment:
  - PORT=8081
  - SCAN_INTERVAL=5
  - LOG_LEVEL=info
```

**Resource Limits:**
```yaml
deploy:
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
```

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Commit Convention**: Use [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` code style changes (formatting)
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

---

## 📜 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- **MapLibre GL JS** - Beautiful open-source mapping library
- **shadcn/ui** - Excellent React component library
- **MaxMind GeoLite2** - Free GeoIP database
- **Zustand** - Lightweight state management
- **Vite** - Lightning-fast build tool
- **The Cyberpunk Aesthetic** - Inspiration from *The Matrix*, *Blade Runner*, and terminal culture

---

## 🔮 Roadmap

- [ ] Multi-machine support (monitor multiple hosts)
- [ ] Historical data storage and replay
- [ ] Threat intelligence integration (VirusTotal, AbuseIPDB)
- [ ] Custom alert rules and notifications
- [ ] Packet capture integration
- [ ] 3D visualization mode
- [ ] Mobile responsive design
- [ ] Export to Markdown/PDF reports
- [ ] Integration with LazyTunnel SSH manager
- [ ] Ansible/Terraform topology import

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/netops/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/netops/discussions)
- **Email**: your.email@example.com

---

<div align="center">

**Made with ❤️ and a lot of ☕**

*Transform your network monitoring into an art form*

</div>
