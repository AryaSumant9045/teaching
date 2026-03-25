import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' })

export async function POST(req: Request) {
  try {
    const { messages, model = 'gemini-2.0-flash' } = await req.json()
    
    const geminiKey = process.env.GEMINI_API_KEY
    const groqKey = process.env.GROQ_API_KEY
    
    console.log('AI API called')
    console.log('GEMINI_API_KEY exists:', !!geminiKey, 'length:', geminiKey?.length)
    console.log('GROQ_API_KEY exists:', !!groqKey, 'length:', groqKey?.length)
    
    // TEMP: Return test response if no API keys (for UI testing)
    if (!geminiKey && !groqKey) {
      console.log('NO API KEYS - returning test response')
      return NextResponse.json({
        content: '⚠️ Test Mode: API keys not configured.\n\nPlease add GEMINI_API_KEY and GROQ_API_KEY to your .env.local file:\n\nGEMINI_API_KEY=your_gemini_key\nGROQ_API_KEY=your_groq_key',
        model: 'test',
        success: true
      })
    }
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    // Try Gemini first
    try {
      const geminiModel = genAI.getGenerativeModel({ model })
      
      // Convert messages to Gemini format
      const lastMessage = messages[messages.length - 1]
      
      // Filter valid history messages
      const history = messages
        .slice(0, -1)
        .filter((m: { role: string; content: string }) => 
          m.role === 'user' || m.role === 'assistant' || m.role === 'model'
        )
        .map((m: { role: string; content: string }) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      
      console.log('Calling Gemini with history length:', history.length)
      
      const chat = geminiModel.startChat({ history })
      const result = await chat.sendMessage(lastMessage.content)
      const text = result.response.text()
      
      console.log('Gemini success')
      
      return NextResponse.json({ 
        content: text, 
        model: 'gemini',
        success: true 
      })
    } catch (geminiError) {
      console.error('Gemini failed:', geminiError)
      
      // Fallback to Groq
      try {
        console.log('Trying Groq fallback...')
        const groqMessages = messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant' | 'system',
          content: m.content
        }))
        
        const groqResponse = await groq.chat.completions.create({
          messages: groqMessages,
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 2048
        })
        
        console.log('Groq success')
        
        return NextResponse.json({
          content: groqResponse.choices[0]?.message?.content || '',
          model: 'groq',
          fallback: true,
          success: true
        })
      } catch (groqError) {
        console.error('Groq also failed:', groqError)
        throw new Error('Both AI services failed')
      }
    }
    
  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response', details: String(error) },
      { status: 500 }
    )
  }
}
