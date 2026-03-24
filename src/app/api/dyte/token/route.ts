import { NextRequest, NextResponse } from 'next/server'

const DYTE_ORG_ID = process.env.DYTE_ORG_ID!
const DYTE_API_KEY = process.env.DYTE_API_KEY!
const DYTE_BASE = 'https://api.dyte.io/v2'
const AUTH = Buffer.from(`${DYTE_ORG_ID}:${DYTE_API_KEY}`).toString('base64')

const headers = {
  'Authorization': `Basic ${AUTH}`,
  'Content-Type': 'application/json',
}

// POST /api/dyte/token
// Body: { meetingId: string, name: string, role: 'host' | 'participant' }
// Returns: { authToken: string }
export async function POST(req: NextRequest) {
  try {
    const { meetingId, name, role } = await req.json()

    const presetName =
      role === 'host'
        ? (process.env.DYTE_PRESET_NAME ?? 'group_call_host')
        : 'group_call_participant'

    const res = await fetch(`${DYTE_BASE}/meetings/${meetingId}/participants`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name ?? 'Student',
        picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name ?? 'anon')}`,
        preset_name: presetName,
        custom_participant_id: `${role}_${Date.now()}`,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({ authToken: data.data.token })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
