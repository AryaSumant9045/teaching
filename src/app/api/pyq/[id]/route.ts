import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { PYQ } from '@/lib/models'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  const body = await req.json()
  const pyq = await PYQ().findByIdAndUpdate(params.id, body, { new: true })
  if (!pyq) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(pyq)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB()
  await PYQ().findByIdAndDelete(params.id)
  return NextResponse.json({ ok: true })
}
