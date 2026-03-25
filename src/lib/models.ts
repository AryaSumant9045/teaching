import mongoose, { Schema, Model } from 'mongoose'

// ── Course ────────────────────────────────────────────────
export interface ICourse {
  _id?: string
  title: string
  description: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  thumbnail: string
  color: string
  status: 'active' | 'archived'
  students: number
  rating: number
  totalLectures: number
  duration: string
  isFree?: boolean
  price?: number
  createdAt: string
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  thumbnail: { type: String, default: '' },
  color: { type: String, default: '#00e5ff' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  students: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalLectures: { type: Number, default: 0 },
  duration: { type: String, default: '0 hrs' },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { versionKey: false })

// ── Lecture ───────────────────────────────────────────────
export interface ILecture {
  _id?: string
  courseId: string
  title: string
  description: string
  order: number
  duration: string
  videoUrl: string
  materials: Array<{ id: string; name: string; type: string; url: string }>
  liveClass: { scheduledAt: string; meetingUrl: string; isLive: boolean; title: string } | null
  dyteRoomId: string
  isFree: boolean
  createdAt: string
}

const MaterialSchema = new Schema({
  id: String,
  name: String,
  type: { type: String },
  url: String
}, { _id: false })

const LectureSchema = new Schema<ILecture>({
  courseId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  order: { type: Number, default: 1 },
  duration: { type: String, default: '45 min' },
  videoUrl: { type: String, default: '' },
  materials: [MaterialSchema],
  liveClass: {
    type: {
      scheduledAt: String, meetingUrl: String, isLive: Boolean, title: String
    }, default: null
  },
  dyteRoomId: { type: String, default: '' },
  isFree: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false })

// ── Student ───────────────────────────────────────────────
export interface IStudent {
  _id?: string
  name: string
  email: string
  avatar: string
  enrolled: number
  progress: number
  streak: number
  status: 'active' | 'revoked'
  joinedAt: string
}

const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String, default: '' },
  enrolled: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  joinedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { versionKey: false })

// ── Quiz ─────────────────────────────────────────────────
export interface IQuiz {
  _id?: string
  title: string
  timer: number
  lessonId: string
  type: 'quiz' | 'lecture'
  isFree?: boolean
  price?: number
  questions: Array<{
    id: string; text: string; marks: number;
    options: Array<{ text: string; isCorrect: boolean }>
  }>
}

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true },
  timer: { type: Number, default: 15 },
  lessonId: { type: String, default: '' },
  type: { type: String, enum: ['quiz', 'lecture'], default: 'quiz' },
  isFree: { type: Boolean, default: true },
  price: { type: Number, default: 0 },
  questions: [{
    id: String, text: String, marks: Number,
    options: [{ text: String, isCorrect: Boolean }],
  }],
}, { versionKey: false })

// ── PYQ ──────────────────────────────────────────────────
export interface IPYQ {
  _id?: string
  title: string
  year: string
  subject: string
  fileUrl: string
  questions: number
  addedAt: string
}

const PYQSchema = new Schema<IPYQ>({
  title: { type: String, required: true },
  year: { type: String, required: true },
  subject: { type: String, default: '' },
  fileUrl: { type: String, default: '' },
  questions: { type: Number, default: 0 },
  addedAt: { type: String, default: () => new Date().toISOString().split('T')[0] },
}, { versionKey: false })

// ── Purchase ───────────────────────────────────────────────
export interface IPurchase {
  _id?: string
  userId: string
  resourceId: string
  resourceType: 'course' | 'quiz'
  amount: number
  orderId: string
  paymentId?: string
  status: 'created' | 'completed' | 'failed'
  createdAt: string
}

const PurchaseSchema = new Schema<IPurchase>({
  userId: { type: String, required: true, index: true },
  resourceId: { type: String, required: true, index: true },
  resourceType: { type: String, enum: ['course', 'quiz'], required: true },
  amount: { type: Number, required: true },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  status: { type: String, enum: ['created', 'completed', 'failed'], default: 'created' },
  createdAt: { type: String, default: () => new Date().toISOString() },
}, { versionKey: false })

// ── Enrollment (Student-Course Link) ─────────────────────
export interface IEnrollment {
  _id?: string
  userId: string
  courseId: string
  enrolledAt: string
  status: 'active' | 'completed' | 'dropped'
  progress: number
}

const EnrollmentSchema = new Schema<IEnrollment>({
  userId: { type: String, required: true, index: true },
  courseId: { type: String, required: true, index: true },
  enrolledAt: { type: String, default: () => new Date().toISOString() },
  status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
  progress: { type: Number, default: 0 },
}, { versionKey: false })

// ── LiveSession (Live Class Session) ───────────────────────
export interface ILiveSession {
  _id?: string
  courseId: string
  adminId: string
  jitsiRoomName: string
  title: string
  scheduledAt: string
  status: 'scheduled' | 'active' | 'completed'
  startedAt?: string
  endedAt?: string
}

const LiveSessionSchema = new Schema<ILiveSession>({
  courseId: { type: String, required: true, index: true },
  adminId: { type: String, required: true },
  jitsiRoomName: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  scheduledAt: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'completed'], default: 'scheduled' },
  startedAt: { type: String },
  endedAt: { type: String },
}, { versionKey: false })

// ── Model Exports (safe for Next.js hot-reload) ───────────
function getModel<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) ?? mongoose.model<T>(name, schema)
}

export const Course = () => getModel<ICourse>('Course', CourseSchema)
export const Lecture = () => getModel<ILecture>('Lecture', LectureSchema)
export const Student = () => getModel<IStudent>('Student', StudentSchema)
export const Quiz = () => getModel<IQuiz>('Quiz', QuizSchema)
export const PYQ = () => getModel<IPYQ>('PYQ', PYQSchema)
export const Purchase = () => getModel<IPurchase>('Purchase', PurchaseSchema)
export const Enrollment = () => getModel<IEnrollment>('Enrollment', EnrollmentSchema)
export const LiveSession = () => getModel<ILiveSession>('LiveSession', LiveSessionSchema)

// Also export direct model references for API routes
export const LiveSessionModel = mongoose.models.LiveSession || mongoose.model('LiveSession', LiveSessionSchema)
export const EnrollmentModel = mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema)
export const PurchaseModel = mongoose.models.Purchase || mongoose.model('Purchase', PurchaseSchema)
