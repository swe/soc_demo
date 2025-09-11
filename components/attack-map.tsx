'use client'

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface AttackLocation {
  id: string
  name: string
  lat: number
  lng: number
  attacks: number
  threatLevel: 'high' | 'medium' | 'low'
}

const attackLocations: AttackLocation[] = [
  { id: 'china', name: 'China', lat: 35.8617, lng: 104.1954, attacks: 1247, threatLevel: 'high' },
  { id: 'usa', name: 'United States', lat: 39.8283, lng: -98.5795, attacks: 1156, threatLevel: 'high' },
  { id: 'russia', name: 'Russia', lat: 61.5240, lng: 105.3188, attacks: 892, threatLevel: 'medium' },
  { id: 'north-korea', name: 'North Korea', lat: 40.3399, lng: 127.5101, attacks: 634, threatLevel: 'medium' },
  { id: 'iran', name: 'Iran', lat: 32.4279, lng: 53.6880, attacks: 456, threatLevel: 'low' },
  { id: 'india', name: 'India', lat: 20.5937, lng: 78.9629, attacks: 567, threatLevel: 'medium' },
  { id: 'brazil', name: 'Brazil', lat: -14.2350, lng: -51.9253, attacks: 298, threatLevel: 'low' },
  { id: 'germany', name: 'Germany', lat: 51.1657, lng: 10.4515, attacks: 234, threatLevel: 'low' },
  { id: 'japan', name: 'Japan', lat: 36.2048, lng: 138.2529, attacks: 189, threatLevel: 'low' },
  { id: 'uk', name: 'United Kingdom', lat: 55.3781, lng: -3.4360, attacks: 345, threatLevel: 'low' },
  { id: 'canada', name: 'Canada', lat: 56.1304, lng: -106.3468, attacks: 123, threatLevel: 'low' },
  { id: 'australia', name: 'Australia', lat: -25.2744, lng: 133.7751, attacks: 198, threatLevel: 'low' },
  { id: 'south-africa', name: 'South Africa', lat: -30.5595, lng: 22.9375, attacks: 87, threatLevel: 'low' },
]

const getThreatColor = (threatLevel: string) => {
  switch (threatLevel) {
    case 'high': return '#ef4444'
    case 'medium': return '#f97316'
    case 'low': return '#3b82f6'
    default: return '#6b7280'
  }
}

const getThreatRadius = (attacks: number) => {
  if (attacks >= 1000) return 12
  if (attacks >= 500) return 8
  if (attacks >= 200) return 6
  return 4
}

export default function AttackMap() {
  return (
    <div className="w-full h-full overflow-hidden">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%', minHeight: '380px' }}
        className="rounded-lg"
        dragging={true}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
        touchZoom={true}
        maxBounds={[[-85, -180], [85, 180]]}
        minZoom={1}
        maxZoom={5}
        worldCopyJump={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {attackLocations.map((location) => (
          <CircleMarker
            key={location.id}
            center={[location.lat, location.lng]}
            radius={getThreatRadius(location.attacks)}
            pathOptions={{
              fillColor: getThreatColor(location.threatLevel),
              color: getThreatColor(location.threatLevel),
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
            }}
            className="animate-pulse"
          >
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-gray-900">{location.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-bold text-red-600">{location.attacks.toLocaleString()}</span> attacks
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  Threat Level: <span className="font-semibold">{location.threatLevel}</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
