# Docker Deployment Guide for NetOps Visual

## TL;DR

```bash
docker-compose up -d
# Open http://localhost:5173
```

---

## Why Docker Networking is Tricky for NetOps Visual

### The Challenge

NetOps Visual's backend monitors **real network connections** on your machine. This creates a unique Docker challenge:

**Normal Containers**: See only their own isolated network (container-to-container traffic)
**What We Need**: Access to the HOST's actual network connections

### The Solution: Host Network Mode

```yaml
network_mode: host  # Backend container uses host's network namespace
```

This is **mandatory** for network monitoring to work correctly.

---

## Architecture with Docker

```
┌─────────────────────────────────────────┐
│  Docker Host                            │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Backend Container                │ │
│  │  (network_mode: host)             │ │
│  │                                   │ │
│  │  - Sees host network traffic ✓   │ │
│  │  - Port 8081 on host             │ │
│  │  - CAP_NET_RAW + CAP_NET_ADMIN   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Frontend Container               │ │
│  │  (bridge network)                 │ │
│  │                                   │ │
│  │  - Nginx on port 5173            │ │
│  │  - Connects to localhost:8081    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Host Network Stack                    │
│  ├─ eth0 (real connections)           │
│  └─ Port 8081 (backend)               │
└─────────────────────────────────────────┘
```

---

## Prerequisites

1. **Docker** and **Docker Compose** installed
2. **GeoIP Database**: Download `GeoLite2-City.mmdb` from MaxMind
   - Place it in `backend/` directory
   - Or mount it via volume in docker-compose.yml

---

## Deployment Steps

### 1. Prepare GeoIP Database

```bash
# Option A: Download and place in backend/
cd backend
# Download GeoLite2-City.mmdb from MaxMind
# Place it here

# Option B: Mount from custom location
# Edit docker-compose.yml volumes section
```

### 2. Build and Start

```bash
# Build images and start services
docker-compose up -d

# Watch logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8081/health
- **WebSocket**: ws://localhost:8081/ws
- **Log Stream**: ws://localhost:8081/logs

### 4. Verify Network Monitoring

Open the terminal panel (green button bottom-right) and you should see:
```
[INFO] Network monitoring started (scanning every 5 seconds)
[INFO] Found X active connections
[INFO] Discovering new node: X.X.X.X
```

---

## Common Issues & Solutions

### Issue: "Permission denied" errors

**Cause**: Backend needs elevated privileges for network monitoring.

**Solution**: The docker-compose.yml already includes:
```yaml
cap_add:
  - NET_RAW
  - NET_ADMIN
```

If still failing, try:
```yaml
privileged: true  # Less secure but guaranteed to work
```

### Issue: No nodes appearing on map

**Cause**: Backend not seeing host network traffic.

**Solution**: Verify `network_mode: host` is set in docker-compose.yml for backend service.

### Issue: Frontend can't connect to backend

**Cause**: WebSocket URL misconfiguration.

**Solution**: With host network mode, frontend should connect to `ws://localhost:8081`. Check browser console for connection errors.

### Issue: GeoIP lookups failing

**Cause**: Missing GeoLite2-City.mmdb file.

**Solution**:
```bash
# Check if database is mounted correctly
docker exec netops-backend ls -la /app/GeoLite2-City.mmdb
```

---

## Production Considerations

### Security Hardening

1. **Don't use privileged mode in production**
   - Stick with specific capabilities only

2. **Use read-only filesystem where possible**
   ```yaml
   read_only: true
   tmpfs:
     - /tmp
   ```

3. **Drop unnecessary capabilities**
   ```yaml
   cap_drop:
     - ALL
   cap_add:
     - NET_RAW
     - NET_ADMIN
   ```

4. **Run frontend with non-root user**
   - Already configured in nginx:alpine image

### Resource Limits

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M

frontend:
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 256M
```

### Logging

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Health Checks

Already included:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8081/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 10s
```

---

## Alternative Deployment Strategies

### Option 1: Backend on Host, Frontend in Container

**Best for**: Development, maximum compatibility

```bash
# Run backend on host
cd backend
sudo ./netops-backend

# Run only frontend in container
docker-compose up frontend
```

### Option 2: Kubernetes with hostNetwork

**Best for**: Multi-node clusters

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: netops-backend
spec:
  template:
    spec:
      hostNetwork: true  # Access host network
      containers:
      - name: backend
        image: netops-backend:latest
        securityContext:
          capabilities:
            add:
            - NET_RAW
            - NET_ADMIN
```

### Option 3: Podman (Rootless Alternative)

```bash
# Podman supports rootless containers with network monitoring
podman-compose up -d
```

---

## Monitoring the Docker Stack

### View Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100
```

### Check Resource Usage

```bash
docker stats netops-backend netops-frontend
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart backend only
docker-compose restart backend
```

### Rebuild After Code Changes

```bash
# Rebuild and restart
docker-compose up -d --build

# Force complete rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Also remove volumes
docker-compose down -v

# Also remove images
docker-compose down --rmi all
```

---

## FAQ

**Q: Why can't I use standard bridge networking?**
A: Bridge networking isolates containers. The backend would only see container-to-container traffic, not your actual network connections.

**Q: Is host network mode secure?**
A: It's less isolated but necessary for this use case. Mitigate risks by:
- Using specific capabilities (not privileged mode)
- Running in trusted environments
- Applying firewall rules
- Regular security updates

**Q: Can I run multiple instances?**
A: Only one backend per host (it monitors the entire host's network). You can run multiple frontends pointing to the same backend.

**Q: Does this work on Docker Desktop (Mac/Windows)?**
A: `network_mode: host` doesn't work the same on Mac/Windows Docker Desktop due to VM isolation. Best to run backend natively on those platforms.

**Q: What about performance impact?**
A: Minimal. Network monitoring has low overhead. Backend scans every 5 seconds by default. Adjust `SCAN_INTERVAL` if needed.

---

## Support

Issues with Docker deployment? Check:
1. `docker-compose logs` for errors
2. Backend can access `/proc/net/tcp` (host network access)
3. GeoIP database exists and is readable
4. Ports 8081 and 5173 are available

For more help, open an issue on GitHub.
