'use client'
import { motion } from 'framer-motion'
import { Users, BookOpen, Brain, TrendingUp, Activity, CheckCircle, Star, Zap } from 'lucide-react'

const metrics = [
  { label: 'Total Students', value: '1,284', icon: Users, color: 'var(--accent-cyan)', change: '+12 this week' },
  { label: 'Active Courses', value: '24', icon: BookOpen, color: 'var(--accent-gold)', change: '+2 this month' },
  { label: 'Quizzes Created', value: '89', icon: Brain, color: '#a78bfa', change: '+5 today' },
  { label: 'Avg. Completion', value: '67%', icon: TrendingUp, color: 'var(--accent-orange)', change: '+3% this week' },
]

const recentActivity = [
  { action: 'New student enrolled', user: 'Priya Sharma', time: '2 min ago', icon: Users, color: 'var(--accent-cyan)' },
  { action: 'Course updated', user: 'Sanskrit Basics I', time: '15 min ago', icon: BookOpen, color: 'var(--accent-gold)' },
  { action: 'Quiz submitted', user: 'Rahul Verma scored 95%', time: '34 min ago', icon: Brain, color: '#a78bfa' },
  { action: 'New enrollment', user: 'Aarav Joshi', time: '1 hr ago', icon: CheckCircle, color: 'var(--accent-orange)' },
  { action: 'PYQ paper uploaded', user: '2023 Sanskrit Board', time: '2 hr ago', icon: Star, color: 'var(--accent-gold)' },
  { action: 'Course created', user: 'Vedic Grammar Level 3', time: '3 hr ago', icon: Zap, color: 'var(--accent-cyan)' },
]

export default function AdminOverviewPage() {
  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Admin <span style={{ color: 'var(--accent-gold)' }}>Overview</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform metrics and recent activity at a glance.</p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6" style={{ marginBottom: '48px' }}>
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass glass-hover"
              style={{ padding: '28px 24px', borderRadius: '16px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${m.color}20`, border: `1px solid ${m.color}40` }}>
                  <Icon size={18} style={{ color: m.color }} />
                </div>
                <Activity size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-3xl font-black mb-1" style={{ color: m.color }}>{m.value}</p>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{m.label}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.change}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass"
        style={{ padding: '32px', borderRadius: '20px' }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Activity size={20} style={{ color: 'var(--accent-gold)' }} />
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>
        <div className="flex flex-col" style={{ gap: '0px' }}>
          {recentActivity.map((item, i) => {
            const Icon = item.icon
            return (
              <div key={i} className="flex items-center gap-4"
                style={{ padding: '16px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${item.color}20` }}>
                  <Icon size={16} style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.user}</p>
                </div>
                <p className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{item.time}</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
