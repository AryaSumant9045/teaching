'use client'
import { useState } from 'react'
import { Sparkles, X, Send, Loader } from 'lucide-react'
import { askAI } from '@/lib/aiService'

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('नमस्ते! मैं Sutra-AI हूं। संस्कृत या UGC NET से संबंधित प्रश्न पूछें।')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const userMsg = message.trim()
    setMessage('')
    setLoading(true)

    try {
      const result = await askAI(userMsg, {
        systemPrompt: 'You are Sutra-AI, a Sanskrit scholar. Answer in Hindi or English.'
      })
      setResponse(result)
    } catch (err) {
      setResponse('क्षमा करें, त्रुटि हुई। कृपया पुनः प्रयास करें।')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.4)'
        }}
      >
        <Sparkles size={24} color="white" />
      </button>
    )
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '8px',
        right: '8px',
        width: 'calc(100vw - 16px)',
        maxWidth: '360px',
        height: '400px',
        background: 'rgba(11, 14, 28, 0.98)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#fbbf24" />
          <span style={{ color: 'white', fontSize: '14px', fontWeight: 600 }}>Sutra-AI</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} color="rgba(255,255,255,0.6)" />
        </button>
      </div>

      {/* Response Area */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          color: 'white',
          fontSize: '14px',
          lineHeight: 1.6
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)' }}>
            <Loader size={16} className="animate-spin" />
            <span>Sutra-AI सोच रहा है...</span>
          </div>
        ) : (
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{response}</p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="प्रश्न पूछें..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {loading ? <Loader size={18} color="white" /> : <Send size={18} color="white" />}
        </button>
      </form>
    </div>
  )
}
