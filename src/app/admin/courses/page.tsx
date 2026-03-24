'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Plus, Trash2, Save, X, Archive, RotateCcw, Search, Loader,
  BookOpen, Users, Star, Edit2, ChevronRight
} from 'lucide-react'

interface Course {
  _id: string; title: string; description: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  thumbnail: string; color: string; status: 'active' | 'archived'
  students: number; rating: number; totalLectures: number; duration: string; createdAt: string
}

const COLORS = ['#00e5ff', '#a78bfa', '#f5a623', '#ff6b35', '#4ade80', '#f472b6']
const CATS = ['Beginner', 'Intermediate', 'Advanced'] as const
const BLANK = (): Omit<Course, '_id'> => ({ title: '', description: '', category: 'Beginner', thumbnail: '', color: '#00e5ff', status: 'active', students: 0, rating: 0, totalLectures: 0, duration: '', createdAt: new Date().toISOString().split('T')[0] })
const CAT_COLORS: Record<string, string> = { Beginner: '#00e5ff', Intermediate: '#f5a623', Advanced: '#a78bfa' }

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [form, setForm] = useState(BLANK())
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/courses')
      if (r.ok) {
        const data = await r.json()
        setCourses(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to load courses: HTTP', r.status)
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const filtered = courses.filter(c => {
    const matchCat = catFilter === 'All' || c.category === catFilter
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const openAdd = () => { setEditCourse(null); setForm(BLANK()); setShowModal(true) }
  const openEdit = (c: Course) => { setEditCourse(c); const { _id, ...rest } = c; setForm(rest as Omit<Course, '_id'>); setShowModal(true) }

  const saveCourse = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    if (editCourse) {
      const r = await fetch(`/api/courses/${editCourse._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const updated = await r.json()
      setCourses(cs => cs.map(c => c._id === editCourse._id ? updated : c))
    } else {
      const r = await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const created = await r.json()
      setCourses(cs => [created, ...cs])
    }
    setSaving(false); setShowModal(false)
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course and all its lectures permanently?')) return
    setCourses(cs => cs.filter(c => c._id !== id))
    await fetch(`/api/courses/${id}`, { method: 'DELETE' })
  }

  const toggleArchive = async (c: Course) => {
    const newStatus = c.status === 'active' ? 'archived' : 'active'
    setCourses(cs => cs.map(x => x._id === c._id ? { ...x, status: newStatus } : x))
    await fetch(`/api/courses/${c._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) })
  }

  const S: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
  const LS: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px' }}>Course <span style={{ color: 'var(--accent-gold)' }}>Management</span></h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {courses.filter(c => c.status === 'active').length} active · {courses.filter(c => c.status === 'archived').length} archived · stored in MongoDB
          </p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', color: '#0a0a0a', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none', boxShadow: '0 0 20px rgba(245,166,35,0.25)' }}>
          <Plus size={16} /> New Course
        </button>
      </motion.div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', height: '40px' }}>
          <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '180px' }} />
        </div>
        {['All', ...CATS].map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={{ padding: '7px 16px', borderRadius: '99px', fontSize: '13px', cursor: 'pointer', background: catFilter === cat ? `${CAT_COLORS[cat] ?? 'rgba(136,153,187,0.9)'}18` : 'transparent', color: catFilter === cat ? (CAT_COLORS[cat] ?? 'var(--text-primary)') : 'var(--text-secondary)', border: `1px solid ${catFilter === cat ? `${CAT_COLORS[cat] ?? '#888'}50` : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading from MongoDB…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filtered.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: 'rgba(14,22,48,0.75)', backdropFilter: 'blur(12px)', border: `1px solid ${c.color}25`, borderRadius: '18px', padding: '22px', opacity: c.status === 'archived' ? 0.55 : 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ height: '3px', borderRadius: '3px', background: c.color, boxShadow: `0 0 10px ${c.color}60` }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: `${CAT_COLORS[c.category]}18`, color: CAT_COLORS[c.category], border: `1px solid ${CAT_COLORS[c.category]}40`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.category}</span>
                {c.status === 'archived' && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.1)' }}>Archived</span>}
                {c.rating > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={11} style={{ color: '#f5a623' }} fill="#f5a623" /><span style={{ fontSize: '12px', fontWeight: 700, color: '#f5a623' }}>{c.rating}</span></div>}
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 6px', lineHeight: 1.3 }}>{c.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                {[{ Icon: Users, val: c.students }, { Icon: BookOpen, val: `${c.totalLectures} lec` }, { Icon: Star, val: c.duration || '—' }].map(({ Icon, val }) => (
                  <span key={String(val)} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}><Icon size={10} style={{ color: c.color }} />{val}</span>
                ))}
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <Link href={`/admin/courses/${c._id}/lectures`} style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1, justifyContent: 'center', padding: '8px', borderRadius: '8px', background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30`, textDecoration: 'none', fontSize: '12px', fontWeight: 600 }}>
                  Lectures <ChevronRight size={11} />
                </Link>
                <button onClick={() => openEdit(c)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '12px' }}><Edit2 size={11} /></button>
                <button onClick={() => toggleArchive(c)} title={c.status === 'active' ? 'Archive' : 'Restore'} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '12px' }}>
                  {c.status === 'active' ? <Archive size={11} /> : <RotateCcw size={11} />}
                </button>
                <button onClick={() => deleteCourse(c._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,107,53,0.08)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.2)', cursor: 'pointer', fontSize: '12px' }}><Trash2 size={11} /></button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
              <BookOpen size={36} style={{ margin: '0 auto 12px', opacity: 0.2 }} /><p>No courses found</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              style={{ width: '100%', maxWidth: '560px', background: 'rgba(6,9,20,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', overflowY: 'auto', maxHeight: '90vh' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '22px' }}>{editCourse ? 'Edit Course' : 'New Course'}</h2>
                <button onClick={() => setShowModal(false)} style={{ padding: '8px', border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div><label style={LS}>Title *</label><input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Sanskrit Basics I" style={S} /></div>
                <div><label style={LS}>Description</label><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...S, resize: 'none' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={LS}>Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Course['category'] }))} style={{ ...S, background: 'rgba(14,22,48,0.95)' }}>
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div><label style={LS}>Duration</label><input value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 12 hrs" style={S} /></div>
                </div>
                <div>
                  <label style={LS}>Accent Color</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {COLORS.map(col => (
                      <button key={col} onClick={() => setForm(f => ({ ...f, color: col }))} style={{ width: '28px', height: '28px', borderRadius: '50%', background: col, border: form.color === col ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: form.color === col ? `0 0 10px ${col}` : 'none', transition: 'all 0.2s' }} />
                    ))}
                    <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'transparent', padding: 0 }} />
                  </div>
                </div>
                <button onClick={saveCourse} disabled={saving} style={{ padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', color: '#0a0a0a', fontWeight: 800, fontSize: '15px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />} {saving ? 'Saving…' : editCourse ? 'Save Changes' : 'Create Course'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
