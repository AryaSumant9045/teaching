import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Student } from '@/lib/models'

const SEED = [
  { name: 'Priya Sharma', email: 'priya@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', enrolled: 3, progress: 78, streak: 12, status: 'active', joinedAt: '2026-01-05' },
  { name: 'Rahul Verma', email: 'rahul@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul', enrolled: 5, progress: 92, streak: 24, status: 'active', joinedAt: '2026-01-08' },
  { name: 'Aarav Joshi', email: 'aarav@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav', enrolled: 1, progress: 34, streak: 3, status: 'active', joinedAt: '2026-01-20' },
  { name: 'Meera Patel', email: 'meera@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera', enrolled: 4, progress: 61, streak: 8, status: 'active', joinedAt: '2026-02-01' },
  { name: 'Vikram Singh', email: 'vikram@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram', enrolled: 2, progress: 45, streak: 0, status: 'revoked', joinedAt: '2026-01-15' },
  { name: 'Sneha Gupta', email: 'sneha@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha', enrolled: 3, progress: 88, streak: 18, status: 'active', joinedAt: '2026-02-12' },
]

export async function GET() {
  await connectDB()
  const StudentModel = Student()
  const count = await StudentModel.countDocuments()
  if (count === 0) await StudentModel.insertMany(SEED)
  const students = await StudentModel.find().sort({ joinedAt: -1 }).lean()
  return NextResponse.json(students)
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const student = await Student().create(body)
  return NextResponse.json(student, { status: 201 })
}
