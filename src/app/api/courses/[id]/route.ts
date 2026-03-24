import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Course } from '@/lib/models'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const course = await Course().findByIdAndUpdate(params.id, body, { new: true })
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(course)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  await Course().findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
