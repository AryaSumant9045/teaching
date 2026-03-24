import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { PYQ } from '@/lib/models'

const SEED = [
  { title: 'Sanskrit Board Exam', year: '2023', subject: 'Sanskrit Grammar', fileUrl: '#', questions: 50, addedAt: '2026-01-10' },
  { title: 'CBSE Sanskrit Paper', year: '2022', subject: 'Sanskrit Literature', fileUrl: '#', questions: 40, addedAt: '2026-01-15' },
  { title: 'Vedic Studies Entrance', year: '2023', subject: 'Vedic Grammar', fileUrl: '#', questions: 60, addedAt: '2026-02-01' },
  { title: 'State Board Sanskrit', year: '2021', subject: 'Sanskrit Composition', fileUrl: '#', questions: 45, addedAt: '2026-02-10' },
]

export async function GET() {
  await connectDB()
  const PYQModel = PYQ()
  const count = await PYQModel.countDocuments()
  if (count === 0) await PYQModel.insertMany(SEED)
  const pyqs = await PYQModel.find().sort({ year: -1 }).lean()
  return NextResponse.json(pyqs)
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  const pyq = await PYQ().create(body)
  return NextResponse.json(pyq, { status: 201 })
}
