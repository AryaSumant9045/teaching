import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSession } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

// POST /api/sessions/[sessionId]/end
// Body: { sessionId: string }
// Returns: { success: boolean, message: string }
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // 1. Authenticate admin
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminId = session.user.id
    const adminRole = session.user.role
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    await connectDB()

    // 2. Verify admin role
    if (adminRole !== 'admin') {
      return NextResponse.json({ error: 'Only admins can end sessions' }, { status: 403 })
    }

    // 3. Find the live session
    const liveSession = await LiveSession().findById(sessionId)
    
    if (!liveSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // 4. Verify the admin owns this session
    if (liveSession.adminId !== adminId) {
      return NextResponse.json({ error: 'You can only end your own sessions' }, { status: 403 })
    }

    // 5. Check if already ended
    if (liveSession.status === 'ended') {
      return NextResponse.json({ 
        success: true, 
        message: 'Session already ended',
        session: liveSession 
      })
    }

    // 6. Update session status to ended
    const updatedSession = await LiveSession().findByIdAndUpdate(
      sessionId,
      {
        status: 'ended',
        endedAt: new Date().toISOString()
      },
      { new: true }
    )

    return NextResponse.json({
      success: true,
      message: 'Live session ended successfully',
      session: updatedSession
    })

  } catch (error) {
    console.error('End session error:', error)
    return NextResponse.json(
      { error: 'Failed to end live session', details: String(error) },
      { status: 500 }
    )
  }
}
