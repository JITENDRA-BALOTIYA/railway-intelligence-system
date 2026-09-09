import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'railway_token'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null)
  const [loading, setLoading] = useState(true)

  // Hydrate user profile on initial load if token exists
  useEffect(() => {
    let isMounted = true

    const hydrateSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      if (!savedToken) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const userData = await authService.getCurrentUser()
        if (isMounted && userData) {
          setUser(userData)
          setToken(savedToken)
        }
      } catch (err) {
        console.warn('Session hydration failed or token expired:', err.message)
        localStorage.removeItem(TOKEN_KEY)
        if (isMounted) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    hydrateSession()
    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password })
    if (data && data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    }
    throw new Error('Invalid login response from server')
  }, [])

  const register = useCallback(async (userData) => {
    const data = await authService.register(userData)
    if (data && data.token && data.user) {
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    }
    throw new Error('Invalid registration response from server')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const isAuthenticated = Boolean(user && token)
  const role = user?.role || 'public_user'
  const stationId = user?.stationId || null
  const stationName = user?.stationName || null

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        role,
        stationId,
        stationName,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
