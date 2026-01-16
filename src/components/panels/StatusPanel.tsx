import { useState, useEffect } from 'react'
import { useNetOpsStore } from '@/lib/store'

export function StatusPanel() {
  const { nodes } = useNetOpsStore()
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    // Listen for WebSocket connection status changes
    const checkStatus = setInterval(() => {
      // If we have nodes, we're probably connected
      if (nodes.length > 0) {
        setWsStatus('connected')
      }
    }, 1000)

    return () => clearInterval(checkStatus)
  }, [nodes])

  const onlineNodes = nodes.filter(n => n.status === 'online').length
  const offlineNodes = nodes.filter(n => n.status === 'offline').length
  const totalConnections = nodes.reduce((sum, node) => sum + (node.connections || 0), 0)

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      right: '80px',
      zIndex: 1000,
      minWidth: isCollapsed ? 'auto' : '250px'
    }}>
      <div style={{
        background: 'rgba(10, 14, 20, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 255, 65, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#e6e6e6'
      }}>
        {isCollapsed ? (
          // Collapsed view - compact button
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: 0
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: wsStatus === 'connected' ? '#00ff41' : '#ff0055',
              animation: wsStatus === 'connected' ? 'ping 2s infinite' : 'none'
            }} />
            <span style={{ color: '#00ff41', fontWeight: 'bold', fontSize: '13px' }}>
              {nodes.length} nodes
            </span>
            <span style={{ color: '#a0a0a0', fontSize: '12px' }}>▼</span>
          </button>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
            }}>
              <span style={{ color: '#00ff41', fontWeight: 'bold' }}>LIVE MONITORING</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: wsStatus === 'connected' ? '#00ff41' : '#ff0055',
                  animation: wsStatus === 'connected' ? 'ping 2s infinite' : 'none'
                }} />
                <span style={{
                  color: wsStatus === 'connected' ? '#00ff41' : '#ff0055',
                  fontSize: '12px'
                }}>
                  {wsStatus === 'connected' ? 'CONNECTED' : 'CONNECTING...'}
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#a0a0a0',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 0,
                    marginLeft: '4px'
                  }}
                >
                  ▲
                </button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a0a0a0' }}>Total Nodes:</span>
                <span style={{ color: '#00d9ff', fontWeight: 'bold' }}>{nodes.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a0a0a0' }}>Online:</span>
                <span style={{ color: '#00ff41', fontWeight: 'bold' }}>{onlineNodes}</span>
              </div>
              {offlineNodes > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a0a0a0' }}>Offline:</span>
                  <span style={{ color: '#666', fontWeight: 'bold' }}>{offlineNodes}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#a0a0a0' }}>Connections:</span>
                <span style={{ color: '#bd00ff', fontWeight: 'bold' }}>{totalConnections}</span>
              </div>
            </div>

            {/* Scan indicator */}
            <div style={{
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(0, 255, 65, 0.2)',
              fontSize: '11px',
              color: '#a0a0a0',
              textAlign: 'center'
            }}>
              Scanning every 5 seconds...
            </div>
          </>
        )}
      </div>
    </div>
  )
}
