import dotenv from 'dotenv'

dotenv.config()

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL

export const env = {
  // Use 5001 as the local default to avoid common port collisions on 5000.
  port: Number(process.env.PORT || 5001),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  mongoUri,
  mongoDbName: process.env.MONGODB_DB || 'MTBM',
  jwtSecret: process.env.JWT_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  gmailEmail: process.env.GMAIL_EMAIL,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export function requireEnv() {
  const missing = []
  if (!env.jwtSecret) missing.push('JWT_SECRET')

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (!env.mongoUri) {
    console.warn(
      'MongoDB URI is not set. Configure one of: MONGODB_URI, MONGO_URI, or DATABASE_URL.'
    )
  }
}
