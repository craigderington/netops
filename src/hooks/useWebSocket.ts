import { useEffect, useRef } from 'react'
import { useNetOpsStore } from '@/lib/store'
import type { NetworkNode, WSMessage } from '@/lib/types'

const WS_URL = 'ws://localhost:8081/ws'

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const { addNode, updateNode, removeNode, clearNodes, setConnections } = useNetOpsStore()

  useEffect(() => {
    function connect() {
      console.log('Connecting to WebSocket:', WS_URL)
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data)
          console.log('WebSocket message:', message)

          switch (message.type) {
            case 'initial_state':
              // Clear existing nodes and load initial state
              clearNodes()
              if (message.nodes) {
                message.nodes.forEach((node: NetworkNode) => {
                  addNode(node)
                })
                console.log(`Loaded ${message.nodes.length} initial nodes`)
              }
              break

            case 'node_add':
              if (message.node) {
                addNode(message.node)
                console.log('Node added:', message.node.name)
              }
              break

            case 'node_update':
              if (message.node) {
                updateNode(message.node.id, message.node)
                console.log('Node updated:', message.node.name)
              }
              break

            case 'node_remove':
              if (message.id) {
                removeNode(message.id)
                console.log('Node removed:', message.id)
              }
              break

            case 'connections_update':
              if (message.connections) {
                setConnections(message.connections)
                console.log('Connections updated:', message.connections.length)
              }
              break

            default:
              console.warn('Unknown message type:', message.type)
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting in 5s...')
        reconnectTimeoutRef.current = setTimeout(connect, 5000)
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [addNode, updateNode, removeNode, clearNodes, setConnections])

  return wsRef.current
}
