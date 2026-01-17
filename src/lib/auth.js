const CURRENT_USER_STORAGE_KEY = 'mtbmCurrentUser'
const TOKEN_STORAGE_KEY = 'mtbmAuthToken'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.message || 'Request failed'
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  return data
}

export const setAuthToken = (token) => {
  if (!token) return
  localStorage.setItem(TOKEN_STORAGE_KEY, String(token))
}

export const loadAuthToken = () => {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export const setCurrentUser = (user) => {
  if (!user) return

  const safeUser = {
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    organization: user.organization,
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(safeUser))
}

export const loadCurrentUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
}

export const signup = async ({ email, password, role, fullName, organization }) => {
  const data = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, role, fullName, organization }),
  })

  if (data?.token) setAuthToken(data.token)
  if (data?.user) setCurrentUser(data.user)
  return data
}

export const login = async ({ email, password, role }) => {
  const data = await apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, role }),
  })

  if (data?.token) setAuthToken(data.token)
  if (data?.user) setCurrentUser(data.user)
  return data
}

export const logout = () => {
  clearAuthToken()
  clearCurrentUser()
}
