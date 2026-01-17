import dotenv from 'dotenv'

dotenv.config()

export const env = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI,
  mongoDbName: process.env.MONGODB_DB || 'MTBM',
  jwtSecret: process.env.JWT_SECRET,
}

export function requireEnv() {
  const missing = []
  if (!env.mongoUri) missing.push('MONGODB_URI')
  if (!env.jwtSecret) missing.push('JWT_SECRET')

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}
