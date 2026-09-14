import React, { useState, useEffect, useCallback, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../styles/leaflet-custom.css'
import {
  AlertTriangle,
  Zap,
  Download,
  RefreshCw,
  Clock,
  ShieldCheck,
  TrendingDown,
  Navigation,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
  Search,
  MapPin,
  Train,
  Activity,
  Maximize2,
  RotateCcw,
  Radio,
  Share2,
} from 'lucide-react'
import { routeService } from '../services/routeService.js'
import { analyticsService } from '../services/analyticsService.js'
import StationDetailDrawer from '../components/congestion/StationDetailDrawer.jsx'
import { Loader } from '../components/common/Loader.jsx'

export default function CongestionMap() {
  // Search inputs
  const [fromCode, setFromCode] = useState('NDLS')
  const [toCode, setToCode] = useState('CNB')
  const [activeFrom, setActiveFrom] = useState('NDLS')
  const [activeTo, setActiveTo] = useState('CNB')

  // Data & state
  const [routeData, setRouteData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dataSource, setDataSource] = useState('DEMO')
  const [forceLiveMode, setForceLiveMode] = useState(false)

  // Auto-refresh & connection
  const [lastUpdated, setLastUpdated] = useState(Date.now())
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState('CONNECTED')

  // Selected item for drawer
  const [selectedItem, setSelectedItem] = useState(null) // { type: 'station' | 'segment' | 'train', data: {...} }
  const [stationStatusData, setStationStatusData] = useState(null)
  const [loadingStationStatus, setLoadingStationStatus] = useState(false)

  // Map layer visibility toggles
  const [showStations, setShowStations] = useState(true)
  const [showTrains, setShowTrains] = useState(true)
  const [showCongestionGlow, setShowCongestionGlow] = useState(true)

  // Reroute actions & notifications
  const [executingReroute, setExecutingReroute] = useState(false)
  const [notification, setNotification] = useState(null)
  const [mitigationState, setMitigationState] = useState({})

  // Leaflet refs
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupRef = useRef(null)

  // Autocomplete stations list
  const [availableStations, setAvailableStations] = useState([])
  const [fromSuggestions, setFromSuggestions] = useState([])
  const [toSuggestions, setToSuggestions] = useState([])

  // Load stations autocomplete list
  useEffect(() => {
    async function loadStationList() {
      try {
        const res = await routeService.getStations()
        if (Array.isArray(res)) {
          setAvailableStations(res)
        }
      } catch (err) {
        console.warn('Could not load station list for autocomplete:', err)
      }
    }
    loadStationList()
  }, [])

  // Quick route options
  const popularCorridors = [
    { label: 'NDLS ➔ CNB', from: 'NDLS', to: 'CNB', desc: 'Northern Trunk (429km)' },
    { label: 'NDLS ➔ MMCT', from: 'NDLS', to: 'MMCT', desc: 'Western Quad Trunk (1271km)' },
    { label: 'NDLS ➔ JP', from: 'NDLS', to: 'JP', desc: 'Delhi-Jaipur Corridor (308km)' },
    { label: 'JP ➔ AII', from: 'JP', to: 'AII', desc: 'Ajmer Semi High-Speed (135km)' },
    { label: 'CNB ➔ HWH', from: 'CNB', to: 'HWH', desc: 'Grand Chord Trunk (1017km)' },
    { label: 'ADI ➔ MMCT', from: 'ADI', to: 'MMCT', desc: 'Western Coastal Trunk (492km)' },
  ]

  // Fetch route telemetry
  const fetchRouteData = useCallback(
    async (from, to, forceLive = false, isSilent = false) => {
      if (!isSilent) setSearchLoading(true)
      setError(null)
      try {
        const data = await routeService.getRoute(from, to, forceLive)
        setRouteData(data)
        setDataSource(data.dataSource || (forceLive ? 'LIVE' : 'DEMO'))
        setConnectionStatus('CONNECTED')
        setLastUpdated(Date.now())
        setActiveFrom(from)
        setActiveTo(to)
      } catch (err) {
        console.error('Failed to fetch route:', err)
        setError(err.message || 'Route not found between specified stations')
        setConnectionStatus('DISCONNECTED')
      } finally {
        setLoading(false)
        if (!isSilent) setSearchLoading(false)
      }
    },
    [],
  )

  // Initial load
  useEffect(() => {
    fetchRouteData(fromCode, toCode, forceLiveMode)
  }, [fetchRouteData, forceLiveMode])

  // 30s auto-refresh timer
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchRouteData(activeFrom, activeTo, forceLiveMode, true)
    }, 30000)

    const timerInterval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000))
    }, 1000)

    return () => {
      clearInterval(refreshInterval)
      clearInterval(timerInterval)
    }
  }, [activeFrom, activeTo, forceLiveMode, lastUpdated, fetchRouteData])

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [26.8467, 80.9462], // Centered around Central/Northern India
        zoom: 6,
        zoomControl: false,
        attributionControl: true,
      })

      // OpenStreetMap tiles — free, no API key, real map
      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        },
      ).addTo(map)

      // Add zoom control top right
      L.control.zoom({ position: 'topright' }).addTo(map)

      const layerGroup = L.layerGroup().addTo(map)
      layerGroupRef.current = layerGroup
      mapInstanceRef.current = map

      setTimeout(() => {
        map.invalidateSize()
      }, 250)
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Handle station click to show drawer
  const handleSelectStation = async (station) => {
    const code = station.stationCode || station.code
    setSelectedItem({ type: 'station', data: station })
    setLoadingStationStatus(true)
    try {
      const status = await routeService.getStationStatus(code)
      setStationStatusData(status)
    } catch (err) {
      console.warn('Could not fetch single station operational status:', err)
      setStationStatusData(null)
    } finally {
      setLoadingStationStatus(false)
    }
  }

  // Handle segment click to show drawer
  const handleSelectSegment = (segment) => {
    setSelectedItem({ type: 'segment', data: segment })
    setStationStatusData(null)
  }

  // Handle train click to show drawer
  const handleSelectTrain = (train) => {
    setSelectedItem({ type: 'train', data: train })
    setStationStatusData(null)
  }

  // Re-render Leaflet Map Polylines, Stations, and Train Markers when routeData changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup || !routeData) return

    layerGroup.clearLayers()

    const allCoords = []

    // 1. Draw Route Track Segments (Polylines)
    const segments = routeData.trackSegments || routeData.segments
    if (segments && Array.isArray(segments)) {
      segments.forEach((seg) => {
        if (!seg.coordinates || seg.coordinates.length < 2) return

        const segCoords = seg.coordinates.map((c) => [c[0], c[1]])
        segCoords.forEach((c) => allCoords.push(c))

        // Segment color based on congestion
        const color =
          seg.congestion > 80
            ? '#ef4444' // Critical red
            : seg.congestion > 65
            ? '#f97316' // Heavy orange
            : seg.congestion > 45
            ? '#eab308' // Moderate yellow
            : '#10b981' // Green clear

        // Glow line underlay if enabled
        if (showCongestionGlow && seg.congestion > 70) {
          L.polyline(segCoords, {
            color: color,
            weight: 12,
            opacity: 0.25,
            lineCap: 'round',
          }).addTo(layerGroup)
        }

        // Main track polyline
        const poly = L.polyline(segCoords, {
          color: color,
          weight: 4.5,
          opacity: 0.95,
          dashArray: seg.congestion > 85 ? '12, 8' : undefined,
          lineCap: 'round',
        }).addTo(layerGroup)

        poly.bindTooltip(
          `<div style="font-family: monospace;">
            <strong>${seg.from} ➔ ${seg.to}</strong><br/>
            Congestion: <span style="color:${color}; font-weight:bold;">${seg.congestion}%</span> | Dist: ${seg.distanceKm}km<br/>
            Avg Speed: ${seg.avgSpeed || 68} km/h (PSR: 130 km/h)
          </div>`,
          { className: 'railway-dark-tooltip', sticky: true },
        )

        poly.on('click', () => handleSelectSegment(seg))
      })
    }

    // 2. Draw Station Nodes
    if (showStations && routeData.stations && Array.isArray(routeData.stations)) {
      routeData.stations.forEach((stn) => {
        const lat = stn.latitude ?? stn.lat
        const lng = stn.longitude ?? stn.lng
        if (typeof lat !== 'number' || typeof lng !== 'number') return
        allCoords.push([lat, lng])

        const stnCode = stn.stationCode ?? stn.code
        const stnName = stn.stationName ?? stn.name
        const stnCongestion = stn.congestionPercentage ?? stn.congestion ?? 65

        const stnColor =
          stnCongestion > 80
            ? '#ef4444'
            : stnCongestion > 65
            ? '#f97316'
            : stnCongestion > 45
            ? '#eab308'
            : '#10b981'

        const iconHtml = `
          <div style="color: ${stnColor}; position: relative;">
            <div class="station-pulse-ring" style="border-color: ${stnColor}"></div>
            <div class="station-dot" style="background-color: ${stnColor}"></div>
          </div>
          <div class="station-badge-label">${stnCode} ${stnCongestion}%</div>
        `

        const customIcon = L.divIcon({
          className: 'station-pin',
          html: iconHtml,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        })

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(layerGroup)

        marker.bindTooltip(
          `<div style="font-family: monospace;">
            <strong>${stnName} (${stnCode})</strong><br/>
            Platform Congestion: ${stnCongestion}%<br/>
            Click to view station telemetry & platform radar
          </div>`,
          { className: 'railway-dark-tooltip', direction: 'top', offset: [0, -14] },
        )

        marker.on('click', () => handleSelectStation(stn))
      })
    }

    // 3. Draw Active Trains along Route
    if (showTrains && routeData.activeTrains && Array.isArray(routeData.activeTrains)) {
      routeData.activeTrains.forEach((trn) => {
        const trnLat = trn.lat ?? (Array.isArray(trn.position) ? trn.position[0] : undefined)
        const trnLng = trn.lng ?? (Array.isArray(trn.position) ? trn.position[1] : undefined)
        if (typeof trnLat !== 'number' || typeof trnLng !== 'number') return
        allCoords.push([trnLat, trnLng])

        const trnNumber = trn.trainNumber || trn.number || '12004'
        const trnName = trn.trainName || trn.name || 'Express'
        const trnSpeed = trn.currentSpeedKmph ?? trn.speed ?? 80
        const trnDelay = trn.delayMinutes ?? trn.delay ?? 0
        const nextStn = trn.nextStationName || trn.nextStation || 'Block Ahead'
        const trnEta = trn.eta || trn.etaNext || '14m'

        const trainHtml = `
          <span class="train-pin-pulse"></span>
          <span>🚆 #${trnNumber} (${trnSpeed}km/h)</span>
        `

        const trainIcon = L.divIcon({
          className: 'train-pin',
          html: trainHtml,
          iconSize: [120, 24],
          iconAnchor: [60, 12],
        })

        const tMarker = L.marker([trnLat, trnLng], { icon: trainIcon }).addTo(layerGroup)

        tMarker.bindTooltip(
          `<div style="font-family: monospace;">
            <strong>#${trnNumber} ${trnName}</strong><br/>
            Speed: ${trnSpeed} km/h | Status: ${trnDelay > 0 ? `+${trnDelay}m Delay` : 'On Time'}<br/>
            Next: ${nextStn} (ETA ${trnEta})
          </div>`,
          { className: 'railway-dark-tooltip', direction: 'bottom', offset: [0, 10] },
        )

        tMarker.on('click', () => handleSelectTrain(trn))
      })
    }

    // Auto-fit bounds with nice padding and drawer offset
    if (allCoords.length > 0) {
      setTimeout(() => {
        if (!mapInstanceRef.current) return
        try {
          mapInstanceRef.current.invalidateSize()
          mapInstanceRef.current.fitBounds(allCoords, {
            paddingTopLeft: [50, 50],
            paddingBottomRight: [selectedItem ? 390 : 60, 50],
            maxZoom: 10,
            animate: true,
          })
        } catch (err) {
          console.warn('Leaflet fitBounds error:', err)
        }
      }, 150)
    }
  }, [routeData, showStations, showTrains, showCongestionGlow, selectedItem])

  // Handle Search Submission
  const handleSearch = (e) => {
    if (e) e.preventDefault()
    if (!fromCode || !toCode) return
    fetchRouteData(fromCode, toCode, forceLiveMode)
  }

  // Handle Quick Corridor Selection
  const handleSelectCorridor = (c) => {
    setFromCode(c.from)
    setToCode(c.to)
    fetchRouteData(c.from, c.to, forceLiveMode)
  }

  // Reset map view to current corridor
  const handleResetGIS = () => {
    const map = mapInstanceRef.current
    if (!map || !routeData?.stations) return
    const coords = routeData.stations
      .map((s) => [s.latitude ?? s.lat, s.longitude ?? s.lng])
      .filter(([lat, lng]) => typeof lat === 'number' && typeof lng === 'number')
    if (coords.length > 0) {
      map.invalidateSize()
      map.fitBounds(coords, {
        paddingTopLeft: [50, 50],
        paddingBottomRight: [selectedItem ? 390 : 60, 50],
        maxZoom: 10,
        animate: true,
      })
    }
  }

  // Execute AI Reroute recommendation
  const handleExecuteReroute = async (actionId = 'ACT-001') => {
    setExecutingReroute(true)
    try {
      const res = await analyticsService.executeReroute(actionId)
      setNotification({
        type: 'success',
        message: res.message || 'Freight #FG-8821 successfully diverted to Bhaupur DFC loop!',
      })
      setMitigationState((prev) => ({ ...prev, [actionId]: true }))
      // Re-fetch current route
      await fetchRouteData(activeFrom, activeTo, forceLiveMode, true)
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to execute automated reroute',
      })
    } finally {
      setExecutingReroute(false)
      setTimeout(() => setNotification(null), 6000)
    }
  }

  // Export GIS Telemetry JSON
  const handleExportTelemetry = () => {
    const exportPayload = {
      timestamp: new Date().toISOString(),
      corridor: `${activeFrom} -> ${activeTo}`,
      routeData,
      connectionStatus,
      dataSource,
    }
    const jsonStr = JSON.stringify(exportPayload, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `corridor_telemetry_${activeFrom}_${activeTo}_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Autocomplete filtering
  const handleFromInputChange = (val) => {
    const upper = val.toUpperCase()
    setFromCode(upper)
    if (upper.length >= 1 && availableStations.length > 0) {
      const filtered = availableStations
        .filter((s) => s.code.includes(upper) || s.name.toUpperCase().includes(upper))
        .slice(0, 5)
      setFromSuggestions(filtered)
    } else {
      setFromSuggestions([])
    }
  }

  const handleToInputChange = (val) => {
    const upper = val.toUpperCase()
    setToCode(upper)
    if (upper.length >= 1 && availableStations.length > 0) {
      const filtered = availableStations
        .filter((s) => s.code.includes(upper) || s.name.toUpperCase().includes(upper))
        .slice(0, 5)
      setToSuggestions(filtered)
    } else {
      setToSuggestions([])
    }
  }

  // Extract KPIs from real backend routeData
  const metrics = {
    corridorName: routeData?.title || `${activeFrom} - ${activeTo} Heavy Quad Trunk`,
    stationCount: routeData?.totalStations || routeData?.stations?.length || 5,
    distanceKm: routeData?.totalDistanceKm || 429,
    activeTrains: routeData?.activeTrainsCount || routeData?.activeTrains?.length || 6,
    avgDelay: routeData?.averageDelayMinutes ? `+${routeData.averageDelayMinutes}m` : '+18m',
    overallCongestion: routeData?.routeCongestionPercentage ?? 76,
    criticalSectionsCount: routeData?.criticalSectionsCount ?? 1,
    status: routeData?.networkStatus || 'Operational (Dense Traffic)',
  }

  const isRerouted = mitigationState['ACT-001'] || false

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <strong className="font-bold text-sm block">Corridor Search Alert</strong>
            <p className="mt-0.5">{error}</p>
            <div className="mt-2 text-[11px] font-mono text-rose-700">
              Try major Indian Railways junctions: <strong>NDLS</strong>, <strong>CNB</strong>,{' '}
              <strong>JP</strong>, <strong>AII</strong>, <strong>MMCT</strong>, <strong>BRC</strong>,{' '}
              <strong>KOTA</strong>, <strong>DDU</strong>, <strong>HWH</strong>.
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
              Railway Intelligence System — Congestion &amp; Corridor Radar
            </h1>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-300 text-emerald-700 bg-emerald-50 leading-none">
              RIS-NEURAL FLOW V4.2
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            Production GIS Leaflet telemetry, real-time block section saturation &amp; dynamic rake headway throttle
          </p>
        </div>

        {/* Data Source & Refresh Status Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Data Source Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold shadow-2xs ${
              dataSource === 'LIVE'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-amber-50 border-amber-300 text-amber-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                dataSource === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>● {dataSource === 'LIVE' ? 'LIVE DATA' : 'DEMO DATA'}</span>
          </div>

          {/* Connection & Update Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-600 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated {secondsAgo}s ago</span>
            <button
              onClick={() => fetchRouteData(activeFrom, activeTo, forceLiveMode, false)}
              className="ml-1 p-0.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Force refresh corridor telemetry"
            >
              <RefreshCw className={`w-3 h-3 ${searchLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Export Telemetry */}
          <button
            type="button"
            onClick={handleExportTelemetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Telemetry</span>
          </button>
        </div>
      </div>

      {/* Interactive Route Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-end gap-3.5">
          {/* FROM Station Input with Autocomplete */}
          <div className="flex-1 relative">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase mb-1">
              FROM STATION CODE
            </label>
            <div className="relative">
              <input
                type="text"
                value={fromCode}
                onChange={(e) => handleFromInputChange(e.target.value)}
                onFocus={() => handleFromInputChange(fromCode)}
                placeholder="e.g. NDLS (New Delhi)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white uppercase tracking-wider transition-all"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Suggestions Dropdown */}
            {fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden font-mono text-xs">
                {fromSuggestions.map((st) => (
                  <div
                    key={st.code}
                    onMouseDown={() => {
                      setFromCode(st.code)
                      setFromSuggestions([])
                    }}
                    className="p-2.5 hover:bg-sky-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <strong className="text-sky-600 font-bold">{st.code}</strong> — {st.name}
                    </div>
                    <span className="text-[10px] text-slate-400">{st.state}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Arrow Divider */}
          <div className="hidden lg:flex items-center justify-center self-center pb-1">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* TO Station Input with Autocomplete */}
          <div className="flex-1 relative">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase mb-1">
              TO STATION CODE
            </label>
            <div className="relative">
              <input
                type="text"
                value={toCode}
                onChange={(e) => handleToInputChange(e.target.value)}
                onFocus={() => handleToInputChange(toCode)}
                placeholder="e.g. CNB (Kanpur Central)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white uppercase tracking-wider transition-all"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>

            {/* Suggestions Dropdown */}
            {toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-40 overflow-hidden font-mono text-xs">
                {toSuggestions.map((st) => (
                  <div
                    key={st.code}
                    onMouseDown={() => {
                      setToCode(st.code)
                      setToSuggestions([])
                    }}
                    className="p-2.5 hover:bg-sky-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <strong className="text-sky-600 font-bold">{st.code}</strong> — {st.name}
                    </div>
                    <span className="text-[10px] text-slate-400">{st.state}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Data Mode Switch */}
          <div className="flex flex-col">
            <label className="block text-[11px] font-mono font-bold tracking-wider text-slate-600 uppercase mb-1">
              DATA TELEMETRY MODE
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setForceLiveMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  !forceLiveMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Auto / Sim
              </button>
              <button
                type="button"
                onClick={() => setForceLiveMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  forceLiveMode ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>Force Live</span>
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={searchLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-xs font-mono font-bold tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-75"
          >
            <Search className={`w-4 h-4 ${searchLoading ? 'animate-spin' : ''}`} />
            <span>{searchLoading ? 'RESOLVING CORRIDOR...' : 'SEARCH ROUTE'}</span>
          </button>
        </form>

        {/* Quick Corridor Selection Tags */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">
            QUICK CORRIDORS:
          </span>
          {popularCorridors.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => handleSelectCorridor(c)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors cursor-pointer border ${
                activeFrom === c.from && activeTo === c.to
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Summary Cards (Real Backend Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Corridor Saturation Level */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                CORRIDOR SATURATION
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  metrics.overallCongestion > 80
                    ? 'bg-rose-100 text-rose-700'
                    : metrics.overallCongestion > 60
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {metrics.overallCongestion > 80 ? 'Critical Congestion' : 'Heavy Quad Flow'}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-mono">
              {metrics.overallCongestion}%
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Critical Sections:</span>
            <span className="font-bold text-rose-600 font-mono">
              {metrics.criticalSectionsCount || 1} Block Bottleneck
            </span>
          </div>
          <div
            className={`h-1 absolute bottom-0 left-0 right-0 ${
              metrics.overallCongestion > 80 ? 'bg-rose-500' : 'bg-amber-500'
            }`}
          />
        </div>

        {/* KPI 2: Active Trains in Corridor */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                CORRIDOR TRAIN DENSITY
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono">
                {metrics.distanceKm} km
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 my-1 font-mono">
              {metrics.activeTrains} Active Rakes
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Track Topology:</span>
            <span className="font-bold text-slate-800 font-mono">
              {metrics.stationCount} Station Junctions
            </span>
          </div>
          <div className="h-1 bg-sky-500 absolute bottom-0 left-0 right-0" />
        </div>

        {/* KPI 3: Average Delay Propagation */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                AVG DELAY PROPAGATION
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                Target &lt;10m
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 my-1 font-mono">
              {metrics.avgDelay || '+18m'}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ripple Cascade:</span>
            <span className="font-bold text-rose-600 font-mono">Kanpur Outer Queue</span>
          </div>
          <div className="h-1 bg-amber-500 absolute bottom-0 left-0 right-0" />
        </div>

        {/* KPI 4: Signaling & Safety Shield */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                SAFETY SHIELD STATUS
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                SIL-4
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 my-1 font-mono">
              Kavach 4.0 Active
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Block Control:</span>
            <span className="font-bold text-emerald-600 font-mono">Automatic Cab Signaling</span>
          </div>
          <div className="h-1 bg-emerald-500 absolute bottom-0 left-0 right-0" />
        </div>
      </div>

      {/* Main Interactive Leaflet GIS Map Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
        {/* Canvas Header & Map Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-3.5 h-3.5 bg-emerald-600 rounded-xs inline-block" />
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-mono uppercase">
              {routeData?.name || `CORRIDOR GIS TELEMETRY: ${activeFrom} ➔ ${activeTo}`}
            </h2>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
              {routeData?.totalDistanceKm || metrics.distanceKm} KM • {routeData?.stations?.length || 5} NODES
            </span>
          </div>

          {/* Layer Toggles & View Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowStations((v) => !v)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                showStations
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Stations {showStations ? '✓' : ''}
            </button>

            <button
              type="button"
              onClick={() => setShowTrains((v) => !v)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                showTrains
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Live Trains {showTrains ? '✓' : ''}
            </button>

            <button
              type="button"
              onClick={() => setShowCongestionGlow((v) => !v)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-colors cursor-pointer ${
                showCongestionGlow
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Saturation Glow {showCongestionGlow ? '✓' : ''}
            </button>

            <button
              type="button"
              onClick={handleResetGIS}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1"
              title="Reset GIS Bounds"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset GIS</span>
            </button>
          </div>
        </div>

        {/* Leaflet Map Container & Slide-Over Drawer */}
        <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-inner">
          <div ref={mapContainerRef} className="railway-leaflet-container" />

          {loading && !routeData && (
            <div className="absolute inset-0 bg-[#060913]/85 backdrop-blur-xs flex items-center justify-center z-50">
              <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-sky-400 shadow-xl">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                <span>Hydrating real-time corridor GIS telemetry...</span>
              </div>
            </div>
          )}

          {/* Floating Kanpur / Chokepoint Callout overlay when on NDLS-CNB corridor */}
          {activeTo === 'CNB' && (
            <div
              style={{ zIndex: 1200 }}
              className={`hidden sm:block absolute top-4 left-4 w-[280px] rounded-xl border-2 p-3 shadow-2xl backdrop-blur-md transition-all ${
                isRerouted
                  ? 'bg-[#0f172a]/95 border-emerald-500/80 shadow-emerald-950/50'
                  : 'bg-[#0f172a]/95 border-rose-500/90 shadow-rose-950/60'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-100 font-sans tracking-tight">
                  Kanpur Central (CNB) Outer
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isRerouted
                      ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-300'
                      : 'bg-rose-900/80 border border-rose-500 text-rose-200'
                  }`}
                >
                  {isRerouted ? '82% Normal' : '114% Cap'}
                </span>
              </div>

              <div className="py-2 space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Approach Queue:</span>
                  <span className="text-slate-100 font-bold">
                    {isRerouted ? '3 Rakes Normal' : '9 Rakes Waiting'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Delay Cascade:</span>
                  <span className={`font-bold ${isRerouted ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isRerouted ? '+8m Nominal' : '+42m to +58m'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Block Signal:</span>
                  <span className="text-amber-300 font-bold">Interlocking Throttle</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isRerouted ? 'Reroute Active' : 'AI Reroute Ready'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleExecuteReroute('ACT-001')}
                  disabled={executingReroute || isRerouted}
                  className={`text-xs font-bold px-2.5 py-1 rounded-md shadow-md transition-all cursor-pointer ${
                    isRerouted
                      ? 'bg-emerald-700/80 text-emerald-100 cursor-default'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {executingReroute ? 'Diverting...' : isRerouted ? 'Diverted ✓' : 'Divert Freight'}
                </button>
              </div>
            </div>
          )}

          {/* Slide-over Telemetry Drawer */}
          <StationDetailDrawer
            selectedItem={selectedItem}
            onClose={() => setSelectedItem(null)}
            stationStatusData={stationStatusData}
            loadingStatus={loadingStationStatus}
          />
        </div>

        {/* Map Legend & GIS Status Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 flex-wrap">
            <span className="font-bold text-slate-800 tracking-wider">CONGESTION GRADIENT:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>&lt;45% Clear</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
              <span>45-70% Moderate</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500" />
              <span>70-85% Heavy</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" />
              <span>&gt;85% Critical</span>
            </div>
            <div className="flex items-center gap-1 text-sky-600">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>🚆 Live Train Radar</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500">
            Interactive GIS: Click any Station, Track Section, or Train for live telemetry
          </div>
        </div>

        {/* Corridor Stations Strip */}
        {routeData?.stations && routeData.stations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-500" />
              <span>CORRIDOR JUNCTIONS (CLICK TO INSPECT):</span>
            </span>
            {routeData.stations.map((stn) => {
              const code = stn.stationCode || stn.code
              const congestion = stn.congestionPercentage ?? stn.congestion ?? 65
              const isSelected =
                selectedItem?.type === 'station' &&
                (selectedItem?.data?.stationCode === code || selectedItem?.data?.code === code)

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectStation(stn)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      congestion > 80
                        ? 'bg-rose-500'
                        : congestion > 65
                        ? 'bg-orange-500'
                        : congestion > 45
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span>{code}</span>
                  <span className="text-[10px] opacity-75">{congestion}%</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Bottom 2-Column Intelligence Grid: Chokepoints & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Top Chokepoints */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 tracking-wide font-mono uppercase">
              <span className="text-amber-500 font-bold">▲</span>
              <span>TOP CHOKEPOINT BLOCK SECTIONS RANKED BY DELAY PROPAGATION</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Sorted by Ripple Impact</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                code: 'TDL-CNB-DN',
                section: 'Tundla Jn (TDL) ➔ Kanpur Central (CNB) Down Line',
                severity: isRerouted ? 'Mitigated' : 'Critical',
                rippleDelay: isRerouted ? '+8m Residual' : '+58m Ripple',
                trainsQueued: isRerouted ? 3 : 9,
                capacity: isRerouted ? '84% Capacity' : '114% Saturated',
                rootCause:
                  'Freight consignment #FG-8821 speed penalty + platform headway blockage at CNB yard.',
                rank: 1,
              },
              {
                code: 'GZB-ALJN-UP',
                section: 'Ghaziabad (GZB) ➔ Aligarh Jn (ALJN) Main Quad',
                severity: 'Moderate',
                rippleDelay: '+22m Ripple',
                trainsQueued: 5,
                capacity: '78% Capacity',
                rootCause:
                  'Suburban EMU rakes sharing quad express tracks during peak transit window.',
                rank: 2,
              },
              {
                code: 'KOTA-RTM-DN',
                section: 'Kota Jn (KOTA) ➔ Ratlam Jn (RTM) Down Freight Chord',
                severity: 'Heavy',
                rippleDelay: '+31m Ripple',
                trainsQueued: 7,
                capacity: '89% Capacity',
                rootCause: 'Gradient speed limits around Darah Pass curves reducing freight acceleration.',
                rank: 3,
              },
            ].map((chk) => (
              <div
                key={chk.code}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">
                      {chk.rank}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{chk.section}</span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded font-mono ${
                        chk.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : chk.severity === 'Mitigated'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {chk.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 pl-7">{chk.rootCause}</div>
                </div>

                <div className="text-right shrink-0 pl-7 sm:pl-0">
                  <div
                    className={`text-xs font-bold font-mono ${
                      chk.severity === 'Mitigated' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {chk.rippleDelay}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {chk.trainsQueued} Rakes Queued • {chk.capacity}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Mitigation Actions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 tracking-wide font-mono uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>AI PREDICTIVE MITIGATION ACTIONS</span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100/90 text-emerald-800">
              Confidence &gt; 92%
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'ACT-001',
                code: 'REROUTE-DFC-01',
                title: 'Divert Freight #FG-8821 to Eastern DFC Loop',
                description:
                  'Relieves Kanpur Central outer bottlenecks, opening high-speed block headway for Rajdhani #12423 & Shatabdi #12004.',
                savedDelay: '-42m Saved',
                status: isRerouted ? 'Executed' : 'Pending',
              },
              {
                id: 'ACT-002',
                code: 'THROTTLE-SIG-04',
                title: 'Stagger Aligarh Jn Suburban Departure Slots',
                description:
                  'Extends EMU departure headway by 4.5 minutes to prevent bottleneck accumulation behind Vande Bharat #22436.',
                savedDelay: '-18m Saved',
                status: 'Pending',
              },
              {
                id: 'ACT-003',
                code: 'PLATFORM-SWAP-02',
                title: 'Dynamic Platform Allocation at Tundla Jn (TDL)',
                description:
                  'Switch incoming freight bypass to Loop Track 3 to keep Express Through line free.',
                savedDelay: '-14m Saved',
                status: 'Pending',
              },
            ].map((act) => (
              <div
                key={act.id}
                className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  act.status === 'Executed'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/50 hover:bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200/90 text-slate-700">
                      {act.code}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{act.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">{act.description}</p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                    {act.savedDelay}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleExecuteReroute(act.id)}
                    disabled={executingReroute || act.status === 'Executed'}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      act.status === 'Executed'
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {act.status === 'Executed' ? 'Executed ✓' : 'Apply Reroute'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
