import { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, Send, X, User, ArrowLeft, Image, MapPin, Link2, 
  Smile, Mic, MicOff, Square, Play, Pause, Trash2, Paperclip 
} from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import * as adminChatApi from '../lib/adminChatApi'
import { API_BASE_URL } from '../lib/auth'

// Common emojis for quick access
const EMOJI_LIST = [
  "😀", "😂", "😍", "🥰", "😊", "😎", "🤔", "😅",
  "👍", "👎", "👏", "🙌", "🔥", "❤️", "💯", "✅",
  "😢", "😭", "😱", "🤯", "😤", "🙄", "😴", "🤒",
  "👋", "🤝", "✌️", "🤞", "💪", "🛠️", "⚙️", "🔧",
]

// Voice Player Component
function VoicePlayer({ src, duration, isMe }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg min-w-[180px] ${isMe ? "bg-purple-700" : "bg-neutral-700"}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isMe ? "bg-purple-800 hover:bg-purple-900" : "bg-neutral-600 hover:bg-neutral-500"}`}
      >
        {isPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className={`h-1 rounded-full overflow-hidden ${isMe ? "bg-purple-800" : "bg-neutral-600"}`}>
          <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Mic className="w-3 h-3 text-white/70" />
          <span className="text-[10px] text-white/70">{formatDuration(isPlaying ? currentTime : duration)}</span>
        </div>
      </div>
    </div>
  )
}

// Render message content with link detection
function MessageContent({ message }) {
  if (!message) return null

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = message.split(urlRegex)

  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {parts.map((part, i) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-300 underline hover:text-blue-200"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

export function AdminChatBox({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !selectedUser) {
      fetchConversations()
    }
  }, [isOpen, selectedUser])

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

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
    setShowAttachMenu(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedUser) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setSending(true)
    try {
      await adminChatApi.sendImage(selectedUser._id, file)
      fetchMessages()
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Failed to upload image')
    } finally {
      setSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`
          setNewMessage((prev) => prev + ` 📍 Location: ${locationUrl}`)
          setShowAttachMenu(false)
        },
        () => alert('Unable to get location')
      )
    } else {
      alert('Geolocation not supported')
    }
  }

  const handleShareLink = () => {
    const link = prompt('Enter the URL to share:')
    if (link) {
      setNewMessage((prev) => prev + ` 🔗 ${link}`)
    }
    setShowAttachMenu(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
    setIsRecording(false)
    setAudioBlob(null)
    setRecordingDuration(0)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const sendVoiceMessage = async () => {
    if (!audioBlob || !selectedUser) return

    setSending(true)
    try {
      await adminChatApi.sendVoice(selectedUser._id, audioBlob, recordingDuration)
      setAudioBlob(null)
      setRecordingDuration(0)
      fetchMessages()
    } catch (err) {
      console.error('Error sending voice:', err)
      alert('Failed to send voice message')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return
    try {
      await adminChatApi.deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m._id !== messageId))
    } catch (err) {
      console.error('Error deleting message:', err)
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

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
    <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-600 text-white rounded-t-lg flex items-center justify-between">
        {selectedUser ? (
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="p-1 hover:bg-purple-700 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-semibold">{selectedUser.fullName}</h3>
              <p className="text-xs text-purple-200 capitalize">{selectedUser.role}</p>
            </div>
          </div>
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
          <div className="space-y-2">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => handleSelectUser(conv)}
                  className="w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white truncate">{conv.participantName}</span>
                      <span className="text-xs text-gray-500">{formatDate(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.lastMessageType === 'image' ? '📷 Image' : conv.lastMessageType === 'voice' ? '🎤 Voice' : conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-purple-600 text-white text-xs rounded-full px-2">{conv.unreadCount}</span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isAdmin = msg.senderRole === 'admin'
              const showDate = idx === 0 || formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt)

              return (
                <div key={msg._id}>
                  {showDate && <div className="text-center text-xs text-gray-500 my-2">{formatDate(msg.createdAt)}</div>}
                  <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[80%] rounded-lg p-3 relative ${isAdmin ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                      {msg.messageType === 'image' && msg.imageUrl && (
                        <img src={`${API_BASE_URL.replace('/api', '')}${msg.imageUrl}`} alt="Shared" className="max-w-full rounded mb-2 cursor-pointer" onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}${msg.imageUrl}`, '_blank')} />
                      )}
                      {msg.messageType === 'voice' && msg.voiceUrl && (
                        <VoicePlayer src={`${API_BASE_URL.replace('/api', '')}${msg.voiceUrl}`} duration={msg.voiceDuration || 0} isMe={isAdmin} />
                      )}
                      {msg.message && <MessageContent message={msg.message} />}
                      <span className={`text-xs mt-1 block ${isAdmin ? 'text-purple-200' : 'text-gray-500'}`}>{formatTime(msg.createdAt)}</span>
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
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          
          {/* Recording UI */}
          {isRecording && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600 dark:text-red-400">Recording... {formatDuration(recordingDuration)}</span>
              <div className="flex-1" />
              <Button size="sm" variant="ghost" onClick={cancelRecording}><X className="w-4 h-4" /></Button>
              <Button size="sm" onClick={stopRecording} className="bg-red-500 hover:bg-red-600"><Square className="w-4 h-4" /></Button>
            </div>
          )}

          {/* Voice preview */}
          {audioBlob && !isRecording && (
            <div className="flex items-center gap-2 mb-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <VoicePlayer src={URL.createObjectURL(audioBlob)} duration={recordingDuration} isMe={true} />
              <Button size="sm" variant="ghost" onClick={cancelRecording}><X className="w-4 h-4" /></Button>
              <Button size="sm" onClick={sendVoiceMessage} disabled={sending} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {!isRecording && !audioBlob && (
            <div className="flex items-center gap-2">
              {/* Emoji */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2"><Smile className="w-5 h-5 text-gray-500" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:bg-gray-100 rounded p-1">{emoji}</button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Attachments */}
              <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2"><Paperclip className="w-5 h-5 text-gray-500" /></Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <button onClick={handleImageUpload} className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
                      <Image className="w-4 h-4" /> Photo
                    </button>
                    <button onClick={handleShareLocation} className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
                      <MapPin className="w-4 h-4" /> Location
                    </button>
                    <button onClick={handleShareLink} className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
                      <Link2 className="w-4 h-4" /> Link
                    </button>
                  </div>
                </PopoverContent>
              </Popover>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              {/* Mic / Send */}
              {newMessage.trim() ? (
                <Button onClick={handleSend} disabled={sending} className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={startRecording} className="bg-purple-600 hover:bg-purple-700">
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const recordingIntervalRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const handleImageUpload = () => {
    fileInputRef.current?.click()
    setShowAttachMenu(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setSending(true)
    try {
      await adminChatApi.sendUserImage(file)
      fetchMessages()
    } catch (err) {
      console.error('Error uploading image:', err)
      alert('Failed to upload image')
    } finally {
      setSending(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          const locationUrl = `https://maps.google.com/?q=${latitude},${longitude}`
          setNewMessage((prev) => prev + ` 📍 Location: ${locationUrl}`)
          setShowAttachMenu(false)
        },
        () => alert('Unable to get location')
      )
    } else {
      alert('Geolocation not supported')
    }
  }

  const handleShareLink = () => {
    const link = prompt('Enter the URL to share:')
    if (link) {
      setNewMessage((prev) => prev + ` 🔗 ${link}`)
    }
    setShowAttachMenu(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Unable to access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
        recordingIntervalRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
    setIsRecording(false)
    setAudioBlob(null)
    setRecordingDuration(0)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const sendVoiceMessage = async () => {
    if (!audioBlob) return

    setSending(true)
    try {
      await adminChatApi.sendUserVoice(audioBlob, recordingDuration)
      setAudioBlob(null)
      setRecordingDuration(0)
      fetchMessages()
    } catch (err) {
      console.error('Error sending voice:', err)
      alert('Failed to send voice message')
    } finally {
      setSending(false)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return
    try {
      await adminChatApi.deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m._id !== messageId))
    } catch (err) {
      console.error('Error deleting message:', err)
    }
  }

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const formatDate = (date) => {
    const d = new Date(date)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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
    <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
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
            <p className="text-sm">Send a message to get help</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, idx) => {
              const isMe = msg.senderRole !== 'admin'
              const showDate = idx === 0 || formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt)

              return (
                <div key={msg._id}>
                  {showDate && <div className="text-center text-xs text-gray-500 my-2">{formatDate(msg.createdAt)}</div>}
                  <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[80%] rounded-lg p-3 relative ${isMe ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                      {isMe && (
                        <button
                          onClick={() => handleDeleteMessage(msg._id)}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                      {!isMe && <p className="text-xs font-medium mb-1 text-green-600 dark:text-green-400">Admin</p>}
                      {msg.messageType === 'image' && msg.imageUrl && (
                        <img src={`${API_BASE_URL.replace('/api', '')}${msg.imageUrl}`} alt="Shared" className="max-w-full rounded mb-2 cursor-pointer" onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}${msg.imageUrl}`, '_blank')} />
                      )}
                      {msg.messageType === 'voice' && msg.voiceUrl && (
                        <VoicePlayer src={`${API_BASE_URL.replace('/api', '')}${msg.voiceUrl}`} duration={msg.voiceDuration || 0} isMe={isMe} />
                      )}
                      {msg.message && <MessageContent message={msg.message} />}
                      <span className={`text-xs mt-1 block ${isMe ? 'text-green-200' : 'text-gray-500'}`}>{formatTime(msg.createdAt)}</span>
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
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* Recording UI */}
        {isRecording && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 dark:text-red-400">Recording... {formatDuration(recordingDuration)}</span>
            <div className="flex-1" />
            <Button size="sm" variant="ghost" onClick={cancelRecording}><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={stopRecording} className="bg-red-500 hover:bg-red-600"><Square className="w-4 h-4" /></Button>
          </div>
        )}

        {/* Voice preview */}
        {audioBlob && !isRecording && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <VoicePlayer src={URL.createObjectURL(audioBlob)} duration={recordingDuration} isMe={true} />
            <Button size="sm" variant="ghost" onClick={cancelRecording}><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={sendVoiceMessage} disabled={sending} className="bg-green-600 hover:bg-green-700">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}

        {!isRecording && !audioBlob && (
          <div className="flex items-center gap-2">
            {/* Emoji */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2"><Smile className="w-5 h-5 text-gray-500" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button key={emoji} onClick={() => handleEmojiClick(emoji)} className="text-xl hover:bg-gray-100 rounded p-1">{emoji}</button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Attachments */}
            <Popover open={showAttachMenu} onOpenChange={setShowAttachMenu}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2"><Paperclip className="w-5 h-5 text-gray-500" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <button onClick={handleImageUpload} className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
                    <Image className="w-4 h-4" /> Photo
                  </button>
                  <button onClick={handleShareLocation} className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
                    <MapPin className="w-4 h-4" /> Location
                  </button>
                  <button onClick={handleShareLink} className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm">
                    <Link2 className="w-4 h-4" /> Link
                  </button>
                </div>
              </PopoverContent>
            </Popover>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Mic / Send */}
            {newMessage.trim() ? (
              <Button onClick={handleSend} disabled={sending} className="bg-green-600 hover:bg-green-700">
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={startRecording} className="bg-green-600 hover:bg-green-700">
                <Mic className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
