import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'emergency'],
      default: 'info',
    },
    section: { type: String, default: 'Network-wide' },
    zone: { type: String, default: 'All' },
    affectedTrains: [{ type: String }],
    active: { type: Boolean, default: true },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema)
