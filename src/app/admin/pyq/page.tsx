'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, FileQuestion, Upload, Calendar, Tag, Edit2, Loader, X, Save } from 'lucide-react'

interface PYQ { _id: string; title: string; year: string; subject: string; fileUrl: string; questions: number; addedAt: string }

const EMPTY_FORM = { title: '', year: new Date().getFullYear().toString(), subject: '', fileUrl: '', questions: 30 }

export default function PYQPage() {
  const [pyqs, setPyqs] = useState<PYQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => { setLoading(true); const r = await fetch('/api/pyq'); setPyqs(await r.json()); setLoading(false) }
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }
  const openEdit = (p: PYQ) => {
    setForm({ title: p.title, year: p.year, subject: p.subject, fileUrl: p.fileUrl, questions: p.questions })
    setEditId(p._id); setShowForm(true)
  }
  const save = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    if (editId) {
      const r = await fetch(`/api/pyq/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const updated = await r.json()
      setPyqs(ps => ps.map(p => p._id === editId ? updated : p))
    } else {
      const r = await fetch('/api/pyq', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, addedAt: new Date().toISOString().split('T')[0] }) })
      const created = await r.json()
      setPyqs(ps => [...ps, created])
    }
    setSaving(false); setShowForm(false)
  }
  const remove = async (id: string) => {
    setPyqs(ps => ps.filter(p => p._id !== id))
    await fetch(`/api/pyq/${id}`, { method: 'DELETE' })
  }

  const years = [...new Set(pyqs.map(p => p.year))].sort((a, b) => Number(b) - Number(a))
  const S: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 4px' }}>PYQ <span style={{ color: 'var(--accent-orange)' }}>Manager</span></h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{pyqs.length} past papers across {years.length} years · stored in MongoDB</p>
        </div>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-orange), #f5a623)', color: '#0a0a0a', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none' }}>
          <Upload size={16} /> Upload PYQ
        </button>
      </motion.div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{ background: 'rgba(14,22,48,0.85)', border: '1px solid rgba(255,107,53,0.3)', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '18px', margin: 0 }}>{editId ? 'Edit PYQ Paper' : 'Add New PYQ Paper'}</h3>
              <button onClick={() => setShowForm(false)} style={{ padding: '6px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              {[
                { key: 'title', label: 'Paper Title', placeholder: 'e.g. Sanskrit Board Exam', icon: FileQuestion },
                { key: 'subject', label: 'Subject', placeholder: 'e.g. Sanskrit Grammar', icon: Tag },
                { key: 'fileUrl', label: 'File URL / Drive Link', placeholder: 'https://...', icon: Upload },
                { key: 'year', label: 'Year', placeholder: '2024', icon: Calendar },
              ].map(({ key, label, placeholder, icon: Icon }) => (
                <div key={key}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                    <Icon size={10} /> {label}
                  </label>
                  <input value={(form as Record<string, string | number>)[key] as string} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} style={S} />
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Number of Questions</label>
              <input type="number" value={form.questions} min={1} onChange={e => setForm(f => ({ ...f, questions: Number(e.target.value) }))} style={{ ...S, width: '140px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={save} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--accent-orange), #f5a623)', color: '#0a0a0a', fontWeight: 700, fontSize: '14px', cursor: 'pointer', border: 'none' }}>
                {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />} {saving ? 'Saving…' : editId ? 'Save Changes' : 'Add Paper'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ padding: '11px 20px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading from MongoDB…
        </div>
      ) : years.map((year, yi) => (
        <div key={year} style={{ marginBottom: '40px' }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: yi * 0.08 }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calendar size={14} style={{ color: 'var(--accent-orange)' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-orange)', margin: 0 }}>{year}</h2>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,107,53,0.15)' }} />
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {pyqs.filter(p => p.year === year).map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(255,107,53,0.12)', borderRadius: '14px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,107,53,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileQuestion size={15} style={{ color: 'var(--accent-orange)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 3px', lineHeight: 1.3 }}>{p.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>{p.subject}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{p.questions} questions</span>
                  <span>Added {p.addedAt}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={p.fileUrl} target="_blank" rel="noopener" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px' }}>
                    <Upload size={11} /> View Paper
                  </a>
                  <button onClick={() => openEdit(p)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={11} /></button>
                  <button onClick={() => remove(p._id)} style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)', color: '#ff6b35', cursor: 'pointer' }}><Trash2 size={11} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
