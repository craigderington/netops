import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export function LegendPanel() {
  const [isOpen, setIsOpen] = useState(true)

  const sectionStyle = { marginBottom: '12px' }
  const titleStyle = { color: '#00ff41', fontWeight: 'bold', marginBottom: '8px', fontSize: '12px' }
  const itemStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }
  const textStyle = { color: '#a0a0a0' }

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '16px',
      zIndex: 1000,
      width: '200px'
    }}>
      <div style={{
        background: 'rgba(10, 14, 20, 0.95)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(0, 255, 65, 0.3)',
        borderRadius: '8px'
      }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            cursor: 'pointer',
            borderBottom: isOpen ? '1px solid rgba(0, 255, 65, 0.2)' : 'none'
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span style={{ color: '#00ff41', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '13px' }}>LEGEND</span>
          {isOpen ? (
            <ChevronUp style={{ width: '14px', height: '14px', color: '#00ff41' }} />
          ) : (
            <ChevronDown style={{ width: '14px', height: '14px', color: '#00ff41' }} />
          )}
        </div>

        {/* Content */}
        {isOpen && (
          <div style={{ padding: '12px', fontSize: '11px', fontFamily: 'monospace' }}>
            {/* Node Types */}
            <div style={sectionStyle}>
              <div style={titleStyle}>Node Types</div>
              <div>
                <div style={itemStyle}>
                  <span style={{ fontSize: '16px' }}>🖥️</span>
                  <span style={textStyle}>Server</span>
                </div>
                <div style={itemStyle}>
                  <span style={{ fontSize: '16px' }}>🛡️</span>
                  <span style={textStyle}>Firewall</span>
                </div>
                <div style={itemStyle}>
                  <span style={{ fontSize: '16px' }}>📡</span>
                  <span style={textStyle}>Router</span>
                </div>
                <div style={itemStyle}>
                  <span style={{ fontSize: '16px' }}>🔀</span>
                  <span style={textStyle}>Switch</span>
                </div>
                <div style={itemStyle}>
                  <span style={{ fontSize: '16px' }}>💻</span>
                  <span style={textStyle}>Endpoint</span>
                </div>
                <div style={itemStyle}>
                  <span style={{ fontSize: '16px' }}>⚖️</span>
                  <span style={textStyle}>Load Balancer</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{ ...sectionStyle, borderTop: '1px solid rgba(0, 255, 65, 0.2)', paddingTop: '12px' }}>
              <div style={titleStyle}>Status</div>
              <div>
                <div style={itemStyle}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00ff41', border: '1px solid #00ff41' }} />
                  <span style={textStyle}>Online</span>
                </div>
                <div style={itemStyle}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffb000', border: '1px solid #ffb000' }} />
                  <span style={textStyle}>Warning</span>
                </div>
                <div style={itemStyle}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff0055', border: '1px solid #ff0055' }} />
                  <span style={textStyle}>Critical</span>
                </div>
                <div style={itemStyle}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#666', border: '1px solid #666' }} />
                  <span style={textStyle}>Offline</span>
                </div>
              </div>
            </div>

            {/* Connections */}
            <div style={{ ...sectionStyle, borderTop: '1px solid rgba(0, 255, 65, 0.2)', paddingTop: '12px' }}>
              <div style={titleStyle}>Connections</div>
              <div style={itemStyle}>
                <div style={{ width: '24px', height: '2px', background: '#00ff41' }} />
                <span style={textStyle}>Active</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
