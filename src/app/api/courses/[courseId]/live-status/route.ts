import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSessionModel, EnrollmentModel, PurchaseModel, Course } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

// GET /api/courses/:courseId/live-status
// Returns: { isLive: boolean, session?: ILiveSession, jitsiRoomName?: string, title?: string }
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized', isLive: false }, { status: 401 })
    }

    const userId = session.user.id
    const { courseId } = await params
    const isAdmin = session.user.role === 'admin'

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required', isLive: false }, { status: 400 })
    }

    await connectDB()

    // Admins and free-course students can always check live status.
    // Paid-course students must have an enrollment or purchase record.
    if (!isAdmin) {
      const course = await Course().findById(courseId).lean()
      const isFree = !course || (course as any).isFree !== false // default free

      if (!isFree) {
        const enrollment = await EnrollmentModel.findOne({ userId, courseId, status: 'active' })
        const purchase = await PurchaseModel.findOne({ userId, resourceId: courseId, resourceType: 'course', status: 'completed' })
        if (!enrollment && !purchase) {
          // Return gracefully — don't hard 403, just say not live
          return NextResponse.json({ isLive: false, message: 'Not enrolled' })
        }
      }
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
