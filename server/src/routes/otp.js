import express from 'express'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { OTP } from '../models/OTP.js'
import { env } from '../lib/env.js'

const router = express.Router()

let transporter = null
const emailReady = Boolean(env.gmailEmail && env.gmailAppPassword)

if (emailReady) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.gmailEmail,
      pass: env.gmailAppPassword,
    },
  })
} else {
  console.warn('Gmail credentials not set; OTP will be logged to console.')
}

router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body ?? {}
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Invalid email address' })
    }

    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      verified: false,
    })

    if (emailReady && transporter) {
      try {
        await transporter.sendMail({
          from: `"MTBM System" <${env.gmailEmail}>`,
          to: normalizedEmail,
          subject: 'Your MTBM Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #5B89B1 0%, #4a7294 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">MTBM Dashboard</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                <h2 style="color: #333; margin-top: 0;">Email Verification</h2>
                <p style="color: #666; font-size: 16px;">Your MTBM verification code is:</p>
                <div style="background: white; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 25px 0; border: 2px dashed #5B89B1; border-radius: 8px; color: #5B89B1;">
                  ${otp}
                </div>
                <p style="color: #999; font-size: 14px; margin-top: 25px;">This code will expire in <strong>10 minutes</strong>.</p>
                <p style="color: #999; font-size: 12px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">If you didn't request this code, please ignore this email.</p>
              </div>
            </div>
          `,
        })
        console.log(`OTP sent to ${normalizedEmail}`)
      } catch (err) {
        console.error('Failed to send OTP email:', err.message)
        return res.status(500).json({ message: 'Failed to send OTP. Please try again.' })
      }
    } else {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📧 [DEV MODE] OTP for ${normalizedEmail}`)
      console.log(`🔐 CODE: ${otp}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
    }

    return res.json({ message: 'OTP sent successfully' })
  } catch (err) {
    console.error('Send OTP error:', err)
    return res.status(500).json({ message: 'Failed to send OTP' })
  }
})

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body ?? {}
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const normalizedOtp = String(otp || '').trim()

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' })
    }
    if (!normalizedOtp) {
      return res.status(400).json({ message: 'OTP is required' })
    }

    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: normalizedOtp,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    await OTP.updateOne({ _id: otpRecord._id }, { verified: true })

    return res.json({ message: 'OTP verified successfully', verified: true })
  } catch (err) {
    console.error('Verify OTP error:', err)
    return res.status(500).json({ message: 'Failed to verify OTP' })
  }
})

export default router
