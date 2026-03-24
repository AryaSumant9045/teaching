import mongoose from 'mongoose'

// Cached connection for Next.js hot-reloading
interface MongooseCache { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
declare global { var _mongoose: MongooseCache | undefined }

const cached: MongooseCache = global._mongoose ?? (global._mongoose = { conn: null, promise: null })

export async function connectDB() {
  const MONGO_URI = process.env.MONGO_URI
  if (!MONGO_URI) throw new Error('MONGO_URI is not defined in .env.local')

  if (cached.conn) return cached.conn

  // If the previous promise failed reset it so we can retry with the correct URI
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 15000,
      })
      .catch(err => {
        // Reset on failure so the next request can retry
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    cached.promise = null
    throw err
  }

  return cached.conn
}
