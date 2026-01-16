import { useState, useEffect, useRef } from 'react'
import { Terminal, Trash2 } from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export function TerminalPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const terminalRef = useRef<HTMLDivElement>(null)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Connect to backend log stream
    function connectLogStream() {
      const ws = new WebSocket('ws://localhost:8081/logs')

      ws.onopen = () => {
        console.log('Terminal log stream connected')
        addLog('info', 'Terminal connected to backend log stream')
      }

      ws.onmessage = (event) => {
        try {
          const logData = JSON.parse(event.data)
          addLog(logData.level || 'info', logData.message)
        } catch {
          // If not JSON, treat as plain text
          addLog('info', event.data)
        }
      }

      ws.onerror = () => {
        addLog('error', 'WebSocket connection error')
      }

      ws.onclose = () => {
        addLog('warn', 'Disconnected from backend. Reconnecting in 5s...')
        setTimeout(connectLogStream, 5000)
      }

      wsRef.current = ws
    }

    connectLogStream()

    return () => {
      wsRef.current?.close()
    }
  }, [])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [logs])

  const addLog = (level: LogEntry['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
    setLogs(prev => [...prev, { timestamp, level, message }])
  }

  const clearLogs = () => {
    setLogs([])
    addLog('info', 'Terminal cleared')
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-terminal-green'
      case 'warn': return 'text-terminal-amber'
      case 'error': return 'text-terminal-red'
      default: return 'text-terminal-green'
    }
  }

  const getLevelPrefix = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return '[INFO]'
      case 'warn': return '[WARN]'
      case 'error': return '[ERROR]'
      default: return '[LOG]'
    }
  }

  return (
    <>
      {/* Floating Terminal Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(21, 26, 33, 0.9)',
          border: '2px solid rgba(0, 255, 65, 0.5)',
          backdropFilter: 'blur(4px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          transition: 'all 0.3s',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(31, 41, 55, 0.9)'
          e.currentTarget.style.borderColor = '#00ff41'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(21, 26, 33, 0.9)'
          e.currentTarget.style.borderColor = 'rgba(0, 255, 65, 0.5)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}
        title="Open Terminal"
      >
        <Terminal style={{ width: '24px', height: '24px', color: '#00ff41' }} />
      </button>

      {/* Terminal Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1999,
              backdropFilter: 'blur(2px)'
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '600px',
              maxWidth: '90vw',
              height: '100vh',
              background: 'rgba(10, 14, 20, 0.95)',
              backdropFilter: 'blur(12px)',
              borderLeft: '1px solid rgba(0, 255, 65, 0.3)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'monospace'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(0, 255, 65, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal style={{ width: '20px', height: '20px', color: '#00ff41' }} />
                <span style={{ color: '#00ff41', fontWeight: 'bold', fontSize: '16px' }}>
                  Backend Terminal
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={clearLogs}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ffb000',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 176, 0, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                  title="Clear logs"
                >
                  <Trash2 style={{ width: '16px', height: '16px' }} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#00ff41',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    fontSize: '18px'
                  }}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Logs */}
            <div
              ref={terminalRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                fontSize: '12px',
                lineHeight: '1.6'
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: 'rgba(0, 255, 65, 0.5)', fontStyle: 'italic' }}>
                  Waiting for backend logs...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      marginBottom: '2px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 65, 0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <span style={{ color: '#00d9ff', flexShrink: 0 }}>{log.timestamp}</span>
                    <span style={{
                      color: log.level === 'info' ? '#00ff41' : log.level === 'warn' ? '#ffb000' : '#ff0055',
                      flexShrink: 0,
                      fontWeight: 'bold'
                    }}>
                      {getLevelPrefix(log.level)}
                    </span>
                    <span style={{ color: 'rgba(230, 230, 230, 0.9)', wordBreak: 'break-all' }}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
