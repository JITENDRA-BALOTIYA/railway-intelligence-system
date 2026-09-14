import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Default stations for 12951 Mumbai Rajdhani route when live data has no coords
const DEFAULT_STATIONS = [
  { code: 'NDLS', name: 'New Delhi',   lat: 28.6420, lng: 77.2197, status: 'Departed', delayMin: 0 },
  { code: 'GZB',  name: 'Ghaziabad',  lat: 28.6692, lng: 77.4538, status: 'Departed', delayMin: 3 },
  { code: 'ALJN', name: 'Aligarh',    lat: 27.8974, lng: 78.0880, status: 'Departed', delayMin: 7 },
  { code: 'MTJ',  name: 'Mathura',    lat: 27.4924, lng: 77.6737, status: 'Departed', delayMin: 10 },
  { code: 'KOTA', name: 'Kota Jn',    lat: 25.1803, lng: 75.8382, status: 'Arriving', delayMin: 8 },
  { code: 'RTM',  name: 'Ratlam',     lat: 23.3315, lng: 75.0367, status: 'Upcoming', delayMin: 14 },
  { code: 'BRC',  name: 'Bharuch',    lat: 21.7051, lng: 72.9959, status: 'Upcoming', delayMin: 12 },
  { code: 'VAD',  name: 'Vadodara',   lat: 22.3119, lng: 73.1823, status: 'Upcoming', delayMin: 11 },
  { code: 'ST',   name: 'Surat',      lat: 21.1702, lng: 72.8311, status: 'Upcoming', delayMin: 10 },
  { code: 'BCT',  name: 'Mumbai CST', lat: 18.9398, lng: 72.8355, status: 'Upcoming', delayMin: 12 },
]

const STATUS_COLORS = {
  Departed: '#10b981',
  Arriving: '#f59e0b',
  Upcoming: '#94a3b8',
}

const buildIcon = (code, status) => L.divIcon({
  className: '',
  html: `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
      <div style="
        width:12px;height:12px;border-radius:50%;
        background:${STATUS_COLORS[status] || '#94a3b8'};
        border:2.5px solid #fff;
        box-shadow:0 0 0 2px ${STATUS_COLORS[status] || '#94a3b8'}44;
      "></div>
      <div style="
        margin-top:3px;
        background:rgba(255,255,255,0.95);
        border:1px solid #e2e8f0;
        color:#1e293b;
        font-family:monospace;
        font-size:9px;
        font-weight:700;
        padding:1px 4px;
        border-radius:3px;
        white-space:nowrap;
        box-shadow:0 1px 4px rgba(0,0,0,0.15);
      ">${code}</div>
    </div>`,
  iconSize: [40, 36],
  iconAnchor: [20, 6],
})

export const LiveEtaMap = ({ stations: propStations, currentPos, trainNumber }) => {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layersRef = useRef(null)
  const [mapMode, setMapMode] = useState('Map')

  const stations = (propStations && propStations.length > 0) ? propStations : DEFAULT_STATIONS

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [24.0, 77.0],
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
    })

    // OpenStreetMap tiles — free, no API key, clean light map
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(map)

    L.control.zoom({ position: 'topleft' }).addTo(map)

    const layers = L.layerGroup().addTo(map)
    layersRef.current = layers
    mapInstanceRef.current = map

    setTimeout(() => map.invalidateSize(), 200)
    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Draw stations & route
  useEffect(() => {
    const map = mapInstanceRef.current
    const layers = layersRef.current
    if (!map || !layers) return

    layers.clearLayers()

    const coords = stations.map((s) => [s.lat, s.lng])

    // Route polyline — two-tone (completed = green, remaining = slate)
    const departedCoords = stations.filter((s) => s.status === 'Departed' || s.status === 'Arriving').map((s) => [s.lat, s.lng])
    const upcomingCoords = stations.filter((s) => s.status === 'Arriving' || s.status === 'Upcoming').map((s) => [s.lat, s.lng])

    if (departedCoords.length >= 2) {
      L.polyline(departedCoords, { color: '#10b981', weight: 3, opacity: 0.8 }).addTo(layers)
    }
    if (upcomingCoords.length >= 2) {
      L.polyline(upcomingCoords, { color: '#94a3b8', weight: 2, opacity: 0.6, dashArray: '6 4' }).addTo(layers)
    }

    // Station markers
    stations.forEach((stn) => {
      const icon = buildIcon(stn.code, stn.status)
      L.marker([stn.lat, stn.lng], { icon })
        .addTo(layers)
        .bindTooltip(
          `<strong>${stn.code} – ${stn.name}</strong><br/>Status: ${stn.status}${stn.delayMin ? ` · +${stn.delayMin}m delay` : ''}`,
          { className: 'leaflet-tooltip', direction: 'top', offset: [0, -10] }
        )
    })

    // Current train position
    if (currentPos) {
      const trainIcon = L.divIcon({
        className: '',
        html: `<div style="background:#0284c7;border:2px solid #38bdf8;border-radius:6px;padding:2px 6px;color:#fff;font-size:10px;font-weight:800;font-family:monospace;box-shadow:0 0 12px rgba(2,132,199,0.5);white-space:nowrap;">🚆 ${trainNumber}</div>`,
        iconSize: [90, 22],
        iconAnchor: [45, 11],
      })
      L.marker([currentPos.lat, currentPos.lng], { icon: trainIcon }).addTo(layers)
    }

    // Fit bounds
    if (coords.length > 1) {
      try {
        map.fitBounds(coords, { padding: [30, 30], maxZoom: 8, animate: true })
      } catch (_) {}
    }
  }, [stations, currentPos, trainNumber])

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm">🗺</span>
          <span className="text-sm font-bold text-slate-800">Live Train Movement & ETA Map</span>
        </div>
        <div className="flex items-center gap-1">
          {['Map', 'Satellite', 'Hybrid'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setMapMode(mode)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                mapMode === mode
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div ref={mapRef} className="flex-1 min-h-[250px]" />

      {/* Legend */}
      <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-500">
        {[
          { color: '#10b981', label: 'On Time' },
          { color: '#f59e0b', label: 'Slight Delay' },
          { color: '#f97316', label: 'Moderate Delay' },
          { color: '#ef4444', label: 'Heavy Delay' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
