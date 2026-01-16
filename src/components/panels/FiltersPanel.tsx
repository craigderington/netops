import { useState } from 'react'
import { useNetOpsStore } from '@/lib/store'

export function FiltersPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const { nodes } = useNetOpsStore()

  // Get unique owners and types
  const owners = [...new Set(nodes.map(n => n.owner).filter(Boolean))] as string[]
  const types = [...new Set(nodes.map(n => n.type))]

  const [selectedOwners, setSelectedOwners] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])

  const toggleOwner = (owner: string) => {
    setSelectedOwners(prev =>
      prev.includes(owner) ? prev.filter(o => o !== owner) : [...prev, owner]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '16px',
      zIndex: 1000
    }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'rgba(10, 14, 20, 0.95)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 255, 65, 0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#00ff41',
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🔍 FILTERS ({selectedOwners.length + selectedTypes.length})
        </button>
      ) : (
        <div style={{
          background: 'rgba(10, 14, 20, 0.95)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 255, 65, 0.3)',
          borderRadius: '8px',
          padding: '16px',
          width: '300px',
          maxHeight: '60vh',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#e6e6e6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid rgba(0, 255, 65, 0.2)'
          }}>
            <span style={{ color: '#00ff41', fontWeight: 'bold' }}>FILTERS</span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ff0055',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✕
            </button>
          </div>

          {owners.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '8px' }}>OWNER</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {owners.map(owner => (
                  <label key={owner} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedOwners.includes(owner)}
                      onChange={() => toggleOwner(owner)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ color: '#bd00ff', fontSize: '11px' }}>{owner}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <div style={{ color: '#a0a0a0', fontSize: '10px', marginBottom: '8px' }}>TYPE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {types.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => toggleType(type)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#00d9ff', fontSize: '11px', textTransform: 'uppercase' }}>
                    {type.replace('-', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {(selectedOwners.length > 0 || selectedTypes.length > 0) && (
            <button
              onClick={() => {
                setSelectedOwners([])
                setSelectedTypes([])
              }}
              style={{
                marginTop: '12px',
                width: '100%',
                background: 'transparent',
                border: '1px solid #ffb000',
                color: '#ffb000',
                borderRadius: '4px',
                padding: '8px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}
            >
              CLEAR ALL FILTERS
            </button>
          )}
        </div>
      )}
    </div>
  )
}
