import express from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.js'
import { OTP } from '../models/OTP.js'
import { env } from '../lib/env.js'

const router = express.Router()

let transporter = null
const emailReady = Boolean(env.gmailEmail && env.gmailAppPassword)
const googleClient = env.googleClientId ? new OAuth2Client(env.googleClientId) : null

if (emailReady) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.gmailEmail,
      pass: env.gmailAppPassword,
    },
  })
} else {
  console.warn('GMAIL_EMAIL or GMAIL_APP_PASSWORD not set; password reset emails will not be sent.')
}

if (!googleClient) {
  console.warn('GOOGLE_CLIENT_ID not set; Google login will not be available.')
}

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
  const { email, password, role, fullName, organization, photoUrl, emailVerified } = req.body ?? {}

  const normalizedRole = String(role || '').trim()
  const normalizedFullName = String(fullName || '').trim()
  const normalizedOrg = String(organization || '').trim()
  const normalizedPhotoUrl = String(photoUrl || '').trim()
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!['engineer', 'technician'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Invalid role' })
  }
  if (!normalizedFullName) return res.status(400).json({ message: 'Full name is required' })
  if (!normalizedOrg) return res.status(400).json({ message: 'Organization is required' })
  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' })
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Invalid email address' })
  }
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

router.post('/google', async (req, res) => {
  try {
    const { credential, role } = req.body ?? {}
    const normalizedRole = String(role || '').trim()

    if (!credential) return res.status(400).json({ message: 'Google credential is required' })
    if (!['engineer', 'technician'].includes(normalizedRole)) {
      return res.status(400).json({ message: 'Role is required' })
    }
    if (!googleClient) {
      return res.status(500).json({ message: 'Google login is not configured' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    })

    const payload = ticket.getPayload()
    const normalizedEmail = String(payload?.email || '').trim().toLowerCase()
    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Google account email not available' })
    }

    const fullName = String(payload?.name || payload?.given_name || normalizedEmail).trim()
    const photoUrl = String(payload?.picture || '').trim()

    let user = await User.findOne({ email: normalizedEmail, role: normalizedRole })

    if (!user) {
      const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10)
      user = await User.create({
        email: normalizedEmail,
        role: normalizedRole,
        fullName: fullName || 'Google User',
        organization: 'Google',
        photoUrl,
        passwordHash,
      })
    } else {
      const updates = {}
      if (!user.fullName && fullName) updates.fullName = fullName
      if (!user.photoUrl && photoUrl) updates.photoUrl = photoUrl
      if (!user.organization) updates.organization = 'Google'

      if (Object.keys(updates).length) {
        await User.updateOne({ _id: user._id }, updates)
        user = { ...user.toObject(), ...updates }
      }
    }

    const token = signToken(user)
    return res.json({ token, user: toSafeUser(user) })
  } catch (err) {
    console.error('Google login failed', err)
    return res.status(500).json({ message: 'Google login failed' })
  }
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body ?? {}
  const normalizedEmail = String(email || '').trim().toLowerCase()

  if (!normalizedEmail) return res.status(400).json({ message: 'Email is required' })

  const user = await User.findOne({ email: normalizedEmail })
  if (!user) {
    // Don't reveal if email exists (security best practice)
    return res.json({ message: 'If email exists, reset link will be sent' })
  }

  // Generate reset token (valid for 1 hour)
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex')
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await User.updateOne(
    { _id: user._id },
    { resetToken: resetTokenHash, resetTokenExpires }
  )

  const resetUrl = `${env.frontendUrl.replace(/\/$/, '')}/forgot-password?token=${resetToken}`

  if (emailReady) {
    try {
      await transporter.sendMail({
        from: env.gmailEmail,
        to: user.email,
        subject: 'Reset your MTBM password',
        text: `Hi ${user.fullName || 'there'},\n\nUse this link to reset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can ignore this email.`,
        html: `
          <p>Hi ${user.fullName || 'there'},</p>
          <p>Use this link to reset your password (expires in 1 hour):</p>
          <p><a href="${resetUrl}" style="background-color: #5B89B1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, you can ignore this email.</p>
        `,
      })
      console.log(`Password reset email sent to ${user.email}`)
    } catch (err) {
      console.error('Failed to send reset email:', err.message)
      // Still respond generically so reset UX isn't blocked
    }
  } else {
    // Fallback: log the reset URL for dev
    console.log(`Reset URL (email not configured): ${resetUrl}`)
  }

  return res.json({ message: 'If email exists, reset link will be sent' })
})

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body ?? {}
  const normalizedPassword = String(newPassword || '').trim()

  if (!token) return res.status(400).json({ message: 'Reset token is required' })
  if (!normalizedPassword) return res.status(400).json({ message: 'New password is required' })
  if (normalizedPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetToken: resetTokenHash,
    resetTokenExpires: { $gt: new Date() },
  })

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' })
  }

  const passwordHash = await bcrypt.hash(normalizedPassword, 10)
  await User.updateOne(
    { _id: user._id },
    {
      passwordHash,
      resetToken: undefined,
      resetTokenExpires: undefined,
    }
  )

  return res.json({ message: 'Password reset successful' })
})

export default router
