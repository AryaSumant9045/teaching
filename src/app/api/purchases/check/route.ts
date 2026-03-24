import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Purchase, Student } from '@/lib/models'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ purchased: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const resourceId = searchParams.get('resourceId')
    if (!resourceId) return NextResponse.json({ purchased: false })

    await connectDB()
    
    // Find the student by email to get their user ID
    const student = await Student().findOne({ email: session.user.email })
    if (!student) return NextResponse.json({ purchased: false })

    // Check purchase
    const purchase = await Purchase().findOne({
      userId: student._id.toString(),
      resourceId,
      status: 'completed'
    })

    return NextResponse.json({ purchased: !!purchase, userId: student._id.toString() })
  } catch (error: any) {
    console.error('[/api/purchases/check]', error.message)
    return NextResponse.json({ purchased: false, error: error.message }, { status: 500 })
  }
}
