import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models/User'
import { auth } from '@/auth'

export async function GET() {
  try {
    // 1. Check Authentication & Authorization
    const session = await auth()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Connect to Database
    await connectDB()

    // 3. Fetch all users, sorted by newest first
    const students = await User.find({}).sort({ createdAt: -1 }).lean()

    return NextResponse.json({ students })
  } catch (error: any) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}
