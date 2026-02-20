const CURRENT_USER_STORAGE_KEY = 'mtbmCurrentUser'
const TOKEN_STORAGE_KEY = 'mtbmAuthToken'

// In production (same-origin deploy) use '' so API calls are relative.
// In dev, fall back to localhost:5000 where the Express server runs.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ??
  (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '')

/**
 * Normalise any media / image URL coming from the DB so it works on
 * both localhost and the production same-origin deploy.
 *
 * Handles:
 *  - null / undefined / empty  → returns ''
 *  - Full external https:// URLs (Google avatars etc.)  → pass-through
 *  - URLs that still carry the old http://localhost:5000 prefix
 *    (stored in DB before the fix)  → strips host, keeps /uploads/…
 *  - Relative paths like /uploads/…  → prepends API_BASE_URL
 */
export function normalizeMediaUrl(raw) {
  if (!raw) return '';
  // Full https URL (Google avatar, Cloudinary, etc.) — use as-is
  if (raw.startsWith('https://')) return raw;
  // Strip any old http://localhost:XXXX prefix that was persisted in the DB
  const stripped = raw.replace(/^http:\/\/localhost:\d+/, '');
  // Now it should be a relative path like /uploads/foo.jpg
  if (stripped.startsWith('/')) return `${API_BASE_URL}${stripped}`;
  // Fallback — return whatever we got
  return raw;
}

async function apiRequest(path, options = {}) {
  const token = loadAuthToken()

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const getAuthHeader = () => {
  const token = loadAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
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
    photoUrl: user.photoUrl,
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

export const signup = async ({ email, password, role, fullName, organization, photoUrl }) => {
  const data = await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, role, fullName, organization, photoUrl }),
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

export const googleLogin = async ({ credential, role }) => {
  const data = await apiRequest('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential, role }),
  })

  if (data?.token) setAuthToken(data.token)
  if (data?.user) setCurrentUser(data.user)
  return data
}

export const logout = () => {
  clearAuthToken()
  clearCurrentUser()
}

export const uploadAvatar = async (file) => {
  if (!file) throw new Error('No file selected')

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE_URL}/api/uploads/avatar`, {
    method: 'POST',
    body: formData,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const message = data?.message || 'Avatar upload failed'
    const err = new Error(message)
    err.status = res.status
    throw err
  }

  if (!data?.url) throw new Error('Avatar upload failed')
  return data
}

export const updateMe = async ({ photoUrl }) => {
  const data = await apiRequest('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ photoUrl }),
  })

  if (data?.user) setCurrentUser(data.user)
  return data
}
