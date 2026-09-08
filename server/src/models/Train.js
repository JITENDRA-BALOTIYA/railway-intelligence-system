import mongoose from 'mongoose'

const timelineStopSchema = new mongoose.Schema({
  station: { type: String, required: true },
  stationCode: { type: String },
  type: { type: String, default: '' },
  status: { type: String, default: '' },
  time: { type: String, required: true },
  scheduledTime: { type: String },
  delay: { type: String, default: 'On Time' },
  complete: { type: Boolean, default: false },
  platform: { type: String, default: 'PF 1' },
})

const trainSchema = new mongoose.Schema(
  {
    trainNumber: { type: String, required: true, unique: true, index: true },
    trainName: { type: String, required: true },
    source: { type: String, required: true },
    sourceCode: { type: String },
    destination: { type: String, required: true },
    destinationCode: { type: String },
    currentStation: { type: String, required: true },
    nextStation: { type: String, required: true },
    speed: { type: Number, default: 0 },
    delay: { type: Number, default: 0 }, // in minutes
    status: {
      type: String,
      enum: ['Running', 'Delayed', 'On Time', 'Terminated', 'Scheduled'],
      default: 'Running',
    },
    platform: { type: String, default: 'Platform 1' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    distanceRemainingKm: { type: Number, default: 0 },
    timeline: [timelineStopSchema],
    weather: {
      temp: { type: String, default: '25°C' },
      condition: { type: String, default: 'Clear' },
      visibility: { type: String, default: '500 m' },
    },
    crowd: {
      level: { type: String, default: 'Moderate' },
      station: { type: String },
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
)

export const Train = mongoose.models.Train || mongoose.model('Train', trainSchema)
