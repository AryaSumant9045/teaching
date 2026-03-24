import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Course } from '@/lib/models'

export async function GET() {
  try {
    await connectDB()
    const courses = await Course().find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(courses)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/courses GET]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    const course = await Course().create(body)
    return NextResponse.json(course, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/courses POST]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
