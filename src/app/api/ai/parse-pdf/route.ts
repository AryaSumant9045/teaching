import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Use require for CJS compat with pdf-parse
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)

    const text = data.text
      .replace(/\s{3,}/g, '\n\n') // collapse excessive whitespace
      .trim()

    if (text.length < 30) {
      return NextResponse.json({ error: 'PDF appears to be empty or image-only' }, { status: 400 })
    }

    return NextResponse.json({
      text,
      pages: data.numpages,
      chars: text.length,
      success: true
    })
  } catch (error) {
    console.error('PDF parse error:', error)
    return NextResponse.json(
      { error: 'Failed to parse PDF', details: String(error) },
      { status: 500 }
    )
  }
}
