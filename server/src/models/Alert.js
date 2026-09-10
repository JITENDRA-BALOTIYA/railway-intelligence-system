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
    platform: { type: String },
    active: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
    },
    acknowledgedBy: { type: String, default: null },
    acknowledgedAt: { type: Date, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema)
