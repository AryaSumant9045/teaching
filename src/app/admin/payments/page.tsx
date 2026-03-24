'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Brain, IndianRupee, TrendingUp, Loader, User, CreditCard } from 'lucide-react'

interface Course { _id: string; title: string; category: string; price: number; students: number; color: string; }
interface Quiz { _id: string; title: string; type: string; price: number; }
interface Purchase { _id: string; amount: number; resourceType: string; status: string; createdAt: string; orderId: string; userId: string; }

export default function AdminPaymentsPage() {
  const [data, setData] = useState<{ courses: Course[], quizzes: Quiz[], purchases: Purchase[] }>({
    courses: [], quizzes: [], purchases: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); })
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading Payment Data...
    </div>
  )

  const { courses, quizzes, purchases } = data
  const totalRevenue = purchases.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Payment <span style={{ color: '#10b981' }}>Manager</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Manage your paid content and monitor revenue
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#10b981' }}>
            <IndianRupee size={20} /> <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>₹{totalRevenue.toLocaleString()}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>From {purchases.filter(p=>p.status==='completed').length} completed orders</p>
        </div>
        <div style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: 'var(--accent-orange)' }}>
            <BookOpen size={20} /> <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Courses</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>{courses.length}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Monetized courses</p>
        </div>
        <div style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', color: '#a78bfa' }}>
            <Brain size={20} /> <span style={{ fontWeight: 700, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Quizzes</span>
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 800, margin: 0 }}>{quizzes.length}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>Monetized quizzes</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.5fr)', gap: '24px' }}>
        {/* Monetized Content List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Monetized Courses</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {courses.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No paid courses found.</p>}
              {courses.map(c => (
                <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${c.color}20`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={16} /></div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>{c.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{c.students} Students Enrolled</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '16px' }}>₹{c.price}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Monetized Quizzes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
              {quizzes.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No paid quizzes found.</p>}
              {quizzes.map(q => (
                <div key={q._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={16} /></div>
                    <div>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px' }}>{q.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{q.type === 'quiz' ? 'Standard' : 'Lecture Test'}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '16px' }}>₹{q.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Purchases */}
        <div style={{ background: 'rgba(14,22,48,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', alignSelf: 'start' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} style={{ color: '#10b981' }} /> Recent Transactions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {purchases.length === 0 && <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No purchases yet</p>}
            {purchases.map(p => (
              <div key={p._id} style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${p.status === 'completed' ? '#10b981' : p.status === 'failed' ? '#ef4444' : '#f5a623'}`}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}><User size={12} /> {p.userId.substring(0, 8)}...</span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>₹{p.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    {p.resourceType} • {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: p.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: p.status === 'completed' ? '#10b981' : p.status === 'failed' ? '#ef4444' : '#f5a623' }}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
