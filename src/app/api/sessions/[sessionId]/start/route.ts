import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { LiveSessionModel } from '@/lib/models'
import { connectDB } from '@/lib/mongodb'

// POST /api/sessions/[sessionId]/start - Admin only
export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params

    await connectDB()

    // Update session status to active
    const updatedSession = await LiveSessionModel.findByIdAndUpdate(
      sessionId,
      {
        status: 'active',
        startedAt: new Date().toISOString()
      },
      { returnDocument: 'after' }
    )

    if (!updatedSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      session: updatedSession
    })

  } catch (error) {
    console.error('Start session error:', error)
    return NextResponse.json(
      { error: 'Failed to start live session' },
      { status: 500 }
    )
  }
}
