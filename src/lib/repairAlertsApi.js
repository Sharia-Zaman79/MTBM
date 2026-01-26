import { loadAuthToken, loadCurrentUser } from '@/lib/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

console.log('🔗 API Base URL:', API_BASE_URL)

async function apiRequest(path, options = {}) {
  const token = loadAuthToken()
  console.log('🔑 Token available:', !!token)

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => null)
  console.log('📥 Response:', res.status, data)
  
  if (!res.ok) {
    const message = data?.message || 'Request failed'
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

export const repairAlertsApi = {
  // Create a new repair alert (Engineer submits)
  create: async ({ subsystem, issue, priority = 'medium' }) => {
    return apiRequest('/api/repair-alerts', {
      method: 'POST',
      body: JSON.stringify({ subsystem, issue, priority }),
    })
  },

  // Get all repair alerts with optional filters
  getAll: async (status = null, limit = 50) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (limit) params.append('limit', limit.toString())
    
    const query = params.toString()
    return apiRequest(`/api/repair-alerts${query ? `?${query}` : ''}`)
  },

  // Get alerts created by current engineer
  getMyAlerts: async (status = null) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const query = params.toString()
    return apiRequest(`/api/repair-alerts/my-alerts${query ? `?${query}` : ''}`)
  },

  // Get a single repair alert
  getOne: async (id) => {
    return apiRequest(`/api/repair-alerts/${id}`)
  },

  // Update repair alert status (Technician accepts or resolves)
  update: async (id, status) => {
    return apiRequest(`/api/repair-alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  // Delete a repair alert
  delete: async (id) => {
    return apiRequest(`/api/repair-alerts/${id}`, {
      method: 'DELETE',
    })
  },

  // Get stats summary
  getStats: async () => {
    return apiRequest('/api/repair-alerts/stats/summary')
  },
}

export default repairAlertsApi
