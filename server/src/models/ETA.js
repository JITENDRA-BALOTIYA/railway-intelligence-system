import mongoose from 'mongoose'

const etaHistoryPointSchema = new mongoose.Schema({
  time: { type: String, required: true },
  scheduled: { type: Number, required: true }, // minutes from midnight or timestamp
  predicted: { type: Number, required: true },
  actual: { type: Number },
})

const etaSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, index: true },
    station: { type: String, required: true },
    stationCode: { type: String },
    scheduledArrival: { type: String, required: true },
    predictedArrival: { type: String, required: true },
    delay: { type: Number, default: 0 }, // in minutes
    confidence: { type: Number, default: 85, min: 0, max: 100 }, // percentage
    predictionWindow: {
      start: { type: String, required: true },
      end: { type: String, required: true },
    },
    recoveryEstimatedMinutes: { type: Number, default: 0 },
    stationDwellTimeMinutes: { type: Number, default: 5 },
    routeCongestion: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Severe'],
      default: 'Moderate',
    },
    weatherImpact: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'Severe'],
      default: 'Low',
    },
    signalImpact: {
      type: String,
      enum: ['None', 'Low', 'Moderate', 'Severe'],
      default: 'Low',
    },
    factors: [
      {
        name: String,
        impact: Number, // percentage or weight
        level: String,
      },
    ],
    history: [etaHistoryPointSchema],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export const ETA = mongoose.models.ETA || mongoose.model('ETA', etaSchema)
