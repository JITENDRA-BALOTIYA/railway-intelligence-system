import mongoose from 'mongoose'

const cleaningTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    trainNumber: {
      type: String,
      required: true,
      index: true,
    },
    trainName: {
      type: String,
      required: true,
    },
    stationId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    stationName: {
      type: String,
      default: '',
    },
    platform: {
      type: String,
      default: 'PF —',
    },
    scheduledArrival: {
      type: String,
      default: '—',
    },
    expectedArrival: {
      type: String,
      default: '—',
    },
    scheduledDeparture: {
      type: String,
      default: '—',
    },
    cleaningWindowStart: {
      type: String,
      default: '—',
    },
    cleaningWindowDeadline: {
      type: String,
      default: '—',
    },
    status: {
      type: String,
      enum: [
        'upcoming',
        'approaching',
        'arrived',
        'cleaning_required',
        'cleaning_in_progress',
        'cleaning_completed',
        'ready_for_departure',
      ],
      default: 'upcoming',
      index: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Standard'],
      default: 'Standard',
    },
    assignedStaffId: {
      type: String,
      default: null,
    },
    assignedStaffName: {
      type: String,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    durationMinutes: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

export const CleaningTask = mongoose.models.CleaningTask || mongoose.model('CleaningTask', cleaningTaskSchema)
