import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Lecture } from '@/lib/models'

// Safely parse materials — handles both array and JSON-string
function parseMaterials(raw: unknown): object[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p : [] } catch { return [] }
  }
  return []
}

// GET /api/lectures?courseId=xxx
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const courseId = req.nextUrl.searchParams.get('courseId')
    const query = courseId ? { courseId } : {}
    const lectures = await Lecture().find(query).sort({ order: 1 }).lean()
    return NextResponse.json(lectures)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/lectures GET]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const body = await req.json()
    body.materials = parseMaterials(body.materials)
    const lecture = await Lecture().create(body)
    return NextResponse.json(lecture, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[/api/lectures POST]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
