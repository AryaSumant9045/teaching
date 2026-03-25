'use client'
import { useState } from 'react'
import { Sparkles, X, Send, Loader } from 'lucide-react'
import { askAI } from '@/lib/aiService'

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('नमस्ते! मैं Sutra-AI हूं। संस्कृत भाषा, व्याकरण, साहित्य, और UGC NET/JRF परीक्षा से संबंधित प्रश्न पूछें।')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const userMsg = message.trim()
    setMessage('')
    setLoading(true)

    // Add user message to history
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])

    try {
      const result = await askAI(userMsg, {
        systemPrompt: `You are Sutra-AI, a specialized Sanskrit scholar and competitive exam expert. 

STRICT GUIDELINES:
1. ONLY answer questions related to:
   - Sanskrit language (grammar, literature, poetry, vyakaran, shiksha)
   - UGC NET Sanskrit preparation
   - JRF Sanskrit 
   - State PGT/TGT Sanskrit exams
   - Sanskrit competitive exams
   - Vedic studies and ancient Indian knowledge
   - Sanskrit teaching methodologies

2. ABSOLUTELY FORBIDDEN:
   - Political discussions
   - Religious controversies
   - Personal opinions on sensitive topics
   - Non-academic conversations
   - Jokes or casual chat
   - Any topic outside Sanskrit/competitive exams

3. RESPONSE FORMAT:
   - Answer in Hindi or English as preferred by user
   - Be precise and academic
   - Focus on exam-relevant content
   - If asked about forbidden topics, politely decline and redirect to Sanskrit studies

If user asks inappropriate questions, respond: "मैं केवल संस्कृत और प्रतियोगीता परीक्षाओं से संबंधित प्रश्नों का उत्तर दे सकता हूँ। कृपया संस्कृत विषय से प्रश्न पूछें।"`
      })
      
      // Add assistant response to history
      setChatHistory(prev => [...prev, { role: 'assistant', content: result }])
      setResponse(result)
    } catch (err) {
      const errorMsg = 'क्षमा करें, त्रुटि हुई। कृपया पुनः प्रयास करें।'
      setChatHistory(prev => [...prev, { role: 'assistant', content: errorMsg }])
      setResponse(errorMsg)
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
            <span>Sutra-AI संस्कृत उत्तर ढूंढ रहा है...</span>
          </div>
        ) : (
          <div>
            {/* Display chat history */}
            {chatHistory.map((msg, index) => (
              <div key={index} style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '4px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    fontWeight: 500
                  }}>
                    {msg.role === 'user' ? 'आप:' : 'Sutra-AI:'}
                  </span>
                </div>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))'
                    : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' 
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid rgba(255,255,255,0.1)',
                  maxWidth: '100%',
                  wordBreak: 'break-word'
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
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
          placeholder="संस्कृत प्रश्न पूछें..."
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
