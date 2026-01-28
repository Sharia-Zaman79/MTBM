import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, X, User, ArrowLeft } from 'lucide-react'
import { Button } from './ui/button'
import * as adminChatApi from '../lib/adminChatApi'
import { API_BASE_URL } from '../lib/auth'

export function AdminChatBox({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations when opened
  useEffect(() => {
    if (isOpen && !selectedUser) {
      fetchConversations()
    }
  }, [isOpen, selectedUser])

  // Poll for new messages when in a conversation
  useEffect(() => {
    if (selectedUser && isOpen) {
      fetchMessages()
      pollRef.current = setInterval(fetchMessages, 3000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedUser, isOpen])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await adminChatApi.getConversations()
      setConversations(data.conversations || [])
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async () => {
    if (!selectedUser) return
    try {
      const data = await adminChatApi.getMessages(selectedUser._id)
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return

    try {
      setSending(true)
      await adminChatApi.sendMessage(selectedUser._id, newMessage.trim())
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleSelectUser = (conv) => {
    setSelectedUser({
      _id: conv._id,
      fullName: conv.participantName,
      email: conv.participantEmail,
      role: conv.participantRole,
    })
    setMessages([])
  }

  const handleBack = () => {
    setSelectedUser(null)
    setMessages([])
    fetchConversations()
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString()
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-purple-600 hover:bg-purple-700"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-600 text-white rounded-t-lg flex items-center justify-between">
        {selectedUser ? (
          <>
            <div className="flex items-center gap-2">
              <button onClick={handleBack} className="p-1 hover:bg-purple-700 rounded">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-semibold">{selectedUser.fullName}</h3>
                <p className="text-xs text-purple-200 capitalize">{selectedUser.role}</p>
              </div>
            </div>
          </>
        ) : (
          <h3 className="font-semibold">Messages</h3>
        )}
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-purple-700 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedUser ? (
          // Conversations list
          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a chat from the Engineers or Technicians tab</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectUser(conv)}
                  className="w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {conv.participantName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessageType === 'image' ? '📷 Image' : 
                         conv.lastMessageType === 'voice' ? '🎤 Voice message' : 
                         conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-0.5">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{conv.participantRole}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          // Messages view
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isAdmin = msg.senderRole === 'admin'
              const showDate = idx === 0 || 
                formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt)

              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 my-2">
                      {formatDate(msg.createdAt)}
                    </div>
                  )}
                  <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isAdmin
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {msg.messageType === 'image' && msg.imageUrl && (
                        <img
                          src={`${API_BASE_URL.replace('/api', '')}${msg.imageUrl}`}
                          alt="Shared"
                          className="max-w-full rounded mb-2"
                        />
                      )}
                      {msg.message && <p className="text-sm">{msg.message}</p>}
                      <span className={`text-xs mt-1 block ${isAdmin ? 'text-purple-200' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input (only when in conversation) */}
      {selectedUser && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || sending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// User Chat with Admin component (for engineers/technicians)
export function UserAdminChat({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check for unread messages periodically
  useEffect(() => {
    const checkUnread = async () => {
      try {
        const data = await adminChatApi.getUnreadCount()
        setUnreadCount(data.unreadCount || 0)
      } catch (err) {
        console.error('Error checking unread:', err)
      }
    }
    checkUnread()
    const interval = setInterval(checkUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch and poll messages when open
  useEffect(() => {
    if (isOpen) {
      fetchMessages()
      setUnreadCount(0)
      pollRef.current = setInterval(fetchMessages, 3000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isOpen])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const data = await adminChatApi.getUserMessages()
      setMessages(data.messages || [])
    } catch (err) {
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)
      await adminChatApi.sendUserMessage(newMessage.trim())
      setNewMessage('')
      fetchMessages()
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString()
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-green-600 hover:bg-green-700 relative"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-600 text-white rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Chat with Admin</h3>
          <p className="text-xs text-green-200">Support & Assistance</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-green-700 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Send a message to get help from admin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isMe = msg.senderRole !== 'admin'
              const showDate = idx === 0 || 
                formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt)

              return (
                <div key={msg._id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 my-2">
                      {formatDate(msg.createdAt)}
                    </div>
                  )}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        isMe
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      {!isMe && (
                        <p className="text-xs font-medium mb-1 text-green-600 dark:text-green-400">
                          Admin
                        </p>
                      )}
                      {msg.messageType === 'image' && msg.imageUrl && (
                        <img
                          src={`${API_BASE_URL.replace('/api', '')}${msg.imageUrl}`}
                          alt="Shared"
                          className="max-w-full rounded mb-2"
                        />
                      )}
                      {msg.message && <p className="text-sm">{msg.message}</p>}
                      <span className={`text-xs mt-1 block ${isMe ? 'text-green-200' : 'text-gray-500'}`}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
