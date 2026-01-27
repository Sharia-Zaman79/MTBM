import express from 'express'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
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
    
    // JWT uses 'sub' for user ID (from auth.js signToken)
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

// Create a new repair alert (Engineer submits)
router.post('/', verifyUser, async (req, res) => {
  try {
    console.log('📨 Creating repair alert:', req.body)
    console.log('👤 User:', req.user?.email, req.user?.fullName)
    
    const { subsystem, issue, priority } = req.body

    if (!subsystem || !issue) {
      return res.status(400).json({ message: 'Subsystem and issue are required' })
    }

    const alert = new RepairAlert({
      subsystem,
      issue,
      priority: priority || 'medium',
      status: 'pending',
      engineerId: req.user._id,
      engineerName: req.user.fullName || req.user.email,
      engineerEmail: req.user.email,
    })

    await alert.save()
    console.log('✅ Alert saved to database:', alert._id)

    res.status(201).json({
      message: 'Repair alert created successfully',
      alert,
    })
  } catch (err) {
    console.error('❌ Error creating repair alert:', err)
    res.status(500).json({ message: 'Failed to create repair alert' })
  }
})

// Get all repair alerts (with optional filters)
router.get('/', verifyUser, async (req, res) => {
  try {
    const { status, engineerId, technicianId, limit = 50 } = req.query
    console.log('📋 Fetching alerts with filter:', { status, engineerId, technicianId, limit })

    const filter = {}
    if (status) filter.status = status
    if (engineerId) filter.engineerId = engineerId
    if (technicianId) filter.technicianId = technicianId

    const alerts = await RepairAlert.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    console.log('📋 Found', alerts.length, 'alerts')
    res.json({ alerts })
  } catch (err) {
    console.error('Error fetching repair alerts:', err)
    res.status(500).json({ message: 'Failed to fetch repair alerts' })
  }
})

// Get alerts for current engineer (to see when technician accepts)
router.get('/my-alerts', verifyUser, async (req, res) => {
  try {
    const { status } = req.query
    
    console.log('🔍 MY-ALERTS endpoint called for engineer:', req.user?.email, req.user?._id)
    
    const filter = { engineerId: req.user._id }
    if (status) filter.status = status

    console.log('🔍 MY-ALERTS filter:', filter)
    
    const alerts = await RepairAlert.find(filter)
      .sort({ createdAt: -1 })

    console.log('🔍 MY-ALERTS found:', alerts.length, 'alerts for this engineer')
    
    res.json({ alerts })
  } catch (err) {
    console.error('Error fetching engineer alerts:', err)
    res.status(500).json({ message: 'Failed to fetch alerts' })
  }
})

// Get a single repair alert
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const alert = await RepairAlert.findById(req.params.id)
    
    if (!alert) {
      return res.status(404).json({ message: 'Repair alert not found' })
    }

    res.json({ alert })
  } catch (err) {
    console.error('Error fetching repair alert:', err)
    res.status(500).json({ message: 'Failed to fetch repair alert' })
  }
})

// Update repair alert status (Technician accepts or resolves)
router.patch('/:id', verifyUser, async (req, res) => {
  try {
    const { status } = req.body
    const alertId = req.params.id

    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Valid status required' })
    }

    const alert = await RepairAlert.findById(alertId)
    if (!alert) {
      return res.status(404).json({ message: 'Repair alert not found' })
    }

    const updateData = { status }

    // If technician is accepting the alert
    if (status === 'in-progress' && alert.status === 'pending') {
      updateData.technicianId = req.user._id
      updateData.technicianName = req.user.fullName || req.user.email
      updateData.technicianEmail = req.user.email
      updateData.acceptedAt = new Date()
    }

    // If marking as resolved
    if (status === 'resolved') {
      updateData.resolvedAt = new Date()
    }

    const updatedAlert = await RepairAlert.findByIdAndUpdate(
      alertId,
      updateData,
      { new: true }
    )

    res.json({
      message: `Alert ${status === 'in-progress' ? 'accepted' : 'updated'} successfully`,
      alert: updatedAlert,
    })
  } catch (err) {
    console.error('Error updating repair alert:', err)
    res.status(500).json({ message: 'Failed to update repair alert' })
  }
})

// Delete a repair alert
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const alert = await RepairAlert.findById(req.params.id)
    
    if (!alert) {
      return res.status(404).json({ message: 'Repair alert not found' })
    }

    // Only the engineer who created it can delete (or technician working on it)
    if (
      alert.engineerId.toString() !== req.user._id.toString() &&
      alert.technicianId?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this alert' })
    }

    await RepairAlert.findByIdAndDelete(req.params.id)

    res.json({ message: 'Repair alert deleted successfully' })
  } catch (err) {
    console.error('Error deleting repair alert:', err)
    res.status(500).json({ message: 'Failed to delete repair alert' })
  }
})

// Get stats summary
router.get('/stats/summary', verifyUser, async (req, res) => {
  try {
    const [pending, inProgress, resolved] = await Promise.all([
      RepairAlert.countDocuments({ status: 'pending' }),
      RepairAlert.countDocuments({ status: 'in-progress' }),
      RepairAlert.countDocuments({ status: 'resolved' }),
    ])

    res.json({
      pending,
      inProgress,
      resolved,
      total: pending + inProgress + resolved,
    })
  } catch (err) {
    console.error('Error fetching stats:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// Rate a technician (Engineer only, after issue is resolved)
router.post('/:id/rate', verifyUser, async (req, res) => {
  try {
    const { rating, comment } = req.body
    const alertId = req.params.id

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const alert = await RepairAlert.findById(alertId)
    if (!alert) {
      return res.status(404).json({ message: 'Repair alert not found' })
    }

    // Only the engineer who created the alert can rate
    if (alert.engineerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the requesting engineer can rate' })
    }

    // Can only rate resolved alerts
    if (alert.status !== 'resolved') {
      return res.status(400).json({ message: 'Can only rate after issue is resolved' })
    }

    // Check if already rated
    if (alert.rating) {
      return res.status(400).json({ message: 'This repair has already been rated' })
    }

    const updatedAlert = await RepairAlert.findByIdAndUpdate(
      alertId,
      {
        rating: Number(rating),
        ratingComment: comment?.trim() || null,
        ratedAt: new Date(),
      },
      { new: true }
    )

    console.log('⭐ Technician rated:', updatedAlert.technicianName, 'Rating:', rating)

    res.json({
      message: 'Rating submitted successfully',
      alert: updatedAlert,
    })
  } catch (err) {
    console.error('Error rating technician:', err)
    res.status(500).json({ message: 'Failed to submit rating' })
  }
})

// Get technician's average rating
router.get('/technician/:technicianId/rating', verifyUser, async (req, res) => {
  try {
    const { technicianId } = req.params

    const result = await RepairAlert.aggregate([
      {
        $match: {
          technicianId: new mongoose.Types.ObjectId(technicianId),
          rating: { $ne: null },
        }
      },
      {
        $group: {
          _id: '$technicianId',
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratings: { $push: { rating: '$rating', comment: '$ratingComment', date: '$ratedAt' } }
        }
      }
    ])

    if (result.length === 0) {
      return res.json({
        averageRating: null,
        totalRatings: 0,
        ratings: [],
      })
    }

    res.json({
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalRatings: result[0].totalRatings,
      ratings: result[0].ratings,
    })
  } catch (err) {
    console.error('Error fetching technician rating:', err)
    res.status(500).json({ message: 'Failed to fetch rating' })
  }
})

export default router
