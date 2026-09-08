import { createContext, useContext, useState, useEffect } from 'react'
import { alertService } from '../services/alertService.js'

const NotificationContext = createContext(null)

export const NotificationProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await alertService.getAlerts()
        setAlerts(data || [])
        setUnreadCount(data?.length || 0)
      } catch (e) {
        console.error('Failed to load alerts in context:', e)
      }
    }
    loadAlerts()
  }, [])

  const markAllRead = () => {
    setUnreadCount(0)
  }

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev)
    if (!isDrawerOpen) {
      markAllRead()
    }
  }

  return (
    <NotificationContext.Provider
      value={{
        alerts,
        unreadCount,
        isDrawerOpen,
        toggleDrawer,
        setIsDrawerOpen,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
}
