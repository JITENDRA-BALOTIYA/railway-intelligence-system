import { useState, useEffect } from 'react'
import { alertService } from '../services/alertService.js'

export const useNotifications = () => {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const fetchAlerts = async () => {
      try {
        const data = await alertService.getAlerts()
        if (isMounted) {
          setAlerts(data || [])
          setUnreadCount(data?.length || 0)
        }
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAlerts()
    return () => {
      isMounted = false
    }
  }, [])

  const markAllRead = () => {
    setUnreadCount(0)
  }

  return { alerts, unreadCount, markAllRead, loading }
}
