import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import uploadRoutes from './routes/uploads.js'
import logbookRoutes from './routes/logbook.js'
import otpRoutes from './routes/otp.js'
import repairAlertsRoutes from './routes/repairAlerts.js'
import chatRoutes from './routes/chat.js'
import adminRoutes from './routes/admin.js'
import adminChatRoutes from './routes/adminChat.js'
import meetingRoutes from './routes/meetings.js'
import { env, requireEnv } from './lib/env.js'
import { connectDb } from './lib/db.js'

async function connectDbWithRetry() {
  const retryDelayMs = 10_000

  for (;;) {
    try {
      await connectDb()
      global.__mtbmLastDbError = null
      console.log('MongoDB connected')
      return
    } catch (err) {
      global.__mtbmLastDbError = err?.message || String(err)
      console.error('MongoDB connection failed. Retrying in 10s...', global.__mtbmLastDbError)
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    }
  }
}

async function main() {
  requireEnv()

  const app = express()

  // Keep explicit allow list from env, but also allow localhost dev origins on any port.
  const allowedOrigins = new Set([env.corsOrigin].filter(Boolean))
  const isLocalDevOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true)
        if (allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
          return callback(null, true)
        }
        return callback(null, false)
      },
      credentials: true,
    })
  )
  app.use(express.json({ limit: '1mb' }))

  // Serve uploaded files (avatars)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      dbReady: Boolean(global.__mtbmDbReady),
      dbError: global.__mtbmDbReady ? null : global.__mtbmLastDbError || null,
    })
  })

  app.use('/api', (req, res, next) => {
    if (req.path === '/health') return next()
    if (global.__mtbmDbReady) return next()

    return res.status(503).json({
      message:
        'Database not connected yet. Check MONGODB_URI (or MONGO_URI / DATABASE_URL) on Render and try again.',
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/uploads', uploadRoutes)
  app.use('/api/logbook', logbookRoutes)
  app.use('/api/otp', otpRoutes)
  app.use('/api/repair-alerts', repairAlertsRoutes)
  app.use('/api/chat', chatRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/admin-chat', adminChatRoutes)
  app.use('/api/meetings', meetingRoutes)

  // ─── Serve frontend in production ───────────────────────────
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distPath = path.join(__dirname, '../../dist')

  app.use(express.static(distPath))

  // SPA fallback – any non-API GET request serves index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next()
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })

  // Minimal error handler
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  })

  // Render requires binding to the provided PORT; do not auto-switch ports in production.
  const server = app.listen(env.port, () => {
    console.log(`MTBM server listening on http://localhost:${env.port}`)
  })

  // Keep server reference alive so Node doesn't exit.
  global.__mtbmServer = server
  global.__mtbmDbReady = false
  global.__mtbmLastDbError = null

  connectDbWithRetry()
    .then(() => {
      global.__mtbmDbReady = true
    })
    .catch((err) => {
      console.error('Unexpected DB retry loop failure', err)
    })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
