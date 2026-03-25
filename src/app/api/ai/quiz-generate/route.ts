import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { text, count = 5, difficulty = 'Medium', topic = 'Sanskrit' } = await req.json()

    if (!text || text.trim().length < 30) {
      return NextResponse.json({ error: 'Text too short to generate quiz' }, { status: 400 })
    }

    const prompt = `You are an expert Sanskrit and competitive exam question creator.

Generate exactly ${count} multiple choice questions from the following text/topic.
Difficulty: ${difficulty}
Topic area: ${topic}

Source text:
"""
${text.slice(0, 8000)}
"""

Return ONLY a valid JSON array (no markdown, no explanation) in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why this answer is correct",
    "marks": 1
  }
]

Rules:
- Questions must be directly based on the provided text
- Each question must have exactly 4 options
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Make distractors plausible but clearly wrong
- For Sanskrit, include Devanagari where appropriate
- Explanation should be concise (1-2 sentences)`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const raw = result.response.text().trim()

    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    let questions
    try {
      questions = JSON.parse(cleaned)
    } catch {
      // Try to extract JSON array from response
      const match = cleaned.match(/\[[\s\S]*\]/)
      if (match) {
        questions = JSON.parse(match[0])
      } else {
        throw new Error('Could not parse quiz JSON from AI response')
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI returned empty or invalid quiz data')
    }

    return NextResponse.json({
      questions,
      count: questions.length,
      success: true
    })
  } catch (error) {
    console.error('Quiz generate error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quiz', details: String(error) },
      { status: 500 }
    )
  }
}
