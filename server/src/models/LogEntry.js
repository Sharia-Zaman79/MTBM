import mongoose from 'mongoose'

const logEntrySchema = new mongoose.Schema(
  {
    issue: { type: String, required: true },
    return: { type: String, required: true },
    duration: { type: String, default: '' },
    company: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
)

export const LogEntry = mongoose.model('LogEntry', logEntrySchema)
