import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Student } from '@/lib/models'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const student = await Student().findByIdAndUpdate(params.id, body, { new: true })
  if (!student) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(student)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  await Student().findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
