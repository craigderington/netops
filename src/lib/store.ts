import { create } from 'zustand'
import type {
  NetworkNode,
  Connection,
  SecurityZone,
  ThreatEvent,
  ConnectionType,
  SecurityZoneType,
} from './types'
import { sampleTopology } from '@/data/sample-topology'

interface NetOpsStore {
  // State
  nodes: NetworkNode[]
  connections: Connection[]
  selectedNode: NetworkNode | null
  securityZones: SecurityZone[]
  threatEvents: ThreatEvent[]
  filteredZone: SecurityZoneType | null

  // Node operations
  addNode: (node: NetworkNode) => void
  updateNode: (id: string, updates: Partial<NetworkNode>) => void
  removeNode: (id: string) => void

  // Connection operations
  addConnection: (from: string, to: string, type: ConnectionType) => void
  removeConnection: (id: string) => void
  setConnections: (connections: Array<{ from: string; to: string }>) => void

  // UI state
  selectNode: (node: NetworkNode | null) => void
  filterByZone: (zone: SecurityZoneType | null) => void

  // Utility
  loadSampleData: () => void
  clearNodes: () => void
  clearAll: () => void
}

export const useNetOpsStore = create<NetOpsStore>((set) => ({
  // Initial state
  nodes: [],
  connections: [],
  selectedNode: null,
  securityZones: [],
  threatEvents: [],
  filteredZone: null,

  // Node operations
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  updateNode: (id, updates) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
      selectedNode:
        state.selectedNode?.id === id
          ? { ...state.selectedNode, ...updates }
          : state.selectedNode,
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      connections: state.connections.filter(
        (conn) => conn.from !== id && conn.to !== id
      ),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    })),

  // Connection operations
  addConnection: (from, to, type) =>
    set((state) => {
      const newConnection: Connection = {
        id: `c${Date.now()}`,
        from,
        to,
        type,
        latency: 0,
        bandwidth: 1000,
        status: 'active',
      }
      return {
        connections: [...state.connections, newConnection],
      }
    }),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id),
    })),

  setConnections: (wsConnections) =>
    set(() => ({
      connections: wsConnections.map((conn, idx) => ({
        id: `${conn.from}-${conn.to}-${idx}`,
        from: conn.from,
        to: conn.to,
        type: 'https',
        latency: 0,
        bandwidth: 1000,
        status: 'active',
      })),
    })),

  // UI state
  selectNode: (node) =>
    set(() => ({
      selectedNode: node,
    })),

  filterByZone: (zone) =>
    set(() => ({
      filteredZone: zone,
    })),

  // Utility
  loadSampleData: () =>
    set(() => ({
      nodes: sampleTopology.nodes,
      connections: sampleTopology.connections,
      securityZones: sampleTopology.securityZones,
      threatEvents: sampleTopology.threatEvents || [],
    })),

  clearNodes: () =>
    set(() => ({
      nodes: [],
    })),

  clearAll: () =>
    set(() => ({
      nodes: [],
      connections: [],
      selectedNode: null,
      securityZones: [],
      threatEvents: [],
      filteredZone: null,
    })),
}))
