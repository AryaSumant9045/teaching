import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Course, Quiz, Purchase } from '@/lib/models'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await connectDB()

    const [courses, quizzes, purchases] = await Promise.all([
      Course().find().lean(),
      Quiz().find().lean(),
      Purchase().find().sort({ createdAt: -1 }).limit(50).lean(),
    ])

    return NextResponse.json({ courses, quizzes, purchases })
  } catch (err: unknown) {
    console.error('Error in Admin Payments API:', err)
    return NextResponse.json({ error: 'Failed to load payments data', details: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
