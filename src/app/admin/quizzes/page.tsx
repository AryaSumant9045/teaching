'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, Save, Brain, CheckCircle, Clock, Award, Edit2, X, Loader } from 'lucide-react'

interface Option { text: string; isCorrect: boolean }
interface Question { id: string; text: string; marks: number; options: Option[] }
interface Quiz {
  _id: string; title: string; timer: number; lessonId: string;
  questions: Question[]; type: 'quiz' | 'lecture'
  isFree?: boolean; price?: number;
}

const BLANK_QUESTION = (): Question => ({
  id: Date.now().toString(), text: '', marks: 1,
  options: [
    { text: '', isCorrect: true }, { text: '', isCorrect: false },
    { text: '', isCorrect: false }, { text: '', isCorrect: false },
  ],
})

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'list' | 'builder'>('list')
  const [editQuiz, setEditQuiz] = useState<Quiz | null>(null)
  const [quizType, setQuizType] = useState<'quiz' | 'lecture'>('quiz')
  const [title, setTitle] = useState('')
  const [timer, setTimer] = useState(15)
  const [lessonId, setLessonId] = useState('')
  const [isFree, setIsFree] = useState(true)
  const [price, setPrice] = useState(0)
  const [questions, setQuestions] = useState<Question[]>([BLANK_QUESTION()])
  const [saving, setSaving] = useState(false)

  const load = async () => { setLoading(true); const r = await fetch('/api/quizzes'); setQuizzes(await r.json()); setLoading(false) }
  useEffect(() => { load() }, [])

  const openBuilder = (q?: Quiz) => {
    if (q) { setEditQuiz(q); setTitle(q.title); setTimer(q.timer); setLessonId(q.lessonId); setQuizType(q.type); setIsFree(q.isFree !== false); setPrice(q.price || 0); setQuestions(q.questions.length ? q.questions : [BLANK_QUESTION()]) }
    else { setEditQuiz(null); setTitle(''); setTimer(15); setLessonId(''); setQuizType('quiz'); setIsFree(true); setPrice(0); setQuestions([BLANK_QUESTION()]) }
    setMode('builder')
  }

  const addQuestion = () => setQuestions(qs => [...qs, BLANK_QUESTION()])
  const removeQuestion = (id: string) => setQuestions(qs => qs.filter(q => q.id !== id))
  const updateQ = (id: string, patch: Partial<Question>) => setQuestions(qs => qs.map(q => q.id === id ? { ...q, ...patch } : q))
  const updateOption = (qid: string, optIdx: number, text: string) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, options: q.options.map((o, i) => i === optIdx ? { ...o, text } : o) } : q))
  const setCorrect = (qid: string, optIdx: number) => setQuestions(qs => qs.map(q => q.id === qid ? { ...q, options: q.options.map((o, i) => ({ ...o, isCorrect: i === optIdx })) } : q))

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    const payload = { title, timer, lessonId, type: quizType, isFree, price, questions }
    if (editQuiz) {
      const r = await fetch(`/api/quizzes/${editQuiz._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const updated = await r.json()
      setQuizzes(qs => qs.map(q => q._id === editQuiz._id ? updated : q))
    } else {
      const r = await fetch('/api/quizzes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const created = await r.json()
      setQuizzes(qs => [...qs, created])
    }
    setSaving(false); setMode('list')
  }

  const remove = async (id: string) => {
    setQuizzes(qs => qs.filter(q => q._id !== id))
    await fetch(`/api/quizzes/${id}`, { method: 'DELETE' })
  }

  const S = { padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const }

  if (mode === 'builder') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>{editQuiz ? 'Edit' : 'New'} <span style={{ color: '#a78bfa' }}>Quiz</span></h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setMode('list')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}><X size={14} /> Cancel</button>
          <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', cursor: 'pointer', border: 'none', fontWeight: 700, fontSize: '14px' }}>
            {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} {saving ? 'Saving…' : 'Save Quiz'}
          </button>
        </div>
      </div>

      {/* Meta */}
      <div style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
          <div><label style={LS}>Quiz Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sandhi Rules — Level 2" style={S} /></div>
          <div><label style={LS}>Timer (mins)</label><input type="number" value={timer} onChange={e => setTimer(Number(e.target.value))} min={1} style={S} /></div>
          <div>
            <label style={LS}>Type</label>
            <select value={quizType} onChange={e => setQuizType(e.target.value as 'quiz' | 'lecture')} style={{ ...S, background: 'rgba(14,22,48,0.95)' }}>
              <option value="quiz">Standard Quiz</option>
              <option value="lecture">Lecture Test</option>
            </select>
          </div>
          {quizType === 'lecture' && <div style={{ gridColumn: '1/-1' }}><label style={LS}>Linked Lesson ID</label><input value={lessonId} onChange={e => setLessonId(e.target.value)} placeholder="e.g. lesson-3" style={S} /></div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={{ ...LS, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, marginTop: '8px' }}>
            <input type="checkbox" checked={isFree} onChange={e => { setIsFree(e.target.checked); if (e.target.checked) setPrice(0) }} style={{ accentColor: '#a78bfa', width: '16px', height: '16px' }} />
            Is Free Quiz?
          </label>
          {!isFree && (
            <div><label style={LS}>Price (₹)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} min={0} style={S} placeholder="Amount in INR" /></div>
          )}
        </div>
      </div>

      {/* Questions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        {questions.map((q, qi) => (
          <div key={q.id} style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ ...LS, color: '#a78bfa' }}>Q{qi + 1}. Question</label>
                <input value={q.text} onChange={e => updateQ(q.id, { text: e.target.value })} placeholder="Type your question here..." style={{ ...S, border: '1px solid rgba(124,58,237,0.3)' }} />
              </div>
              <div style={{ width: '90px' }}>
                <label style={LS}>Marks</label>
                <input type="number" value={q.marks} min={1} onChange={e => updateQ(q.id, { marks: Number(e.target.value) })} style={{ ...S, width: '90px', textAlign: 'center', color: 'var(--accent-gold)' }} />
              </div>
              {questions.length > 1 && (
                <button onClick={() => removeQuestion(q.id)} style={{ marginTop: '24px', padding: '10px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '8px', cursor: 'pointer', color: '#ff6b35' }}><Trash2 size={14} /></button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${opt.isCorrect ? 'rgba(0,229,255,0.4)' : 'rgba(255,255,255,0.08)'}`, background: opt.isCorrect ? 'rgba(0,229,255,0.06)' : 'transparent' }}>
                  <button onClick={() => setCorrect(q.id, oi)} style={{ flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <CheckCircle size={15} style={{ color: opt.isCorrect ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
                  </button>
                  <input value={opt.text} onChange={e => updateOption(q.id, oi, e.target.value)} placeholder={`Option ${oi + 1}`} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: opt.isCorrect ? 'var(--accent-cyan)' : 'var(--text-primary)' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={addQuestion} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', width: '100%', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.15)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>
        <Plus size={15} /> Add Question
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px' }}>Quiz <span style={{ color: '#a78bfa' }}>Builder</span></h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{quizzes.length} quizzes in MongoDB</p>
        </div>
        <button onClick={() => openBuilder()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none' }}>
          <Plus size={16} /> New Quiz
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading from MongoDB…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {quizzes.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} style={{ color: '#a78bfa' }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: q.type === 'quiz' ? 'rgba(124,58,237,0.15)' : 'rgba(245,166,35,0.15)', color: q.type === 'quiz' ? '#a78bfa' : 'var(--accent-gold)', border: `1px solid ${q.type === 'quiz' ? 'rgba(124,58,237,0.3)' : 'rgba(245,166,35,0.3)'}` }}>
                  {q.type === 'quiz' ? 'Standard Quiz' : 'Lecture Test'}
                </span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 12px' }}>{q.title}</h3>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}><Clock size={11} />{q.timer} min</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-muted)' }}><Award size={11} />{q.questions.length} questions</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: q.isFree !== false ? '#34d399' : '#f5a623', fontWeight: 700 }}>
                  {q.isFree !== false ? 'Free' : `₹${q.price}`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openBuilder(q)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}><Edit2 size={12} /> Edit</button>
                <button onClick={() => remove(q._id)} style={{ padding: '9px 12px', borderRadius: '8px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', color: '#ff6b35', cursor: 'pointer' }}><Trash2 size={12} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

const LS: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }
