'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import MandalaHero from '@/components/shared/MandalaHero'
import {
  BookOpen, Brain, Mic, BarChart2, Zap, ChevronRight, Star,
  Layers, Globe, Award
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

const features = [
  {
    icon: Brain,
    title: 'Adaptive Curriculum',
    desc: 'Reinforcement learning tracks your weak points and dynamically adjusts your lesson path.',
    color: 'var(--accent-gold)',
    badge: 'AI-Powered',
  },
  {
    icon: Mic,
    title: 'Pronunciation AI',
    desc: 'Real-time audio analysis grades your Sanskrit pronunciation, giving instant phonetic feedback.',
    color: 'var(--accent-orange)',
    badge: 'Real-Time',
  },
  {
    icon: BarChart2,
    title: 'Smart Analytics',
    desc: 'Beautiful dashboards visualize your mastery of grammar, vocabulary, and Sandhi rules.',
    color: 'var(--accent-cyan)',
    badge: 'Visual',
  },
  {
    icon: Layers,
    title: 'Bento Learning Hub',
    desc: 'A futuristic, modular dashboard that puts all your progress at a glance.',
    color: '#a78bfa',
    badge: 'Immersive',
  },
  {
    icon: Globe,
    title: 'Vedic Grammar Engine',
    desc: "Pāṇini's Ashtadhyayi rules, Sandhi, Samasa — taught with precision and context.",
    color: 'var(--accent-gold)',
    badge: '3000+ Rules',
  },
  {
    icon: Award,
    title: 'Streak & Rewards',
    desc: 'Daily streaks, XP points, and achievement badges to keep you motivated on the path.',
    color: 'var(--accent-orange)',
    badge: 'Gamified',
  },
]

const sampleWords = [
  { skt: 'ज्ञान', trans: 'Jñāna', meaning: 'Knowledge' },
  { skt: 'शान्ति', trans: 'Śānti', meaning: 'Peace' },
  { skt: 'आनन्द', trans: 'Ānanda', meaning: 'Bliss' },
  { skt: 'धर्म', trans: 'Dharma', meaning: 'Cosmic Order' },
  { skt: 'सत्य', trans: 'Satya', meaning: 'Truth' },
  { skt: 'ब्रह्म', trans: 'Brahma', meaning: 'Absolute Reality' },
]

const stats = [
  { value: '50,000+', label: 'Active Learners' },
  { value: '3,976', label: 'Sanskrit Roots' },
  { value: '98%', label: 'Accuracy Rating' },
  { value: '150+', label: 'Lesson Modules' },
]

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return <div className="min-h-screen bg-[var(--bg-deep)]" />

  return (
    <div className="relative min-h-screen overflow-hidden" suppressHydrationWarning>
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-[120px] pb-32 px-4 flex flex-col items-center text-center overflow-hidden" style={{ marginTop: '80px' }}>
        {/* Glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.4) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />

        {/* Attractive Stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[
            { top: 12, left: 15 }, { top: 25, left: 80 }, { top: 50, left: 20 },
            { top: 70, left: 85 }, { top: 10, left: 50 }, { top: 60, left: 60 },
            { top: 30, left: 10 }, { top: 80, left: 30 }, { top: 40, left: 90 },
            { top: 5, left: 30 }, { top: 90, left: 70 }, { top: 20, left: 40 },
            { top: 75, left: 15 }, { top: 45, left: 75 }, { top: 85, left: 50 },
            { top: 35, left: 35 }, { top: 65, left: 95 }, { top: 15, left: 65 },
            { top: 55, left: 5 }, { top: 95, left: 45 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${pos.top}%`,
                left: `${pos.left}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                background: i % 3 === 0 ? 'var(--accent-cyan)' : i % 2 === 0 ? 'var(--accent-gold)' : 'white',
                boxShadow: `0 0 10px ${i % 3 === 0 ? 'var(--accent-cyan)' : 'var(--accent-gold)'}`
              }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: (i % 3) + 2, repeat: Infinity, ease: "easeInOut", delay: (i % 2) * 1.5 }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="badge badge-gold mb-6 text-xs tracking-widest relative z-10"
        >
          <Star size={10} fill="currentColor" />
          Ancient Language · Futuristic Technology
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            scale: { delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="text-5xl md:text-7xl font-bold leading-[1.1] max-w-4xl mb-6 drop-shadow-2xl relative z-10"
          style={{ textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
        >
          Master{' '}
          <span className="gradient-text-gold text-glow-gold">Sanskrit</span>
          {' '}with<br />
          <span className="gradient-text-cosmic">Cyber-Vedic AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-lg md:text-xl max-w-2xl mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          The world's most advanced Sanskrit learning platform. AI-powered pronunciation grading,
          adaptive curriculum, and a futuristic immersive experience.
        </motion.p>

        {/* Sanskrit tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="devanagari text-2xl mb-10 text-glow-gold"
          style={{ color: 'var(--accent-gold)' }}
        >
          सा विद्या या विमुक्तये
        </motion.p>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          <em>"That alone is knowledge which leads to liberation"</em>
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/register" className="btn-primary text-base px-8 py-4">
            <Zap size={18} />
            Begin Your Journey
          </Link>
          <Link href="/dashboard" className="btn-ghost text-base px-8 py-4">
            Explore Dashboard
            <ChevronRight size={18} />
          </Link>
        </motion.div>

        {/* Floating mandala */}
        <MandalaHero />
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="px-4 py-20 mt-12">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => (
            <GlassCard key={s.label} delay={0.1 * i} hover className="text-center py-6">
              <p className="text-3xl font-bold gradient-text-gold mb-1">{s.value}</p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ── SCROLLING WORD TICKER ─────────────────────────── */}
      <section className="py-16 overflow-hidden relative my-12">
        <div className="flex gap-6 animate-marquee whitespace-nowrap"
          style={{ animation: 'marquee 20s linear infinite' }}>
          {[...sampleWords, ...sampleWords].map((w, i) => (
            <div key={i} className="glass px-6 py-4 flex-shrink-0 flex items-center gap-4 min-w-[180px]">
              <span className="devanagari text-2xl" style={{ color: 'var(--accent-gold)' }}>{w.skt}</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{w.trans}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{w.meaning}</p>
              </div>
            </div>
          ))}
        </div>
        <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="px-4" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: '3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span className="badge badge-orange" style={{ marginBottom: '1.5rem' }}>Platform Features</span>
            <h2 className="text-4xl md:text-6xl font-black drop-shadow-2xl leading-[1.15]"
              style={{ textShadow: '0 0 40px rgba(245, 166, 35, 0.8), 0 0 80px rgba(245, 166, 35, 0.4)', marginTop: '1rem', marginBottom: '2.5rem', maxWidth: '56rem', textAlign: 'center' }}>
              Everything You Need to{' '}
              <br className="hidden md:block" />
              <span className="gradient-text-gold">Master Sanskrit</span>
            </h2>
            <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              Where ancient linguistic precision meets cutting-edge AI technology.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '3.5rem' }}>
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <GlassCard key={feat.title} delay={0.07 * i} hover className="group">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                      style={{ background: `${feat.color}18`, border: `1px solid ${feat.color}30` }}
                    >
                      <Icon size={22} style={{ color: feat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-base">{feat.title}</h3>
                        <span className="badge badge-gold text-[10px] px-2 py-0.5">{feat.badge}</span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SAMPLE LESSON PREVIEW ──────────────────────────── */}
      <section className="px-4" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: '3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span className="badge badge-cyan" style={{ marginBottom: '1.5rem' }}>Live Preview</span>
            <h2 className="text-4xl md:text-6xl font-black drop-shadow-2xl leading-[1.15]"
              style={{ textShadow: '0 0 40px rgba(0, 229, 255, 0.8), 0 0 80px rgba(0, 229, 255, 0.4)', marginTop: '1rem', marginBottom: '2.5rem', maxWidth: '56rem', textAlign: 'center' }}>
              See the{' '}
              <br className="hidden md:block" />
              <span className="gradient-text-cosmic">Learning Experience</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 items-center" style={{ gap: '4rem' }}>
            {/* Flashcard preview */}
            <GlassCard hover glow="gold" className="min-h-[280px] flex flex-col items-center justify-center text-center">
              <p className="badge badge-gold mb-6 text-xs">Lesson 3 · Nouns</p>
              <p className="devanagari text-6xl mb-4 text-glow-gold" style={{ color: 'var(--accent-gold)' }}>
                नमस्ते
              </p>
              <p className="text-xl font-semibold mb-2">Namaste</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                I bow to the divine in you · <em>namaḥ + te</em>
              </p>
              <div className="mt-6 flex gap-3">
                <button className="btn-ghost text-sm py-2 px-4">← Previous</button>
                <button className="btn-primary text-sm py-2 px-4">Next →</button>
              </div>
            </GlassCard>

            {/* Progress preview */}
            <div className="flex flex-col gap-6">
              {[
                { label: 'Vocabulary', val: 72, color: 'var(--accent-gold)' },
                { label: 'Grammar', val: 54, color: 'var(--accent-orange)' },
                { label: 'Pronunciation', val: 88, color: 'var(--accent-cyan)' },
                { label: 'Sandhi Rules', val: 41, color: '#a78bfa' },
              ].map((item, i) => (
                <GlassCard key={item.label} delay={0.1 * i} hover className="py-4 px-5">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.val}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.val}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: `linear-gradient(90deg, ${item.color}aa, ${item.color})` }}
                    />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-32 px-4 w-full flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="w-full max-w-4xl mx-auto glass text-center py-20 px-8 flex flex-col items-center justify-center relative overflow-hidden"
          style={{ borderColor: 'rgba(245,166,35,0.3)', boxShadow: 'var(--glow-gold)' }}
        >
          <p className="devanagari text-3xl mb-4" style={{ color: 'var(--accent-gold)' }}>
            अथ योगानुशासनम्
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            <em>"Now begins the discipline of yoga" — Yoga Sūtras 1.1</em>
          </p>
          <h2 className="text-4xl font-bold mb-4">Your Journey Begins Now</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            Join 50,000+ learners on the path to mastering the language of the Vedas.
          </p>
          <Link href="/register" className="btn-primary text-lg px-10 py-4">
            <Zap size={20} />
            Start for Free
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)' }}>
        <p className="devanagari text-lg mb-1" style={{ color: 'var(--accent-gold)', opacity: 0.6 }}>ॐ</p>
        <p className="text-sm">© 2026 SanskritAI · Built with reverence for the ancient language</p>
      </footer>
    </div>
  )
}

