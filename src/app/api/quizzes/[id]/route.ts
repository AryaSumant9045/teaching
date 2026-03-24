import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Quiz } from '@/lib/models'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const quiz = await Quiz().findByIdAndUpdate(params.id, body, { new: true })
  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  await Quiz().findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
