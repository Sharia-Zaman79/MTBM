import express from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import Message from '../models/Message.js'
import RepairAlert from '../models/RepairAlert.js'
import { User } from '../models/User.js'
import { env } from '../lib/env.js'

// Setup uploads directory for chat images and voice
const chatUploadsDir = path.join(process.cwd(), 'uploads', 'chat')
const voiceUploadsDir = path.join(process.cwd(), 'uploads', 'voice')
fs.mkdirSync(chatUploadsDir, { recursive: true })
fs.mkdirSync(voiceUploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, chatUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '')
    cb(null, `${crypto.randomUUID()}${ext}`)
  },
})

const voiceStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, voiceUploadsDir),
  filename: (_req, file, cb) => {
    cb(null, `${crypto.randomUUID()}.webm`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) return cb(null, true)
    cb(new Error('Only images are allowed'))
  },
})

const voiceUpload = multer({
  storage: voiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for voice
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith('audio/') || file.mimetype === 'video/webm') return cb(null, true)
    cb(new Error('Only audio files are allowed'))
  },
})

const router = express.Router()

// Middleware to verify JWT and get user info
const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, env.jwtSecret)
    
    const userId = decoded.sub || decoded.userId
    const user = await User.findById(userId).select('-passwordHash')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Auth error:', err.message)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Middleware to verify user has access to the repair alert's chat
const verifyAlertAccess = async (req, res, next) => {
  try {
    const { alertId } = req.params
    const alert = await RepairAlert.findById(alertId)
    
    if (!alert) {
      return res.status(404).json({ message: 'Repair alert not found' })
    }

    // Only the assigned engineer or technician can access the chat
    const userId = req.user._id.toString()
    const isEngineer = alert.engineerId.toString() === userId
    const isTechnician = alert.technicianId?.toString() === userId

    if (!isEngineer && !isTechnician) {
      return res.status(403).json({ message: 'You do not have access to this chat' })
    }

    // Alert must be accepted (in-progress) or resolved to chat
    if (alert.status === 'pending') {
      return res.status(400).json({ message: 'Chat is only available after a technician accepts the request' })
    }

    req.alert = alert
    req.isEngineer = isEngineer
    next()
  } catch (err) {
    console.error('Alert access error:', err.message)
    return res.status(500).json({ message: 'Failed to verify access' })
  }
}

// Get messages for a repair alert
router.get('/:alertId', verifyUser, verifyAlertAccess, async (req, res) => {
  try {
    const { alertId } = req.params
    const { since } = req.query // For polling - get messages after this timestamp

    const filter = { repairAlertId: alertId }
    if (since) {
      filter.createdAt = { $gt: new Date(since) }
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: 1 })
      .limit(100)

    // Mark messages as read for the current user
    const otherRole = req.isEngineer ? 'technician' : 'engineer'
    await Message.updateMany(
      { repairAlertId: alertId, senderRole: otherRole, isRead: false },
      { isRead: true }
    )

    res.json({
      messages,
      alert: {
        _id: req.alert._id,
        subsystem: req.alert.subsystem,
        issue: req.alert.issue,
        status: req.alert.status,
        engineerName: req.alert.engineerName,
        technicianName: req.alert.technicianName,
        priority: req.alert.priority,
      }
    })
  } catch (err) {
    console.error('Error fetching messages:', err)
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

// Send a message
router.post('/:alertId', verifyUser, verifyAlertAccess, async (req, res) => {
  try {
    const { alertId } = req.params
    const { message } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' })
    }

    const newMessage = new Message({
      repairAlertId: alertId,
      senderId: req.user._id,
      senderName: req.user.fullName || req.user.email,
      senderRole: req.isEngineer ? 'engineer' : 'technician',
      message: message.trim(),
    })

    await newMessage.save()
    console.log('💬 Message sent:', newMessage._id, 'for alert:', alertId)

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage,
    })
  } catch (err) {
    console.error('Error sending message:', err)
    res.status(500).json({ message: 'Failed to send message' })
  }
})

// Upload image and send as message
router.post('/:alertId/image', verifyUser, verifyAlertAccess, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' })
    }

    try {
      const { alertId } = req.params
      const imageUrl = `/uploads/chat/${req.file.filename}`

      const newMessage = new Message({
        repairAlertId: alertId,
        senderId: req.user._id,
        senderName: req.user.fullName || req.user.email,
        senderRole: req.isEngineer ? 'engineer' : 'technician',
        message: '',
        messageType: 'image',
        imageUrl,
      })

      await newMessage.save()
      console.log('📷 Image message sent:', newMessage._id)

      res.status(201).json({
        message: 'Image sent successfully',
        data: newMessage,
      })
    } catch (error) {
      console.error('Error saving image message:', error)
      res.status(500).json({ message: 'Failed to send image' })
    }
  })
})

// Upload voice message
router.post('/:alertId/voice', verifyUser, verifyAlertAccess, (req, res) => {
  voiceUpload.single('voice')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No voice file uploaded' })
    }

    try {
      const { alertId } = req.params
      const { duration } = req.body
      const voiceUrl = `/uploads/voice/${req.file.filename}`

      const newMessage = new Message({
        repairAlertId: alertId,
        senderId: req.user._id,
        senderName: req.user.fullName || req.user.email,
        senderRole: req.isEngineer ? 'engineer' : 'technician',
        message: '',
        messageType: 'voice',
        voiceUrl,
        voiceDuration: parseFloat(duration) || 0,
      })

      await newMessage.save()
      console.log('🎤 Voice message sent:', newMessage._id)

      res.status(201).json({
        message: 'Voice message sent successfully',
        data: newMessage,
      })
    } catch (error) {
      console.error('Error saving voice message:', error)
      res.status(500).json({ message: 'Failed to send voice message' })
    }
  })
})

// Get unread message count for user
router.get('/unread/count', verifyUser, async (req, res) => {
  try {
    const userId = req.user._id.toString()
    const userRole = req.user.role?.toLowerCase()

    // Find all alerts where user is involved
    let alertFilter = {}
    if (userRole === 'engineer') {
      alertFilter = { engineerId: req.user._id, status: { $ne: 'pending' } }
    } else {
      alertFilter = { technicianId: req.user._id }
    }

    const alerts = await RepairAlert.find(alertFilter).select('_id')
    const alertIds = alerts.map(a => a._id)

    // Count unread messages not sent by this user
    const otherRole = userRole === 'engineer' ? 'technician' : 'engineer'
    const unreadCount = await Message.countDocuments({
      repairAlertId: { $in: alertIds },
      senderRole: otherRole,
      isRead: false,
    })

    res.json({ unreadCount })
  } catch (err) {
    console.error('Error fetching unread count:', err)
    res.status(500).json({ message: 'Failed to fetch unread count' })
  }
})

export default router
