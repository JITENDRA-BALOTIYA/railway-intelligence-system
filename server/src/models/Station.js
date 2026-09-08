import mongoose from 'mongoose'

const stationSchema = new mongoose.Schema(
  {
    stationCode: { type: String, required: true, unique: true, index: true },
    stationName: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: '' },
    platforms: { type: Number, default: 1 },
    crowdLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical Surge'],
      default: 'Moderate',
    },
    crowdPercentage: { type: Number, default: 50 },
    weather: { type: String, default: 'Clear' },
    visibility: { type: String, default: '1000 m' },
    temperature: { type: String, default: '28°C' },
    activeTrainsCount: { type: Number, default: 0 },
    platformsStatus: [
      {
        platformNumber: Number,
        occupied: Boolean,
        trainNumber: String,
        trainName: String,
        expectedDeparture: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

export const Station = mongoose.models.Station || mongoose.model('Station', stationSchema)
