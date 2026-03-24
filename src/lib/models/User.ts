import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  image?: string
  role: 'student' | 'admin'
  provider: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    provider: {
      type: String,
      required: true,
      default: 'credentials',
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
