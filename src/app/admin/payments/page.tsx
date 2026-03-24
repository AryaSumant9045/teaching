'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Brain, IndianRupee, TrendingUp, Loader, User, Pencil, CheckCircle, X } from 'lucide-react'
import Link from 'next/link'

interface Course { _id: string; title: string; category: string; price: number; students: number; color: string; isFree: boolean }
interface Quiz { _id: string; title: string; type: string; price: number; isFree: boolean }
interface Purchase { _id: string; amount: number; resourceType: string; status: string; createdAt: string; orderId: string; userId: string; }

export default function AdminPaymentsPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<{ id: string; type: 'course' | 'quiz'; val: number } | null>(null)

  const load = useCallback(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(d => { setCourses(d.courses ?? []); setQuizzes(d.quizzes ?? []); setPurchases(d.purchases ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const markFree = async (id: string, type: 'course' | 'quiz') => {
    const url = type === 'course' ? `/api/courses/${id}` : `/api/quizzes/${id}`
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isFree: true, price: 0 }) })
    if (type === 'course') setCourses(cs => cs.filter(c => c._id !== id))
    else setQuizzes(qs => qs.filter(q => q._id !== id))
  }

  const savePrice = async () => {
    if (!editingPrice) return
    const { id, type, val } = editingPrice
    const url = type === 'course' ? `/api/courses/${id}` : `/api/quizzes/${id}`
    await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ price: val }) })
    if (type === 'course') setCourses(cs => cs.map(c => c._id === id ? { ...c, price: val } : c))
    else setQuizzes(qs => qs.map(q => q._id === id ? { ...q, price: val } : q))
    setEditingPrice(null)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)' }}>
      <Loader size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '8px' }} /> Loading...
    </div>
  )

  const totalRevenue = purchases.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)

  const PaidBadge = ({ price }: { price: number }) => (
    <span style={{ fontWeight: 800, color: '#10b981', fontSize: '15px', whiteSpace: 'nowrap' }}>₹{price}</span>
  )

  const ActionBtns = ({ id, type, price, editLink }: { id: string; type: 'course' | 'quiz'; price: number; editLink: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%', justifyContent: 'flex-start', background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
      {editingPrice?.id === id ? (
        <>
          <input
            type="number" min={0}
            value={editingPrice.val}
            onChange={e => setEditingPrice(ep => ep ? { ...ep, val: Number(e.target.value) } : ep)}
            style={{ width: '80px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.08)', color: '#fff', fontSize: '13px', outline: 'none' }}
            autoFocus
          />
          <button onClick={savePrice} title="Save" style={{ padding: '7px', borderRadius: '8px', border: '1px solid #10b981', background: 'rgba(16,185,129,0.15)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><CheckCircle size={14} /> Save</button>
          <button onClick={() => setEditingPrice(null)} title="Cancel" style={{ padding: '7px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}><X size={14} /> Cancel</button>
        </>
      ) : (
        <>
          <PaidBadge price={price} />
          <div style={{ flex: 1 }} />
          <button onClick={() => setEditingPrice({ id, type, val: price })} title="Edit price" style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}><Pencil size={13} /> Edit Price</button>
          <Link href={editLink} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none', fontWeight: 600 }}>Manage</Link>
          <button onClick={() => markFree(id, type)} title="Remove from paid (mark free)" style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Mark Free</button>
        </>
      )}
    </div>
  )

  const paidCourses = courses.filter(c => !c.isFree)
  const freeCourses = courses.filter(c => c.isFree)
  const paidQuizzes = quizzes.filter(q => !q.isFree)
  const freeQuizzes = quizzes.filter(q => q.isFree)

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pb-24 max-w-7xl mx-auto">
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 42px)', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          Payment <span style={{ color: '#10b981' }}>Manager</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>Manage paid content and monitor revenue</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '36px' }}>
        {[
          { icon: <IndianRupee size={20} />, label: 'Revenue', val: `₹${totalRevenue.toLocaleString()}`, sub: `${purchases.filter(p => p.status === 'completed').length} completed orders`, color: '#10b981' },
          { icon: <BookOpen size={20} />, label: 'Paid Courses', val: paidCourses.length, sub: 'Monetized courses', color: 'var(--accent-orange)' },
          { icon: <Brain size={20} />, label: 'Paid Quizzes', val: paidQuizzes.length, sub: 'Monetized quizzes', color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(14,22,48,0.7)', border: `1px solid ${s.color}30`, borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', color: s.color, background: `${s.color}15`, padding: '6px 12px', borderRadius: '20px' }}>
              {s.icon} <span style={{ fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '6px', color: '#fff' }}>{s.val}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr] xl:grid-cols-[2fr_1.3fr] gap-8">
        {/* Courses + Quizzes lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* ----- COURSES ----- */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '6px', background: 'rgba(245,166,35,0.1)', color: 'var(--accent-orange)', borderRadius: '8px' }}><BookOpen size={16} /></div> Course Monetization
            </h3>
            
            {paidCourses.length > 0 && <h4 style={{ fontSize: '14px', color: '#10b981', margin: '20px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Active Paid Courses</h4>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paidCourses.map(c => (
                <div key={c._id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px', borderRadius: '16px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%' }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px', background: `${c.color}20`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={18} /></div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '16px', lineHeight: 1.4, color: '#fff' }}>{c.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{c.category} • {c.students} students</p>
                    </div>
                  </div>
                  <ActionBtns id={c._id} type="course" price={c.price} editLink="/admin/courses" />
                </div>
              ))}
            </div>

            {freeCourses.length > 0 && <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Available to Monetize</h4>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {freeCourses.map(c => (
                <div key={c._id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%' }}>
                    <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '8px', background: `${c.color}15`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BookOpen size={16} /></div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px', lineHeight: 1.4, color: '#eaeaea' }}>{c.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{c.category}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>Free</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setEditingPrice({ id: c._id, type: 'course', val: 999 })} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>Make Paid</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ----- QUIZZES ----- */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '6px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', borderRadius: '8px' }}><Brain size={16} /></div> Quiz Monetization
            </h3>
            
            {paidQuizzes.length > 0 && <h4 style={{ fontSize: '14px', color: '#10b981', margin: '20px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Active Paid Quizzes</h4>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paidQuizzes.map(q => (
                <div key={q._id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px', borderRadius: '16px', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%' }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '10px', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={18} /></div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '16px', lineHeight: 1.4, color: '#fff' }}>{q.title}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>{q.type === 'quiz' ? 'Standard Quiz' : 'Lecture Test'}</p>
                    </div>
                  </div>
                  <ActionBtns id={q._id} type="quiz" price={q.price} editLink="/admin/quizzes" />
                </div>
              ))}
            </div>

            {freeQuizzes.length > 0 && <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>Available to Monetize</h4>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {freeQuizzes.map(q => (
                <div key={q._id} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '18px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.15)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', width: '100%' }}>
                    <div style={{ width: '36px', height: '36px', flexShrink: 0, borderRadius: '8px', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={16} /></div>
                    <div style={{ minWidth: 0, width: '100%' }}>
                      <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '15px', lineHeight: 1.4, color: '#eaeaea' }}>{q.title}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', width: '100%', justifyContent: 'flex-start', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' }}>Free</span>
                    <div style={{ flex: 1 }} />
                    <button onClick={() => setEditingPrice({ id: q._id, type: 'quiz', val: 99 })} style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontSize: '13px', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' }}>Make Paid</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div style={{ background: 'rgba(14,22,48,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '24px', alignSelf: 'start', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
            <TrendingUp size={18} style={{ color: '#10b981' }} /> Recent Transactions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {purchases.length === 0 && <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '32px 0' }}>No purchases yet</p>}
            {purchases.map(p => (
              <div key={p._id} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${p.status === 'completed' ? '#10b981' : p.status === 'failed' ? '#ef4444' : '#f5a623'}`, transition: 'all 0.2s', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}><User size={12} style={{ opacity: 0.6 }} /> {p.userId.substring(0, 10)}…</span>
                  <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>₹{p.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{p.resourceType} • {new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px', background: p.status === 'completed' ? 'rgba(16,185,129,0.15)' : p.status === 'failed' ? 'rgba(239,68,68,0.15)' : 'rgba(245,166,35,0.15)', color: p.status === 'completed' ? '#10b981' : p.status === 'failed' ? '#ef4444' : '#f5a623', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
