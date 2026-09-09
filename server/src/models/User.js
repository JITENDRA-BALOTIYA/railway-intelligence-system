import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['super_admin', 'station_master', 'cleaning_staff', 'public_user'],
      default: 'public_user',
      index: true,
    },
    stationId: {
      type: String,
      default: null, // e.g., 'NDLS', 'MMCT'
      trim: true,
      uppercase: true,
      index: true,
    },
    stationName: {
      type: String,
      default: null,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash || !candidatePassword) return false
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Static helper to hash password
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plainPassword, salt)
}

export const User = mongoose.models.User || mongoose.model('User', userSchema)
