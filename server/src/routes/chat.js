import express from 'express'
import jwt from 'jsonwebtoken'
import Message from '../models/Message.js'
import RepairAlert from '../models/RepairAlert.js'
import { User } from '../models/User.js'
import { env } from '../lib/env.js'

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
