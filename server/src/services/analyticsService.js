import { seedAnalytics } from '../data/seedData.js'
import { trainService } from './trainService.js'

// In-memory state for live dynamic mitigation & reroutes
let activeMitigations = [
  {
    id: 'ACT-001',
    code: 'IR-ACT-109',
    title: 'Divert Down-Line Freight #FG-8821',
    description: 'Loop via Bhaupur DFC connection to unlock CNB Platform 4 for 12301 Rajdhani',
    savedDelay: 'Saved: 34 min',
    confidence: '94%',
    status: 'Ready',
    primary: true,
  },
  {
    id: 'ACT-002',
    code: 'IR-ACT-110',
    title: 'Dynamic Speed Ceiling Throttle (TDL-CNB)',
    description: 'Step down block entry speeds from 90 km/h to 60 km/h to prevent red-signal queue stop',
    savedDelay: 'Saved: 19 min',
    confidence: '92%',
    status: 'Ready',
    primary: false,
  },
  {
    id: 'ACT-003',
    code: 'IR-ACT-111',
    title: 'Advance Platform Re-allocation (NDLS PF 4 -> PF 12)',
    description: 'Reroute incoming Vande Bharat to unoccupied high-speed terminal line',
    savedDelay: 'Saved: 22 min',
    confidence: '95%',
    status: 'Ready',
    primary: false,
  },
  {
    id: 'ACT-004',
    code: 'IR-ACT-112',
    title: 'Kavach Headway Compression on MTJ-KOTA',
    description: 'Enable continuous brake curve supervision to close headway from 4.2m to 2.8m',
    savedDelay: 'Saved: 15 min',
    confidence: '91%',
    status: 'Ready',
    primary: false,
  },
]

let calloutState = {
  title: 'Kanpur Central (CNB) Outer',
  capBadge: '114% Cap',
  approachQueue: '9 Rakes Waiting',
  predictedDelayCascade: '+42m to +58m',
  blockSignalStatus: 'Automatic Interlocking Throttle',
  aiRerouteReady: 'AI Reroute Ready',
  actionButtonText: 'Divert Freight #FG-8821',
  actionId: 'ACT-001',
  freightId: 'FG-8821',
  isRerouted: false,
}

export const analyticsService = {
  /**
   * Network-wide overview KPI analytics
   */
  async getOverview() {
    const trains = await trainService.getAllTrains()
    const total = trains.length || 1
    const delayed = trains.filter((t) => t.delay > 5).length
    const onTime = total - delayed
    const onTimePercentage = Math.round((onTime / total) * 100)
    const avgDelay = Math.round(trains.reduce((acc, t) => acc + (t.delay || 0), 0) / total)

    return {
      trackedTrains: total,
      onTimePercentage,
      delayedTrains: delayed,
      averageDelayMinutes: avgDelay,
      systemHealthScore: seedAnalytics.overview.systemHealthScore,
      networkThroughput: seedAnalytics.overview.networkThroughput,
      sparklines: seedAnalytics.overview.sparklines,
      delayReasonsAggregate: seedAnalytics.delayReasonsAggregate,
    }
  },

  /**
   * Corridor-level congestion and bottle-neck mapping with full GIS telemetry
   */
  async getCongestionData() {
    return {
      kpis: {
        highCongestionSectors: {
          count: 7,
          label: '7 Critical',
          badge: 'Critical Delay Risk',
          delta: '+2 Sectors Added',
          tone: 'critical',
        },
        averageHeadway: {
          value: 4.2,
          label: '4.2 min',
          target: 'Target 3.5m',
          utilization: '88.4% Saturated',
          tone: 'amber',
        },
        terminalDwellBottlenecks: {
          count: 14,
          label: '14 Junctions',
          hotspots: 'NDLS, CNB, BSL, BRC',
          avgDwell: 'Avg Dwell +19m',
          tone: 'critical',
        },
        corridorSpeedIndex: {
          speed: 74.8,
          label: '74.8 km/h',
          psr: 'PSR: 110 km/h',
          penalty: '-18.2 km/h',
          tone: 'slate',
        },
      },
      corridorCanvas: {
        sectorId: 'IR-W04-NR2',
        title: 'CORRIDOR GIS TELEMETRY CANVAS: NORTHERN & WESTERN HEAVY QUAD TRUNKS',
        resolution: 'Micro-Block (1km)',
        liveHeatmapActive: true,
        autoReroutesCount: activeMitigations.filter((m) => m.status === 'Ready').length,
        filters: [
          { id: 'all', label: 'All Corridors', active: true },
          { id: 'dfc', label: 'Freight DFC' },
          { id: 'priority', label: '• Rajdhani/VB Priority', isPriority: true },
          { id: 'ohe', label: 'OHE Power Stability' },
          { id: 'fog', label: '▲ Fog Overlay Active (150m)', isAlert: true },
        ],
        nodes: [
          { id: 'NDLS', name: 'New Delhi', code: 'NDLS', label: 'NDLS 98%', saturation: 98, status: 'critical', x: 90, y: 70, color: '#ef4444' },
          { id: 'GZB', name: 'Ghaziabad', code: 'GZB', label: 'GZB', saturation: 82, status: 'warning', x: 230, y: 85, color: '#f59e0b' },
          { id: 'ALJN', name: 'Aligarh Jn', code: 'ALJN', label: 'ALJN', saturation: 62, status: 'moderate', x: 400, y: 120, color: '#10b981' },
          { id: 'TDL', name: 'Tundla Jn', code: 'TDL', label: 'TDL', saturation: 79, status: 'warning', x: 550, y: 155, color: '#f59e0b' },
          {
            id: 'CNB',
            name: 'Kanpur Central',
            code: 'CNB',
            label: 'CNB Outer',
            saturation: calloutState.isRerouted ? 78 : 114,
            status: calloutState.isRerouted ? 'warning' : 'critical',
            x: 690,
            y: 165,
            color: calloutState.isRerouted ? '#f59e0b' : '#ef4444',
            callout: { ...calloutState },
          },
          { id: 'DDU', name: 'Pt. Deen Dayal Upadhyaya', code: 'DDU', label: 'DDU', saturation: 42, status: 'fluid', x: 930, y: 185, color: '#10b981' },
          { id: 'MTJ', name: 'Mathura Jn', code: 'MTJ', label: 'MTJ', saturation: 78, status: 'warning', x: 150, y: 155, color: '#f59e0b' },
          { id: 'KOTA', name: 'Kota Jn', code: 'KOTA', label: 'KOTA', saturation: 45, status: 'fluid', x: 245, y: 245, color: '#10b981', movingTrain: true },
          { id: 'RTM', name: 'Ratlam Jn', code: 'RTM', label: 'RTM 89%', saturation: 89, status: 'critical', x: 360, y: 305, color: '#ef4444' },
          { id: 'BRC', name: 'Vadodara Jn', code: 'BRC', label: 'BRC', saturation: 74, status: 'warning', x: 510, y: 345, color: '#f59e0b' },
          { id: 'CSMT', name: 'Mumbai CSMT', code: 'CSMT', label: 'CSMT', saturation: 36, status: 'fluid', x: 670, y: 360, color: '#10b981' },
        ],
        tracks: [
          { from: 'NDLS', to: 'GZB', color: '#ef4444', style: 'dashed', congestion: 98, level: 'critical' },
          { from: 'GZB', to: 'ALJN', color: '#eab308', style: 'solid', congestion: 68, level: 'moderate' },
          { from: 'ALJN', to: 'TDL', color: '#10b981', style: 'solid', congestion: 58, level: 'fluid' },
          { from: 'TDL', to: 'CNB', color: calloutState.isRerouted ? '#f59e0b' : '#ef4444', style: 'solid', congestion: calloutState.isRerouted ? 78 : 114, level: calloutState.isRerouted ? 'warning' : 'critical', hasHazardArrow: true },
          { from: 'CNB', to: 'DDU', color: '#10b981', style: 'solid', congestion: 38, level: 'fluid' },
          { from: 'NDLS', to: 'MTJ', color: '#eab308', style: 'solid', congestion: 76, level: 'warning' },
          { from: 'MTJ', to: 'KOTA', color: '#10b981', style: 'solid', congestion: 44, level: 'fluid', trainActive: true },
          { from: 'KOTA', to: 'RTM', color: '#ef4444', style: 'solid', congestion: 89, level: 'critical' },
          { from: 'RTM', to: 'BRC', color: '#eab308', style: 'solid', congestion: 71, level: 'warning' },
          { from: 'BRC', to: 'CSMT', color: '#10b981', style: 'solid', congestion: 36, level: 'fluid' },
        ],
      },
      topChokepoints: [
        {
          rank: 1,
          section: 'CNB Outer - Govindpuri Interlocking',
          code: 'CNB-GOY',
          rippleDelay: '+58 min',
          trainsQueued: calloutState.isRerouted ? 4 : 9,
          capacity: calloutState.isRerouted ? '84%' : '114%',
          severity: calloutState.isRerouted ? 'Mitigated' : 'Critical',
          rootCause: 'Platform Occupancy Conflict & Freight Stabling',
        },
        {
          rank: 2,
          section: 'NDLS - Ghaziabad Quad Track Line 3/4',
          code: 'NDLS-GZB',
          rippleDelay: '+45 min',
          trainsQueued: 6,
          capacity: '98%',
          severity: 'Critical',
          rootCause: 'Dense Smog & Visual Signaling Throttling',
        },
        {
          rank: 3,
          section: 'Ratlam Yard Neck - Nagda Bypass',
          code: 'RTM-NAD',
          rippleDelay: '+34 min',
          trainsQueued: 4,
          capacity: '89%',
          severity: 'High',
          rootCause: 'Overlength Goods Train Crossing',
        },
        {
          rank: 4,
          section: 'Mathura Junction S&T Cross-over Block',
          code: 'MTJ-SW',
          rippleDelay: '+26 min',
          trainsQueued: 3,
          capacity: '78%',
          severity: 'Moderate',
          rootCause: 'Intermittent Track Circuit Drop',
        },
      ],
      aiMitigationActions: activeMitigations,
      corridors: seedAnalytics.corridorCongestion,
      highRiskSections: [
        { section: 'Delhi - Ghaziabad - Kanpur', risk: 'Extreme Fog & Saturation', action: 'Speed Capped at 75 km/h' },
        { section: 'Amritsar - Ludhiana - Ambala', risk: 'Dense Smog', action: 'Headway Spacing Extended' },
        { section: 'Durgapur - Barddhaman', risk: 'Interlocking Work', action: 'Single Line Reversible Operation' },
      ],
      timestamp: new Date().toISOString(),
    }
  },

  /**
   * Execute an AI mitigation / train reroute action
   */
  async executeReroute({ actionId = 'ACT-001' } = {}) {
    const action = activeMitigations.find((m) => m.id === actionId) || activeMitigations[0]
    action.status = 'Executed'

    if (action.id === 'ACT-001' || action.title.includes('FG-8821')) {
      calloutState.isRerouted = true
      calloutState.approachQueue = '4 Rakes Waiting (5 Diverted to DFC)'
      calloutState.predictedDelayCascade = '+12m (Recovered 34 min)'
      calloutState.capBadge = '78% Fluid'
      calloutState.blockSignalStatus = 'Clear Signal Authorized'
      calloutState.actionButtonText = 'Freight #FG-8821 Diverted via DFC'
    }

    return {
      success: true,
      message: `Action ${action.code} executed successfully: ${action.title}`,
      action,
      updatedCongestion: await this.getCongestionData(),
    }
  },
}

