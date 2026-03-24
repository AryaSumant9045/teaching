'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from '@/components/shared/Navbar'
import GlassCard from '@/components/ui/GlassCard'
import { Mic, Square, BarChart2, BookOpen, PenLine, Lightbulb, ChevronRight, Check } from 'lucide-react'

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

export default function PracticePage() {
  const [recording, setRecording]   = useState(false)
  const [score, setScore]           = useState<number | null>(null)
  const [wordIdx, setWordIdx]       = useState(0)
  const [selectedChar, setChar]     = useState(0)

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

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="px-4" style={{ paddingTop: '7rem', paddingBottom: '6rem', maxWidth: '100rem', width: '95%', marginLeft: 'auto', marginRight: 'auto' }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3.5rem' }}>
          <span className="badge badge-cyan" style={{ marginBottom: '1rem' }}>Practice Studio</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Sharpen Your <span className="gradient-text-gold">Sanskrit Skills</span>
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Real-time pronunciation grading, writing practice, and AI-powered suggestions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: '2.5rem' }}>

          {/* ── PRONUNCIATION GRADER ─── */}
          <GlassCard delay={0.05} hover glow="orange" className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <Mic size={18} style={{ color: 'var(--accent-orange)' }} />
              <h2 className="font-semibold text-lg">Pronunciation Grader</h2>
              <span className="badge badge-orange ml-auto text-xs">AI Powered</span>
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
                {recording ? 'Recording… speak now' : 'Tap microphone to start'}
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
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>Pronunciation Score</p>
                  <p className="text-6xl font-bold mb-1" style={{ color: scoreColor }}>
                    {score}<span className="text-3xl">%</span>
                  </p>
                  <p className="text-sm" style={{ color: scoreColor }}>
                    {score >= 85 ? '🎉 Excellent!' : score >= 70 ? '👍 Good — keep practicing' : '📚 Needs improvement'}
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
              <h2 className="font-semibold">AI Recommendations</h2>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              Based on your performance, the RL engine suggests:
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
              Start Suggested <ChevronRight size={14} />
            </button>
          </GlassCard>

          {/* ── WRITING PRACTICE ─── */}
          <GlassCard delay={0.2} className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-5">
              <PenLine size={18} style={{ color: '#a78bfa' }} />
              <h2 className="font-semibold text-lg">Devanagari Writing Practice</h2>
              <span className="badge badge-cyan ml-auto text-xs">Trace & Learn</span>
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
                  <Check size={14} /> Mark as Practiced
                </button>
              </div>
            </motion.div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
