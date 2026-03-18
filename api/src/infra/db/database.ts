import mongoose from 'mongoose'
import { logger } from '../logs'

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL!)
    logger.info('MongoDB connected')
  } catch (error) {
    logger.error(error, 'MongoDB connection error')
  }
}

export default connectDb
