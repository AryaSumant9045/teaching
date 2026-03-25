import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSession, Course, Enrollment } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

const DYTE_ORG_ID = process.env.DYTE_ORG_ID!
const DYTE_API_KEY = process.env.DYTE_API_KEY!
const DYTE_BASE = 'https://api.dyte.io/v2'
const AUTH = Buffer.from(`${DYTE_ORG_ID}:${DYTE_API_KEY}`).toString('base64')

const headers = {
  'Authorization': `Basic ${AUTH}`,
  'Content-Type': 'application/json',
}

// POST /api/sessions/start
// Body: { courseId: string, title?: string, description?: string }
// Returns: { session: ILiveSession, adminToken: string, meetingId: string }
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate admin
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = session.user.id
    const adminName = session.user.name || 'Admin'
    const adminRole = session.user.role

    // 2. Parse request body
    const { courseId, title = 'Live Class', description = '' } = await req.json()
    
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    await connectDB()

    // 3. Verify admin owns/is admin of the course
    // Note: In a real app, you'd check if the user is the course creator or has admin role
    // For now, we check if user has admin role
    if (adminRole !== 'admin') {
      return NextResponse.json({ error: 'Only admins can start live sessions' }, { status: 403 })
    }

    // 4. Check if there's already an active session for this course
    const existingSession = await LiveSession().findOne({ 
      courseId, 
      status: 'active' 
    })
    
    if (existingSession) {
      return NextResponse.json({ 
        error: 'A live session is already active for this course',
        session: existingSession 
      }, { status: 409 })
    }

    // 5. Create Dyte meeting
    const meetingRes = await fetch(`${DYTE_BASE}/meetings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: title,
        record_on_start: false,
        live_stream_on_start: false,
        persist_chat: true,
        preferred_region: 'ap-south-1',
      }),
    })

    if (!meetingRes.ok) {
      const err = await meetingRes.text()
      console.error('Dyte meeting creation failed:', err)
      return NextResponse.json({ error: 'Failed to create video meeting' }, { status: 500 })
    }

    const meetingData = await meetingRes.json()
    const dyteMeetingId = meetingData.data.id
    const dyteRoomName = meetingData.data.room_name

    // 6. Create LiveSession record in database
    const newSession = await LiveSession().create({
      courseId,
      adminId,
      dyteMeetingId,
      dyteRoomName,
      status: 'active',
      title,
      description,
      startedAt: new Date().toISOString(),
    })

    // 7. Generate Admin Token
    const presetName = process.env.DYTE_PRESET_NAME
    
    const tokenBody: any = {
      name: adminName,
      picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(adminName)}`,
      custom_participant_id: `admin_${adminId}_${Date.now()}`,
    }
    
    if (presetName) {
      tokenBody.preset_name = presetName
    }

    const tokenRes = await fetch(`${DYTE_BASE}/meetings/${dyteMeetingId}/participants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(tokenBody),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      console.error('Dyte admin token generation failed:', err)
      // Cleanup the created session
      await LiveSession().findByIdAndUpdate(newSession._id, { status: 'ended', endedAt: new Date().toISOString() })
      return NextResponse.json({ error: 'Failed to generate admin token' }, { status: 500 })
    }

    const tokenData = await tokenRes.json()
    const adminToken = tokenData.data.token

    // 8. Return session details and admin token
    return NextResponse.json({
      success: true,
      session: newSession,
      adminToken,
      meetingId: dyteMeetingId,
      roomName: dyteRoomName,
      message: 'Live session started successfully'
    })

  } catch (error) {
    console.error('Start session error:', error)
    return NextResponse.json(
      { error: 'Failed to start live session', details: String(error) },
      { status: 500 }
    )
  }
}
