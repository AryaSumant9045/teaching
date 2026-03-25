'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Clock, Users, Loader, Plus, Video } from 'lucide-react'

interface Course {
  _id: string
  title: string
  color: string
}

interface ScheduleFormProps {
  course: Course
  onSessionCreated?: () => void
}

export default function ScheduleLiveClass({ course, onSessionCreated }: ScheduleFormProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    scheduledAt: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.scheduledAt) return

    setLoading(true)
    try {
      const res = await fetch('/api/sessions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          title: formData.title,
          scheduledAt: formData.scheduledAt
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setShowForm(false)
      setFormData({ title: '', scheduledAt: '' })
      onSessionCreated?.()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const startNow = async () => {
    if (!formData.title) {
      alert('Please enter a title for the live class')
      return
    }

    setLoading(true)
    try {
      // Schedule for immediate start
      const now = new Date()
      const scheduledAt = now.toISOString()

      const res = await fetch('/api/sessions/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course._id,
          title: formData.title,
          scheduledAt
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Start the session immediately
      const startRes = await fetch(`/api/sessions/${data.session._id}/start`, {
        method: 'POST'
      })

      const startData = await startRes.json()
      if (!startRes.ok) throw new Error(startData.error)

      // Navigate to Jitsi room
      router.push(`/live/${data.session.jitsiRoomName}?role=host&title=${encodeURIComponent(formData.title)}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff6b35, #f5a623)',
            color: '#0a0a0a',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <Video size={18} />
          Schedule Live Class
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '24px',
            borderRadius: '16px',
            background: 'rgba(14,22,48,0.7)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 700, color: 'white' }}>
            Schedule Live Class for {course.title}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#00e5ff' }}>
                Class Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Introduction to Sanskrit Grammar"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 600, color: '#00e5ff' }}>
                Schedule Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                min={new Date().toISOString().slice(0, 16)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #ff6b35, #f5a623)',
                  color: '#0a0a0a',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Calendar size={16} />}
                {loading ? 'Scheduling...' : 'Schedule Class'}
              </button>

              <button
                type="button"
                onClick={startNow}
                disabled={loading}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'rgba(0,229,255,0.2)',
                  color: '#00e5ff',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: '1px solid rgba(0,229,255,0.3)',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Video size={16} />}
                Start Now
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}
