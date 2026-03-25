import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSessionModel, EnrollmentModel, PurchaseModel } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

// GET /api/courses/:courseId/live-status
// Returns: { isLive: boolean, session?: ILiveSession, jitsiRoomName?: string, title?: string }
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userName = session.user.name || 'Student'
    const { courseId } = await params

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    await connectDB()

    // 2. Check if user is enrolled in the course
    // Check both Enrollment model and Purchase model (for backward compatibility)
    const enrollment = await EnrollmentModel.findOne({ 
      userId, 
      courseId,
      status: 'active'
    })

    const purchase = await PurchaseModel.findOne({
      userId,
      resourceId: courseId,
      resourceType: 'course',
      status: 'completed'
    })

    const isEnrolled = !!enrollment || !!purchase

    if (!isEnrolled) {
      return NextResponse.json({ 
        error: 'You are not enrolled in this course',
        isLive: false 
      }, { status: 403 })
    }

    // 3. Query for active live session
    const liveSession = await LiveSessionModel.findOne({
      courseId,
      status: 'active'
    })

    // 4. If no active session, return isLive: false
    if (!liveSession) {
      return NextResponse.json({
        isLive: false,
        message: 'No active live session for this course'
      })
    }

    // 5. Return live status with Jitsi room info
    return NextResponse.json({
      isLive: true,
      session: liveSession,
      jitsiRoomName: liveSession.jitsiRoomName,
      title: liveSession.title,
      startedAt: liveSession.startedAt,
      message: 'Live session is active'
    })

  } catch (error) {
    console.error('Live status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check live status', details: String(error), isLive: false },
      { status: 500 }
    )
  }
}
