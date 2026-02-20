const rooms = new Map()

const DEFAULT_TTL_MS = 45_000

function getRoom(roomKey) {
  let room = rooms.get(roomKey)
  if (!room) {
    room = new Map()
    rooms.set(roomKey, room)
  }
  return room
}

function normalizeUser(user) {
  return {
    userId: user.userId?.toString(),
    name: user.name || 'Unknown',
    role: user.role || 'unknown',
  }
}

export function touchPresence(roomKey, user) {
  const { userId, name, role } = normalizeUser(user)
  if (!roomKey || !userId) return

  const room = getRoom(roomKey)
  room.set(userId, { userId, name, role, lastSeen: Date.now() })
}

export function listActive(roomKey, { ttlMs = DEFAULT_TTL_MS } = {}) {
  const room = rooms.get(roomKey)
  if (!room) return []

  const now = Date.now()
  const active = []

  for (const [userId, entry] of room.entries()) {
    if (!entry?.lastSeen || now - entry.lastSeen > ttlMs) {
      room.delete(userId)
      continue
    }
    active.push({ ...entry })
  }

  if (room.size === 0) rooms.delete(roomKey)

  active.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
  return active
}
