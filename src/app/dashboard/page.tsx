'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Navbar from '@/components/shared/Navbar'
import GlassCard from '@/components/ui/GlassCard'
import ProgressChart from '@/components/features/ProgressChart'
import {
  Flame, BookOpen, Mic, BarChart2, Target, Trophy,
  TrendingUp, Zap, Star, CheckCircle2, ChevronRight, Brain, ShoppingCart, Languages
} from 'lucide-react'

const translations = {
  en: {
    greeting: 'नमस्ते,',
    learner: 'Learner',
    level: 'Level',
    xpToNext: 'XP to next level',
    continueLearning: 'Continue Learning',
    boughtCourses: 'Bought Courses',
    browseCourses: 'Browse courses',
    loadingCourses: 'Loading your purchased courses...',
    noCourses: 'You have not purchased any course yet.',
    openCourse: 'Open Course',
    dailyStreak: 'Daily Streak',
    daysInRow: 'days in a row',
    dailyGoal: 'Daily Goal',
    lessonsCompleted: 'lessons completed',
    achievements: 'Achievements',
    aiRecommends: 'AI Recommends',
    weakPoint: 'Weak Point',
    startNow: 'Start Now',
    weeklyProgress: 'Weekly Progress',
    last7Days: 'Last 7 days',
    skillMastery: 'Skill Mastery',
    recentLessons: 'Recent Lessons',
    viewAll: 'View all',
    complete: 'complete',
    categories: {
      Grammar: 'Grammar',
      Vocabulary: 'Vocabulary',
      Phonetics: 'Phonetics'
    }
  },
  hi: {
    greeting: 'नमस्ते,',
    learner: 'शिक्षार्थी',
    level: 'स्तर',
    xpToNext: 'अगले स्तर के लिए XP',
    continueLearning: 'सीखना जारी रखें',
    boughtCourses: 'खरीदे गए पाठ्यक्रम',
    browseCourses: 'पाठ्यक्रम देखें',
    loadingCourses: 'आपके खरीदे गए पाठ्यक्रम लोड हो रहे हैं...',
    noCourses: 'आपने अभी तक कोई पाठ्यक्रम नहीं खरीदा है।',
    openCourse: 'पाठ्यक्रम खोलें',
    dailyStreak: 'दैनिक स्ट्रीक',
    daysInRow: 'दिन लगातार',
    dailyGoal: 'दैनिक लक्ष्य',
    lessonsCompleted: 'पाठ पूरे हुए',
    achievements: 'उपलब्धियाँ',
    aiRecommends: 'AI सुझाव',
    weakPoint: 'कमजोर बिंदु',
    startNow: 'अब शुरू करें',
    weeklyProgress: 'साप्ताहिक प्रगति',
    last7Days: 'पिछले 7 दिन',
    skillMastery: 'कौशल महारत',
    recentLessons: 'हाल के पाठ',
    viewAll: 'सभी देखें',
    complete: 'पूरा हुआ',
    categories: {
      Grammar: 'व्याकरण',
      Vocabulary: 'शब्दावली',
      Phonetics: 'ध्वनि विज्ञान'
    }
  }
}

const streak = 14
const dailyGoal = { done: 3, total: 5 }
const xp = 2840
const level = 12

const recentLessons = [
  { id: '1', title: 'Sandhi: Vowel Merging', category: 'Grammar', progress: 100, icon: '📜' },
  { id: '2', title: 'Case Endings (Vibhakti)', category: 'Grammar', progress: 65, icon: '🎯' },
  { id: '3', title: '100 Essential Roots', category: 'Vocabulary', progress: 40, icon: '🌿' },
  { id: '4', title: 'Pronunciation — Gutturals', category: 'Phonetics', progress: 80, icon: '🔊' },
]

const masteryData = [
  { subject: 'Vocabulary', hiSubject: 'शब्दावली', score: 72, color: 'var(--accent-gold)' },
  { subject: 'Grammar', hiSubject: 'व्याकरण', score: 54, color: 'var(--accent-orange)' },
  { subject: 'Pronunciation', hiSubject: 'उच्चारण', score: 88, color: 'var(--accent-cyan)' },
  { subject: 'Sandhi', hiSubject: 'संधि', score: 41, color: '#a78bfa' },
  { subject: 'Samasa', hiSubject: 'समास', score: 30, color: '#34d399' },
]

const achievements = [
  { label: 'First Word', hiLabel: 'पहला शब्द', icon: '⭐', earned: true },
  { label: 'Week Warrior', hiLabel: 'सप्ताह योद्धा', icon: '🔥', earned: true },
  { label: 'Grammar Guru', hiLabel: 'व्याकरण गुरु', icon: '📖', earned: false },
  { label: 'Pronunciation+', hiLabel: 'उच्चारण+', icon: '🎤', earned: false },
]

interface Course {
  _id: string
  title: string
  description: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  color: string
  isFree?: boolean
  price?: number
}

export default function DashboardPage() {
  const xpToNext = 3200
  const [boughtCourses, setBoughtCourses] = useState<Course[]>([])
  const [loadingBoughtCourses, setLoadingBoughtCourses] = useState(true)
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = translations[lang]

  useEffect(() => {
    const loadBoughtCourses = async () => {
      try {
        const purchasesRes = await fetch('/api/purchases/user', { cache: 'no-store' })
        if (!purchasesRes.ok) {
          setBoughtCourses([])
          return
        }

        const purchasesData: { purchasedResourceIds?: string[] } = await purchasesRes.json()
        const purchasedIds = Array.isArray(purchasesData.purchasedResourceIds)
          ? purchasesData.purchasedResourceIds.map((id: unknown) => String(id))
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

        const allCourses: Course[] = await coursesRes.json()
        const purchasedSet = new Set(purchasedIds)
        const filteredBoughtCourses = Array.isArray(allCourses)
          ? allCourses.filter(course => purchasedSet.has(String(course._id)))
          : []

        setBoughtCourses(filteredBoughtCourses)
      } catch {
        setBoughtCourses([])
      } finally {
        setLoadingBoughtCourses(false)
      }
    }

    loadBoughtCourses()
  }, [])

  return (
    <div className="relative min-h-screen">
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

      <div className="px-4 sm:px-6 lg:px-8" style={{ paddingTop: '7rem', paddingBottom: '4rem', maxWidth: '72rem', marginLeft: 'auto', marginRight: 'auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between flex-wrap gap-4"
          style={{ marginBottom: '3rem' }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {t.greeting} <span className="gradient-text-gold">{t.learner}</span> 🙏
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {t.level} {level} · {xp.toLocaleString()} / {xpToNext.toLocaleString()} {t.xpToNext}
            </p>
            <div className="progress-bar mt-4 max-w-sm" style={{ height: '8px' }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(xp / xpToNext) * 100}%` }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
          <Link href="/lessons/1" className="btn-primary text-lg px-8 py-4">
            <Zap size={20} />
            {t.continueLearning}
          </Link>
        </motion.div>

        {/* ── BENTO GRID ───────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4" style={{ gap: '2.5rem' }}>

          {/* Bought courses — top, spans full */}
          <GlassCard delay={0.02} className="md:col-span-2 xl:col-span-4">
            <div style={{ padding: '0.5rem 0.5rem 0.75rem', marginBottom: '0.25rem' }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <h3 className="font-semibold">{t.boughtCourses}</h3>
                </div>
                <Link href="/courses" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent-cyan)' }}>
                  {t.browseCourses} <ChevronRight size={14} />
                </Link>
              </div>

              {loadingBoughtCourses ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t.loadingCourses}
                </p>
              ) : boughtCourses.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {t.noCourses}
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {boughtCourses.map(course => (
                    <Link key={course._id} href={`/courses/${course._id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="rounded-xl p-4 transition-all duration-200 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                      >
                        <span
                          className="badge text-[10px] mb-3 inline-block"
                          style={{
                            background: `${course.color}22`,
                            color: course.color,
                            border: `1px solid ${course.color}55`,
                          }}
                        >
                          {course.category}
                        </span>
                        <p className="font-semibold text-sm mb-1 leading-tight">{course.title}</p>
                        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                          {course.description || (lang === 'hi' ? 'इस पाठ्यक्रम में अपनी सीखना जारी रखें।' : 'Continue your learning in this course.')}
                        </p>
                        <span className="text-xs font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                          {t.openCourse} <ChevronRight size={12} className="inline-block" />
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Streak card */}
          <GlassCard delay={0.05} hover glow="orange" className="flex flex-col p-5">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={18} style={{ color: 'var(--accent-orange)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.dailyStreak}</span>
            </div>
            <p className="text-6xl font-bold gradient-text-gold mb-1">{streak}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.daysInRow} 🔥</p>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full"
                  style={{ background: i < 5 ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)' }}
                />
              ))}
            </div>
          </GlassCard>

          {/* Daily goal */}
          <GlassCard delay={0.1} hover className="flex flex-col p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} style={{ color: 'var(--accent-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.dailyGoal}</span>
            </div>
            <p className="text-4xl font-bold mb-1">
              {dailyGoal.done}<span style={{ color: 'var(--text-muted)' }}>/{dailyGoal.total}</span>
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{t.lessonsCompleted}</p>
            <div className="grid grid-cols-5 gap-1 mt-auto">
              {Array.from({ length: dailyGoal.total }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-lg flex items-center justify-center"
                  style={{
                    background: i < dailyGoal.done ? 'rgba(245,166,35,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${i < dailyGoal.done ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {i < dailyGoal.done && <CheckCircle2 size={14} style={{ color: 'var(--accent-gold)' }} />}
                </div>
              ))}
            </div>
          </GlassCard>

          {/* XP / Trophy */}
          <GlassCard delay={0.15} hover className="flex flex-col p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} style={{ color: '#a78bfa' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.achievements}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-auto">
              {achievements.map(a => (
                <div
                  key={a.label}
                  className="rounded-xl p-3 text-center transition-all duration-200"
                  style={{
                    background: a.earned ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${a.earned ? 'rgba(245,166,35,0.3)' : 'rgba(255,255,255,0.08)'}`,
                    opacity: a.earned ? 1 : 0.45,
                  }}
                >
                  <div className="text-2xl mb-1">{a.icon}</div>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{lang === 'hi' ? a.hiLabel : a.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Next lesson suggestion */}
          <GlassCard delay={0.2} hover glow="cyan" className="flex flex-col p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{t.aiRecommends}</span>
            </div>
            <div
              className="flex-1 rounded-xl p-4 flex flex-col justify-center"
              style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}
            >
              <span className="badge badge-cyan text-[10px] mb-3">{t.weakPoint}</span>
              <p className="font-semibold mb-1">{lang === 'hi' ? 'समास (संयुक्त शब्द)' : 'Compound Words (Samāsa)'}</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                {lang === 'hi' ? 'आपका समास स्कोर 30% है। तेज़ी से स्तर बढ़ाने के लिए अभ्यास करें।' : 'Your Samasa score is 30%. Practice now to level up fast.'}
              </p>
              <Link href="/lessons/5" className="btn-primary text-xs py-2">
                {t.startNow} <ChevronRight size={12} />
              </Link>
            </div>
          </GlassCard>

          {/* Progress chart — spans 2 cols */}
          <GlassCard delay={0.25} className="md:col-span-2 xl:col-span-2 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: 'var(--accent-gold)' }} />
                <h3 className="font-semibold">{t.weeklyProgress}</h3>
              </div>
              <span className="badge badge-gold text-xs">{t.last7Days}</span>
            </div>
            <ProgressChart />
          </GlassCard>

          {/* Mastery bars — spans 2 cols */}
          <GlassCard delay={0.3} className="md:col-span-2 xl:col-span-2 p-5">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={18} style={{ color: 'var(--accent-orange)' }} />
              <h3 className="font-semibold">{t.skillMastery}</h3>
            </div>
            <div className="flex flex-col gap-4">
              {masteryData.map((m, i) => (
                <div key={m.subject}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">{lang === 'hi' ? m.hiSubject : m.subject}</span>
                    <span className="text-sm font-bold" style={{ color: m.color }}>{m.score}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${m.score}%` }}
                      transition={{ duration: 1, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                      style={{ background: `linear-gradient(90deg, ${m.color}99, ${m.color})` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent lessons — spans full */}
          <GlassCard delay={0.35} className="md:col-span-2 xl:col-span-4 p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookOpen size={18} style={{ color: 'var(--accent-gold)' }} />
                <h3 className="font-semibold">{t.recentLessons}</h3>
              </div>
              <Link href="/lessons/1" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent-gold)' }}>
                {t.viewAll} <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {recentLessons.map((lesson, i) => (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="rounded-xl p-4 transition-all duration-200 cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)' }}
                  >
                    <div className="text-2xl mb-3">{lesson.icon}</div>
                    <p className="font-semibold text-sm mb-1 leading-tight">{lesson.title}</p>
                    <span className="badge badge-gold text-[10px] mb-3">{t.categories[lesson.category as keyof typeof t.categories]}</span>
                    <div className="progress-bar mt-3">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${lesson.progress}%` }}
                        transition={{ duration: 1, delay: 0.15 * i }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{lesson.progress}% {t.complete}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </div>
  )
}
