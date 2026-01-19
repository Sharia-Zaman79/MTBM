import express from 'express'
import cors from 'cors'
import path from 'path'
import authRoutes from './routes/auth.js'
import uploadRoutes from './routes/uploads.js'
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

  // Minimal error handler
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  })

  app.listen(env.port, () => {
    console.log(`MTBM server listening on http://localhost:${env.port}`)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
