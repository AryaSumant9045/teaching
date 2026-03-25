import { NextResponse } from 'next/server'

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  
  return NextResponse.json({
    geminiKeyExists: !!geminiKey,
    geminiKeyLength: geminiKey?.length || 0,
    groqKeyExists: !!groqKey,
    groqKeyLength: groqKey?.length || 0,
    nodeEnv: process.env.NODE_ENV
  })
}
