import { NextRequest, NextResponse } from 'next/server'

const DYTE_ORG_ID = process.env.DYTE_ORG_ID!
const DYTE_API_KEY = process.env.DYTE_API_KEY!
const DYTE_BASE = 'https://api.dyte.io/v2'
const AUTH = Buffer.from(`${DYTE_ORG_ID}:${DYTE_API_KEY}`).toString('base64')

const headers = {
  'Authorization': `Basic ${AUTH}`,
  'Content-Type': 'application/json',
}

// POST /api/dyte/meeting
// Body: { lectureTitle: string, lectureId: string }
// Returns: { meetingId: string }
export async function POST(req: NextRequest) {
  try {
    const { lectureTitle, lectureId } = await req.json()

    const res = await fetch(`${DYTE_BASE}/meetings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title: lectureTitle ?? 'Live Sanskrit Lecture',
        record_on_start: false,
        live_stream_on_start: false,
        persist_chat: true,
        preferred_region: 'ap-south-1',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    const meetingId = data.data.id

    return NextResponse.json({ meetingId, lectureId })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
