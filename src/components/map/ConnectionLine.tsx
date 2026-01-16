import { useState } from 'react'
import { MapRoute } from '@/components/ui/map'
import type { Connection, NetworkNode } from '@/lib/types'

interface ConnectionLineProps {
  connection: Connection
  nodes: NetworkNode[]
  onSelect?: (connection: Connection) => void
}

// Get connection color and style based on type
function getConnectionStyle(type: Connection['type']) {
  switch (type) {
    case 'ssh':
      return {
        color: '#00ff41', // terminal green
        width: 2,
        dashArray: [4, 4] as [number, number],
        label: 'SSH',
      }
    case 'http':
      return {
        color: '#00d9ff', // terminal blue
        width: 2,
        dashArray: undefined,
        label: 'HTTP',
      }
    case 'https':
      return {
        color: '#00d9ff', // terminal blue
        width: 3,
        dashArray: undefined,
        label: 'HTTPS',
      }
    case 'database':
      return {
        color: '#bd00ff', // terminal purple
        width: 2,
        dashArray: [2, 3] as [number, number],
        label: 'Database',
      }
    case 'vpn':
      return {
        color: '#ffb000', // terminal amber
        width: 4,
        dashArray: undefined,
        label: 'VPN',
      }
    default:
      return {
        color: '#666',
        width: 2,
        dashArray: undefined,
        label: 'Unknown',
      }
  }
}

// Get connection status opacity
function getStatusOpacity(status: Connection['status']): number {
  switch (status) {
    case 'active':
      return 0.8
    case 'degraded':
      return 0.5
    case 'inactive':
      return 0.3
    default:
      return 0.8
  }
}

export function ConnectionLine({ connection, nodes, onSelect }: ConnectionLineProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Find the from and to nodes
  const fromNode = nodes.find((n) => n.id === connection.from)
  const toNode = nodes.find((n) => n.id === connection.to)

  // If either node is missing, don't render the connection
  if (!fromNode || !toNode) {
    return null
  }

  const style = getConnectionStyle(connection.type)
  const opacity = getStatusOpacity(connection.status)

  // Create coordinates array [lng, lat]
  const coordinates: [number, number][] = [
    [fromNode.location.lng, fromNode.location.lat],
    [toNode.location.lng, toNode.location.lat],
  ]

  return (
    <>
      {/* Flow indicator layer - subtle pulsing underlay for active connections */}
      {connection.status === 'active' && (
        <MapRoute
          id={`${connection.id}-flow`}
          coordinates={coordinates}
          color={style.color}
          width={style.width + 4}
          opacity={0.3}
          dashArray={style.dashArray}
          interactive={false}
        />
      )}

      {/* Main connection line */}
      <MapRoute
        id={connection.id}
        coordinates={coordinates}
        color={style.color}
        width={isHovered ? style.width + 2 : style.width}
        opacity={isHovered ? 1 : opacity}
        dashArray={style.dashArray}
        onClick={() => onSelect?.(connection)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        interactive={true}
      />

      {/* Tooltip/Info overlay when hovered - we'll add this in a moment */}
      {isHovered && (
        <div
          className="absolute z-50 bg-background/95 backdrop-blur border border-terminal-green/50 rounded px-3 py-2 text-xs font-mono pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-terminal-green font-bold">{style.label}</span>
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: style.color }}
              />
            </div>
            <div className="text-muted-foreground">
              <div>
                {fromNode.name} → {toNode.name}
              </div>
              <div className="flex gap-3 mt-1">
                <span>Latency: {connection.latency}ms</span>
                <span>BW: {connection.bandwidth}Mbps</span>
              </div>
              <div className="capitalize mt-1">Status: {connection.status}</div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
