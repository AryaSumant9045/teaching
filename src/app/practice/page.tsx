'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import GlassCard from '@/components/ui/GlassCard'
import { Mic, Square, BarChart2, BookOpen, PenLine, Lightbulb, ChevronRight, Check, Brain, ShoppingCart, FileQuestion, Calendar, Languages } from 'lucide-react'

const translations = {
  en: {
    practiceStudio: 'Practice Studio',
    sharpenSkills: 'Sharpen Your',
    sanskritSkills: 'Sanskrit Skills',
    subtitle: 'Real-time pronunciation grading, writing practice, and AI-powered suggestions.',
    yourQuizzes: 'Your Quizzes',
    browseAllQuizzes: 'Browse All Quizzes',
    loadingQuizzes: 'Loading your purchased quizzes...',
    noQuizzes: "You haven't purchased any quizzes yet.",
    questions: 'Questions',
    minutes: 'minutes',
    clickToStart: 'Click to start quiz',
    startQuiz: 'Start Quiz',
    previousYearQuestions: 'Previous Year Questions',
    browseAllPYQ: 'Browse All PYQ',
    loadingPYQ: 'Loading PYQ papers...',
    noPYQ: 'No previous year papers available yet.',
    pronunciationGrader: 'Pronunciation Grader',
    aiPowered: 'AI Powered',
    recording: 'Recording… speak now',
    tapToStart: 'Tap microphone to start',
    pronunciationScore: 'Pronunciation Score',
    excellent: '🎉 Excellent!',
    good: '👍 Good — keep practicing',
    needsImprovement: '📚 Needs improvement',
    aiRecommendations: 'AI Recommendations',
    basedOnPerformance: 'Based on your performance, the RL engine suggests:',
    startSuggested: 'Start Suggested',
    writingPractice: 'Devanagari Writing Practice',
    traceLearn: 'Trace & Learn',
    markAsPracticed: 'Mark as Practiced',
    morePapers: 'more papers'
  },
  hi: {
    practiceStudio: 'अभ्यास स्टूडियो',
    sharpenSkills: 'अपने',
    sanskritSkills: 'संस्कृत कौशल निखारें',
    subtitle: 'वास्तविक समय उच्चारण ग्रेडिंग, लेखन अभ्यास और AI-संचालित सुझाव।',
    yourQuizzes: 'आपकी प्रश्नोत्तरी',
    browseAllQuizzes: 'सभी प्रश्नोत्तरी देखें',
    loadingQuizzes: 'आपकी खरीदी गई प्रश्नोत्तरी लोड हो रही हैं...',
    noQuizzes: 'आपने अभी तक कोई प्रश्नोत्तरी नहीं खरीदी है।',
    questions: 'प्रश्न',
    minutes: 'मिनट',
    clickToStart: 'प्रश्नोत्तरी शुरू करने के लिए क्लिक करें',
    startQuiz: 'प्रश्नोत्तरी शुरू करें',
    previousYearQuestions: 'पिछले वर्ष के प्रश्न',
    browseAllPYQ: 'सभी PYQ देखें',
    loadingPYQ: 'PYQ पेपर लोड हो रहे हैं...',
    noPYQ: 'कोई पिछले वर्ष का पेपर उपलब्ध नहीं है।',
    pronunciationGrader: 'उच्चारण ग्रेडर',
    aiPowered: 'AI संचालित',
    recording: 'रिकॉर्डिंग… अब बोलें',
    tapToStart: 'शुरू करने के लिए माइक टैप करें',
    pronunciationScore: 'उच्चारण स्कोर',
    excellent: '🎉 उत्कृष्ट!',
    good: '👍 अच्छा — अभ्यास जारी रखें',
    needsImprovement: '📚 सुधार की आवश्यकता',
    aiRecommendations: 'AI सुझाव',
    basedOnPerformance: 'आपके प्रदर्शन के आधार पर, RL इंजन सुझाव देता है:',
    startSuggested: 'सुझाए गए को शुरू करें',
    writingPractice: 'देवनागरी लेखन अभ्यास',
    traceLearn: 'ट्रेस और सीखें',
    markAsPracticed: 'अभ्यास किया गया चिह्नित करें',
    morePapers: 'और पेपर'
  }
}

const pronunciationWords = [
  { skt: 'कृष्ण', trans: 'Kṛṣṇa', phonetic: 'k-ṛ-ṣ-ṇ-a', tips: 'The ṛ is a vocalic r — tongue rolls back slightly.' },
  { skt: 'अग्नि', trans: 'Agni', phonetic: 'a-g-n-i', tips: 'The g is hard (as in "good"), never soft.' },
  { skt: 'ब्रह्मन्', trans: 'Brahman', phonetic: 'b-r-a-h-m-a-n', tips: 'The h is aspirated — breathe out lightly after.' },
]

const writingExercises = [
  { skt: 'अ', name: 'A', stroke: 'Short vowel — the base of all Sanskrit sounds' },
  { skt: 'इ', name: 'I', stroke: 'Short i vowel — bright, front of mouth' },
  { skt: 'उ', name: 'U', stroke: 'Short u vowel — rounded lips' },
  { skt: 'क', name: 'Ka', stroke: 'First consonant — velar stop' },
  { skt: 'ग', name: 'Ga', stroke: 'Voiced velar — soft g as in "go"' },
  { skt: 'न', name: 'Na', stroke: 'Dental nasal — tongue behind teeth' },
]

const rlSuggestions = [
  { title: 'Guttural Sounds',       xp: 80,  priority: 'High',   badge: 'badge-orange', icon: '🔊' },
  { title: 'Long vowel distinction', xp: 60, priority: 'Medium', badge: 'badge-gold',   icon: '🎵' },
  { title: 'Visarga Pronunciation',  xp: 50, priority: 'Medium', badge: 'badge-gold',   icon: '💨' },
  { title: 'Aspirated consonants',   xp: 90, priority: 'High',   badge: 'badge-orange', icon: '📢' },
]

interface Quiz {
  _id: string
  title: string
  timer: number
  lessonId: string
  type: 'quiz' | 'lecture'
  isFree?: boolean
  price?: number
  questions?: Array<{
    id: string; text: string; marks: number;
    options: Array<{ text: string; isCorrect: boolean }>
  }>
}

interface Course {
  _id: string
  title: string
  description: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  color: string
  isFree?: boolean
  price?: number
}

interface PYQ {
  _id: string
  title: string
  year: string
  subject: string
  fileUrl: string
  questions: number
  addedAt: string
}

export default function PracticePage() {
  const [recording, setRecording]   = useState(false)
  const [score, setScore]           = useState<number | null>(null)
  const [wordIdx, setWordIdx]       = useState(0)
  const [selectedChar, setChar]     = useState(0)
  const [boughtQuizzes, setBoughtQuizzes] = useState<Quiz[]>([])
  const [loadingBoughtQuizzes, setLoadingBoughtQuizzes] = useState(true)
  const [boughtCourses, setBoughtCourses] = useState<Course[]>([])
  const [loadingBoughtCourses, setLoadingBoughtCourses] = useState(true)
  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [loadingPyqs, setLoadingPyqs] = useState(true)
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = translations[lang]

  const word = pronunciationWords[wordIdx]

  const handleRecord = () => {
    if (recording) {
      setRecording(false)
      // Simulate AI grading
      setTimeout(() => setScore(Math.floor(72 + Math.random() * 25)), 800)
    } else {
      setScore(null)
      setRecording(true)
    }
  }

  const scoreColor = score === null ? 'var(--text-muted)'
    : score >= 85 ? '#34d399'
    : score >= 70 ? 'var(--accent-gold)'
    : 'var(--accent-orange)'

  // Load purchased quizzes
  useEffect(() => {
    const loadBoughtQuizzes = async () => {
      try {
        const purchasesRes = await fetch('/api/purchases/user', { cache: 'no-store' })
        if (!purchasesRes.ok) {
          setBoughtQuizzes([])
          return
        }

        const purchasesData = await purchasesRes.json()
        const purchasedIds = Array.isArray(purchasesData.purchasedResourceIds)
          ? purchasesData.purchasedResourceIds.map((id: string | number) => String(id))
          : []

        if (purchasedIds.length === 0) {
          setBoughtQuizzes([])
          return
        }

        const quizzesRes = await fetch('/api/quizzes', { cache: 'no-store' })
        if (!quizzesRes.ok) {
          setBoughtQuizzes([])
          return
        }

        const allQuizzes = await quizzesRes.json()
        const purchasedSet = new Set(purchasedIds)
        const filteredBoughtQuizzes = Array.isArray(allQuizzes)
          ? allQuizzes.filter((quiz) => purchasedSet.has(String(quiz._id)))
          : []

        setBoughtQuizzes(filteredBoughtQuizzes)
      } catch {
        setBoughtQuizzes([])
      } finally {
        setLoadingBoughtQuizzes(false)
      }
    }

    const loadBoughtCourses = async () => {
      try {
        const purchasesRes = await fetch('/api/purchases/user', { cache: 'no-store' })
        if (!purchasesRes.ok) {
          setBoughtCourses([])
          return
        }

        const purchasesData = await purchasesRes.json()
        const purchasedIds = Array.isArray(purchasesData.purchasedResourceIds)
          ? purchasesData.purchasedResourceIds.map((id: string | number) => String(id))
          : []

        if (purchasedIds.length === 0) {
          setBoughtCourses([])
          return
        }

        const coursesRes = await fetch('/api/courses', { cache: 'no-store' })
        if (!coursesRes.ok) {
          setBoughtCourses([])
          return
        }

        const allCourses = await coursesRes.json()
        const purchasedSet = new Set(purchasedIds)
        const filteredBoughtCourses = Array.isArray(allCourses)
          ? allCourses.filter((course) => purchasedSet.has(String(course._id)))
          : []

        setBoughtCourses(filteredBoughtCourses)
      } catch {
        setBoughtCourses([])
      } finally {
        setLoadingBoughtCourses(false)
      }
    }

    loadBoughtQuizzes()
    loadBoughtCourses()

    // Load PYQs
    const loadPyqs = async () => {
      try {
        const pyqsRes = await fetch('/api/pyq', { cache: 'no-store' })
        if (!pyqsRes.ok) {
          setPyqs([])
          return
        }
        const allPyqs = await pyqsRes.json()
        setPyqs(Array.isArray(allPyqs) ? allPyqs : [])
      } catch {
        setPyqs([])
      } finally {
        setLoadingPyqs(false)
      }
    }
    loadPyqs()
  }, [])

  return (
    <div className="relative min-h-screen">
      <Navbar />
      
      {/* Language Toggle Button */}
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        style={{ position: 'fixed', top: '90px', right: '16px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', cursor: 'pointer', transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        <Languages size={18} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: lang === 'en' ? 'rgba(255,255,255,0.8)' : '#fff' }}>
          {lang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>
      
      <div className="px-4 sm:px-6 lg:px-8" style={{ paddingTop: '7rem', paddingBottom: '6rem', maxWidth: '100rem', marginLeft: 'auto', marginRight: 'auto' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3.5rem' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>{t.practiceStudio}</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            {t.sharpenSkills} <span className="gradient-text-gold">{t.sanskritSkills}</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── PURCHASED QUIZZES SECTION ───────────────────────────── */}
        <GlassCard delay={0.02} className="mb-12">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Brain size={18} style={{ color: 'var(--accent-cyan)' }} />
                <h3 className="font-semibold">{t.yourQuizzes}</h3>
              </div>
              <Link href="/quizzes" className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
                {t.browseAllQuizzes} <ChevronRight size={14} />
              </Link>
            </div>

            {loadingBoughtQuizzes ? (
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t.loadingQuizzes}
              </p>
            ) : boughtQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  {t.noQuizzes}
                </p>
                <Link href="/quizzes" className="btn-primary text-sm py-2 px-6 inline-flex items-center gap-2">
                  {t.browseAllQuizzes} <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {boughtQuizzes.map(quiz => (
                  <Link key={quiz._id} href={`/quizzes/${quiz._id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="rounded-xl p-5 transition-all duration-200 cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Brain size={16} style={{ color: 'var(--accent-cyan)' }} />
                        <span className="badge badge-cyan text-[10px]">{quiz.questions?.length || 0} {t.questions}</span>
                      </div>
                      <p className="font-semibold text-sm mb-1 leading-tight">{quiz.title}</p>
                      <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                        {quiz.timer} {t.minutes} · {t.clickToStart}
                      </p>
                      <span className="text-xs font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                        {t.startQuiz} <ChevronRight size={12} className="inline-block" />
                      </span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </GlassCard>

        {/* ── PYQ SECTION ───────────────────────────── */}
        <GlassCard delay={0.03} className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileQuestion size={18} style={{ color: 'var(--accent-gold)' }} />
                <h3 className="font-semibold">{t.previousYearQuestions}</h3>
              </div>
              <Link href="/pyq" className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
                {t.browseAllPYQ} <ChevronRight size={14} />
              </Link>
            </div>

            <div className="text-center py-8">
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                {t.noPYQ}
              </p>
              <Link href="/pyq" className="btn-primary text-sm py-2 px-6 inline-flex items-center gap-2">
                {t.browseAllPYQ} <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2.5rem' }}>

          {/* ── PRONUNCIATION GRADER ─── */}
          <GlassCard delay={0.05} hover glow="orange" className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <Mic size={18} style={{ color: 'var(--accent-orange)' }} />
              <h2 className="font-semibold text-lg">{t.pronunciationGrader}</h2>
              <span className="badge badge-orange ml-auto text-xs">{t.aiPowered}</span>
            </div>

            {/* Word display */}
            <div className="rounded-2xl p-6 text-center mb-5"
              style={{ background: 'rgba(255,107,53,0.05)', border: '1px solid rgba(255,107,53,0.15)' }}>
              <p className="devanagari text-6xl mb-3 text-glow-gold" style={{ color: 'var(--accent-gold)' }}>
                {word.skt}
              </p>
              <p className="text-xl font-semibold mb-1">{word.trans}</p>
              <p className="text-sm font-mono mb-3" style={{ color: 'var(--accent-cyan)' }}>{word.phonetic}</p>
              <div
                className="rounded-xl px-4 py-2 inline-flex items-center gap-2 text-sm"
                style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.15)' }}
              >
                <Lightbulb size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{word.tips}</span>
              </div>
            </div>

            {/* Record button */}
            <div className="flex flex-col items-center gap-5 mb-5">
              <motion.button
                onClick={handleRecord}
                whileTap={{ scale: 0.94 }}
                className="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: recording
                    ? 'linear-gradient(135deg, rgba(255,107,53,0.3), rgba(245,166,35,0.2))'
                    : 'rgba(255,255,255,0.06)',
                  border: recording ? '2px solid var(--accent-orange)' : '2px solid var(--border-glass)',
                  boxShadow: recording ? 'var(--glow-orange)' : 'none',
                }}
                aria-label={recording ? 'Stop recording' : 'Start recording'}
              >
                {recording && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ background: 'rgba(255,107,53,0.3)' }}
                  />
                )}
                {recording
                  ? <Square size={28} style={{ color: 'var(--accent-orange)' }} />
                  : <Mic size={28} style={{ color: 'var(--text-secondary)' }} />
                }
              </motion.button>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {recording ? t.recording : t.tapToStart}
              </p>
            </div>

            {/* Score display */}
            <AnimatePresence>
              {score !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl p-5 text-center"
                  style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${scoreColor}40` }}
                >
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{t.pronunciationScore}</p>
                  <p className="text-6xl font-bold mb-1" style={{ color: scoreColor }}>
                    {score}<span className="text-3xl">%</span>
                  </p>
                  <p className="text-sm" style={{ color: scoreColor }}>
                    {score >= 85 ? t.excellent : score >= 70 ? t.good : t.needsImprovement}
                  </p>
                  <div className="progress-bar mt-3 mx-auto max-w-[200px]">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})` }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Word selector */}
            <div className="flex gap-2 mt-5 justify-center">
              {pronunciationWords.map((w, i) => (
                <button
                  key={i}
                  onClick={() => { setWordIdx(i); setScore(null) }}
                  className="devanagari rounded-xl px-4 py-2 text-sm transition-all duration-200"
                  style={{
                    background: wordIdx === i ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)',
                    color: wordIdx === i ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    border: `1px solid ${wordIdx === i ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {w.skt}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* ── RL RECOMMENDATIONS ─── */}
          <GlassCard delay={0.1} hover className="flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={18} style={{ color: 'var(--accent-cyan)' }} />
              <h2 className="font-semibold">{t.aiRecommendations}</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              {t.basedOnPerformance}
            </p>
            <div className="flex flex-col gap-3 flex-1">
              {rlSuggestions.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * i }}
                  className="rounded-xl p-3 flex items-center gap-3 transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <span className={`badge ${s.badge} text-[10px]`}>{s.priority}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'var(--accent-gold)' }}>+{s.xp}XP</span>
                </motion.div>
              ))}
            </div>
            <button className="btn-primary mt-5 w-full text-sm">
              {t.startSuggested} <ChevronRight size={14} />
            </button>
          </GlassCard>

          {/* ── WRITING PRACTICE ─── */}
          <GlassCard delay={0.2} className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-5">
              <PenLine size={18} style={{ color: '#a78bfa' }} />
              <h2 className="font-semibold text-lg">{t.writingPractice}</h2>
              <span className="badge badge-cyan ml-auto text-xs">{t.traceLearn}</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {writingExercises.map((ch, i) => (
                <motion.button
                  key={ch.skt}
                  onClick={() => setChar(i)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl p-4 text-center transition-all duration-200"
                  style={{
                    background: selectedChar === i ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${selectedChar === i ? 'rgba(245,166,35,0.45)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: selectedChar === i ? 'var(--glow-gold)' : 'none',
                  }}
                >
                  <p className="devanagari text-4xl mb-2" style={{ color: selectedChar === i ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                    {ch.skt}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{ch.name}</p>
                </motion.button>
              ))}
            </div>

            {/* Selected char info */}
            <motion.div
              key={selectedChar}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-xl p-4 flex items-center gap-4"
              style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)' }}
            >
              <p className="devanagari text-5xl" style={{ color: 'var(--accent-gold)' }}>
                {writingExercises[selectedChar].skt}
              </p>
              <div>
                <p className="font-semibold mb-1">{writingExercises[selectedChar].name}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {writingExercises[selectedChar].stroke}
                </p>
              </div>
              <div className="ml-auto">
                <button className="btn-primary py-2 px-4 text-sm">
                  <Check size={14} /> {t.markAsPracticed}
                </button>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
