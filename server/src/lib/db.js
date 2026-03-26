import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDb() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is not set')
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName,
    serverSelectionTimeoutMS: 15000,
  })
}
