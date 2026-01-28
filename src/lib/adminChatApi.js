import { getAuthHeader, API_BASE_URL } from './auth'

const API_URL = `${API_BASE_URL}/api/admin-chat`

// Get auth header helper
const headers = () => ({
  ...getAuthHeader(),
  'Content-Type': 'application/json',
})

// Admin APIs

// Get all conversations for admin
export async function getConversations() {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: headers(),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch conversations')
  }
  return res.json()
}

// Get messages with a specific user
export async function getMessages(userId, since = null) {
  const url = new URL(`${API_URL}/messages/${userId}`)
  if (since) {
    url.searchParams.set('since', since)
  }
  const res = await fetch(url.toString(), {
    headers: headers(),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch messages')
  }
  return res.json()
}

// Send message to user
export async function sendMessage(userId, message) {
  const res = await fetch(`${API_URL}/messages/${userId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error('Failed to send message')
  }
  return res.json()
}

// Start a new conversation
export async function startConversation(userId, message = '') {
  const res = await fetch(`${API_URL}/start/${userId}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message }),
  })
  if (!res.ok) {
    throw new Error('Failed to start conversation')
  }
  return res.json()
}

// Send image to user (admin)
export async function sendImage(userId, file) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/messages/${userId}/image`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!res.ok) {
    throw new Error('Failed to send image')
  }
  return res.json()
}

// Send voice to user (admin)
export async function sendVoice(userId, audioBlob, duration) {
  const formData = new FormData()
  formData.append('voice', audioBlob, 'voice.webm')
  formData.append('duration', duration.toString())

  const res = await fetch(`${API_URL}/messages/${userId}/voice`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!res.ok) {
    throw new Error('Failed to send voice')
  }
  return res.json()
}

// Delete message
export async function deleteMessage(messageId) {
  const res = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    throw new Error('Failed to delete message')
  }
  return res.json()
}

// User APIs (for engineers/technicians)

// Get messages from admin
export async function getUserMessages(since = null) {
  const url = new URL(`${API_URL}/user/messages`)
  if (since) {
    url.searchParams.set('since', since)
  }
  const res = await fetch(url.toString(), {
    headers: headers(),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch messages')
  }
  return res.json()
}

// Send message to admin
export async function sendUserMessage(message, adminId = null) {
  const res = await fetch(`${API_URL}/user/messages`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, adminId }),
  })
  if (!res.ok) {
    throw new Error('Failed to send message')
  }
  return res.json()
}

// Send image to admin (user)
export async function sendUserImage(file) {
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/user/messages/image`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!res.ok) {
    throw new Error('Failed to send image')
  }
  return res.json()
}

// Send voice to admin (user)
export async function sendUserVoice(audioBlob, duration) {
  const formData = new FormData()
  formData.append('voice', audioBlob, 'voice.webm')
  formData.append('duration', duration.toString())

  const res = await fetch(`${API_URL}/user/messages/voice`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!res.ok) {
    throw new Error('Failed to send voice')
  }
  return res.json()
}

// Get unread count from admin
export async function getUnreadCount() {
  const res = await fetch(`${API_URL}/user/unread`, {
    headers: headers(),
  })
  if (!res.ok) {
    throw new Error('Failed to fetch unread count')
  }
  return res.json()
}
