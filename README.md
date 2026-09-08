# 🚆 Railway Intelligence System

**Production-Grade Full-Stack Railway Operations & AI ETA Prediction Platform**

A modular, scalable operations command center for real-time train tracking, multi-factor AI-powered ETA predictions, delay root-cause analysis, corridor congestion monitoring, station crowd intelligence, and network-wide performance analytics.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Operations Dashboard** | Executive command center with KPIs, live activity feed, and network alerts |
| **Live Train Tracking** | Real-time speed, position, progress, and route timeline visualization |
| **AI ETA Prediction Engine** | Multi-factor arrival forecast with confidence scoring and prediction history |
| **Delay Root Cause Analysis** | Decomposition of delay sources (signals, weather, platform, speed restrictions) |
| **Future Delay Risk Forecast** | Forward 30-min / 1-hr / 2-hr delay propagation risk assessment |
| **Train Search & Directory** | Fast search, filter by status, and train network directory |
| **Route Analytics** | Corridor congestion indices, punctuality rates, and delay distribution charts |
| **Congestion Map** | Railway corridor bottleneck identification and track saturation analysis |
| **Station Crowd Intelligence** | Platform density, rush indices, and crowd capacity recommendations |
| **Saved Trips** | Bookmarked trains with localStorage persistence for quick monitoring |

---

## 🏗️ Architecture

```
React UI Components (Pages / Cards / Gauges / Charts)
   ↓
Custom Hooks (useTrainTracking, useETAPrediction, useTrainSearch, etc.)
   ↓
Service Layer (trainService, etaService, stationService, alertService)
   ↓
REST API (Centralized HTTP client with error handling)
   ↓
Express Routes (/api/trains, /api/eta, /api/delays, /api/stations, /api/analytics, /api/alerts)
   ↓
Controllers (Input validation, HTTP status mapping, response formatting)
   ↓
Domain Business Services (Dynamic ETA Calculator, Delay Decomposition, Congestion Scoring)
   ↓
Mongoose Models & MongoDB (with resilient in-memory fallback for development)
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19** with JSX
- **Vite 8** (build & HMR)
- **Tailwind CSS 4** (utility-first styling)
- **React Router 7** (client-side routing)
- **Recharts** (interactive data visualization)
- **Lucide React** (icon system)

### Backend
- **Node.js** (runtime)
- **Express.js** (REST API framework)
- **Mongoose / MongoDB** (persistent data layer)
- **Helmet** (HTTP security headers)
- **express-rate-limit** (API rate limiting)
- **CORS** (cross-origin configuration)
- **dotenv** (environment variable management)

---

## 📁 Project Structure

```
railway-intelligence-system/
├── client/                         # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Card, Badge, Button, StatWidget, Loader, EmptyState, Modal
│   │   │   ├── layout/             # Header, Sidebar, AlertTicker
│   │   │   ├── dashboard/          # StatsGrid, QuickActions, LiveActivityFeed
│   │   │   ├── eta/                # ETAPredictionCard, PredictionFactors, ConfidenceScore, ETAHistoryChart
│   │   │   ├── tracking/           # TrainTrackingCard, RouteTimeline, SpeedGauge, WeatherWidget
│   │   │   ├── analytics/          # RoutePerformanceChart, CongestionRadar, DelayReasonDistribution
│   │   │   ├── stations/           # StationCrowdCard, PlatformAvailability
│   │   │   └── alerts/             # AlertBanner, AlertList
│   │   ├── pages/                  # Dashboard, LiveTracking, ETAPrediction, DelayAnalysis, etc.
│   │   ├── layouts/                # DashboardLayout, AuthLayout
│   │   ├── hooks/                  # useTrainTracking, useETAPrediction, useTrainSearch, etc.
│   │   ├── services/               # api.js, trainService, etaService, stationService, etc.
│   │   ├── context/                # TrainContext, NotificationContext
│   │   ├── constants/              # routes, railwayConstants
│   │   ├── utils/                  # formatters, dateUtils, colorUtils
│   │   ├── routes/                 # AppRoutes
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── index.html
│
├── server/                         # Express Backend
│   └── src/
│       ├── config/                 # env.js, database.js
│       ├── controllers/            # trainController, etaController, etc.
│       ├── models/                 # Train, Station, ETA, Delay, Alert
│       ├── routes/                 # trainRoutes, etaRoutes, etc.
│       ├── services/               # trainService, etaService, delayService, etc.
│       ├── middleware/             # errorHandler, notFound, validateRequest
│       ├── validators/             # trainValidator
│       ├── utils/                  # apiResponse, logger, etaCalculator
│       ├── data/                   # seedData
│       ├── app.js
│       └── server.js
│
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js 18+
- MongoDB (optional — falls back to in-memory store automatically)

### Setup

```bash
git clone <repository-url>
cd railway-intelligence-system
npm install
```

### Environment Variables

Copy `.env.example` to `.env` (or `server/.env`):

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/railway_intelligence
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Running (Development)

```bash
npm run dev
```

This boots both servers concurrently:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 📡 API Documentation

All responses follow the format:
```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/dashboard` | Unified dashboard hydration |
| GET | `/api/trains` | List all trains (supports `?search=`, `?status=`) |
| GET | `/api/trains/:trainNumber` | Get train by number |
| GET | `/api/trains/:trainNumber/live` | Real-time telemetry |
| GET | `/api/eta/:trainNumber` | AI ETA prediction |
| GET | `/api/eta/:trainNumber/history` | Prediction accuracy history |
| GET | `/api/delays/:trainNumber` | Delay decomposition |
| GET | `/api/delays/:trainNumber/reasons` | Forward delay risks |
| GET | `/api/stations` | List all stations |
| GET | `/api/stations/:stationCode` | Station details |
| GET | `/api/stations/:stationCode/crowd` | Crowd analysis |
| GET | `/api/analytics/overview` | Network KPIs |
| GET | `/api/analytics/congestion` | Corridor congestion |
| GET | `/api/alerts` | Active network alerts |

---

## 🔮 Future Integration Points

The architecture is designed to plug in real data sources without frontend rewrites:

- **Real Railway APIs** (NTES/IRCTC) → Swap `trainService` data source
- **GPS/Train Location Data** → Swap `getLiveStatus()` to real GPS feed
- **AI/ML ETA Prediction** → Swap `etaCalculator.js` with ML inference endpoint
- **Weather APIs** → Inject real weather data into ETA pipeline
- **Station Crowd APIs** → Feed real crowd metrics into `stationService`
- **WebSockets / Socket.IO** → Add event emitter layer in services for push updates
- **Authentication** → Add JWT middleware and AuthLayout pages
- **Push Notifications** → Extend `NotificationContext` with Service Workers

---

## 📄 License

MIT
