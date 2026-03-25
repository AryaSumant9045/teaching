'use client'
import { useState } from 'react'
import { askAI, generateAIResponse } from '@/lib/aiService'
import { Sparkles, Send, Loader, Bot, AlertCircle } from 'lucide-react'

export default function AIChatDemo() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('')
  const [fallback, setFallback] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    setResponse('')

    try {
      const result = await askAI(prompt, {
        systemPrompt: 'You are a Sanskrit scholar and AI assistant. Answer in Hindi, English, or Sanskrit as appropriate.'
      })
      setResponse(result)
      
      // Get full response details
      const fullResult = await generateAIResponse([
        { role: 'system', content: 'You are a Sanskrit scholar AI.' },
        { role: 'user', content: prompt }
      ])
      
      setModel(fullResult.model)
      setFallback(fullResult.fallback || false)
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Sutra-AI Chat</h2>
          <p className="text-sm text-muted-foreground">Gemini → Groq fallback enabled</p>
        </div>
      </div>

      {model && (
        <div className={`mb-4 px-3 py-1.5 rounded-lg text-xs inline-flex items-center gap-2 ${
          fallback 
            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
            : 'bg-green-500/10 text-green-500 border border-green-500/20'
        }`}>
          <Bot size={12} />
          {fallback ? `Groq (Fallback) - Gemini failed` : `Gemini ${model}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="relative mb-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask about Sanskrit, Vedic studies, UGC NET..."
          className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-cyan-500/50 outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>

      {error && (
        <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-400 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {response && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  )
}
