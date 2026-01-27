import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    // The repair alert this message belongs to
    repairAlertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RepairAlert',
      required: true,
    },
    // Sender info
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['engineer', 'technician'],
      required: true,
    },
    // Message content
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Read status
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
messageSchema.index({ repairAlertId: 1, createdAt: 1 })
messageSchema.index({ repairAlertId: 1, isRead: 1 })

const Message = mongoose.model('Message', messageSchema)

export default Message
