import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Course } from '@/lib/models'

interface Params { params: Promise<{ courseId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const { courseId } = await params
    const course = await Course().findById(courseId).lean()
    if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(course)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const { courseId } = await params
    const body = await req.json()
    const updated = await Course().findByIdAndUpdate(
      courseId,
      { $set: body },
      { new: true, runValidators: true }
    ).lean()
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(updated)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/courses/[courseId] PUT]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await connectDB()
    const { courseId } = await params
    await Course().findByIdAndDelete(courseId)
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/courses/[courseId] DELETE]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
