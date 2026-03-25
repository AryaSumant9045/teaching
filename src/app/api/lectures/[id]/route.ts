import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Lecture } from '@/lib/models'

function parseMaterials(raw: unknown): object[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const body = await req.json()
    if (body.materials !== undefined) body.materials = parseMaterials(body.materials)
    const lecture = await Lecture().findByIdAndUpdate(id, body, { returnDocument: 'after', runValidators: true })
    if (!lecture) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(lecture)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/lectures PUT]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    await Lecture().findByIdAndDelete(id)
    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/lectures/[id] — toggle isLive on liveClass
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const { isLive } = await req.json()
    const lecture = await Lecture().findByIdAndUpdate(
      id,
      { 'liveClass.isLive': isLive },
      { returnDocument: 'after' }
    )
    return NextResponse.json(lecture)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
