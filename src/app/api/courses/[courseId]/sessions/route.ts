import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSession } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

// GET /api/courses/[courseId]/sessions - Students & Admins
export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await params

    await connectDB()

    // Fetch sessions for this course with status 'scheduled' or 'active'
    const sessions = await LiveSession().find({
      courseId,
      status: { $in: ['scheduled', 'active'] }
    }).sort({ scheduledAt: 1 })

    return NextResponse.json({
      success: true,
      sessions
    })

  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
