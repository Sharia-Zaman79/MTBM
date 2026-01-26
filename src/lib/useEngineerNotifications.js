import { useEffect, useRef, useCallback } from 'react'
import { repairAlertsApi } from '@/lib/repairAlertsApi'
import { loadCurrentUser } from '@/lib/auth'
import { useAlerts } from '@/lib/alert-store'

/**
 * Hook for engineers to receive notifications when technicians accept their alerts
 * Polls the backend every 5 seconds for status updates
 */
export function useEngineerNotifications() {
  // Track which alerts we've already notified about
  const notifiedAlertsRef = useRef(new Set())
  const intervalRef = useRef(null)
  const { addAlert } = useAlerts()

  const checkForAcceptedAlerts = useCallback(async () => {
    try {
      const user = loadCurrentUser()
      console.log('🔔 useEngineerNotifications - user:', user?.email, 'role:', user?.role)
      
      // Check if user is an engineer (case-insensitive)
      if (!user || user.role?.toLowerCase() !== 'engineer') {
        console.log('🔔 Skipping - not an engineer')
        return
      }

      console.log('🔔 Checking for accepted alerts for engineer:', user.email)
      
      // Get all alerts created by this engineer that are in-progress or resolved
      const { alerts } = await repairAlertsApi.getMyAlerts()
      
      console.log('🔔 Got my alerts:', alerts?.length, 'alerts')
      
      for (const alert of alerts) {
        const alertKey = `${alert._id}-${alert.status}`
        
        // Skip if we already notified about this status
        if (notifiedAlertsRef.current.has(alertKey)) continue

        // Notify for accepted alerts
        if (alert.status === 'in-progress' && alert.technicianName) {
          addAlert({
            type: 'notification',
            level: 'info',
            title: `${alert.technicianName} accepted the problem`,
            detail: `Subsystem: ${alert.subsystem} - ${alert.issue}`,
            // Use actual accepted timestamp from backend
            timestamp: alert.acceptedAt || alert.updatedAt,
          })
          notifiedAlertsRef.current.add(alertKey)
        }

        // Notify for resolved alerts
        if (alert.status === 'resolved' && alert.technicianName) {
          addAlert({
            type: 'notification',
            level: 'info',
            title: `${alert.technicianName} resolved the issue!`,
            detail: `Subsystem: ${alert.subsystem} - ${alert.issue}`,
            // Use actual resolved timestamp from backend
            timestamp: alert.resolvedAt || alert.updatedAt,
          })
          notifiedAlertsRef.current.add(alertKey)
        }
      }
    } catch (err) {
      // Silently fail - don't spam console for polling errors
    }
  }, [addAlert])

  useEffect(() => {
    const user = loadCurrentUser()
    console.log('🔔 useEngineerNotifications useEffect - user:', user?.email, 'role:', user?.role)
    
    if (!user || user.role?.toLowerCase() !== 'engineer') {
      console.log('🔔 useEffect: Not starting polling - not an engineer')
      return
    }

    console.log('🔔 Starting engineer notification polling')
    
    // Initial check
    checkForAcceptedAlerts()

    // Poll every 5 seconds
    intervalRef.current = setInterval(checkForAcceptedAlerts, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [checkForAcceptedAlerts])

  return { checkForAcceptedAlerts }
}

export default useEngineerNotifications
