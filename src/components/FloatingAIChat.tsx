'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, X, Send, Loader2, MessageSquare, HelpCircle,
  FileText, Upload, ChevronDown, CheckCircle, Save, Trash2,
  Copy, RotateCcw, Zap
} from 'lucide-react'
import {
  generateAIResponse, generateQuizFromText, parsePDF,
  CHAT_SYSTEM_PROMPT, DOUBT_SYSTEM_PROMPT,
  type ChatMessage, type QuizQuestion
} from '@/lib/aiService'

// ── Types ────────────────────────────────────────────────────────
type Mode = 'chat' | 'doubt' | 'quiz'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

// ── Quick chips per mode ─────────────────────────────────────────
const CHIPS: Record<Mode, string[]> = {
  chat: ['Sandhi ke niyam batao', 'UGC NET syllabus', 'Panini ke sutras', 'Karak prakarana'],
  doubt: ['Sandhi aur Samas mein antar', 'Krit pratyaya kya hain?', 'Dhatu path explain karo', 'Avyay kya hote hain?'],
  quiz: ['Sanskrit grammar', 'Vedic literature', 'UGC NET 2023', 'Kalidasa works'],
}

const MODE_CONFIG = {
  chat: { label: 'Chat', icon: MessageSquare, color: '#f5a623', tip: 'Sanskrit ke baare mein kuch bhi poochho' },
  doubt: { label: 'Doubt', icon: HelpCircle, color: '#00e5ff', tip: 'Step-by-step samjhayenge' },
  quiz: { label: 'Quiz Gen', icon: FileText, color: '#a78bfa', tip: 'PDF ya text se quiz banao' },
}

// ── Markdown-lite renderer ────────────────────────────────────────
function RenderContent({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div style={{ lineHeight: 1.65 }}>
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**'))
          return <p key={i} style={{ fontWeight: 700, margin: '4px 0', color: '#f5a623' }}>{line.slice(2, -2)}</p>
        if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* '))
          return <p key={i} style={{ margin: '2px 0 2px 12px' }}>• {line.slice(2)}</p>
        if (/^\d+\./.test(line))
          return <p key={i} style={{ margin: '2px 0 2px 8px' }}>{line}</p>
        if (line.trim() === '') return <br key={i} />
        // Bold inline **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g)
        return (
          <p key={i} style={{ margin: '2px 0' }}>
            {parts.map((part, j) =>
              part.startsWith('**') && part.endsWith('**')
                ? <strong key={j} style={{ color: '#fbbf24' }}>{part.slice(2, -2)}</strong>
                : part
            )}
          </p>
        )
      })}
    </div>
  )
}

// ── Quiz Card component ───────────────────────────────────────────
function QuizCard({ q, index, selected, onSelect }: {
  q: QuizQuestion; index: number; selected: number | null; onSelect: (i: number) => void
}) {
  const labels = ['A', 'B', 'C', 'D']
  const answered = selected !== null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(167,139,250,0.2)',
      borderRadius: 12,
      padding: '14px',
      marginBottom: 12,
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>
        Q{index + 1}. {q.question}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex
          const isSelected = selected === i
          let bg = 'rgba(255,255,255,0.05)'
          let border = '1px solid rgba(255,255,255,0.1)'
          let color = '#cbd5e1'
          if (answered) {
            if (isCorrect) { bg = 'rgba(34,197,94,0.15)'; border = '1px solid rgba(34,197,94,0.4)'; color = '#86efac' }
            else if (isSelected) { bg = 'rgba(239,68,68,0.15)'; border = '1px solid rgba(239,68,68,0.4)'; color = '#fca5a5' }
          }
          return (
            <button key={i} onClick={() => !answered && onSelect(i)}
              style={{ background: bg, border, borderRadius: 8, padding: '6px 10px', cursor: answered ? 'default' : 'pointer', color, fontSize: 12, textAlign: 'left', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 700, flexShrink: 0 }}>{labels[i]}.</span> {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, fontSize: 11, color: '#86efac' }}>
          💡 {q.explanation}
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('chat')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  // Quiz mode state
  const [quizText, setQuizText] = useState('')
  const [quizCount, setQuizCount] = useState(5)
  const [quizDiff, setQuizDiff] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [quizTopic, setQuizTopic] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([])
  const [pdfStatus, setPdfStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle')
  const [pdfInfo, setPdfInfo] = useState<{ name: string; pages: number } | null>(null)
  const [savingQuiz, setSavingQuiz] = useState(false)
  const [quizTitle, setQuizTitle] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Welcome messages per mode
  const WELCOME: Record<Mode, string> = {
    chat: 'नमस्ते! मैं **Sakha AI** हूँ 🙏\n\nSanskrit grammar, literature, UGC NET, aur Vedic studies se related kuch bhi poochho. Main Hindi aur English dono mein jawab de sakta hoon.',
    doubt: 'स्वागतम्! 🎓\n\nApna **Sanskrit doubt** poochho — main step-by-step samjhaoonga examples ke saath.\n\nKya samajhna hai aapko?',
    quiz: '📄 **Quiz Generator Mode**\n\nTeen tarike se quiz banao:\n1. **PDF upload** karein\n2. **Text paste** karein\n3. **Topic type** karein (niche chips se)\n\nFir questions ki count aur difficulty choose karein!',
  }

  // Switch mode → reset state
  useEffect(() => {
    setMessages([{
      id: Date.now().toString(),
      role: 'assistant',
      content: WELCOME[mode],
      timestamp: new Date()
    }])
    setChatHistory([])
    setQuestions([])
    setSelectedAnswers([])
    setQuizText('')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Send message (chat / doubt modes) ─────────────────────────
  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text || input).trim()
    if (!userText || loading) return
    setInput('')

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const systemPrompt = mode === 'doubt' ? DOUBT_SYSTEM_PROMPT : CHAT_SYSTEM_PROMPT
    const newHistory: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...chatHistory,
      { role: 'user', content: userText }
    ]

    try {
      const result = await generateAIResponse(newHistory)
      const content = result.success ? result.content : 'क्षमा करें, अभी उत्तर नहीं दे पा रहा। कृपया पुनः प्रयास करें।'
      setChatHistory(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content }])
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date() }])
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: '⚠️ Error: कृपया internet connection check karein.', timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, mode, chatHistory])

  // ── PDF Upload ────────────────────────────────────────────────
  const handlePDF = async (file: File) => {
    setPdfStatus('parsing')
    setPdfInfo(null)
    try {
      const { text, pages } = await parsePDF(file)
      setQuizText(text)
      setPdfInfo({ name: file.name, pages })
      setPdfStatus('done')
    } catch (e) {
      setPdfStatus('error')
      console.error(e)
    }
  }

  // ── Generate Quiz ─────────────────────────────────────────────
  const generateQuiz = async () => {
    if (!quizText.trim() && !quizTopic.trim()) return
    setLoading(true)
    setQuestions([])
    try {
      const qs = await generateQuizFromText(
        quizText || `Generate questions about: ${quizTopic}`,
        quizCount, quizDiff, quizTopic || 'Sanskrit'
      )
      setQuestions(qs)
      setSelectedAnswers(new Array(qs.length).fill(null))
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: '⚠️ Quiz generate nahi hua. Text zyada detailed hona chahiye.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  // ── Save Quiz to admin ────────────────────────────────────────
  const saveQuiz = async () => {
    if (!questions.length || !quizTitle.trim()) return
    setSavingQuiz(true)
    try {
      const quizPayload = {
        title: quizTitle,
        type: 'Standard Quiz',
        timer: 15,
        isFree: false,
        questions: questions.map(q => ({
          question: q.question,
          options: q.options,
          correct: q.options[q.correctIndex],
          marks: q.marks || 1,
          explanation: q.explanation
        }))
      }
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizPayload)
      })
      if (res.ok) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(), role: 'assistant',
          content: `✅ Quiz **"${quizTitle}"** saved successfully!\n\n/admin/quizzes mein dekh sakte hain.`,
          timestamp: new Date()
        }])
        setQuizTitle('')
        setQuestions([])
        setSelectedAnswers([])
      } else {
        throw new Error('Save failed')
      }
    } catch {
      alert('Quiz save nahi hua. Please try again.')
    } finally {
      setSavingQuiz(false)
    }
  }

  // ── Floating button ───────────────────────────────────────────
  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24,
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5a623, #d97706)',
          border: '2px solid rgba(245,166,35,0.4)',
          cursor: 'pointer', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 0 0 rgba(245,166,35,0.4)',
          animation: 'neon-pulse 2.5s ease-in-out infinite'
        }}
      >
        <Sparkles size={26} color="white" />
      </motion.button>
    )
  }

  const accentColor = MODE_CONFIG[mode].color

  return (
    <AnimatePresence>
      <motion.div
        key="chat-panel"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 16, right: 16,
          width: 'min(480px, calc(100vw - 32px))',
          height: 'min(600px, calc(100vh - 32px))',
          background: 'rgba(6, 9, 20, 0.97)',
          border: `1px solid ${accentColor}40`,
          borderRadius: 20, zIndex: 99999,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: `0 32px 64px rgba(0,0,0,0.8), 0 0 0 1px ${accentColor}20, inset 0 1px 0 rgba(255,255,255,0.06)`,
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{
          padding: '14px 16px 0',
          background: `linear-gradient(135deg, ${accentColor}18, rgba(0,0,0,0))`,
          borderBottom: `1px solid ${accentColor}25`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Sparkles size={16} color="white" />
              </div>
              <div>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1 }}>Sakha AI</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
                  <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 500 }}>Online</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { setMessages([]); setChatHistory([]); setQuestions([]) }}
                title="Clear chat"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                <RotateCcw size={14} />
              </button>
              <button onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 6, paddingBottom: 12 }}>
            {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => {
              const Icon = cfg.icon
              const active = mode === key
              return (
                <button key={key} onClick={() => setMode(key)}
                  style={{
                    flex: 1, padding: '6px 4px', borderRadius: 10, border: 'none',
                    background: active ? `${cfg.color}22` : 'rgba(255,255,255,0.04)',
                    outline: active ? `1px solid ${cfg.color}50` : '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    transition: 'all 0.2s ease',
                  }}>
                  <Icon size={14} color={active ? cfg.color : 'rgba(255,255,255,0.4)'} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? cfg.color : 'rgba(255,255,255,0.4)' }}>
                    {cfg.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── BODY ───────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Chat / Doubt messages */}
          {(mode === 'chat' || mode === 'doubt') && (
            <>
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '86%',
                    padding: '10px 14px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                    background: msg.role === 'user'
                      ? `linear-gradient(135deg, ${accentColor}35, ${accentColor}18)`
                      : 'rgba(255,255,255,0.05)',
                    border: msg.role === 'user'
                      ? `1px solid ${accentColor}40`
                      : '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.92)',
                    fontSize: 13,
                  }}>
                    {msg.role === 'assistant' ? <RenderContent text={msg.content} /> : <p style={{ margin: 0 }}>{msg.content}</p>}
                    <p style={{ margin: '4px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 5, padding: '10px 14px', alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor }} />
                  ))}
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>Sakha AI सोच रहा है...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}

          {/* Quiz Gen mode body */}
          {mode === 'quiz' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* PDF upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault() }}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePDF(f) }}
                style={{
                  border: `2px dashed ${pdfStatus === 'done' ? '#22c55e' : accentColor}50`,
                  borderRadius: 12, padding: '16px', textAlign: 'center',
                  cursor: 'pointer', background: 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}>
                <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={e => { const f = e.target.files?.[0]; if (f) handlePDF(f) }} />
                {pdfStatus === 'parsing' && <Loader2 size={20} color={accentColor} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 6px' }} />}
                {pdfStatus === 'done' && <CheckCircle size={20} color="#22c55e" style={{ margin: '0 auto 6px' }} />}
                {(pdfStatus === 'idle' || pdfStatus === 'error') && <Upload size={20} color={accentColor} style={{ margin: '0 auto 6px' }} />}
                <p style={{ fontSize: 12, color: pdfStatus === 'done' ? '#22c55e' : 'rgba(255,255,255,0.5)', margin: 0 }}>
                  {pdfStatus === 'idle' && 'PDF drop karein ya click karein'}
                  {pdfStatus === 'parsing' && 'PDF parse ho raha hai...'}
                  {pdfStatus === 'done' && `✓ ${pdfInfo?.name} (${pdfInfo?.pages} pages)`}
                  {pdfStatus === 'error' && '❌ PDF parse nahi hua. Dobara try karein.'}
                </p>
              </div>

              {/* OR text input */}
              <div style={{ position: 'relative' }}>
                <textarea
                  value={quizText}
                  onChange={e => setQuizText(e.target.value)}
                  placeholder="Ya yahan Sanskrit text paste karein..."
                  rows={3}
                  style={{
                    width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)', color: 'white', fontSize: 12,
                    padding: '10px 12px', resize: 'none', outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Controls row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Questions</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quizCount}
                    onChange={e => setQuizCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 12, padding: '6px 8px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Difficulty</label>
                  <select value={quizDiff} onChange={e => setQuizDiff(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 12, padding: '6px 8px', outline: 'none' }}>
                    {['Easy', 'Medium', 'Hard'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Topic</label>
                  <input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
                    placeholder="e.g. Sandhi"
                    style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: 'white', fontSize: 12, padding: '6px 8px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>

              <button onClick={generateQuiz} disabled={loading || (!quizText.trim() && !quizTopic.trim())}
                style={{
                  padding: '10px', borderRadius: 10, border: 'none',
                  background: loading ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, #a78bfa, #7c3aed)`,
                  color: 'white', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Zap size={14} /> Quiz Generate Karo</>}
              </button>

              {/* Generated questions */}
              {questions.length > 0 && (
                <>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', marginBottom: 10 }}>
                      ✨ {questions.length} Questions Generated
                    </p>
                    {questions.map((q, i) => (
                      <QuizCard key={i} q={q} index={i} selected={selectedAnswers[i] ?? null}
                        onSelect={(ans) => setSelectedAnswers(prev => { const n = [...prev]; n[i] = ans; return n })} />
                    ))}
                  </div>

                  {/* Save quiz */}
                  <div style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
                    <input value={quizTitle} onChange={e => setQuizTitle(e.target.value)}
                      placeholder="Quiz ka naam dein..."
                      style={{ flex: 1, borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 12, padding: '8px 10px', outline: 'none' }} />
                    <button onClick={saveQuiz} disabled={savingQuiz || !quizTitle.trim()}
                      style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: savingQuiz ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', fontWeight: 700, fontSize: 12, cursor: savingQuiz ? 'not-allowed' : 'pointer', display: 'flex', gap: 4, alignItems: 'center' }}>
                      <Save size={13} /> {savingQuiz ? '...' : 'Save'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── QUICK CHIPS ────────────────────────────────────── */}
        {(!loading && (mode !== 'quiz' || questions.length === 0)) && (
          <div style={{ padding: '6px 14px', display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none' }}>
            {CHIPS[mode].map(chip => (
              <button key={chip} onClick={() => mode === 'quiz' ? setQuizTopic(chip) : sendMessage(chip)}
                style={{
                  flexShrink: 0, padding: '4px 10px', borderRadius: 20, border: `1px solid ${accentColor}30`,
                  background: `${accentColor}0f`, color: accentColor, fontSize: 10, fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* ── INPUT (chat / doubt) ────────────────────────────── */}
        {(mode === 'chat' || mode === 'doubt') && (
          <div style={{ padding: '10px 14px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={mode === 'doubt' ? 'Apna doubt yahan likhein...' : 'Sanskrit se related kuch poochho...'}
                disabled={loading}
                rows={1}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 12,
                  border: `1px solid ${input ? accentColor + '50' : 'rgba(255,255,255,0.12)'}`,
                  background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13,
                  outline: 'none', resize: 'none', maxHeight: 100, overflow: 'auto',
                  transition: 'border-color 0.2s', fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  width: 42, height: 42, borderRadius: 12, border: 'none', flexShrink: 0,
                  background: input.trim() ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : 'rgba(255,255,255,0.08)',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                {loading ? <Loader2 size={18} color="white" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} color={input.trim() ? 'white' : 'rgba(255,255,255,0.3)'} />}
              </button>
            </div>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '5px 0 0', textAlign: 'center' }}>
              Enter to send • Shift+Enter for new line
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
