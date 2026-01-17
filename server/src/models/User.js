import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, required: true, enum: ['engineer', 'technician'] },
    fullName: { type: String, required: true, trim: true },
    organization: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
)

// Preserve your current behavior: same email can exist for different roles
userSchema.index({ email: 1, role: 1 }, { unique: true })

export const User = mongoose.model('User', userSchema)
