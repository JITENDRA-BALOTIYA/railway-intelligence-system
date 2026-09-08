const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
