import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useNetOpsStore } from '@/lib/store'
import { useWebSocket } from '@/hooks/useWebSocket'
import { LegendPanel } from '@/components/panels/LegendPanel'
import { StatusPanel } from '@/components/panels/StatusPanel'
import { NodeDetailsPanel } from '@/components/panels/NodeDetailsPanel'
import { FiltersPanel } from '@/components/panels/FiltersPanel'
import { TerminalPanel } from '@/components/panels/TerminalPanel'
import type { NetworkNode } from '@/lib/types'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

function getDeviceIcon(type: NetworkNode['type']): string {
  switch (type) {
    case 'server': return '🖥️'
    case 'firewall': return '🛡️'
    case 'router': return '📡'
    case 'switch': return '🔀'
    case 'endpoint': return '💻'
    case 'load-balancer': return '⚖️'
    default: return '❓'
  }
}

function getStatusColor(status: NetworkNode['status']) {
  switch (status) {
    case 'online': return { border: '#00ff41', bg: 'rgba(0, 255, 65, 0.2)' }
    case 'warning': return { border: '#ffb000', bg: 'rgba(255, 176, 0, 0.2)' }
    case 'critical': return { border: '#ff0055', bg: 'rgba(255, 0, 85, 0.2)' }
    case 'offline': return { border: '#666', bg: 'rgba(102, 102, 102, 0.2)' }
    default: return { border: '#666', bg: 'rgba(102, 102, 102, 0.2)' }
  }
}

export function NetOpsMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])

  const { nodes, connections, selectNode } = useNetOpsStore()

  // Connect to WebSocket for live network discovery
  useWebSocket()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: [-95.7129, 37.0902],
      zoom: 4,
      renderWorldCopies: false // Prevent world from repeating when zoomed out
    })

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add markers
  useEffect(() => {
    if (!map.current || nodes.length === 0) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Group nodes by location to detect overlaps
    const locationGroups = new Map<string, NetworkNode[]>()
    nodes.forEach(node => {
      const key = `${node.location.lat.toFixed(2)},${node.location.lng.toFixed(2)}`
      if (!locationGroups.has(key)) {
        locationGroups.set(key, [])
      }
      locationGroups.get(key)!.push(node)
    })

    // Calculate offset positions for overlapping nodes
    const nodePositions = new Map<string, { lat: number; lng: number }>()
    locationGroups.forEach((group) => {
      if (group.length === 1) {
        // Single node - no offset needed
        nodePositions.set(group[0].id, group[0].location)
      } else {
        // Multiple nodes - spread them in a circle
        const baseLocation = group[0].location
        const radius = 0.3 // degrees offset
        group.forEach((node, index) => {
          const angle = (index / group.length) * 2 * Math.PI
          nodePositions.set(node.id, {
            lat: baseLocation.lat + radius * Math.sin(angle),
            lng: baseLocation.lng + radius * Math.cos(angle)
          })
        })
      }
    })

    // Add markers for each node
    nodes.forEach(node => {
      const position = nodePositions.get(node.id) || node.location
      const isOffset = position.lat !== node.location.lat || position.lng !== node.location.lng
      const colors = getStatusColor(node.status)
      const isIPv6 = node.ipAddress.includes(':')
      const ipVersion = isIPv6 ? 'IPv6' : 'IPv4'
      const ipVersionColor = isIPv6 ? '#bd00ff' : '#00d9ff'

      const el = document.createElement('div')
      el.innerHTML = `
        <style>
          @keyframes ping {
            0% {
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.75;
            }
            75%, 100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
        </style>
        <div style="
          position: relative;
          width: 0;
          height: 0;
          cursor: pointer;
        ">
          <!-- Outer ring (lighter shade) -->
          <div style="
            position: absolute;
            width: 64px;
            height: 64px;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            background: ${colors.border}33;
            border: 2px ${isOffset ? 'dashed' : 'solid'} ${colors.border}66;
            ${isOffset ? 'box-shadow: 0 0 0 2px rgba(255, 176, 0, 0.3);' : ''}
            z-index: 1;
          "></div>

          <!-- Inner circle (darker, solid) -->
          <div style="
            position: absolute;
            width: 44px;
            height: 44px;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            border-radius: 50%;
            border: 3px solid ${colors.border};
            background: ${colors.bg};
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(4px);
            z-index: 3;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
          ">
            <span style="font-size: 22px">${getDeviceIcon(node.type)}</span>
          </div>

          <!-- Pulse animation for online nodes -->
          ${node.status === 'online' ? `
            <div style="
              position: absolute;
              width: 64px;
              height: 64px;
              top: 0;
              left: 0;
              border-radius: 50%;
              border: 3px solid ${colors.border};
              animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              z-index: 2;
            "></div>
          ` : ''}
        </div>
        <div style="
          position: relative;
        ">
          <div style="
            position: absolute;
            top: 32px;
            left: 0;
            transform: translateX(-50%);
            white-space: nowrap;
          ">
            <div style="
              background: rgba(10, 14, 20, 0.9);
              backdrop-filter: blur(4px);
              border: 1px solid rgba(0, 255, 65, 0.3);
              padding: 4px 8px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 12px;
            ">
              <div style="color: #00ff41; font-weight: bold; font-size: 11px;">${node.name}</div>
              ${node.owner ? `<div style="color: #bd00ff; font-size: 9px; font-style: italic;">${node.owner}</div>` : ''}
              <div style="display: flex; align-items: center; gap: 4px; font-size: 10px;">
                <span style="color: ${ipVersionColor}; font-weight: bold; background: rgba(0,0,0,0.5); padding: 1px 4px; border-radius: 2px;">${ipVersion}</span>
                <span style="color: #00d9ff;">${node.ipAddress}</span>
              </div>
              ${node.connections ? `<div style="color: #ffb000; font-size: 9px;">${node.connections} connection${node.connections > 1 ? 's' : ''}</div>` : ''}
            </div>
          </div>
        </div>
      `

      // Add click handler
      el.onclick = () => {
        selectNode(node)
      }
      el.style.cursor = 'pointer'

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([position.lng, position.lat])
        .addTo(map.current!)

      markers.current.push(marker)
    })

    return () => {
      markers.current.forEach(marker => marker.remove())
      markers.current = []
    }
  }, [nodes])

  // Add connection lines
  useEffect(() => {
    if (!map.current || connections.length === 0 || nodes.length === 0) return

    const waitForLoad = () => {
      if (!map.current?.loaded()) {
        setTimeout(waitForLoad, 100)
        return
      }

      // Remove existing layer and source if present
      if (map.current.getLayer('connections-layer')) {
        map.current.removeLayer('connections-layer')
      }
      if (map.current.getSource('connections')) {
        map.current.removeSource('connections')
      }

      const features = connections
        .map(conn => {
          const fromNode = nodes.find(n => n.id === conn.from)
          const toNode = nodes.find(n => n.id === conn.to)
          if (!fromNode || !toNode) return null

          return {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [fromNode.location.lng, fromNode.location.lat],
                [toNode.location.lng, toNode.location.lat]
              ]
            }
          }
        })
        .filter((f): f is NonNullable<typeof f> => f !== null)

      map.current.addSource('connections', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features
        }
      })

      map.current.addLayer({
        id: 'connections-layer',
        type: 'line',
        source: 'connections',
        paint: {
          'line-color': '#00ff41',
          'line-width': 2,
          'line-opacity': 0.6
        }
      })
    }

    waitForLoad()
  }, [connections, nodes])

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}
      />
      <LegendPanel />
      <StatusPanel />
      <NodeDetailsPanel />
      <FiltersPanel />
      <TerminalPanel />
    </>
  )
}
