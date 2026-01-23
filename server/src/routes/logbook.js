import express from 'express'
import { LogEntry } from '../models/LogEntry.js'

const router = express.Router()

router.get('/', async (_req, res) => {
  try {
    const entries = await LogEntry.find().sort({ createdAt: -1 })
    return res.json({ entries })
  } catch (err) {
    console.error('Failed to load logbook entries', err)
    return res.status(500).json({ message: 'Failed to load logbook entries' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { issue, return: returnDate, duration, company, location } = req.body ?? {}

    const normalizedIssue = String(issue || '').trim()
    const normalizedReturn = String(returnDate || '').trim()
    const normalizedCompany = String(company || '').trim()
    const normalizedLocation = String(location || '').trim()
    const normalizedDuration = String(duration || '').trim()

    if (!normalizedIssue) return res.status(400).json({ message: 'Issue date is required' })
    if (!normalizedReturn) return res.status(400).json({ message: 'Return date is required' })
    if (!normalizedCompany) return res.status(400).json({ message: 'Company is required' })
    if (!normalizedLocation) return res.status(400).json({ message: 'Location is required' })

    const entry = await LogEntry.create({
      issue: normalizedIssue,
      return: normalizedReturn,
      duration: normalizedDuration,
      company: normalizedCompany,
      location: normalizedLocation,
    })

    return res.status(201).json({ entry })
  } catch (err) {
    console.error('Failed to create logbook entry', err)
    return res.status(500).json({ message: 'Failed to create logbook entry' })
  }
})

export default router
