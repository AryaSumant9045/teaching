'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Users, TrendingUp, UserX, CheckCircle, XCircle, Loader } from 'lucide-react'

interface Student {
  _id: string; name: string; email: string; avatar: string
  enrolled: number; progress: number; streak: number; status: 'active' | 'revoked'; joinedAt: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/students')
    setStudents(await res.json())
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = async (s: Student) => {
    const next = s.status === 'active' ? 'revoked' : 'active'
    setStudents(ss => ss.map(x => x._id === s._id ? { ...x, status: next } : x))
    await fetch(`/api/students/${s._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px' }}>Student <span style={{ color: 'var(--accent-cyan)' }}>Management</span></h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{students.filter(s => s.status === 'active').length} active students · stored in MongoDB</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
            style={{ background: 'transparent', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '12px 0', border: 'none', width: '220px' }} />
        </div>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Students', value: students.length, color: 'var(--accent-cyan)', icon: Users },
          { label: 'Avg. Progress', value: students.length ? `${Math.round(students.reduce((a, s) => a + s.progress, 0) / students.length)}%` : '—', color: 'var(--accent-gold)', icon: TrendingUp },
          { label: 'Revoked Access', value: students.filter(s => s.status === 'revoked').length, color: 'var(--accent-orange)', icon: UserX },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', background: 'rgba(14,22,48,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 800, color, margin: 0 }}>{value}</p>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading from MongoDB…
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'rgba(14,22,48,0.7)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Student', 'Enrolled', 'Progress', 'Streak', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '16px 20px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', opacity: s.status === 'revoked' ? 0.55 : 1 }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.name}`} alt={s.name} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)' }} />
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '14px', margin: 0 }}>{s.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>{s.enrolled} courses</td>
                  <td style={{ padding: '14px 20px', minWidth: '120px' }}>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden', marginBottom: '4px' }}>
                      <div style={{ width: `${s.progress}%`, height: '100%', borderRadius: '99px', background: s.progress > 70 ? 'var(--accent-cyan)' : s.progress > 40 ? 'var(--accent-gold)' : 'var(--accent-orange)' }} />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{s.progress}%</p>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: s.streak > 10 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>🔥 {s.streak} days</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 10px', borderRadius: '99px', background: s.status === 'active' ? 'rgba(0,229,255,0.1)' : 'rgba(255,107,53,0.1)', color: s.status === 'active' ? 'var(--accent-cyan)' : 'var(--accent-orange)', border: `1px solid ${s.status === 'active' ? 'rgba(0,229,255,0.3)' : 'rgba(255,107,53,0.3)'}` }}>
                      {s.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />} {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => toggleStatus(s)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: 'transparent', color: s.status === 'active' ? 'var(--accent-orange)' : 'var(--accent-cyan)', border: `1px solid ${s.status === 'active' ? 'rgba(255,107,53,0.3)' : 'rgba(0,229,255,0.3)'}` }}>
                      {s.status === 'active' ? <><UserX size={12} />Revoke</> : <><CheckCircle size={12} />Restore</>}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>No students found</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
