import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Course, Quiz, Purchase } from '@/lib/models'

// Force dynamically rendered route
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    const [courses, quizzes, purchases] = await Promise.all([
      Course().find({ isFree: false }).lean(),
      Quiz().find({ isFree: false }).lean(),
      Purchase().find().sort({ createdAt: -1 }).limit(50).lean(),
    ])

    return NextResponse.json({ courses, quizzes, purchases })
  } catch (err: any) {
    console.error('Error in Admin Payments API:', err)
    return NextResponse.json({ error: 'Failed to load payments data', details: err.message }, { status: 500 })
  }
}
