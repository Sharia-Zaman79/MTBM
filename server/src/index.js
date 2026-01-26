import express from 'express'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth.js'
import uploadRoutes from './routes/uploads.js'
import logbookRoutes from './routes/logbook.js'
import otpRoutes from './routes/otp.js'
import repairAlertsRoutes from './routes/repairAlerts.js'
import { env, requireEnv } from './lib/env.js'
import { connectDb } from './lib/db.js'

async function main() {
  requireEnv()
  await connectDb()

  const app = express()

  app.use(
    cors({
      origin: env.corsOrigin,
    })
  )
  app.use(express.json({ limit: '1mb' }))

  // Serve uploaded files (avatars)
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/uploads', uploadRoutes)
  app.use('/api/logbook', logbookRoutes)
  app.use('/api/otp', otpRoutes)
  app.use('/api/repair-alerts', repairAlertsRoutes)

  // Minimal error handler
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  })

  // Try to start on the configured port; if it's busy, fall back to the next port
  const startServer = async (portToTry, attempt = 1) => {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(portToTry, () => resolve(server))
        server.on('error', reject)
      })

      return portToTry
    } catch (err) {
      if (err?.code === 'EADDRINUSE' && attempt === 1) {
        const fallbackPort = portToTry + 1
        console.warn(`Port ${portToTry} is in use. Retrying on ${fallbackPort}...`)
        return startServer(fallbackPort, attempt + 1)
      }

      throw err
    }
  }

  const runningPort = await startServer(env.port)
  console.log(`MTBM server listening on http://localhost:${runningPort}`)

  if (runningPort !== env.port) {
    console.warn(
      `Update your client API base (e.g. VITE_API_URL) to http://localhost:${runningPort} if requests fail.`
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
