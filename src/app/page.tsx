'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Navbar from '@/components/shared/Navbar'
import MandalaHero from '@/components/shared/MandalaHero'
import {
  BookOpen, Brain, Mic, BarChart2, Zap, ChevronRight, Star,
  Layers, Globe, Award, Languages, GraduationCap, ScrollText, Trophy
} from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'

const translations = {
  en: {
    badge: 'Ancient Language · Futuristic Technology',
    title1: 'Master',
    title2: 'with',
    subtitle: "The world's most advanced Sanskrit learning platform. AI-powered pronunciation grading, adaptive curriculum, and a futuristic immersive experience.",
    tagline: '"That alone is knowledge which leads to liberation"',
    beginJourney: 'Begin Your Journey',
    exploreDashboard: 'Explore Dashboard',
    stats: {
      learners: 'Active Learners',
      roots: 'Sanskrit Roots',
      accuracy: 'Accuracy Rating',
      modules: 'Lesson Modules',
    },
    featuresTitle: 'Everything You Need to',
    featuresSubtitle: 'Where ancient linguistic precision meets cutting-edge AI technology.',
    features: [
      { title: 'Adaptive Curriculum', desc: 'Reinforcement learning tracks your weak points and dynamically adjusts your lesson path.', badge: 'AI-Powered' },
      { title: 'Pronunciation AI', desc: 'Real-time audio analysis grades your Sanskrit pronunciation, giving instant phonetic feedback.', badge: 'Real-Time' },
      { title: 'Smart Analytics', desc: 'Beautiful dashboards visualize your mastery of grammar, vocabulary, and Sandhi rules.', badge: 'Visual' },
      { title: 'Bento Learning Hub', desc: 'A futuristic, modular dashboard that puts all your progress at a glance.', badge: 'Immersive' },
      { title: 'Vedic Grammar Engine', desc: "Pāṇini's Ashtadhyayi rules, Sandhi, Samasa — taught with precision and context.", badge: '3000+ Rules' },
      { title: 'Streak & Rewards', desc: 'Daily streaks, XP points, and achievement badges to keep you motivated on the path.', badge: 'Gamified' },
    ],
    previewTitle: 'See the',
    previewSubtitle: 'Learning Experience',
    lesson: 'Lesson 3 · Nouns',
    prev: '← Previous',
    next: 'Next →',
    ctaTitle: 'Your Journey Begins Now',
    ctaSubtitle: 'Join 50,000+ learners on the path to mastering the language of the Vedas.',
    startFree: 'Start for Free',
    footer: 'Built with reverence for the ancient language',
    programs: [
      { title: 'UG (Shastri / BA)', desc: 'Build your foundation with Basic Grammar, Laghusiddhanta Kaumudi, and Literature basics.', cta: 'View Syllabus' },
      { title: 'PG (Acharya / MA)', desc: 'Master Advanced Texts, Darshanas, Vedas, Linguistics and Manuscriptology.', cta: 'View Syllabus' },
      { title: 'UGC NET (Code 25/73)', desc: 'Crack the exam with optimized notes, Previous Year Questions, and Mock Tests.', cta: 'Start Prep' },
    ],
  },
  hi: {
    badge: 'प्राचीन भाषा · भविष्यवादी तकनीक',
    title1: 'संस्कृत',
    title2: 'में महारथ हासिल करें',
    subtitle: "दुनिया की सबसे उन्नत संस्कृत सीखने वाली प्लेटफॉर्म। AI-संचालित उच्चारण ग्रेडिंग, अनुकूली पाठ्यक्रम, और एक भविष्यवादी इमर्सिव अनुभव।",
    tagline: '"ज्ञान वही है जो मुक्ति की ओर ले जाए"',
    beginJourney: 'अपनी यात्रा शुरू करें',
    exploreDashboard: 'डैशबोर्ड देखें',
    stats: {
      learners: 'सक्रिय शिक्षार्थी',
      roots: 'संस्कृत मूल',
      accuracy: 'सटीकता रेटिंग',
      modules: 'पाठ मॉड्यूल',
    },
    featuresTitle: 'संस्कृत में निपुण होने के लिए',
    featuresSubtitle: 'जहाँ प्राचीन भाषाई सटीकता अत्याधुनिक AI तकनीक से मिलती है।',
    features: [
      { title: 'अनुकूली पाठ्यक्रम', desc: 'प्रबलन सीखना आपके कमजोर बिंदुओं को ट्रैक करता है और आपके पाठ पथ को गतिशील रूप से समायोजित करता है।', badge: 'AI-संचालित' },
      { title: 'उच्चारण AI', desc: 'रीयल-टाइम ऑडियो विश्लेषण आपके संस्कृत उच्चारण को ग्रेड करता है, तत्काल ध्वनिक प्रतिक्रिया देता है।', badge: 'रीयल-टाइम' },
      { title: 'स्मार्ट एनालिटिक्स', desc: 'सुंदर डैशबोर्ड आपके व्याकरण, शब्दावली और संधि नियमों पर महारत को दर्शाते हैं।', badge: 'दृश्य' },
      { title: 'बेंटो लर्निंग हब', desc: 'एक भविष्यवादी, मॉड्यूलर डैशबोर्ड जो आपकी सभी प्रगति को एक नज़र में रखता है।', badge: 'इमर्सिव' },
      { title: 'वैदिक व्याकरण इंजन', desc: 'पाणिनि के अष्टाध्यायी नियम, संधि, समास — सटीकता और संदर्भ के साथ सिखाए गए।', badge: '3000+ नियम' },
      { title: 'स्ट्रीक और पुरस्कार', desc: 'दैनिक स्ट्रीक, XP अंक, और उपलब्धि बैज जो आपको पथ पर प्रेरित रखें।', badge: 'गेमिफाइड' },
    ],
    previewTitle: 'देखें',
    previewSubtitle: 'सीखने का अनुभव',
    lesson: 'पाठ 3 · संज्ञा',
    prev: '← पिछला',
    next: 'अगला →',
    ctaTitle: 'आपकी यात्रा अब शुरू होती है',
    ctaSubtitle: '50,000+ शिक्षार्थियों के साथ वेदों की भाषा में निपुण होने के पथ पर शामिल हों।',
    startFree: 'मुफ्त में शुरू करें',
    footer: 'प्राचीन भाषा के प्रति श्रद्धा के साथ निर्मित',
    programs: [
      { title: 'स्नातक (शास्त्री / BA)', desc: 'मूलभूत व्याकरण, लघुसिद्धान्त कौमुदी और साहित्य की नींव बनाएं।', cta: 'पाठ्यक्रम देखें' },
      { title: 'स्नातकोत्तर (आचार्य / MA)', desc: 'उन्नत ग्रंथ, दर्शन, वेद, भाषाविज्ञान और पांडुलिपि विज्ञान में निपुणता प्राप्त करें।', cta: 'पाठ्यक्रम देखें' },
      { title: 'UGC NET (कोड 25/73)', desc: 'अनुकूलित नोट्स, पिछले वर्ष के प्रश्नों और मॉक टेस्ट से परीक्षा पास करें।', cta: 'तैयारी शुरू करें' },
    ],
  }
}

const features = [
  { icon: Brain, color: 'var(--accent-gold)' },
  { icon: Mic, color: 'var(--accent-orange)' },
  { icon: BarChart2, color: 'var(--accent-cyan)' },
  { icon: Layers, color: '#a78bfa' },
  { icon: Globe, color: 'var(--accent-gold)' },
  { icon: Award, color: 'var(--accent-orange)' },
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
  { value: '50,000+', enLabel: 'Active Learners', hiLabel: 'सक्रिय शिक्षार्थी' },
  { value: '3,976', enLabel: 'Sanskrit Roots', hiLabel: 'संस्कृत मूल' },
  { value: '98%', enLabel: 'Accuracy Rating', hiLabel: 'सटीकता रेटिंग' },
  { value: '150+', enLabel: 'Lesson Modules', hiLabel: 'पाठ मॉड्यूल' },
]

export default function HomePage() {
  const [isMounted, setIsMounted] = useState(false)
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const [counts, setCounts] = useState([0, 0, 0, 0])
  const statsRef = useRef<HTMLDivElement>(null)
  const hasCountedRef = useRef(false)
  const t = translations[lang]

  useEffect(() => setIsMounted(true), [])

  // Counter animation on scroll
  useEffect(() => {
    if (!isMounted) return
    const targets = [50000, 3976, 98, 150]
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasCountedRef.current) {
          hasCountedRef.current = true
          targets.forEach((target, i) => {
            const duration = 1800
            const steps = 60
            const increment = target / steps
            let current = 0
            const timer = setInterval(() => {
              current = Math.min(current + increment, target)
              setCounts(prev => { const n = [...prev]; n[i] = Math.floor(current); return n })
              if (current >= target) clearInterval(timer)
            }, duration / steps)
          })
        }
      },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [isMounted])

  if (!isMounted) return <div className="min-h-screen bg-[var(--bg-deep)]" />

  return (
    <div className="relative min-h-screen overflow-hidden" suppressHydrationWarning>
      <Navbar />

      {/* Language Toggle Button */}
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        className="fixed top-24 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 group backdrop-blur-md"
      >
        <Languages size={18} className="text-cyan-400 group-hover:text-cyan-300" />
        <span className="text-sm font-medium text-white/80 group-hover:text-white">
          {lang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-[120px] pb-32 px-4 flex flex-col items-center text-center overflow-hidden" style={{ marginTop: '80px' }}>
        {/* Animated mesh gradient overlay */}
        <div className="hero-mesh-bg absolute inset-0 pointer-events-none z-0" />
        {/* Deep glow blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-25 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.4) 0%, rgba(124,58,237,0.15) 50%, transparent 70%)', filter: 'blur(80px)' }}
        />

        {/* Floating animated particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {[
            { top: 12, left: 15, delay: 0, dur: 6 },
            { top: 25, left: 80, delay: 1.2, dur: 8 },
            { top: 50, left: 20, delay: 0.5, dur: 7 },
            { top: 70, left: 85, delay: 2, dur: 9 },
            { top: 10, left: 50, delay: 0.3, dur: 5 },
            { top: 60, left: 60, delay: 1.8, dur: 10 },
            { top: 30, left: 10, delay: 0.8, dur: 7 },
            { top: 80, left: 30, delay: 3, dur: 6 },
            { top: 40, left: 90, delay: 1.5, dur: 8 },
            { top: 5, left: 30, delay: 0.2, dur: 9 },
            { top: 90, left: 70, delay: 2.5, dur: 7 },
            { top: 20, left: 40, delay: 1.1, dur: 6 },
            { top: 75, left: 15, delay: 0.9, dur: 8 },
            { top: 45, left: 75, delay: 2.2, dur: 5 },
            { top: 85, left: 50, delay: 1.6, dur: 10 },
            { top: 35, left: 35, delay: 0.7, dur: 7 },
            { top: 65, left: 95, delay: 3.2, dur: 6 },
            { top: 15, left: 65, delay: 1.4, dur: 9 },
            { top: 55, left: 5, delay: 0.4, dur: 8 },
            { top: 95, left: 45, delay: 2.8, dur: 7 },
          ].map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                top: `${p.top}%`,
                left: `${p.left}%`,
                width: `${(i % 3) + 2}px`,
                height: `${(i % 3) + 2}px`,
                background: i % 3 === 0 ? 'var(--accent-cyan)' : i % 2 === 0 ? 'var(--accent-gold)' : '#a78bfa',
                boxShadow: `0 0 8px ${i % 3 === 0 ? 'var(--accent-cyan)' : i % 2 === 0 ? 'var(--accent-gold)' : '#a78bfa'}`,
              }}
              animate={{
                y: [0, -(10 + (i % 4) * 8), 0],
                x: [0, (i % 2 === 0 ? 6 : -6), 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
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
          {t.badge}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            scale: { delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="hero-heading text-[3.5rem] md:text-[5.5rem] leading-[1.05] max-w-4xl mb-6 drop-shadow-2xl relative z-10"
          style={{ textShadow: '0 10px 40px rgba(0,0,0,0.9)' }}
        >
          <span className="gradient-text-gold text-glow-gold">{t.title1}</span>{' '}
          <span className="gradient-text-gold text-glow-gold">{lang === 'hi' ? '' : 'Sanskrit'}</span>
          {lang === 'hi' ? '' : t.title2}<br />
          {lang === 'hi' ? <span className="gradient-text-gold text-glow-gold">{t.title2}</span> : <span className="gradient-text-cosmic">Cyber-Vedic AI</span>}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-lg md:text-xl max-w-2xl mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t.subtitle}
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
          <em>{t.tagline}</em>
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link href="/register" className="btn-primary btn-neon-pulse text-base px-8 py-4">
            <Zap size={18} />
            {t.beginJourney}
          </Link>
          <Link href="/dashboard" className="btn-glass-ghost text-base px-8 py-4">
            {t.exploreDashboard}
            <ChevronRight size={18} />
          </Link>
        </motion.div>

        {/* Floating mandala */}
        <MandalaHero />
      </section>

      {/* ── PROGRAMS ──────────────────────────────────────────── */}
      <section className="px-4 pt-16 pb-24 flex justify-center" style={{ marginBottom: '2rem' }}>
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto"
          >
            {/* UG Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden p-7 flex flex-col gap-4 cursor-pointer group"
              style={{
                background: 'rgba(245, 166, 35, 0.06)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(245, 166, 35, 0.22)',
                boxShadow: '0 8px 40px rgba(245,166,35,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Top sheen */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
              {/* Glow blob */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.6) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)' }}>
                <GraduationCap size={22} style={{ color: 'var(--accent-gold)' }} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2 leading-tight">{t.programs[0].title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {t.programs[0].desc}
                </p>
              </div>
              <Link href="/courses" className="mt-auto flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-200" style={{ color: 'var(--accent-gold)' }}>
                {t.programs[0].cta} <ChevronRight size={15} />
              </Link>
            </motion.div>

            {/* PG Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden p-7 flex flex-col gap-4 cursor-pointer group"
              style={{
                background: 'rgba(0, 229, 255, 0.05)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(0, 229, 255, 0.20)',
                boxShadow: '0 8px 40px rgba(0,229,255,0.07), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.6) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,229,255,0.12)', border: '1px solid rgba(0,229,255,0.25)' }}>
                <ScrollText size={22} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2 leading-tight">{t.programs[1].title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {t.programs[1].desc}
                </p>
              </div>
              <Link href="/courses" className="mt-auto flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-200" style={{ color: 'var(--accent-cyan)' }}>
                {t.programs[1].cta} <ChevronRight size={15} />
              </Link>
            </motion.div>

            {/* UGC NET Card */}
            <motion.div
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-3xl overflow-hidden p-7 flex flex-col gap-4 cursor-pointer group"
              style={{
                background: 'rgba(167, 139, 250, 0.06)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(167, 139, 250, 0.22)',
                boxShadow: '0 8px 40px rgba(167,139,250,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.6) 0%, transparent 70%)', filter: 'blur(20px)' }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}>
                <Trophy size={22} style={{ color: '#a78bfa' }} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2 leading-tight">{t.programs[2].title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {t.programs[2].desc}
                </p>
              </div>
              <Link href="/practice" className="mt-auto flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all duration-200" style={{ color: '#a78bfa' }}>
                {t.programs[2].cta} <ChevronRight size={15} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="px-4 flex justify-center" style={{ paddingTop: '5rem', paddingBottom: '4rem', marginTop: '1rem' }}>
        <div ref={statsRef} className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((s, i) => {
            const raw = counts[i]
            const display = i === 0 ? (raw >= 50000 ? '50,000+' : raw.toLocaleString() + '+') :
              i === 1 ? (raw >= 3976 ? '3,976' : raw.toLocaleString()) :
                i === 2 ? (raw >= 98 ? '98%' : raw + '%') :
                  (raw >= 150 ? '150+' : raw + '+')
            return (
              <GlassCard key={s.enLabel} delay={0.1 * i} hover className="text-center py-6">
                <p className="counter-value text-3xl gradient-text-gold mb-1">{display}</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{lang === 'hi' ? s.hiLabel : s.enLabel}</p>
              </GlassCard>
            )
          })}
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
      <section className="px-4 flex justify-center" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: '3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span className="badge badge-orange" style={{ marginBottom: '1.5rem' }}>{lang === 'hi' ? 'प्लेटफॉर्म विशेषताएं' : 'Platform Features'}</span>
            <h2 className="text-4xl md:text-6xl font-black drop-shadow-2xl leading-[1.15]"
              style={{ textShadow: '0 0 40px rgba(245, 166, 35, 0.8), 0 0 80px rgba(245, 166, 35, 0.4)', marginTop: '1rem', marginBottom: '2.5rem', maxWidth: '56rem', textAlign: 'center' }}>
              {t.featuresTitle}{' '}
              <br className="hidden md:block" />
              <span className="gradient-text-gold">{lang === 'hi' ? 'संस्कृत में निपुण होने के लिए' : 'Master Sanskrit'}</span>
            </h2>
            <p className="text-lg max-w-2xl" style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>
              {t.featuresSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '1.5rem' }}>
            {features.map((feat, i) => {
              const Icon = feat.icon
              const featureData = t.features[i]
              return (
                <motion.div
                  key={featureData.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.06 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  className="bento-card group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${feat.color}18`, border: `1px solid ${feat.color}35` }}
                  >
                    <Icon size={22} style={{ color: feat.color }} />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-base tracking-tight">{featureData.title}</h3>
                    <span className="badge badge-gold text-[10px] px-2 py-0.5">{featureData.badge}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {featureData.desc}
                  </p>
                  {/* Accent glow on card matching icon color */}
                  <div className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${feat.color}60, transparent)` }} />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SAMPLE LESSON PREVIEW ──────────────────────────── */}
      <section className="px-4 flex justify-center" style={{ paddingTop: '5rem', paddingBottom: '3rem' }}>
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ marginBottom: '3.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <span className="badge badge-cyan" style={{ marginBottom: '1.5rem' }}>{lang === 'hi' ? 'लाइव पूर्वावलोकन' : 'Live Preview'}</span>
            <h2 className="text-4xl md:text-6xl font-black drop-shadow-2xl leading-[1.15]"
              style={{ textShadow: '0 0 40px rgba(0, 229, 255, 0.8), 0 0 80px rgba(0, 229, 255, 0.4)', marginTop: '1rem', marginBottom: '2.5rem', maxWidth: '56rem', textAlign: 'center' }}>
              {t.previewTitle}{' '}
              <br className="hidden md:block" />
              <span className="gradient-text-cosmic">{t.previewSubtitle}</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 items-center" style={{ gap: '4rem' }}>
            {/* Flashcard preview */}
            <GlassCard hover glow="gold" className="min-h-[280px] flex flex-col items-center justify-center text-center md:ml-12 md:mr-8">
              <p className="badge badge-gold mb-6 text-xs">{t.lesson}</p>
              <p className="devanagari text-6xl mb-4 text-glow-gold" style={{ color: 'var(--accent-gold)' }}>
                नमस्ते
              </p>
              <p className="text-xl font-semibold mb-2">Namaste</p>
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {lang === 'hi' ? 'मैं आपके भीतर के दिव्य को प्रणाम करता हूँ' : 'I bow to the divine in you'} · <em>namaḥ + te</em>
              </p>
              <div className="mt-6 flex gap-3">
                <button className="btn-ghost text-sm py-2 px-4">{t.prev}</button>
                <button className="btn-primary text-sm py-2 px-4">{t.next}</button>
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
          style={{ borderColor: 'rgba(245,166,35,0.3)', boxShadow: 'var(--glow-gold)', padding: '40px' }}
        >
          <p className="devanagari text-3xl mb-4" style={{ color: 'var(--accent-gold)' }}>
            अथ योगानुशासनम्
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            <em>{lang === 'hi' ? '"अब योग के अनुशासन की शुरुआत होती है" — योग सूत्र 1.1' : '"Now begins the discipline of yoga" — Yoga Sūtras 1.1'}</em>
          </p>
          <h2 className="text-4xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
            {t.ctaSubtitle}
          </p>
          <Link href="/register" className="btn-primary text-lg px-10 py-4">
            <Zap size={20} />
            {t.startFree}
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-glass)' }}>
        <p className="devanagari text-lg mb-1" style={{ color: 'var(--accent-gold)', opacity: 0.6 }}>ॐ</p>
        <p className="text-sm"> 2026 {lang === 'hi' ? 'संस्कृतAI' : 'SanskritAI'} · {t.footer}</p>
      </footer>
    </div>
  )
}
