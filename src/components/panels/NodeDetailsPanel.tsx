import { useNetOpsStore } from '@/lib/store'
import type { NetworkNode } from '@/lib/types'

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

export function NodeDetailsPanel() {
  const { selectedNode, selectNode } = useNetOpsStore()

  if (!selectedNode) return null

  const isIPv6 = selectedNode.ipAddress.includes(':')
  const ipVersion = isIPv6 ? 'IPv6' : 'IPv4'
  const ipVersionColor = isIPv6 ? '#bd00ff' : '#00d9ff'

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '16px',
      transform: 'translateY(-50%)',
      zIndex: 1000,
      width: '350px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'rgba(10, 14, 20, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 255, 65, 0.3)',
        borderRadius: '8px',
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e6e6e6'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              color: '#00ff41',
              fontWeight: 'bold',
              fontSize: '16px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '24px' }}>{getDeviceIcon(selectedNode.type)}</span>
              <span>NODE DETAILS</span>
            </div>
          </div>
          <button
            onClick={() => selectNode(null)}
            style={{
              background: 'transparent',
              border: '1px solid #ff0055',
              color: '#ff0055',
              borderRadius: '4px',
              padding: '4px 8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          >
            ✕ CLOSE
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>NAME</div>
            <div style={{ color: '#00ff41', fontWeight: 'bold' }}>{selectedNode.name}</div>
          </div>

          <div>
            <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>IP ADDRESS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                color: ipVersionColor,
                fontWeight: 'bold',
                background: 'rgba(0,0,0,0.5)',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '11px'
              }}>
                {ipVersion}
              </span>
              <span style={{ color: '#00d9ff', fontFamily: 'monospace' }}>{selectedNode.ipAddress}</span>
            </div>
          </div>

          {selectedNode.owner && (
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>OWNER</div>
              <div style={{ color: '#bd00ff', fontStyle: 'italic' }}>{selectedNode.owner}</div>
            </div>
          )}

          {selectedNode.asn && (
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>ASN</div>
              <div style={{ color: '#ffb000' }}>{selectedNode.asn}</div>
            </div>
          )}

          <div>
            <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>TYPE</div>
            <div style={{
              color: '#00d9ff',
              textTransform: 'uppercase',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {selectedNode.type.replace('-', ' ')}
            </div>
          </div>

          <div>
            <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>STATUS</div>
            <div style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: '4px',
              background: selectedNode.status === 'online' ? 'rgba(0, 255, 65, 0.2)' : 'rgba(102, 102, 102, 0.2)',
              border: `1px solid ${selectedNode.status === 'online' ? '#00ff41' : '#666'}`,
              color: selectedNode.status === 'online' ? '#00ff41' : '#666',
              textTransform: 'uppercase',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {selectedNode.status}
            </div>
          </div>

          {selectedNode.connections !== undefined && selectedNode.connections > 0 && (
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>ACTIVE CONNECTIONS</div>
              <div style={{
                color: '#ffb000',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {selectedNode.connections}
              </div>
            </div>
          )}

          {selectedNode.process && (
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>PROCESS</div>
              <div style={{
                color: '#00d9ff',
                fontFamily: 'monospace',
                fontSize: '11px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '6px 8px',
                borderRadius: '4px'
              }}>
                {selectedNode.process}
              </div>
            </div>
          )}

          <div>
            <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>COORDINATES</div>
            <div style={{ color: '#a0a0a0', fontSize: '11px' }}>
              {selectedNode.location.lat.toFixed(4)}°N, {Math.abs(selectedNode.location.lng).toFixed(4)}°{selectedNode.location.lng < 0 ? 'W' : 'E'}
            </div>
          </div>

          {selectedNode.firstSeen && (
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>FIRST SEEN</div>
              <div style={{ color: '#a0a0a0', fontSize: '11px' }}>
                {new Date(selectedNode.firstSeen).toLocaleString()}
              </div>
            </div>
          )}
          {selectedNode.lastSeen && (
            <div>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '4px' }}>LAST SEEN</div>
              <div style={{ color: '#a0a0a0', fontSize: '11px' }}>
                {new Date(selectedNode.lastSeen).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
