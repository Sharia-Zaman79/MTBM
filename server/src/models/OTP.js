import mongoose from 'mongoose'

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
)

otpSchema.index({ email: 1, createdAt: 1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OTP = mongoose.model('OTP', otpSchema)
