import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  ChevronDown,
  Clock3,
  CloudFog,
  Expand,
  Gauge,
  Home,
  LocateFixed,
  Map,
  MapPinned,
  Minus,
  Plus,
  Route,
  Search,
  TrainFront,
  TrendingUp,
  Users,
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import './App.css'
import { alerts, navSections, notificationItems, quickActions, statCards, trainData } from './data/railwayData'

function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [selectedTrainId, setSelectedTrainId] = useState('12301')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isRouteExpanded, setIsRouteExpanded] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const filteredTrains = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return trainData

    return trainData.filter((train) => {
      const haystack = [train.id, train.name, train.from, train.to].join(' ').toLowerCase()
      return haystack.includes(term)
    })
  }, [searchTerm])

  const selectedTrain = useMemo(
    () => trainData.find((train) => train.id === selectedTrainId) ?? trainData[0],
    [selectedTrainId],
  )

  const displayedTrain = filteredTrains.find((train) => train.id === selectedTrainId) ?? filteredTrains[0] ?? selectedTrain

  const navItems = [
    { label: 'Dashboard', icon: Home, isSelected: activeNav === 'Dashboard' },
    ...navSections.flatMap((section) =>
      section.items.map((item) => ({
        label: item.label,
        icon: getNavIcon(item.icon),
        badge: item.badge,
        section: section.title,
        isSelected: activeNav === item.label,
      })),
    ),
  ]

  const visibleTrain = displayedTrain || selectedTrain

  const handleTrainSelection = (trainId) => {
    setSelectedTrainId(trainId)
    setSearchTerm('')
  }

  return (
    <div className="app-shell">
      <header className="top-header">
        <div className="brand-block">
          <div className="brand-icon">
            <TrainFront size={18} />
          </div>
          <div className="brand-copy">
            <h1>Railway Intelligence System</h1>
            <span>AI-Powered ETA &amp; Delay Intelligence</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="online-pill">
            <span className="live-dot" />
            System Online
          </div>

          <div className="notification-wrap">
            <button
              type="button"
              className="icon-button"
              aria-label="Notifications"
              onClick={() => setIsNotificationOpen((v) => !v)}
            >
              <Bell size={16} />
              <span className="alert-badge">1</span>
            </button>

            {isNotificationOpen && (
              <div className="notification-panel">
                {notificationItems.map((item) => (
                  <div className="notification-item" key={item.title}>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                    <span>{item.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="user-menu-wrap">
            <button
              type="button"
              className="profile-button"
              onClick={() => setIsProfileOpen((v) => !v)}
            >
              <div className="avatar">R</div>
              <div className="profile-copy">
                <span className="profile-name">Rail Enthusiast</span>
                <span className="profile-tier">Premium User</span>
              </div>
              <ChevronDown size={14} />
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown">
                <button type="button">Profile</button>
                <button type="button">Switch Account</button>
                <button type="button">Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="sidebar card-surface">
          <nav className="sidebar-nav" aria-label="Sidebar navigation">
            <button
              type="button"
              className={`nav-item nav-item--main ${activeNav === 'Dashboard' ? 'selected' : ''}`}
              onClick={() => setActiveNav('Dashboard')}
            >
              <Home size={15} />
              <span>Dashboard</span>
            </button>

            {navSections.map((section) => (
              <div key={section.title} className="nav-section">
                <div className="nav-section-title">{section.title}</div>
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`nav-item ${activeNav === item.label ? 'selected' : ''}`}
                    onClick={() => setActiveNav(item.label)}
                  >
                    {renderNavIcon(item.icon)}
                    <span>{item.label}</span>
                    {item.badge && <span className="new-badge">{item.badge}</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="main-panel">
          <div className="toolbar-row">
            <div className="search-box-wrap">
              <div className="search-box">
                <Search size={14} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search Train (e.g. 12951 / Mumbai to Delhi)"
                  aria-label="Search trains"
                />
              </div>
              <button type="button" className="search-button" aria-label="Search">
                <Search size={16} />
              </button>

              {searchTerm && filteredTrains.length > 0 && (
                <div className="search-results">
                  {filteredTrains.slice(0, 4).map((train) => (
                    <button key={train.id} type="button" onClick={() => handleTrainSelection(train.id)}>
                      <span>{train.id}</span>
                      <span>{train.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="time-card">
              <div className="time-icon">
                <Clock3 size={15} />
              </div>
              <div>
                <div className="time-value">{formatTime(currentTime)}</div>
                <div className="time-date">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>

          <div className="stats-row">
            {statCards.map((card) => (
              <div key={card.title} className="stats-card card-surface">
                <div className="stats-card__head">
                  <div>
                    <div className="stats-title">{card.title}</div>
                    <div className="stats-value">{card.value}</div>
                  </div>
                  <div className={`metric-pill metric-pill--${card.tone}`} />
                </div>
                <div className="stats-subtitle">{card.subtitle}</div>
                <svg viewBox="0 0 120 32" className={`sparkline sparkline--${card.tone}`} preserveAspectRatio="none">
                  <path d={buildSparkline(card.spark)} />
                </svg>
              </div>
            ))}
          </div>

          <section className="tracking-card card-surface">
            <div className="tracking-card__header">
              <div className="train-summary">
                <div className="mini-train-icon">
                  <TrainFront size={16} />
                </div>
                <div>
                  <div className="train-name">{visibleTrain.id} | {visibleTrain.name}</div>
                  <div className="train-route">{visibleTrain.from} → {visibleTrain.to}</div>
                </div>
              </div>

              <div className="status-block">
                <span className="status-pill">{visibleTrain.status}</span>
                <span className="status-updated">Updated {visibleTrain.updated}</span>
              </div>
            </div>

            <div className="map-wrap" style={{ transform: `scale(${zoomLevel})` }}>
              <div className="map-toolbar">
                <button type="button"><Expand size={14} /></button>
                <button type="button"><LocateFixed size={14} /></button>
                <button type="button" onClick={() => setZoomLevel((value) => Math.min(1.2, value + 0.1))}><Plus size={14} /></button>
                <button type="button" onClick={() => setZoomLevel((value) => Math.max(0.9, value - 0.1))}><Minus size={14} /></button>
              </div>

              <RailwayMap train={visibleTrain} />
            </div>

            <div className={`route-section ${isRouteExpanded ? 'expanded' : ''}`}>
              <div className="route-header">
                <span>Route &amp; Timeline</span>
                <button type="button" onClick={() => setIsRouteExpanded((value) => !value)}>View Full Route</button>
              </div>

              <div className="timeline-shell">
                {visibleTrain.timeline.map((stop, index) => (
                  <div key={`${stop.station}-${index}`} className={`timeline-stop ${stop.complete ? 'complete' : 'future'}`}>
                    <div className="stop-dot" />
                    {index < visibleTrain.timeline.length - 1 && <div className="stop-line" />}
                    <div className="stop-meta">
                      <div className="stop-name">{stop.station}</div>
                      {stop.type && <div className="stop-type">{stop.type}</div>}
                      <div className="stop-status">{stop.status}</div>
                      <div className="stop-time">{stop.time}</div>
                      <div className={`delay-tag ${stop.delay !== 'Expected' && stop.delay !== '—' ? 'delay' : ''}`}>
                        {stop.delay}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="quick-actions-row">
            {quickActions.map((action) => (
              <button key={action.label} type="button" className={`quick-action quick-action--${action.tone}`}>
                <span className="quick-action__icon"><Activity size={14} /></span>
                <div>
                  <strong>{action.label}</strong>
                  <span>{action.sublabel}</span>
                </div>
              </button>
            ))}
          </div>
        </main>

        <aside className="intel-panel">
          <EtaPredictionPanel train={visibleTrain} />
        </aside>
      </div>

      <div className="alert-bar">
        <div className="alert-bar__content">
          <span className="alert-bar__label"><AlertTriangle size={12} /> Railway Alerts</span>
          <span>Heavy Fog in North India - Trains may experience delays.</span>
          <span className="alert-divider" />
          <span>Patna Division: Engineering work from 2 Jun - Check before travel.</span>
        </div>
        <button type="button">View All Alerts <ArrowRight size={12} /></button>
      </div>
    </div>
  )
}

function EtaPredictionPanel({ train }) {
  const prediction = train.etaPrediction || {
    title: 'Estimated Time of Arrival',
    subtitle: 'AI-powered real-time prediction',
    station: train.to,
    platform: train.platform,
    scheduledArrival: train.scheduledArrival,
    predictedArrival: train.expectedArrival,
    differenceMinutes: train.delay,
    confidence: 89,
    confidenceLabel: 'High confidence',
    explanation: 'Train is running with a stable delay profile based on current route conditions.',
    liveStatus: 'LIVE',
    lastUpdatedSeconds: 30,
    confidenceFactors: [],
    breakdown: [],
    history: [],
    delayImpact: [],
    upcomingStations: [],
    predictionFactors: [],
  }

  const chartData = prediction.history.map((item) => ({
    time: item.time,
    scheduled: item.scheduled,
    predicted: item.predicted,
    actual: item.actual,
  }))

  return (
    <>
      <div className="eta-hero card-surface">
        <div className="eta-hero__header">
          <div>
            <div className="eta-panel-title">{prediction.title}</div>
            <div className="eta-panel-subtitle">{prediction.subtitle}</div>
          </div>
          <div className="live-indicator">
            <span className="pulse-dot" />
            {prediction.liveStatus}
          </div>
        </div>

        <div className="eta-hero__meta">
          <div>
            <div className="eta-station">{prediction.station}</div>
          </div>
          <span className="platform-tag">{prediction.platform}</span>
        </div>

        <div className="eta-hero__value-wrap">
          <div className="eta-hero__value">{prediction.predictedArrival}</div>
          <div className="eta-delta eta-delta--warning">+{prediction.differenceMinutes} min vs scheduled</div>
        </div>

        <div className="eta-hero__comparisons">
          <div className="eta-compare">
            <span>Scheduled</span>
            <strong>{prediction.scheduledArrival}</strong>
          </div>
          <div className="eta-compare">
            <span>Predicted</span>
            <strong>{prediction.predictedArrival}</strong>
          </div>
          <div className="eta-compare">
            <span>Difference</span>
            <strong>+{prediction.differenceMinutes} min</strong>
          </div>
        </div>

        <div className="eta-live-status">
          <div className="eta-live-status__row">
            <span>Last updated</span>
            <strong>{prediction.lastUpdatedSeconds} sec ago</strong>
          </div>
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="eta-card__header">
          <div>AI Confidence</div>
          <div className="confidence-value">{prediction.confidence}%</div>
        </div>

        <div className="confidence-level-row">
          <span className="confidence-label">High confidence</span>
          <span className="confidence-score">{prediction.confidence}%</span>
        </div>
        <div className="progress-meter progress-meter--green">
          <span style={{ width: `${prediction.confidence}%` }} />
        </div>

        <div className="confidence-factors">
          <div className="confidence-factors__title">Confidence is based on:</div>
          <ul>
            {prediction.confidenceFactors.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="section-heading">ETA Breakdown</div>
        <div className="breakdown-list">
          {prediction.breakdown.map((item) => (
            <div key={item.label} className="breakdown-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="section-heading">Prediction Timeline</div>
        <div className="timeline-stack">
          <div className="timeline-branch">
            <div className="timeline-step">
              <span className="timeline-label">Scheduled ETA</span>
              <strong>{prediction.scheduledArrival}</strong>
            </div>
            <div className="timeline-arrow">↓</div>
            <div className="timeline-step timeline-step--featured">
              <span className="timeline-label">Current estimated ETA</span>
              <strong>{prediction.predictedArrival}</strong>
            </div>
            <div className="timeline-arrow">↓</div>
            <div className="timeline-step timeline-step--window">
              <span className="timeline-label">Likely arrival window</span>
              <strong>{prediction.likelyWindow.start} — {prediction.likelyWindow.end}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="section-heading">ETA Prediction History</div>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#eef2f5" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip
                formatter={(value) => [`${value} PM`, 'Predicted arrival']}
                labelFormatter={(label) => `Prediction updated ${label}`}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff' }}
              />
              <Line type="monotone" dataKey="scheduled" stroke="#d1d5db" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="predicted" stroke="#16a34a" strokeWidth={3} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="actual" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="section-heading">Delay Impact</div>
        <div className="delay-impact-content">
          <div className="delay-impact__row">
            <span>Current delay</span>
            <strong>+{prediction.differenceMinutes} min</strong>
          </div>
          <div className="delay-impact__list">
            {prediction.delayImpact.map((item) => (
              <div key={item.label} className="impact-row">
                <div className="impact-row__label">
                  <span>{item.label}</span>
                  <strong>+{item.value} min</strong>
                </div>
                <div className="impact-bar">
                  <span style={{ width: `${Math.max(10, item.value * 8)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="section-heading">Upcoming Stations</div>
        <div className="station-list">
          {prediction.upcomingStations.map((station) => (
            <div key={station.station} className={`station-item ${station.status}`}>
              <div className="station-item__name">{station.station}</div>
              <div className="station-item__times">
                <span>{station.scheduled}</span>
                <span>{station.predicted}</span>
              </div>
              <div className="station-item__delay">{station.delay}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="eta-card card-surface">
        <div className="section-heading">Prediction Factors</div>
        <div className="factor-list">
          {prediction.predictionFactors.map((factor) => (
            <div key={factor.name} className="factor-row">
              <div className="factor-row__meta">
                <span>{factor.name}</span>
                <strong>{factor.level}</strong>
              </div>
              <div className="factor-bar">
                <span style={{ width: `${factor.impact}%` }} />
              </div>
              <div className="factor-value">{factor.impact}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="eta-card eta-card--note card-surface">
        <div className="section-heading">Why is the ETA {prediction.predictedArrival}?</div>
        <p>{prediction.explanation}</p>
      </div>
    </>
  )
}

function RailwayMap({ train }) {
  const cityLabels = [
    { label: 'Dhanbad', top: 62, left: 30 },
    { label: 'Asansol', top: 65, left: 46 },
    { label: 'Bardhaman', top: 50, left: 56 },
    { label: 'Ranchi', top: 23, left: 35 },
    { label: 'Jamshedpur', top: 20, left: 46 },
    { label: 'Kharagpur', top: 78, left: 48 },
    { label: 'Kolkata', top: 74, left: 62 },
  ]

  return (
    <div className="rail-map">
      <svg viewBox="0 0 700 250" className="map-svg" aria-hidden="true">
        <path d="M 50 110 C 140 100, 210 80, 250 120 S 350 160, 420 120 S 520 60, 600 110" />
        <path d="M 60 120 C 140 110, 210 88, 250 128 S 350 170, 420 130 S 520 68, 610 118" className="map-route--ghost" />
      </svg>

      {cityLabels.map((city) => (
        <div key={city.label} className="city-label" style={{ left: `${city.left}%`, top: `${city.top}%` }}>
          {city.label}
        </div>
      ))}

      <div className="route-bubble">
        <div className="route-bubble__title">{train.id} - HWH NDLS</div>
        <div className="route-bubble__grid">
          <span>Speed</span>
          <strong>{train.speed} km/h</strong>
        </div>
        <div className="route-bubble__grid">
          <span>Delay</span>
          <strong className="text-alert">{train.delay} min</strong>
        </div>
        <div className="route-bubble__grid">
          <span>Next Stop</span>
          <strong>{train.nextStop}</strong>
        </div>
        <div className="route-bubble__grid">
          <span>ETA</span>
          <strong>{train.eta}</strong>
        </div>
      </div>

      <div className="train-marker" aria-label="Current train position">
        <TrainFront size={14} />
      </div>
    </div>
  )
}

function renderNavIcon(iconName) {
  const icons = {
    Home,
    MapPinned,
    Clock3,
    AlertTriangle,
    Gauge,
    Search,
    Route,
    Map,
    TrendingUp,
    Users,
    Activity,
  }

  const Icon = icons[iconName] || Home
  return <Icon size={14} />
}

function getNavIcon(iconName) {
  const icons = {
    Home,
    MapPinned,
    Clock3,
    AlertTriangle,
    Gauge,
    Search,
    Route,
    Map,
    TrendingUp,
    Users,
    Activity,
  }

  return icons[iconName] || Home
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date)
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function buildSparkline(points) {
  const width = 120
  const height = 32
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width
    const y = height - ((point - min) / range) * (height - 6) - 3
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  })

  return coords.join(' ')
}

export default App
