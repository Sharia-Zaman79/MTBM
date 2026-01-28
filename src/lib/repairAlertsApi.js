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

  // Rate a technician (Engineer only, after resolved)
  rateTechnician: async (alertId, rating, comment = null) => {
    return apiRequest(`/api/repair-alerts/${alertId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    })
  },

  // Get technician's average rating
  getTechnicianRating: async (technicianId) => {
    return apiRequest(`/api/repair-alerts/technician/${technicianId}/rating`)
  },

  // Get technician's complete stats
  getTechnicianStats: async (technicianId) => {
    return apiRequest(`/api/repair-alerts/technician/${technicianId}/stats`)
  },
}

// Profile API
export const profileApi = {
  // Get current user profile
  getProfile: async () => {
    return apiRequest('/api/auth/profile')
  },

  // Update profile
  updateProfile: async (data) => {
    return apiRequest('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  // Upload profile photo
  uploadPhoto: async (file) => {
    const token = loadAuthToken()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE_URL}/api/uploads/avatar`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.message || 'Photo upload failed')
    }
    return data
  },
}

// Chat API
export const chatApi = {
  // Get messages for a repair alert
  getMessages: async (alertId, since = null) => {
    const params = new URLSearchParams()
    if (since) params.append('since', since)
    
    const query = params.toString()
    return apiRequest(`/api/chat/${alertId}${query ? `?${query}` : ''}`)
  },

  // Send a message
  sendMessage: async (alertId, message) => {
    return apiRequest(`/api/chat/${alertId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },

  // Upload and send an image
  sendImage: async (alertId, file) => {
    const token = loadAuthToken()
    const formData = new FormData()
    formData.append('image', file)

    const res = await fetch(`${API_BASE_URL}/api/chat/${alertId}/image`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.message || 'Image upload failed')
    }
    return data
  },

  // Upload and send a voice message
  sendVoice: async (alertId, blob, duration) => {
    const token = loadAuthToken()
    const formData = new FormData()
    formData.append('voice', blob, 'voice.webm')
    formData.append('duration', duration.toString())

    const res = await fetch(`${API_BASE_URL}/api/chat/${alertId}/voice`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(data?.message || 'Voice upload failed')
    }
    return data
  },

  // Get unread message count
  getUnreadCount: async () => {
    return apiRequest('/api/chat/unread/count')
  },
}

export default repairAlertsApi
