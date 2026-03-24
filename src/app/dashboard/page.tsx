'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Navbar from '@/components/shared/Navbar'
import GlassCard from '@/components/ui/GlassCard'
import ProgressChart from '@/components/features/ProgressChart'
import {
  Flame, BookOpen, Mic, BarChart2, Target, Trophy,
  TrendingUp, Zap, Star, CheckCircle2, ChevronRight, Brain, ShoppingCart
} from 'lucide-react'

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
  { subject: 'Vocabulary', score: 72, color: 'var(--accent-gold)' },
  { subject: 'Grammar', score: 54, color: 'var(--accent-orange)' },
  { subject: 'Pronunciation', score: 88, color: 'var(--accent-cyan)' },
  { subject: 'Sandhi', score: 41, color: '#a78bfa' },
  { subject: 'Samasa', score: 30, color: '#34d399' },
]

const achievements = [
  { label: 'First Word', icon: '⭐', earned: true },
  { label: 'Week Warrior', icon: '🔥', earned: true },
  { label: 'Grammar Guru', icon: '📖', earned: false },
  { label: 'Pronunciation+', icon: '🎤', earned: false },
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
      <div className="px-4" style={{ paddingTop: '7rem', paddingBottom: '6rem', maxWidth: '100rem', width: '95%', marginLeft: 'auto', marginRight: 'auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between flex-wrap gap-4"
          style={{ marginBottom: '3rem' }}
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              नमस्ते, <span className="gradient-text-gold">Learner</span> 🙏
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Level {level} · {xp.toLocaleString()} / {xpToNext.toLocaleString()} XP to next level
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
            Continue Learning
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
                  <h3 className="font-semibold">Bought Courses</h3>
                </div>
                <Link href="/courses" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent-cyan)' }}>
                  Browse courses <ChevronRight size={14} />
                </Link>
              </div>

              {loadingBoughtCourses ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Loading your purchased courses...
                </p>
              ) : boughtCourses.length === 0 ? (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  You have not purchased any course yet.
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
                          {course.description || 'Continue your learning in this course.'}
                        </p>
                        <span className="text-xs font-semibold" style={{ color: 'var(--accent-cyan)' }}>
                          Open Course <ChevronRight size={12} className="inline-block" />
                        </span>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Streak card */}
          <GlassCard delay={0.05} hover glow="orange" className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={18} style={{ color: 'var(--accent-orange)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Daily Streak</span>
            </div>
            <p className="text-6xl font-bold gradient-text-gold mb-1">{streak}</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>days in a row 🔥</p>
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
          <GlassCard delay={0.1} hover className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} style={{ color: 'var(--accent-gold)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Daily Goal</span>
            </div>
            <p className="text-4xl font-bold mb-1">
              {dailyGoal.done}<span style={{ color: 'var(--text-muted)' }}>/{dailyGoal.total}</span>
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>lessons completed</p>
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
          <GlassCard delay={0.15} hover className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={18} style={{ color: '#a78bfa' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Achievements</span>
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
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-secondary)' }}>{a.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Next lesson suggestion */}
          <GlassCard delay={0.2} hover glow="cyan" className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <Brain size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>AI Recommends</span>
            </div>
            <div
              className="flex-1 rounded-xl p-4 flex flex-col justify-center"
              style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}
            >
              <span className="badge badge-cyan text-[10px] mb-3">Weak Point</span>
              <p className="font-semibold mb-1">Compound Words (Samāsa)</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
                Your Samasa score is 30%. Practice now to level up fast.
              </p>
              <Link href="/lessons/5" className="btn-primary text-xs py-2">
                Start Now <ChevronRight size={12} />
              </Link>
            </div>
          </GlassCard>

          {/* Progress chart — spans 2 cols */}
          <GlassCard delay={0.25} className="md:col-span-2 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} style={{ color: 'var(--accent-gold)' }} />
                <h3 className="font-semibold">Weekly Progress</h3>
              </div>
              <span className="badge badge-gold text-xs">Last 7 days</span>
            </div>
            <ProgressChart />
          </GlassCard>

          {/* Mastery bars — spans 2 cols */}
          <GlassCard delay={0.3} className="md:col-span-2 xl:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <BarChart2 size={18} style={{ color: 'var(--accent-orange)' }} />
              <h3 className="font-semibold">Skill Mastery</h3>
            </div>
            <div className="flex flex-col gap-4">
              {masteryData.map((m, i) => (
                <div key={m.subject}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">{m.subject}</span>
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
          <GlassCard delay={0.35} className="md:col-span-2 xl:col-span-4">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BookOpen size={18} style={{ color: 'var(--accent-gold)' }} />
                <h3 className="font-semibold">Recent Lessons</h3>
              </div>
              <Link href="/lessons/1" className="text-sm flex items-center gap-1" style={{ color: 'var(--accent-gold)' }}>
                View all <ChevronRight size={14} />
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
                    <span className="badge badge-gold text-[10px] mb-3">{lesson.category}</span>
                    <div className="progress-bar mt-3">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${lesson.progress}%` }}
                        transition={{ duration: 1, delay: 0.15 * i }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{lesson.progress}% complete</p>
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
