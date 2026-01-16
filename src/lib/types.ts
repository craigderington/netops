// Core network topology types for NetOps Visual

export type DeviceType = 'server' | 'firewall' | 'router' | 'switch' | 'endpoint' | 'load-balancer'

export type SecurityZoneType = 'dmz' | 'internal' | 'public' | 'private'

export type NodeStatus = 'online' | 'offline' | 'warning' | 'critical'

export type ConnectionType = 'ssh' | 'http' | 'https' | 'database' | 'vpn'

export type ConnectionStatus = 'active' | 'inactive' | 'degraded'

export interface Location {
  lat: number
  lng: number
}

export interface NetworkMetrics {
  cpu: number // percentage 0-100
  memory: number // percentage 0-100
  bandwidth: number // Mbps
  connections: number // active connection count
}

export interface NetworkNode {
  id: string
  type: DeviceType
  name: string
  location: Location
  ipAddress: string
  securityZone?: SecurityZoneType
  status: NodeStatus
  metrics?: NetworkMetrics
  owner?: string
  asn?: string
  connections?: number
  process?: string
  firstSeen?: string
  lastSeen?: string
  metadata?: Record<string, any>
}

export interface Connection {
  id: string
  from: string // node id
  to: string // node id
  type: ConnectionType
  latency: number // milliseconds
  bandwidth: number // Mbps
  status: ConnectionStatus
}

export interface SecurityZone {
  id: string
  name: string
  type: SecurityZoneType
  polygon: [number, number][] // [lng, lat] coordinates
  rules: string[]
}

export interface ThreatEvent {
  id: string
  type: 'failed-login' | 'port-scan' | 'ddos' | 'intrusion'
  timestamp: string
  nodeId: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
}

export interface NetworkTopology {
  name: string
  nodes: NetworkNode[]
  connections: Connection[]
  securityZones: SecurityZone[]
  threatEvents?: ThreatEvent[]
}

export interface WSMessage {
  type: 'initial_state' | 'node_add' | 'node_update' | 'node_remove' | 'connections_update'
  node?: NetworkNode
  nodes?: NetworkNode[]
  connections?: Array<{ from: string; to: string }>
  id?: string
}
