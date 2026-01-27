import mongoose from 'mongoose'

const repairAlertSchema = new mongoose.Schema(
  {
    subsystem: {
      type: String,
      required: true,
      trim: true,
    },
    issue: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved'],
      default: 'pending',
    },
    // Engineer who created the alert
    engineerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    engineerName: {
      type: String,
      required: true,
    },
    engineerEmail: {
      type: String,
      required: true,
    },
    // Technician who accepted the alert (if any)
    technicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    technicianName: {
      type: String,
      default: null,
    },
    technicianEmail: {
      type: String,
      default: null,
    },
    // Timestamps for tracking
    acceptedAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    // Rating given by engineer after resolution (1-5 stars)
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    ratingComment: {
      type: String,
      trim: true,
      default: null,
    },
    ratedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
)

// Index for efficient queries
repairAlertSchema.index({ status: 1, createdAt: -1 })
repairAlertSchema.index({ engineerId: 1, status: 1 })
repairAlertSchema.index({ technicianId: 1, status: 1 })

const RepairAlert = mongoose.model('RepairAlert', repairAlertSchema)

export default RepairAlert
