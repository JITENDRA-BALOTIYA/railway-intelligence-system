// API Base URL Strategy:
// - Development: Vite dev server proxies `/api` → `http://localhost:5000/api` (see vite.config.js proxy)
//   VITE_API_URL is not required in dev because the proxy handles it.
// - Production (Vercel): Set VITE_API_URL=https://<render-backend>.onrender.com via Vercel env vars.
//   The base URL becomes `VITE_API_URL + '/api'` so all requests go to the correct backend.
// NOTE: Individual service calls use paths like `/trains`, `/eta` — the `/api` prefix is added here.
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

export class ApiError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

export const apiClient = {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key])
      }
    })

    try {
      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new ApiError(
          payload.message || `Request failed with status ${response.status}`,
          response.status,
          payload.errors,
        )
      }

      return payload.data !== undefined ? payload.data : payload
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw new ApiError(err.message || 'Network connection failed', 0)
    }
  },

  async post(endpoint, body = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new ApiError(
          payload.message || `Request failed with status ${response.status}`,
          response.status,
          payload.errors,
        )
      }

      return payload.data !== undefined ? payload.data : payload
    } catch (err) {
      if (err instanceof ApiError) throw err
      throw new ApiError(err.message || 'Network connection failed', 0)
    }
  },
}
