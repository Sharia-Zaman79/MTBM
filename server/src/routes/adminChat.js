import express from 'express'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import AdminMessage from '../models/AdminMessage.js'
import { User } from '../models/User.js'
import { env } from '../lib/env.js'

// Setup uploads directory
const chatUploadsDir = path.join(process.cwd(), 'uploads', 'admin-chat')
fs.mkdirSync(chatUploadsDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, chatUploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '')
    cb(null, `${crypto.randomUUID()}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
})

const router = express.Router()

// Middleware to verify JWT
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

// Middleware to verify admin
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

// Get conversations list for admin
router.get('/conversations', verifyUser, verifyAdmin, async (req, res) => {
  try {
    // Get unique conversations grouped by participant
    const conversations = await AdminMessage.aggregate([
      { $match: { adminId: req.user._id } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$participantId',
          participantRole: { $first: '$participantRole' },
          participantName: { $first: '$participantName' },
          participantEmail: { $first: '$participantEmail' },
          lastMessage: { $first: '$message' },
          lastMessageType: { $first: '$messageType' },
          lastMessageAt: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isRead', false] }, { $ne: ['$senderRole', 'admin'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ])

    res.json({ conversations })
  } catch (err) {
    console.error('Error fetching conversations:', err)
    res.status(500).json({ message: 'Failed to fetch conversations' })
  }
})

// Get messages with a specific user (for admin)
router.get('/messages/:userId', verifyUser, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { since } = req.query

    const filter = {
      adminId: req.user._id,
      participantId: userId,
    }
    if (since) {
      filter.createdAt = { $gt: new Date(since) }
    }

    const messages = await AdminMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(100)

    // Mark messages as read
    await AdminMessage.updateMany(
      { adminId: req.user._id, participantId: userId, senderRole: { $ne: 'admin' }, isRead: false },
      { isRead: true }
    )

    // Get participant info
    const participant = await User.findById(userId).select('-passwordHash')

    res.json({ messages, participant })
  } catch (err) {
    console.error('Error fetching messages:', err)
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

// Send message from admin to user
router.post('/messages/:userId', verifyUser, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { message } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' })
    }

    const participant = await User.findById(userId).select('-passwordHash')
    if (!participant) {
      return res.status(404).json({ message: 'User not found' })
    }

    const newMessage = new AdminMessage({
      participantId: participant._id,
      participantRole: participant.role,
      participantName: participant.fullName,
      participantEmail: participant.email,
      adminId: req.user._id,
      adminName: req.user.fullName,
      senderId: req.user._id,
      senderRole: 'admin',
      senderName: req.user.fullName,
      message: message.trim(),
    })

    await newMessage.save()
    console.log('💬 Admin message sent to:', participant.fullName)

    res.status(201).json({ message: 'Message sent', data: newMessage })
  } catch (err) {
    console.error('Error sending message:', err)
    res.status(500).json({ message: 'Failed to send message' })
  }
})

// Get messages for engineer/technician (from admin)
router.get('/user/messages', verifyUser, async (req, res) => {
  try {
    const { since } = req.query

    const filter = {
      participantId: req.user._id,
    }
    if (since) {
      filter.createdAt = { $gt: new Date(since) }
    }

    const messages = await AdminMessage.find(filter)
      .sort({ createdAt: 1 })
      .limit(100)

    // Mark messages as read
    await AdminMessage.updateMany(
      { participantId: req.user._id, senderRole: 'admin', isRead: false },
      { isRead: true }
    )

    res.json({ messages })
  } catch (err) {
    console.error('Error fetching messages:', err)
    res.status(500).json({ message: 'Failed to fetch messages' })
  }
})

// Send message from user to admin
router.post('/user/messages', verifyUser, async (req, res) => {
  try {
    const { message, adminId } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' })
    }

    // Find an admin (or specific admin if provided)
    let admin
    if (adminId) {
      admin = await User.findOne({ _id: adminId, role: 'admin' }).select('-passwordHash')
    } else {
      // Find the admin they've chatted with before, or any admin
      const existingChat = await AdminMessage.findOne({ participantId: req.user._id }).sort({ createdAt: -1 })
      if (existingChat) {
        admin = await User.findById(existingChat.adminId).select('-passwordHash')
      } else {
        admin = await User.findOne({ role: 'admin' }).select('-passwordHash')
      }
    }

    if (!admin) {
      return res.status(404).json({ message: 'No admin available' })
    }

    const newMessage = new AdminMessage({
      participantId: req.user._id,
      participantRole: req.user.role,
      participantName: req.user.fullName,
      participantEmail: req.user.email,
      adminId: admin._id,
      adminName: admin.fullName,
      senderId: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.fullName,
      message: message.trim(),
    })

    await newMessage.save()
    console.log('💬 User message sent to admin:', admin.fullName)

    res.status(201).json({ message: 'Message sent', data: newMessage })
  } catch (err) {
    console.error('Error sending message:', err)
    res.status(500).json({ message: 'Failed to send message' })
  }
})

// Get unread count for user (from admin)
router.get('/user/unread', verifyUser, async (req, res) => {
  try {
    const unreadCount = await AdminMessage.countDocuments({
      participantId: req.user._id,
      senderRole: 'admin',
      isRead: false,
    })

    res.json({ unreadCount })
  } catch (err) {
    console.error('Error fetching unread count:', err)
    res.status(500).json({ message: 'Failed to fetch unread count' })
  }
})

// Start a new conversation (admin only)
router.post('/start/:userId', verifyUser, verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params
    const { message } = req.body

    const participant = await User.findById(userId).select('-passwordHash')
    if (!participant) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (participant.role === 'admin') {
      return res.status(400).json({ message: 'Cannot start chat with another admin' })
    }

    // Create initial message if provided
    if (message?.trim()) {
      const newMessage = new AdminMessage({
        participantId: participant._id,
        participantRole: participant.role,
        participantName: participant.fullName,
        participantEmail: participant.email,
        adminId: req.user._id,
        adminName: req.user.fullName,
        senderId: req.user._id,
        senderRole: 'admin',
        senderName: req.user.fullName,
        message: message.trim(),
      })
      await newMessage.save()
    }

    res.json({ 
      message: 'Conversation started',
      participant: {
        _id: participant._id,
        fullName: participant.fullName,
        email: participant.email,
        role: participant.role,
      }
    })
  } catch (err) {
    console.error('Error starting conversation:', err)
    res.status(500).json({ message: 'Failed to start conversation' })
  }
})

export default router
