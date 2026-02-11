import { loadAuthToken } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function apiRequest(endpoint, options = {}) {
  const token = loadAuthToken()
  
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || 'Request failed')
  }
  return data
}

export const adminApi = {
  // Get dashboard overview stats
  getOverviewStats: async () => {
    return apiRequest('/api/admin/stats/overview')
  },

  // Get all engineers with their stats
  getEngineers: async () => {
    return apiRequest('/api/admin/engineers')
  },

  // Get all technicians with their stats
  getTechnicians: async () => {
    return apiRequest('/api/admin/technicians')
  },

  // Get monthly report data
  getMonthlyReport: async (month, year) => {
    const params = new URLSearchParams()
    if (month !== undefined) params.append('month', month)
    if (year !== undefined) params.append('year', year)
    const query = params.toString()
    return apiRequest(`/api/admin/reports/monthly${query ? `?${query}` : ''}`)
  },

  // Get monthly report for a specific engineer/technician
  getMonthlyUserReport: async (userId, month, year) => {
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (month !== undefined) params.append('month', month)
    if (year !== undefined) params.append('year', year)
    const query = params.toString()
    return apiRequest(`/api/admin/reports/monthly/user${query ? `?${query}` : ''}`)
  },

  // Get all alerts
  getAlerts: async (status, priority, limit) => {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (priority) params.append('priority', priority)
    if (limit) params.append('limit', limit)
    const query = params.toString()
    return apiRequest(`/api/admin/alerts${query ? `?${query}` : ''}`)
  },
}

export default adminApi
