import { useState } from 'react'
import { MapMarker } from '@/components/ui/map'
import type { ThreatEvent, NetworkNode } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ThreatMarkerProps {
  threat: ThreatEvent
  node: NetworkNode
}

// Get threat icon based on type
function getThreatIcon(type: ThreatEvent['type']): string {
  switch (type) {
    case 'failed-login':
      return '🔐'
    case 'port-scan':
      return '🔍'
    case 'ddos':
      return '💥'
    case 'intrusion':
      return '🚨'
    default:
      return '⚠️'
  }
}

// Get threat color based on severity
function getThreatColor(severity: ThreatEvent['severity']) {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-terminal-red',
        border: 'border-terminal-red',
        text: 'text-terminal-red',
        glow: 'glow-red',
      }
    case 'high':
      return {
        bg: 'bg-terminal-amber',
        border: 'border-terminal-amber',
        text: 'text-terminal-amber',
        glow: 'glow-amber',
      }
    case 'medium':
      return {
        bg: 'bg-terminal-amber',
        border: 'border-terminal-amber',
        text: 'text-terminal-amber',
        glow: 'glow-amber',
      }
    case 'low':
      return {
        bg: 'bg-terminal-blue',
        border: 'border-terminal-blue',
        text: 'text-terminal-blue',
        glow: 'glow-blue',
      }
    default:
      return {
        bg: 'bg-gray-500',
        border: 'border-gray-500',
        text: 'text-gray-500',
        glow: '',
      }
  }
}

// Get time ago string
function getTimeAgo(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function ThreatMarker({ threat, node }: ThreatMarkerProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colors = getThreatColor(threat.severity)
  const icon = getThreatIcon(threat.type)

  return (
    <MapMarker
      longitude={node.location.lng}
      latitude={node.location.lat}
      offset={[20, -20]} // Offset from node position
    >
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Pulsing outer ring */}
        <div
          className={cn(
            'absolute inset-0 rounded-full animate-ping',
            colors.bg,
            'opacity-75'
          )}
          style={{ animationDuration: '2s' }}
        />

        {/* Threat marker */}
        <div
          className={cn(
            'relative size-8 rounded-full flex items-center justify-center',
            'border-2 backdrop-blur-sm',
            colors.border,
            colors.bg,
            colors.glow,
            'transition-all duration-300',
            isHovered && 'scale-125'
          )}
        >
          <span className="text-lg filter drop-shadow-lg">{icon}</span>
        </div>

        {/* Severity indicator */}
        <div
          className={cn(
            'absolute -top-1 -right-1 size-3 rounded-full border-2 border-background',
            colors.bg,
            'pulse-animation'
          )}
        />

        {/* Hover tooltip */}
        {isHovered && (
          <div className="absolute left-10 top-0 w-64 z-50 pointer-events-none">
            <div className="bg-background/95 backdrop-blur border-2 rounded-lg p-3 shadow-xl"
              style={{ borderColor: getThreatColor(threat.severity).border.replace('border-', '') }}
            >
              <div className="space-y-2 text-xs font-mono">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className={cn('font-bold uppercase', colors.text)}>
                    {threat.type.replace('-', ' ')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {getTimeAgo(threat.timestamp)}
                  </span>
                </div>

                {/* Severity badge */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Severity:</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded border text-[10px] font-bold uppercase',
                    colors.border,
                    colors.text,
                    colors.bg,
                    'bg-opacity-20'
                  )}>
                    {threat.severity}
                  </span>
                </div>

                {/* Target */}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="text-terminal-green">{node.name}</span>
                </div>

                {/* Message */}
                <div className="pt-2 border-t border-terminal-green/20">
                  <p className="text-muted-foreground leading-relaxed">
                    {threat.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MapMarker>
  )
}
