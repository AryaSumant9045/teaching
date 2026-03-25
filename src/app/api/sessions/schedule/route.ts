import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSessionModel } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'
import { v4 as uuidv4 } from 'uuid'

// POST /api/sessions/schedule - Admin only
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId, title, scheduledAt } = await req.json()

    if (!courseId || !title || !scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    // Generate unique Jitsi room name
    const jitsiRoomName = `SanskritClass-${uuidv4()}`

    const newSession = await LiveSessionModel.create({
      courseId,
      adminId: session.user.id,
      jitsiRoomName,
      title,
      scheduledAt,
      status: 'scheduled'
    })

    return NextResponse.json({
      success: true,
      session: newSession
    })

  } catch (error) {
    console.error('Schedule session error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule live session' },
      { status: 500 }
    )
  }
}
