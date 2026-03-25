'use client'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  model: string
  fallback?: boolean
  success: boolean
  error?: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  marks: number
}

// ── System prompts ─────────────────────────────────────────────
export const CHAT_SYSTEM_PROMPT = `You are Sakha AI (सखा AI), an expert Sanskrit scholar and competitive exam guide for the SanskritAI platform.

FOCUS AREAS:
- Sanskrit grammar (Vyakaran, Sandhi, Samasa, Karak, Dhatu, Pratyaya)
- Sanskrit literature (Ramayana, Mahabharata, Vedas, Upanishads, Kalidasa)
- UGC NET Sanskrit (Code 25/73) & JRF preparation
- State PGT/TGT Sanskrit exams
- Vedic studies and ancient Indian knowledge systems
- Sanskrit pronunciation and Devanagari script

RESPONSE RULES:
- Reply in Hindi or English based on user's language preference
- Be precise, scholarly and exam-focused
- Use Devanagari script when citing Sanskrit terms
- If asked off-topic, politely redirect: "मैं केवल संस्कृत और परीक्षा से सम्बंधित प्रश्न ही उत्तर दे सकता हूँ।"
- Keep responses concise but complete`

export const DOUBT_SYSTEM_PROMPT = `You are Sakha AI, a patient Sanskrit tutor specializing in clearing doubts step-by-step.

When answering doubts:
1. First acknowledge what the student is asking
2. Break down the concept into simple steps
3. Give at least one example with Devanagari
4. Provide a memory tip or mnemonic if possible
5. End with: "क्या यह स्पष्ट हुआ? कोई और संदेह हो तो पूछें।"

Focus only on Sanskrit, Vedic studies, and competitive exam content.`

// ── Core API call ───────────────────────────────────────────────
export async function generateAIResponse(
  messages: ChatMessage[],
  options?: { model?: string }
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, model: options?.model || 'gemini-2.0-flash' })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || `AI request failed: ${response.status}`)
    return data as AIResponse
  } catch (error) {
    return { content: '', model: '', success: false, error: String(error) }
  }
}

// ── Quick single-prompt helper ──────────────────────────────────
export async function askAI(
  prompt: string,
  options?: { model?: string; systemPrompt?: string }
): Promise<string> {
  const messages: ChatMessage[] = []
  if (options?.systemPrompt) messages.push({ role: 'system', content: options.systemPrompt })
  messages.push({ role: 'user', content: prompt })
  const response = await generateAIResponse(messages, options)
  if (!response.success) throw new Error(response.error || 'Failed to get AI response')
  return response.content
}

// ── Quiz generation from text ───────────────────────────────────
export async function generateQuizFromText(
  text: string,
  count = 5,
  difficulty = 'Medium',
  topic = 'Sanskrit'
): Promise<QuizQuestion[]> {
  const res = await fetch('/api/ai/quiz-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, count, difficulty, topic })
  })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.error || 'Quiz generation failed')
  return data.questions as QuizQuestion[]
}

// ── PDF extraction ──────────────────────────────────────────────
export async function parsePDF(file: File): Promise<{ text: string; pages: number }> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/ai/parse-pdf', { method: 'POST', body: form })
  const data = await res.json()
  if (!res.ok || !data.success) throw new Error(data.error || 'PDF parsing failed')
  return { text: data.text, pages: data.pages }
}
