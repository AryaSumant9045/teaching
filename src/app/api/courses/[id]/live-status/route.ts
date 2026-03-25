import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSession, Enrollment, Purchase } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

const DYTE_ORG_ID = process.env.DYTE_ORG_ID!
const DYTE_API_KEY = process.env.DYTE_API_KEY!
const DYTE_BASE = 'https://api.dyte.io/v2'
const AUTH = Buffer.from(`${DYTE_ORG_ID}:${DYTE_API_KEY}`).toString('base64')

const headers = {
  'Authorization': `Basic ${AUTH}`,
  'Content-Type': 'application/json',
}

// GET /api/courses/:courseId/live-status
// Returns: { isLive: boolean, session?: ILiveSession, studentToken?: string, meetingId?: string }
export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // 1. Authenticate user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const userName = session.user.name || 'Student'
    const { courseId } = params

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    await connectDB()

    // 2. Check if user is enrolled in the course
    // Check both Enrollment model and Purchase model (for backward compatibility)
    const enrollment = await Enrollment().findOne({ 
      userId, 
      courseId,
      status: 'active'
    })

    const purchase = await Purchase().findOne({
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
    const liveSession = await LiveSession().findOne({
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

    // 5. Generate Student Token
    const presetName = process.env.DYTE_PRESET_NAME
    
    const tokenBody: any = {
      name: userName,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
      custom_participant_id: `student_${userId}_${Date.now()}`,
    }
    
    if (presetName) {
      tokenBody.preset_name = presetName
    }

    const tokenRes = await fetch(`${DYTE_BASE}/meetings/${liveSession.dyteMeetingId}/participants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tokenBody),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Dyte student token generation failed:', err)
      return NextResponse.json({ 
        error: 'Failed to generate join token',
        isLive: true,
        session: liveSession
      }, { status: 500 })
    }

    const tokenData = await tokenRes.json()
    const studentToken = tokenData.data.token

    // 6. Return live status with student token
    return NextResponse.json({
      isLive: true,
      session: liveSession,
      studentToken,
      meetingId: liveSession.dyteMeetingId,
      roomName: liveSession.dyteRoomName,
      title: liveSession.title,
      description: liveSession.description,
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
