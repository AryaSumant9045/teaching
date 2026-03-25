import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSessionModel } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// POST /api/sessions/start
// Body: { courseId: string, title?: string }
// Creates + immediately activates a Jitsi live session
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can start live sessions' }, { status: 403 })
    }

    const { courseId, title = 'Live Class' } = await req.json()
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    await connectDB()

    // Check if there's already an active session for this course
    const existingSession = await LiveSessionModel.findOne({ courseId, status: 'active' })
    if (existingSession) {
      return NextResponse.json({
        success: true,
        session: existingSession,
        jitsiRoomName: existingSession.jitsiRoomName,
        message: 'Session already active',
      })
    }

    // Generate Jitsi room name and create + immediately activate session
    const jitsiRoomName = `SanskritClass-${uuidv4()}`
    const newSession = await LiveSessionModel.create({
      courseId,
      adminId: session.user.id,
      jitsiRoomName,
      title,
      scheduledAt: new Date().toISOString(),
      status: 'active',
      startedAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      session: newSession,
      jitsiRoomName,
      message: 'Live session started successfully',
    })

  } catch (error) {
    console.error('Start session error:', error)
    return NextResponse.json(
      { error: 'Failed to start live session', details: String(error) },
      { status: 500 }
    )
  }
}
