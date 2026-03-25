'use client'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface AIResponse {
  content: string
  model: string
  fallback?: boolean
  success: boolean
  error?: string
}

/**
 * Generate AI response using Gemini API with automatic Groq fallback
 * If Gemini fails, automatically switches to Groq
 */
export async function generateAIResponse(
  messages: ChatMessage[],
  options?: { model?: string }
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: options?.model || 'gemini-1.5-flash'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('AI API Error:', data)
      throw new Error(data.error || data.details || `AI request failed: ${response.status}`)
    }

    return data as AIResponse
  } catch (error) {
    console.error('AI Service Error:', error)
    return {
      content: '',
      model: '',
      success: false,
      error: String(error)
    }
  }
}

/**
 * Quick helper for single prompt
 */
export async function askAI(
  prompt: string,
  options?: { model?: string; systemPrompt?: string }
): Promise<string> {
  const messages: ChatMessage[] = []
  
  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt })
  }
  
  messages.push({ role: 'user', content: prompt })
  
  const response = await generateAIResponse(messages, options)
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to get AI response')
  }
  
  return response.content
}
