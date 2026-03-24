import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Purchase, Student } from '@/lib/models'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ purchasedResourceIds: [], error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const student = await Student().findOne({ email: session.user.email }).lean()
    
    if (!student) {
      return NextResponse.json({ purchasedResourceIds: [] })
    }

    const purchases = await Purchase().find({
      userId: student._id.toString(),
      status: 'completed'
    }).select('resourceId').lean()

    const purchasedResourceIds = purchases.map((p: { resourceId: string }) => p.resourceId)

    return NextResponse.json({ purchasedResourceIds, userId: student._id.toString() })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[/api/purchases/user]', msg)
    return NextResponse.json({ purchasedResourceIds: [], error: msg }, { status: 500 })
  }
}
