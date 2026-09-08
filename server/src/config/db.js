import mongoose from 'mongoose'

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    return null
  }

  try {
    await mongoose.connect(mongoUri)
    return mongoose.connection
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw error
  }
}
