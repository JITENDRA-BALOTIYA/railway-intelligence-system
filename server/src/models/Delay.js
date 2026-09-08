import mongoose from 'mongoose'

const delaySchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    impact: {
      type: String,
      enum: ['Minor', 'Moderate', 'High', 'Critical'],
      default: 'Moderate',
    },
    duration: { type: Number, required: true }, // minutes
    confidence: { type: Number, default: 80 },
    breakdown: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true }, // minutes
        percentage: { type: Number },
      },
    ],
    riskLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Severe'],
      default: 'Moderate',
    },
    recoveryProbability: { type: Number, default: 40 },
    recoveryWindow: { type: String, default: '5-10 min' },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export const Delay = mongoose.models.Delay || mongoose.model('Delay', delaySchema)
