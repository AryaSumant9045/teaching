'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Plus, Trash2, Save, X, Video, FileText,
  Clock, Wifi, WifiOff, Edit2, GripVertical, Calendar, Zap, Loader
} from 'lucide-react'

interface CourseMaterial { id: string; name: string; type: 'pdf'|'video'|'slides'|'link'; url: string }
interface LiveClass { scheduledAt: string; meetingUrl: string; isLive: boolean; title: string }
interface Lecture {
  _id: string; courseId: string; title: string; description: string; order: number
  duration: string; videoUrl: string; materials: CourseMaterial[]
  liveClass: LiveClass | null; isFree: boolean; createdAt: string
}
interface Course { _id: string; title: string; color: string; category: string }

const BLANK_MAT = (): CourseMaterial => ({ id: Date.now().toString(), name: '', type: 'pdf', url: '' })
const S: React.CSSProperties = { width: '100%', padding: '11px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }
const LS: React.CSSProperties = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }

export default function LecturesAdminPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [editLecture, setEditLecture] = useState<Lecture | null>(null)
  const [form, setForm] = useState<Partial<Lecture>>({})
  const [hasLive, setHasLive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [liveLoading, setLiveLoading] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const [cRes, lRes] = await Promise.all([
      fetch('/api/courses'),
      fetch(`/api/lectures?courseId=${courseId}`)
    ])
    const allCourses: Course[] = await cRes.json()
    const lecs: Lecture[] = await lRes.json()
    setCourse(allCourses.find(c => c._id === courseId) ?? null)
    setLectures(lecs.sort((a, b) => a.order - b.order))
    setHasLive(!!lecs.find(l => l.liveClass?.isLive))
    setLoading(false)
  }
  useEffect(() => { load() }, [courseId])

  const openAdd = () => {
    setEditLecture(null)
    setForm({ courseId, title: '', description: '', order: lectures.length + 1, duration: '45 min', videoUrl: '', materials: [BLANK_MAT()], liveClass: null, isFree: false })
    setShowPanel(true)
  }
  const openEdit = (l: Lecture) => { setEditLecture(l); setForm({ ...l }); setShowPanel(true) }
  const addMat = () => setForm(f => ({ ...f, materials: [...(f.materials ?? []), BLANK_MAT()] }))
  const removeMat = (idx: number) => setForm(f => ({ ...f, materials: f.materials?.filter((_, i) => i !== idx) }))
  const updateMat = (idx: number, p: Partial<CourseMaterial>) =>
    setForm(f => ({ ...f, materials: f.materials?.map((m, i) => i === idx ? { ...m, ...p } : m) }))
  const toggleLiveForm = () =>
    setForm(f => ({ ...f, liveClass: f.liveClass ? null : { scheduledAt: '', meetingUrl: '', isLive: false, title: '' } }))

  const saveForm = async () => {
    if (!form.title?.trim()) return
    setSaving(true)
    try {
      if (editLecture) {
        const r = await fetch(`/api/lectures/${editLecture._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Failed to update')
        setLectures(ls => ls.map(l => l._id === editLecture._id ? data : l).sort((a, b) => a.order - b.order))
      } else {
        const r = await fetch('/api/lectures', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, courseId }) })
        const data = await r.json()
        if (!r.ok) throw new Error(data.error || 'Failed to create')
        setLectures(ls => [...ls, data].sort((a, b) => a.order - b.order))
      }
      setShowPanel(false)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    setLectures(ls => ls.filter(l => l._id !== id))
    await fetch(`/api/lectures/${id}`, { method: 'DELETE' })
  }

  const toggleLive = async (lec: Lecture) => {
    const next = !lec.liveClass?.isLive
    await fetch(`/api/lectures/${lec._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isLive: next }) })
    setLectures(ls => ls.map(l => l._id === lec._id && l.liveClass ? { ...l, liveClass: { ...l.liveClass, isLive: next } } : l))
    setHasLive(next)
  }

  const startJitsiLive = async (lec: Lecture) => {
    setLiveLoading(lec._id)
    try {
      // 1. Schedule a live session (creates jitsiRoomName in DB)
      const scheduleRes = await fetch('/api/sessions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          title: lec.title,
          scheduledAt: new Date().toISOString(),
        }),
      })
      const scheduleData = await scheduleRes.json()
      if (!scheduleRes.ok) throw new Error(scheduleData.error || 'Failed to schedule session')

      const sessionId = scheduleData.session._id
      const jitsiRoomName = scheduleData.session.jitsiRoomName

      // 2. Start the session immediately (marks status: 'active')
      const startRes = await fetch(`/api/sessions/${sessionId}/start`, { method: 'POST' })
      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error || 'Failed to start session')

      // 3. Mark lecture liveClass.isLive = true so students see the "Join Live" banner
      await fetch(`/api/lectures/${lec._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLive: true }),
      })
      setLectures(ls => ls.map(l =>
        l._id === lec._id && l.liveClass
          ? { ...l, liveClass: { ...l.liveClass, isLive: true } }
          : l
      ))
      setHasLive(true)

      // 4. Navigate admin to Jitsi room as host
      router.push(`/live/${encodeURIComponent(jitsiRoomName)}?title=${encodeURIComponent(lec.title)}&role=host`)
    } catch (e: any) {
      alert(`Go Live failed: ${e.message}`)
    } finally {
      setLiveLoading(null)
    }
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/courses" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '16px' }}>
          <ArrowLeft size={14} /> Back to Courses
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0 }}>
              {course?.title ?? 'Course'} — <span style={{ color: course?.color ?? '#f5a623' }}>Lectures</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: '13px' }}>
              {lectures.length} lectures · {lectures.filter(l => l.isFree).length} free · MongoDB
            </p>
          </div>
          <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', color: '#0a0a0a', fontWeight: 700, fontSize: '13px', cursor: 'pointer', border: 'none' }}>
            <Plus size={15} /> Add Lecture
          </button>
        </div>
      </div>

      {hasLive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ 
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '12px',
            background: 'rgba(255,107,53,0.12)',
            border: '1px solid rgba(255,107,53,0.35)',
            backdropFilter: 'blur(12px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b35' }} />
          <span style={{ color: '#ff6b35', fontWeight: 700, fontSize: '13px' }}>🔴 Live class in progress</span>
          <button
            onClick={() => {
              const liveLecture = lectures.find(l => l.liveClass?.isLive)
              if (liveLecture) {
                router.push(`/live?meetingId=${liveLecture.liveClass?.meetingUrl?.split('id=')[1]}&title=${encodeURIComponent(liveLecture.title)}&role=host`)
              }
            }}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Join Live
          </button>
        </motion.div>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} /> Loading from MongoDB…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {lectures.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Video size={36} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: '0 0 16px' }}>No lectures yet</p>
              <button onClick={openAdd} style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--accent-gold)', color: '#0a0a0a', fontWeight: 700, cursor: 'pointer', border: 'none', fontSize: '13px' }}>Add First Lecture</button>
            </div>
          )}
          {lectures.map((lec, i) => (
            <motion.div key={lec._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: 'rgba(14,22,48,0.7)', backdropFilter: 'blur(16px)', border: `1px solid ${lec.liveClass?.isLive ? 'rgba(255,107,53,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '16px', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, color: 'var(--text-muted)', paddingTop: '2px' }}>
                <GripVertical size={13} style={{ opacity: 0.3 }} />
                <span style={{ fontWeight: 700, fontSize: '13px', minWidth: '20px' }}>{lec.order}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '15px', margin: 0 }}>{lec.title}</h3>
                  {lec.isFree && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)' }}>FREE</span>}
                  {lec.liveClass?.isLive && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#ff6b35' }} />LIVE</span>}
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>{lec.description}</p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} />{lec.duration}</span>
                  {lec.videoUrl && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Video size={11} />Video</span>}
                  {(lec.materials || []).length > 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><FileText size={11} />{(lec.materials || []).length} material(s)</span>}
                  {lec.liveClass && <span style={{ fontSize: '11px', color: lec.liveClass.isLive ? '#ff6b35' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} />Live class</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button onClick={() => startJitsiLive(lec)} disabled={!!liveLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', color: '#0a0a0a', border: 'none', cursor: liveLoading ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 700, opacity: liveLoading === lec._id ? 0.7 : 1 }}>
                  {liveLoading === lec._id ? <Loader size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={11} />}
                  {liveLoading === lec._id ? 'Starting…' : 'Go Live Now'}
                </button>
                <button onClick={() => openEdit(lec)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: '12px' }}>
                  <Edit2 size={11} /> Edit
                </button>
                {lec.liveClass && (
                  <button onClick={() => toggleLive(lec)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', background: lec.liveClass.isLive ? 'rgba(255,107,53,0.12)' : 'rgba(0,229,255,0.08)', color: lec.liveClass.isLive ? '#ff6b35' : '#00e5ff', border: `1px solid ${lec.liveClass.isLive ? 'rgba(255,107,53,0.3)' : 'rgba(0,229,255,0.2)'}`, cursor: 'pointer', fontSize: '12px' }}>
                    {lec.liveClass.isLive ? <><WifiOff size={11} /> End Live</> : <><Wifi size={11} /> Toggle Live</>}
                  </button>
                )}
                <button onClick={() => remove(lec._id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,107,53,0.06)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.2)', cursor: 'pointer', fontSize: '12px' }}>
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide-in Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
            onClick={e => e.target === e.currentTarget && setShowPanel(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ width: '100%', maxWidth: '520px', height: '100vh', background: 'rgba(6,9,20,0.98)', borderLeft: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', padding: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
                <h2 style={{ margin: 0, fontWeight: 800, fontSize: '20px' }}>{editLecture ? 'Edit Lecture' : 'New Lecture'}</h2>
                <button onClick={() => setShowPanel(false)} style={{ padding: '8px', border: 'none', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div><label style={LS}>Title *</label><input value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Vowels — Svaras" style={S} /></div>
                <div><label style={LS}>Description</label><textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} style={{ ...S, resize: 'none' }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label style={LS}>Duration</label><input value={form.duration ?? ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="45 min" style={S} /></div>
                  <div><label style={LS}>Order</label><input type="number" value={form.order ?? 1} min={1} onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} style={S} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}>
                  <input type="checkbox" id="free" checked={form.isFree ?? false} onChange={e => setForm(f => ({ ...f, isFree: e.target.checked }))} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label htmlFor="free" style={{ fontSize: '13px', color: '#00e5ff', cursor: 'pointer', fontWeight: 600 }}>Mark as Free Preview</label>
                </div>
                <div><label style={LS}>🎥 Video URL</label><input value={form.videoUrl ?? ''} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/..." style={S} /></div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <label style={LS}>📎 Materials</label>
                    <button onClick={addMat} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}><Plus size={12} /> Add</button>
                  </div>
                  {(form.materials ?? []).map((mat, idx) => (
                    <div key={mat.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <select value={mat.type} onChange={e => updateMat(idx, { type: e.target.value as CourseMaterial['type'] })} style={{ ...S, width: '90px', flexShrink: 0, background: 'rgba(14,22,48,0.95)' }}>
                        <option value="pdf">PDF</option><option value="video">Video</option><option value="slides">Slides</option><option value="link">Link</option>
                      </select>
                      <input value={mat.name} onChange={e => updateMat(idx, { name: e.target.value })} placeholder="Name" style={{ ...S, flex: 1 }} />
                      <input value={mat.url} onChange={e => updateMat(idx, { url: e.target.value })} placeholder="URL" style={{ ...S, flex: 1 }} />
                      <button onClick={() => removeMat(idx)} style={{ padding: '8px', border: 'none', background: 'rgba(255,107,53,0.1)', borderRadius: '8px', cursor: 'pointer', color: '#ff6b35', flexShrink: 0 }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,107,53,0.06)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.liveClass ? '14px' : '0' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff6b35', display: 'flex', alignItems: 'center', gap: '6px' }}><Wifi size={14} />Live Class</span>
                    <button onClick={toggleLiveForm} style={{ padding: '5px 12px', borderRadius: '8px', background: form.liveClass ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${form.liveClass ? 'rgba(255,107,53,0.4)' : 'rgba(255,255,255,0.1)'}`, color: form.liveClass ? '#ff6b35' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                      {form.liveClass ? 'Remove' : 'Add Live Class'}
                    </button>
                  </div>
                  {form.liveClass && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input value={form.liveClass.title} onChange={e => setForm(f => f.liveClass ? { ...f, liveClass: { ...f.liveClass, title: e.target.value } } : f)} placeholder="Live class title" style={S} />
                      <input type="datetime-local" value={form.liveClass.scheduledAt?.slice(0, 16) ?? ''} onChange={e => setForm(f => f.liveClass ? { ...f, liveClass: { ...f.liveClass, scheduledAt: e.target.value + ':00Z' } } : f)} style={S} />
                      <input value={form.liveClass.meetingUrl} onChange={e => setForm(f => f.liveClass ? { ...f, liveClass: { ...f.liveClass, meetingUrl: e.target.value } } : f)} placeholder="Meet/Zoom link" style={S} />
                    </div>
                  )}
                </div>
                <button onClick={saveForm} disabled={saving} style={{ padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', color: '#0a0a0a', fontWeight: 800, fontSize: '15px', cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {saving ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />}
                  {saving ? 'Saving…' : editLecture ? 'Save Changes' : 'Add Lecture'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
