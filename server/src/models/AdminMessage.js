import mongoose from 'mongoose'

const adminMessageSchema = new mongoose.Schema(
  {
    // Conversation between admin and a user
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participantRole: {
      type: String,
      enum: ['engineer', 'technician'],
      required: true,
    },
    participantName: {
      type: String,
      required: true,
    },
    participantEmail: {
      type: String,
      required: true,
    },
    // Admin info
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    // Sender info (who sent this message)
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['admin', 'engineer', 'technician'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    // Message content
    message: {
      type: String,
      default: '',
      trim: true,
    },
    // Message type (text, image, or voice)
    messageType: {
      type: String,
      enum: ['text', 'image', 'voice'],
      default: 'text',
    },
    // Image URL (if messageType is 'image')
    imageUrl: {
      type: String,
      default: null,
    },
    // Voice URL (if messageType is 'voice')
    voiceUrl: {
      type: String,
      default: null,
    },
    // Voice duration in seconds
    voiceDuration: {
      type: Number,
      default: 0,
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
adminMessageSchema.index({ adminId: 1, participantId: 1, createdAt: -1 })
adminMessageSchema.index({ participantId: 1, createdAt: -1 })

const AdminMessage = mongoose.model('AdminMessage', adminMessageSchema)

export default AdminMessage
