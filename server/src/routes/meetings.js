import { Router } from 'express'
import nodemailer from 'nodemailer'
import Meeting from '../models/Meeting.js'
import { env } from '../lib/env.js'

const router = Router()

// POST /api/meetings — public meeting booking (no auth)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, preferredDate, preferredTime, message } = req.body

    if (!name || !email || !preferredDate || !preferredTime) {
      return res.status(400).json({ message: 'Name, email, preferred date and time are required.' })
    }

    // Save to DB
    const meeting = await Meeting.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      preferredDate,
      preferredTime,
      message: (message || '').trim(),
    })

    // Respond immediately — meeting is saved
    res.status(201).json({ message: 'Meeting request submitted successfully!' })

    // Send emails in background (non-blocking — won't break the response)
    try {
      const gmailEmail = env.gmailEmail
      const gmailPass = env.gmailAppPassword

      if (gmailEmail && gmailPass) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailEmail, pass: gmailPass },
        })

        // Notify admin
        transporter.sendMail({
          from: `"MTBM Meeting" <${gmailEmail}>`,
          to: gmailEmail,
          subject: `New Meeting Request from ${name}`,
          html: `
            <div style="font-family:sans-serif;max-width:500px;">
              <h2 style="color:#5B89B1;">New Meeting Request</h2>
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;">${name}</td></tr>
                <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
                ${phone ? `<tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee;">Phone</td><td style="padding:8px;border-bottom:1px solid #eee;">${phone}</td></tr>` : ''}
                <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee;">Date</td><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;">${preferredDate}</td></tr>
                <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee;">Time</td><td style="padding:8px;font-weight:600;border-bottom:1px solid #eee;">${preferredTime}</td></tr>
                ${message ? `<tr><td style="padding:8px;color:#666;">Message</td><td style="padding:8px;">${message}</td></tr>` : ''}
              </table>
            </div>
          `,
        }).catch(e => console.error('Admin email failed:', e.message))

        // Send confirmation to visitor
        transporter.sendMail({
          from: `"MTBM Team" <${gmailEmail}>`,
          to: email,
          subject: 'Meeting Request Received — MTBM',
          html: `
            <div style="font-family:sans-serif;max-width:500px;">
              <h2 style="color:#5B89B1;">Thank you, ${name}!</h2>
              <p>We've received your meeting request for <strong>${preferredDate}</strong> at <strong>${preferredTime}</strong>.</p>
              <p>Our team will confirm the schedule shortly. If you need to reschedule, reply to this email.</p>
              <br/>
              <p style="color:#888;font-size:12px;">MTBM — Micro Tunnel Boring Machine<br/>116(Kha), Tejgaon Industrial Area, Dhaka, Bangladesh -1208</p>
            </div>
          `,
        }).catch(e => console.error('Visitor email failed:', e.message))
      }
    } catch (emailErr) {
      console.error('Email setup error:', emailErr.message)
    }
  } catch (err) {
    console.error('Meeting booking error:', err)
    res.status(500).json({ message: 'Failed to submit meeting request. Please try again.' })
  }
})

export default router
