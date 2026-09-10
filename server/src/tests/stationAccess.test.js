import app from '../app.js'
import { memoryStore } from '../config/database.js'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

async function runTests() {
  console.log('=== Starting Station Access & Scoping Automated Verification ===\n')

  const server = app.listen(0)
  const port = server.address().port
  const baseUrl = `http://localhost:${port}/api`

  let passed = 0
  let failed = 0

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`)
      passed++
    } else {
      console.error(`[FAIL] ${message}`)
      failed++
    }
  }

  try {
    // 1. Generate JWT for NDLS Station Master
    const smToken = jwt.sign(
      { userId: 'usr_station_master_ndls', email: 'sm.ndls@railway.gov.in', role: 'station_master', stationId: 'NDLS' },
      config.jwtSecret,
      { expiresIn: '1h' },
    )

    // Ensure memoryStore user exists
    if (!memoryStore.users.find(u => u.email === 'sm.ndls@railway.gov.in')) {
      memoryStore.users.push({
        _id: 'usr_station_master_ndls',
        name: 'Station Director (NDLS)',
        email: 'sm.ndls@railway.gov.in',
        role: 'station_master',
        stationId: 'NDLS',
        stationName: 'New Delhi Railway Station',
        isActive: true,
      })
    }

    // 2. Test GET /api/stations/search?query=Mumbai
    const searchRes = await fetch(`${baseUrl}/stations/search?query=Mumbai`)
    const searchJson = await searchRes.json()
    assert(searchRes.status === 200, 'GET /api/stations/search returns status 200')
    assert(
      searchJson.data && searchJson.data.some((s) => (s.stationCode === 'MMCT' || s.code === 'MMCT')),
      'GET /api/stations/search?query=Mumbai includes MMCT',
    )

    // 3. Test empty query search returns stations
    const emptySearchRes = await fetch(`${baseUrl}/stations/search`)
    const emptySearchJson = await emptySearchRes.json()
    assert(emptySearchRes.status === 200 && emptySearchJson.data?.length > 0, 'GET /api/stations/search without query returns baseline stations')

    // 4. Test NDLS Station Master reading MMCT schedule (read-only access)
    const schedRes = await fetch(`${baseUrl}/stations/MMCT/schedule`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(schedRes.status === 200, 'Station Master can READ schedule of another station (MMCT) -> 200 OK')

    // 5. Test NDLS Station Master reading MMCT arrivals
    const arrRes = await fetch(`${baseUrl}/stations/MMCT/arrivals`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(arrRes.status === 200, 'Station Master can READ arrivals of another station (MMCT) -> 200 OK')

    // 6. Test NDLS Station Master reading MMCT departures
    const depRes = await fetch(`${baseUrl}/stations/MMCT/departures`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(depRes.status === 200, 'Station Master can READ departures of another station (MMCT) -> 200 OK')

    // 7. Test NDLS Station Master reading MMCT platforms
    const pfRes = await fetch(`${baseUrl}/stations/MMCT/platforms`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(pfRes.status === 200, 'Station Master can READ platforms of another station (MMCT) -> 200 OK')

    // 8. Test NDLS Station Master reading MMCT alerts
    const alertsRes = await fetch(`${baseUrl}/stations/MMCT/alerts`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(alertsRes.status === 200, 'Station Master can READ alerts of another station (MMCT) -> 200 OK')

    // 9. Test NDLS Station Master attempting to ACKNOWLEDGE alert at MMCT (must 403)
    const ackRes = await fetch(`${baseUrl}/stations/MMCT/alerts/alert_01/acknowledge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${smToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const ackJson = await ackRes.json()
    assert(ackRes.status === 403, `Station Master attempting alert acknowledge on MMCT is REJECTED with 403 (Actual status: ${ackRes.status})`)
    assert(
      ackJson.message && ackJson.message.includes('NDLS'),
      `403 response explains user is only authorized for NDLS (Message: "${ackJson.message}")`,
    )

    // 10. Test NDLS Station Master attempting cleaning action for another station
    // Setup a dummy MMCT cleaning task in memoryStore
    memoryStore.cleaningTasks.push({
      taskId: 'CLN-MMCT-TEST-01',
      stationId: 'MMCT',
      status: 'approaching',
    })
    const cleanActionRes = await fetch(`${baseUrl}/cleaning/tasks/CLN-MMCT-TEST-01/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${smToken}`, 'Content-Type': 'application/json' },
    })
    assert(cleanActionRes.status === 403, `Station Master attempting cleaning start on MMCT task is REJECTED with 403 (Actual status: ${cleanActionRes.status})`)

    // 11. Test /api/dashboard/role?stationId=MMCT with NDLS token
    const roleDashRes = await fetch(`${baseUrl}/dashboard/role?stationId=MMCT`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    const roleDashJson = await roleDashRes.json()
    assert(roleDashRes.status === 200, 'GET /api/dashboard/role?stationId=MMCT returns 200 OK')
    assert(
      roleDashJson.data?.station?.stationCode === 'MMCT',
      `Role dashboard returned MMCT station profile (Actual code: ${roleDashJson.data?.station?.stationCode})`,
    )

    // 12. Test non-existent valid-format station code query (returns 404)
    const notFoundRes = await fetch(`${baseUrl}/stations/QQQ`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(notFoundRes.status === 404, 'GET /api/stations/QQQ correctly returns 404 Not Found')

    // 13. Test invalid code format
    const badFormatRes = await fetch(`${baseUrl}/stations/INVALIDCODE123`, {
      headers: { Authorization: `Bearer ${smToken}` },
    })
    assert(badFormatRes.status === 400, 'GET /api/stations/INVALIDCODE123 returns 400 Bad Request due to format validation')

    console.log(`\n=== Verification Complete: ${passed} Passed, ${failed} Failed ===`)
  } catch (err) {
    console.error('Test execution error:', err)
  } finally {
    server.close()
    process.exit(failed > 0 ? 1 : 0)
  }
}

runTests()
