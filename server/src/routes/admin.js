import express from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import RepairAlert from '../models/RepairAlert.js'
import Message from '../models/Message.js'
import { env } from '../lib/env.js'

const router = express.Router()

// Middleware to verify JWT and ensure admin role
const verifyAdmin = async (req, res, next) => {
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

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('Admin auth error:', err.message)
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Get dashboard overview stats
router.get('/stats/overview', verifyAdmin, async (req, res) => {
  try {
    const [
      totalEngineers,
      totalTechnicians,
      totalAlerts,
      pendingAlerts,
      inProgressAlerts,
      resolvedAlerts,
    ] = await Promise.all([
      User.countDocuments({ role: 'engineer' }),
      User.countDocuments({ role: 'technician' }),
      RepairAlert.countDocuments(),
      RepairAlert.countDocuments({ status: 'pending' }),
      RepairAlert.countDocuments({ status: 'in-progress' }),
      RepairAlert.countDocuments({ status: 'resolved' }),
    ])

    res.json({
      totalEngineers,
      totalTechnicians,
      totalAlerts,
      pendingAlerts,
      inProgressAlerts,
      resolvedAlerts,
    })
  } catch (err) {
    console.error('Error fetching overview stats:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// Get all engineers with their stats
router.get('/engineers', verifyAdmin, async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' }).select('-passwordHash').lean()
    
    // Get stats for each engineer
    const engineerStats = await Promise.all(
      engineers.map(async (engineer) => {
        const alerts = await RepairAlert.find({ engineerId: engineer._id }).lean()
        
        const totalIssues = alerts.length
        const criticalIssues = alerts.filter(a => a.priority === 'critical').length
        const highIssues = alerts.filter(a => a.priority === 'high').length
        const mediumIssues = alerts.filter(a => a.priority === 'medium').length
        const lowIssues = alerts.filter(a => a.priority === 'low').length
        const resolvedIssues = alerts.filter(a => a.status === 'resolved').length
        
        // Calculate average response time (time from creation to acceptance)
        const acceptedAlerts = alerts.filter(a => a.acceptedAt)
        let avgResponseTime = 0
        if (acceptedAlerts.length > 0) {
          const totalResponseTime = acceptedAlerts.reduce((sum, a) => {
            return sum + (new Date(a.acceptedAt) - new Date(a.createdAt))
          }, 0)
          avgResponseTime = Math.round(totalResponseTime / acceptedAlerts.length / 60000) // in minutes
        }

        return {
          ...engineer,
          stats: {
            totalIssues,
            criticalIssues,
            highIssues,
            mediumIssues,
            lowIssues,
            resolvedIssues,
            avgResponseTime,
          }
        }
      })
    )

    res.json({ engineers: engineerStats })
  } catch (err) {
    console.error('Error fetching engineers:', err)
    res.status(500).json({ message: 'Failed to fetch engineers' })
  }
})

// Get all technicians with their stats
router.get('/technicians', verifyAdmin, async (req, res) => {
  try {
    const technicians = await User.find({ role: 'technician' }).select('-passwordHash').lean()
    
    // Get stats for each technician
    const technicianStats = await Promise.all(
      technicians.map(async (technician) => {
        const alerts = await RepairAlert.find({ technicianId: technician._id }).lean()
        
        const tasksAssigned = alerts.length
        const tasksCompleted = alerts.filter(a => a.status === 'resolved').length
        const tasksInProgress = alerts.filter(a => a.status === 'in-progress').length
        
        // Calculate average fix time (time from acceptance to resolution)
        const completedAlerts = alerts.filter(a => a.resolvedAt && a.acceptedAt)
        let avgFixTime = 0
        if (completedAlerts.length > 0) {
          const totalFixTime = completedAlerts.reduce((sum, a) => {
            return sum + (new Date(a.resolvedAt) - new Date(a.acceptedAt))
          }, 0)
          avgFixTime = Math.round(totalFixTime / completedAlerts.length / 60000) // in minutes
        }

        // Calculate success rate
        const successRate = tasksAssigned > 0 
          ? Math.round((tasksCompleted / tasksAssigned) * 100) 
          : 0

        // Calculate average rating
        const ratedAlerts = alerts.filter(a => a.rating)
        const avgRating = ratedAlerts.length > 0
          ? (ratedAlerts.reduce((sum, a) => sum + a.rating, 0) / ratedAlerts.length).toFixed(1)
          : null

        return {
          ...technician,
          stats: {
            tasksAssigned,
            tasksCompleted,
            tasksInProgress,
            avgFixTime,
            successRate,
            avgRating,
          }
        }
      })
    )

    res.json({ technicians: technicianStats })
  } catch (err) {
    console.error('Error fetching technicians:', err)
    res.status(500).json({ message: 'Failed to fetch technicians' })
  }
})

// Get monthly report data
router.get('/reports/monthly', verifyAdmin, async (req, res) => {
  try {
    const { month, year } = req.query
    const monthNum = Number(month)
    const yearNum = Number(year)
    const targetMonth = Number.isInteger(monthNum) && monthNum >= 0 && monthNum <= 11
      ? monthNum
      : new Date().getMonth()
    const targetYear = Number.isInteger(yearNum) && yearNum >= 1970
      ? yearNum
      : new Date().getFullYear()
    
    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    // Get all alerts in the month
    const alerts = await RepairAlert.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).lean()

    // Get all technicians
    const technicians = await User.find({ role: 'technician' }).select('-passwordHash').lean()
    
    // Technician report data
    const technicianReport = await Promise.all(
      technicians.map(async (tech) => {
        const techAlerts = alerts.filter(a => a.technicianId?.toString() === tech._id.toString())
        const completed = techAlerts.filter(a => a.status === 'resolved')
        
        // Calculate avg fix time
        let avgFixTime = 0
        const withFixTime = completed.filter(a => a.acceptedAt && a.resolvedAt)
        if (withFixTime.length > 0) {
          const total = withFixTime.reduce((sum, a) => 
            sum + (new Date(a.resolvedAt) - new Date(a.acceptedAt)), 0)
          avgFixTime = Math.round(total / withFixTime.length / 60000)
        }

        return {
          name: tech.fullName,
          email: tech.email,
          tasksAssigned: techAlerts.length,
          tasksCompleted: completed.length,
          avgFixTime: `${avgFixTime} min`,
          successRate: techAlerts.length > 0 
            ? `${Math.round((completed.length / techAlerts.length) * 100)}%` 
            : '0%',
        }
      })
    )

    // Get all engineers
    const engineers = await User.find({ role: 'engineer' }).select('-passwordHash').lean()
    
    // Engineer report data
    const engineerReport = await Promise.all(
      engineers.map(async (eng) => {
        const engAlerts = alerts.filter(a => a.engineerId?.toString() === eng._id.toString())
        
        // Calculate avg response time
        let avgResponseTime = 0
        const withResponse = engAlerts.filter(a => a.acceptedAt)
        if (withResponse.length > 0) {
          const total = withResponse.reduce((sum, a) => 
            sum + (new Date(a.acceptedAt) - new Date(a.createdAt)), 0)
          avgResponseTime = Math.round(total / withResponse.length / 60000)
        }

        return {
          name: eng.fullName,
          email: eng.email,
          totalIssuesReported: engAlerts.length,
          criticalIssues: engAlerts.filter(a => a.priority === 'critical').length,
          highIssues: engAlerts.filter(a => a.priority === 'high').length,
          mediumIssues: engAlerts.filter(a => a.priority === 'medium').length,
          lowIssues: engAlerts.filter(a => a.priority === 'low').length,
          resolvedIssues: engAlerts.filter(a => a.status === 'resolved').length,
          avgResponseTime: `${avgResponseTime} min`,
        }
      })
    )

    // Summary stats
    const summary = {
      period: `${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      totalAlerts: alerts.length,
      resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
      pendingAlerts: alerts.filter(a => a.status === 'pending').length,
      inProgressAlerts: alerts.filter(a => a.status === 'in-progress').length,
      criticalAlerts: alerts.filter(a => a.priority === 'critical').length,
      avgResolutionRate: alerts.length > 0 
        ? `${Math.round((alerts.filter(a => a.status === 'resolved').length / alerts.length) * 100)}%`
        : '0%',
    }

    res.json({
      summary,
      technicianReport,
      engineerReport,
    })
  } catch (err) {
    console.error('Error generating monthly report:', err)
    res.status(500).json({ message: 'Failed to generate report' })
  }
})

// Get monthly report for a specific engineer or technician
router.get('/reports/monthly/user', verifyAdmin, async (req, res) => {
  try {
    const { month, year, userId } = req.query
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' })
    }

    const monthNum = Number(month)
    const yearNum = Number(year)
    const targetMonth = Number.isInteger(monthNum) && monthNum >= 0 && monthNum <= 11
      ? monthNum
      : new Date().getMonth()
    const targetYear = Number.isInteger(yearNum) && yearNum >= 1970
      ? yearNum
      : new Date().getFullYear()

    const startDate = new Date(targetYear, targetMonth, 1)
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

    const user = await User.findById(userId).select('-passwordHash').lean()
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    if (user.role !== 'engineer' && user.role !== 'technician') {
      return res.status(400).json({ message: 'User must be an engineer or technician' })
    }

    const baseDateFilter = { createdAt: { $gte: startDate, $lte: endDate } }
    const alerts = await RepairAlert.find({
      ...baseDateFilter,
      ...(user.role === 'engineer'
        ? { engineerId: user._id }
        : { technicianId: user._id }),
    })
      .sort({ createdAt: -1 })
      .lean()

    const period = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    let stats = {}
    if (user.role === 'engineer') {
      const accepted = alerts.filter(a => a.acceptedAt)
      let avgResponseTimeMin = 0
      if (accepted.length > 0) {
        const total = accepted.reduce((sum, a) => sum + (new Date(a.acceptedAt) - new Date(a.createdAt)), 0)
        avgResponseTimeMin = Math.round(total / accepted.length / 60000)
      }

      stats = {
        totalIssuesReported: alerts.length,
        resolvedIssues: alerts.filter(a => a.status === 'resolved').length,
        criticalIssues: alerts.filter(a => a.priority === 'critical').length,
        highIssues: alerts.filter(a => a.priority === 'high').length,
        mediumIssues: alerts.filter(a => a.priority === 'medium').length,
        lowIssues: alerts.filter(a => a.priority === 'low').length,
        avgResponseTime: `${avgResponseTimeMin} min`,
      }
    } else {
      const completed = alerts.filter(a => a.status === 'resolved')
      const withFixTime = completed.filter(a => a.acceptedAt && a.resolvedAt)
      let avgFixTimeMin = 0
      if (withFixTime.length > 0) {
        const total = withFixTime.reduce((sum, a) => sum + (new Date(a.resolvedAt) - new Date(a.acceptedAt)), 0)
        avgFixTimeMin = Math.round(total / withFixTime.length / 60000)
      }

      const rated = alerts.filter(a => a.rating)
      const avgRating = rated.length > 0
        ? Number((rated.reduce((sum, a) => sum + a.rating, 0) / rated.length).toFixed(1))
        : null

      stats = {
        tasksAssigned: alerts.length,
        tasksCompleted: completed.length,
        tasksInProgress: alerts.filter(a => a.status === 'in-progress').length,
        avgFixTime: `${avgFixTimeMin} min`,
        successRate: alerts.length > 0 ? `${Math.round((completed.length / alerts.length) * 100)}%` : '0%',
        avgRating,
      }
    }

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      summary: {
        period,
        totalAlerts: alerts.length,
      },
      stats,
      alerts,
    })
  } catch (err) {
    console.error('Error generating monthly user report:', err)
    res.status(500).json({ message: 'Failed to generate user report' })
  }
})

// Get all repair alerts for admin view
router.get('/alerts', verifyAdmin, async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query
    
    const filter = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority

    const alerts = await RepairAlert.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()

    res.json({ alerts })
  } catch (err) {
    console.error('Error fetching alerts:', err)
    res.status(500).json({ message: 'Failed to fetch alerts' })
  }
})

export default router
