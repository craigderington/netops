import { useEffect, useId } from 'react'
import { useMap } from '@/components/ui/map'
import type { SecurityZone as SecurityZoneType } from '@/lib/types'

interface SecurityZoneProps {
  zone: SecurityZoneType
  visible?: boolean
}

// Get zone colors based on security zone type
function getZoneColors(type: SecurityZoneType['type']) {
  switch (type) {
    case 'dmz':
      return {
        fill: 'rgba(255, 176, 0, 0.15)', // amber
        outline: '#ffb000',
        label: 'DMZ',
      }
    case 'internal':
      return {
        fill: 'rgba(0, 255, 65, 0.15)', // green
        outline: '#00ff41',
        label: 'Internal',
      }
    case 'public':
      return {
        fill: 'rgba(255, 0, 85, 0.15)', // red
        outline: '#ff0055',
        label: 'Public',
      }
    case 'private':
      return {
        fill: 'rgba(189, 0, 255, 0.15)', // purple
        outline: '#bd00ff',
        label: 'Private',
      }
    default:
      return {
        fill: 'rgba(100, 100, 100, 0.15)',
        outline: '#666',
        label: 'Unknown',
      }
  }
}

export function SecurityZone({ zone, visible = true }: SecurityZoneProps) {
  const { map, isLoaded } = useMap()
  const autoId = useId()
  const sourceId = `zone-source-${zone.id}-${autoId}`
  const fillLayerId = `zone-fill-${zone.id}-${autoId}`
  const outlineLayerId = `zone-outline-${zone.id}-${autoId}`

  const colors = getZoneColors(zone.type)

  useEffect(() => {
    if (!isLoaded || !map) return

    // Create polygon coordinates in GeoJSON format
    // Close the polygon by repeating the first coordinate at the end
    const coordinates = [...zone.polygon, zone.polygon[0]]

    // Add source
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          name: zone.name,
          type: zone.type,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
      },
    })

    // Add fill layer
    map.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': colors.fill,
        'fill-opacity': 1,
      },
    })

    // Add outline layer
    map.addLayer({
      id: outlineLayerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': colors.outline,
        'line-width': 2,
        'line-dasharray': [4, 2],
        'line-opacity': 0.8,
      },
    })

    return () => {
      try {
        if (map.getLayer(outlineLayerId)) map.removeLayer(outlineLayerId)
        if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
        if (map.getSource(sourceId)) map.removeSource(sourceId)
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map])

  // Handle visibility changes
  useEffect(() => {
    if (!isLoaded || !map) return

    const visibility = visible ? 'visible' : 'none'

    if (map.getLayer(fillLayerId)) {
      map.setLayoutProperty(fillLayerId, 'visibility', visibility)
    }
    if (map.getLayer(outlineLayerId)) {
      map.setLayoutProperty(outlineLayerId, 'visibility', visibility)
    }
  }, [visible, isLoaded, map, fillLayerId, outlineLayerId])

  return null
}
