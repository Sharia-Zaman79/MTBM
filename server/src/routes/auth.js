import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { env } from '../lib/env.js'

const router = express.Router()

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: '7d' }
  )
}

function toSafeUser(user) {
  return {
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    organization: user.organization,
    photoUrl: user.photoUrl,
  }
}

router.post('/signup', async (req, res) => {
  const { email, password, role, fullName, organization, photoUrl } = req.body ?? {}

  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedRole = String(role || '').trim()
  const normalizedFullName = String(fullName || '').trim()
  const normalizedOrg = String(organization || '').trim()
  const normalizedPhotoUrl = String(photoUrl || '').trim()

  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' })
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }
  if (!['engineer', 'technician'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Invalid role' })
  }
  if (!normalizedFullName) return res.status(400).json({ message: 'Full name is required' })
  if (!normalizedOrg) return res.status(400).json({ message: 'Organization is required' })
  if (!password) return res.status(400).json({ message: 'Password is required' })
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const passwordHash = await bcrypt.hash(String(password), 10)

  try {
    const user = await User.create({
      email: normalizedEmail,
      role: normalizedRole,
      fullName: normalizedFullName,
      organization: normalizedOrg,
      photoUrl: normalizedPhotoUrl,
      passwordHash,
    })

    const token = signToken(user)
    return res.status(201).json({ token, user: toSafeUser(user) })
  } catch (err) {
    // Duplicate key error (email+role)
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }
    return res.status(500).json({ message: 'Failed to sign up' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body ?? {}

  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedRole = String(role || '').trim()

  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' })
  if (!password) return res.status(400).json({ message: 'Password is required' })
  if (!['engineer', 'technician'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Role is required' })
  }

  const user = await User.findOne({ email: normalizedEmail, role: normalizedRole })
  if (!user) return res.status(401).json({ message: 'Wrong email or password' })

  const ok = await bcrypt.compare(String(password), user.passwordHash)
  if (!ok) return res.status(401).json({ message: 'Wrong email or password' })

  const token = signToken(user)
  return res.json({ token, user: toSafeUser(user) })
})

export default router
