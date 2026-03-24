import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Purchase, Student } from '@/lib/models'
import { auth } from '@/auth'
import { User } from '@/lib/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ purchased: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const resourceId = searchParams.get('resourceId')
    const resourceType = searchParams.get('resourceType')
    if (!resourceId) return NextResponse.json({ purchased: false })

    await connectDB()

    // Resolve user ID from Student (legacy) or User (current auth store)
    const student = await Student().findOne({ email: session.user.email }).lean<{ _id: { toString: () => string } } | null>()
    const user = !student
      ? await User.findOne({ email: session.user.email }).lean<{ _id: { toString: () => string } } | null>()
      : null
    const resolvedUserId = student?._id?.toString() || user?._id?.toString() || null
    if (!resolvedUserId) return NextResponse.json({ purchased: false })

    // Check purchase
    const purchase = await Purchase().findOne({
      userId: resolvedUserId,
      resourceId,
      ...(resourceType ? { resourceType } : {}),
      status: 'completed',
    })

    return NextResponse.json({ purchased: !!purchase, userId: resolvedUserId })
  } catch (error: any) {
    console.error('[/api/purchases/check]', error.message)
    return NextResponse.json({ purchased: false, error: error.message }, { status: 500 })
  }
}
