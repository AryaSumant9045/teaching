import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Purchase, Student } from '@/lib/models'
import { auth } from '@/auth'
import { User } from '@/lib/models/User'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ purchasedResourceIds: [], error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const student = await Student().findOne({ email: session.user.email }).lean<{ _id: { toString: () => string } } | null>()
    const user = !student
      ? await User.findOne({ email: session.user.email }).lean<{ _id: { toString: () => string } } | null>()
      : null

    const resolvedUserId = student?._id?.toString() || user?._id?.toString() || null
    if (!resolvedUserId) {
      return NextResponse.json({ purchasedResourceIds: [] })
    }

    const purchases = await Purchase().find({
      userId: resolvedUserId,
      status: 'completed',
      resourceType: 'course',
    }).select('resourceId').lean<{ resourceId: unknown }[]>()

    const purchasedResourceIds = purchases.map(p => String(p.resourceId))

    return NextResponse.json({ purchasedResourceIds, userId: resolvedUserId })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/purchases/user]', msg)
    return NextResponse.json({ purchasedResourceIds: [], error: msg }, { status: 500 })
  }
}
