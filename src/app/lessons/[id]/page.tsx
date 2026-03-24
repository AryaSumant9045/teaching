'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import GlassCard from '@/components/ui/GlassCard'
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Volume2, CheckCircle, XCircle } from 'lucide-react'

const lessonData: Record<string, {
  title: string; category: string; level: string;
  cards: { skt: string; trans: string; meaning: string; example: string }[]
}> = {
  '1': {
    title: 'Sandhi: Vowel Merging',
    category: 'Grammar',
    level: 'Intermediate',
    cards: [
      { skt: 'अ + अ = आ', trans: 'a + a = ā',   meaning: 'Two short a sounds merge into long ā',  example: 'राम + अवतार = रामावतार' },
      { skt: 'अ + इ = ए', trans: 'a + i = e',   meaning: 'Short a and i merge to form e',          example: 'सुर + इन्द्र = सुरेन्द्र' },
      { skt: 'अ + उ = ओ', trans: 'a + u = o',   meaning: 'Short a and u merge to form o',          example: 'सूर्य + उदय = सूर्योदय' },
      { skt: 'इ + इ = ई', trans: 'i + i = ī',   meaning: 'Two i-sounds (short or long) merge to ī', example: 'मुनि + इन्द्र = मुनीन्द्र' },
      { skt: 'उ + उ = ऊ', trans: 'u + u = ū',   meaning: 'Two u-sounds merge to long ū',           example: 'भानु + उदय = भानूदय' },
    ],
  },
  '2': {
    title: 'Case Endings (Vibhakti)',
    category: 'Grammar',
    level: 'Beginner',
    cards: [
      { skt: 'प्रथमा',  trans: 'Prathamā',  meaning: 'Nominative — the subject of the sentence', example: 'रामः गच्छति (Rāma goes)' },
      { skt: 'द्वितीया', trans: 'Dvitīyā', meaning: 'Accusative — the direct object',            example: 'फलं खादति (eats the fruit)' },
      { skt: 'तृतीया',  trans: 'Tṛtīyā',  meaning: 'Instrumental — by means of',               example: 'हस्तेन लिखति (writes with hand)' },
      { skt: 'षष्ठी',  trans: 'Ṣaṣṭhī',  meaning: 'Genitive — of / belonging to',             example: 'रामस्य पुत्रः (son of Rama)' },
      { skt: 'सप्तमी',  trans: 'Saptamī',  meaning: 'Locative — in / at / on',                  example: 'वने वसति (lives in the forest)' },
    ],
  },
}

// Fallback for unknown IDs
const defaultLesson = lessonData['1']

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  // We use a client-side workaround — read id from URL
  // Since this is a client component, we access window.location which works at runtime
  const [lessonId] = useState(() => {
    if (typeof window !== 'undefined') {
      const parts = window.location.pathname.split('/')
      return parts[parts.length - 1] || '1'
    }
    return '1'
  })

  const lesson = lessonData[lessonId] ?? defaultLesson
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped]  = useState(false)
  const [result, setResult]   = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore]     = useState({ correct: 0, wrong: 0 })

  const card = lesson.cards[current]
  const total = lesson.cards.length

  const next = (r: 'correct' | 'wrong') => {
    setResult(r)
    setScore(s => ({ ...s, [r]: s[r] + 1 }))
    setTimeout(() => {
      setResult(null)
      setFlipped(false)
      setCurrent(c => Math.min(c + 1, total - 1))
    }, 600)
  }

  const reset = () => { setCurrent(0); setFlipped(false); setScore({ correct: 0, wrong: 0 }) }

  const done = current === total - 1 && result !== null

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="px-4" style={{ paddingTop: '7rem', paddingBottom: '4rem', maxWidth: '72rem', width: '95%', marginLeft: 'auto', marginRight: 'auto' }}>

        {/* Back + title */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="badge badge-gold">{lesson.category}</span>
            <span className="badge badge-cyan">{lesson.level}</span>
          </div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Card {Math.min(current + 1, total)} of {total}
          </p>
          <div className="progress-bar mt-3 max-w-sm">
            <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>
        </motion.div>

        {/* Score row */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} style={{ color: '#34d399' }} />
            <span style={{ color: '#34d399' }}>{score.correct} Correct</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <XCircle size={16} style={{ color: 'var(--accent-orange)' }} />
            <span style={{ color: 'var(--accent-orange)' }}>{score.wrong} Review</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 w-full max-w-lg mx-auto mb-8" style={{ perspective: '1000px' }}>
          <motion.div
            className="relative w-full cursor-pointer"
            style={{ transformStyle: 'preserve-3d', height: '260px' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setFlipped(f => !f)}
          >
            {/* Front */}
            <div
              className="glass absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8 text-center"
              style={{ backfaceVisibility: 'hidden',
                borderColor: result === 'correct' ? 'rgba(52,211,153,0.5)'
                           : result === 'wrong'   ? 'rgba(255,107,53,0.5)'
                           : 'var(--border-glass)',
                boxShadow: result === 'correct' ? '0 0 30px rgba(52,211,153,0.3)'
                         : result === 'wrong'   ? '0 0 30px rgba(255,107,53,0.3)'
                         : 'none',
              }}
            >
              <p className="devanagari text-5xl mb-4 text-glow-gold" style={{ color: 'var(--accent-gold)' }}>
                {card.skt}
              </p>
              <p className="text-base font-semibold mb-2">{card.trans}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Click to reveal explanation
              </p>
              <Volume2 size={18} className="mt-4" style={{ color: 'var(--text-muted)' }} />
            </div>
            {/* Back */}
            <div
              className="glass absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-8 text-center"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                borderColor: 'rgba(245,166,35,0.3)', background: 'rgba(20,28,55,0.85)',
              }}
            >
              <p className="text-sm mb-2 font-semibold" style={{ color: 'var(--accent-gold)' }}>Meaning</p>
              <p className="text-base mb-4 font-medium">{card.meaning}</p>
              <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>Example:</p>
              <p className="devanagari text-lg" style={{ color: 'var(--accent-cyan)' }}>{card.example}</p>
            </div>
          </motion.div>
        </div>

        {/* Action buttons */}
        <AnimatePresence>
          {flipped && current < total - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 justify-center mb-6"
            >
              <button
                onClick={() => next('wrong')}
                className="btn-ghost flex items-center gap-2 px-6 py-3"
                style={{ borderColor: 'rgba(255,107,53,0.4)', color: 'var(--accent-orange)' }}
              >
                <XCircle size={18} /> Review Again
              </button>
              <button
                onClick={() => next('correct')}
                className="btn-primary px-6 py-3"
                style={{ background: 'linear-gradient(135deg, #34d399, #059669)' }}
              >
                <CheckCircle size={18} /> Got It!
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => { setCurrent(c => Math.max(c - 1, 0)); setFlipped(false) }}
            className="btn-ghost py-2 px-4 flex items-center gap-1"
            disabled={current === 0}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button onClick={reset} className="btn-ghost py-2 px-4 flex items-center gap-1">
            <RotateCcw size={14} /> Reset
          </button>
          <button
            onClick={() => { setCurrent(c => Math.min(c + 1, total - 1)); setFlipped(false) }}
            className="btn-ghost py-2 px-4 flex items-center gap-1"
            disabled={current === total - 1}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        {/* Completed state */}
        {current === total - 1 && (
          <GlassCard delay={0.1} glow="gold" className="mt-10 text-center">
            <p className="devanagari text-3xl mb-3" style={{ color: 'var(--accent-gold)' }}>शाबाश! 🎉</p>
            <h3 className="text-xl font-bold mb-2">Lesson Complete!</h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              {score.correct} correct · {score.wrong} to review
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={reset} className="btn-ghost py-2 px-6">Practice Again</button>
              <Link href="/practice" className="btn-primary py-2 px-6">Go to Practice</Link>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
