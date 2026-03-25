'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Clock, Calendar, Users, Loader, Wifi } from 'lucide-react'

interface LiveSession {
  _id: string
  courseId: string
  jitsiRoomName: string
  title: string
  scheduledAt: string
  status: 'scheduled' | 'active' | 'completed'
  startedAt?: string
}

interface LiveClassScheduleProps {
  courseId: string
  courseTitle: string
  userName: string
  userId: string
}

export default function LiveClassSchedule({ courseId, courseTitle, userName, userId }: LiveClassScheduleProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/sessions`)
        const data = await res.json()
        if (res.ok) {
          setSessions(data.sessions)
        }
      } catch (error) {
        console.error('Failed to fetch sessions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [courseId])

  const handleJoinClass = async (session: LiveSession) => {
    setJoining(true)
    try {
      // Navigate to Jitsi room
      router.push(`/live/${session.jitsiRoomName}?role=participant&title=${encodeURIComponent(session.title)}&name=${encodeURIComponent(userName)}`)
    } catch (error) {
      console.error('Failed to join class:', error)
      setJoining(false)
    }
  }

  const getCountdown = (scheduledAt: string) => {
    const now = new Date()
    const scheduled = new Date(scheduledAt)
    const diff = scheduled.getTime() - now.getTime()

    if (diff <= 0) return 'Starting soon...'

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const activeSession = sessions.find(s => s.status === 'active')
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && new Date(s.scheduledAt) > new Date())

  if (loading) {
    return (
      <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)' }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '14px' }}>Loading live classes...</span>
        </div>
      </div>
    )
  }

  if (!loading && sessions.length === 0) {
    return (
      <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.4)' }}>
          <Calendar size={18} />
          <span style={{ fontSize: '14px' }}>No live classes scheduled</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Active Live Class */}
      <AnimatePresence>
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}
          >
            {/* Glowing background effect */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(239, 68, 68, 0.3) 50%, rgba(245, 158, 11, 0.3) 100%)',
                filter: 'blur(20px)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />

            <div
              style={{
                position: 'relative',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid rgba(245, 158, 11, 0.5)',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(20, 20, 30, 0.95) 100%)',
                boxShadow: '0 0 30px rgba(245, 158, 11, 0.3), inset 0 0 30px rgba(245, 158, 11, 0.1)'
              }}
            >
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ position: 'relative', display: 'flex', height: '12px', width: '12px' }}>
                  <span
                    style={{
                      position: 'absolute',
                      display: 'inline-flex',
                      height: '100%',
                      width: '100%',
                      borderRadius: '50%',
                      background: '#f87171',
                      opacity: 0.75,
                      animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
                    }}
                  />
                  <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '100%', width: '100%', background: '#ef4444' }} />
                </span>
                <span style={{ color: '#f87171', fontWeight: 600, fontSize: '14px', letterSpacing: '0.05em' }}>LIVE NOW</span>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginLeft: 'auto' }}>
                  Started at {new Date(activeSession.startedAt!).toLocaleTimeString()}
                </span>
              </div>

              {/* Session title */}
              <h3 style={{ color: 'white', fontWeight: 600, margin: '0 0 8px', fontSize: '16px' }}>
                {activeSession.title}
              </h3>

              {/* Join button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleJoinClass(activeSession)}
                disabled={joining}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: joining ? 'not-allowed' : 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
                  opacity: joining ? 0.7 : 1
                }}
              >
                {joining ? (
                  <>
                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Joining...
                  </>
                ) : (
                  <>
                    <Video size={18} />
                    Join Live Class
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Classes */}
      {upcomingSessions.length > 0 && (
        <div>
          <h4 style={{ color: 'white', fontWeight: 600, margin: '0 0 12px', fontSize: '14px' }}>
            Upcoming Classes
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingSessions.map((session) => (
              <div
                key={session._id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Calendar size={16} style={{ color: '#00e5ff' }} />
                  <span style={{ color: 'white', fontWeight: 500, fontSize: '14px' }}>
                    {session.title}
                  </span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Clock size={14} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                    {new Date(session.scheduledAt).toLocaleString()}
                  </span>
                  <span style={{ color: '#f5a623', fontSize: '12px', fontWeight: 600, marginLeft: 'auto' }}>
                    {getCountdown(session.scheduledAt)}
                  </span>
                </div>

                <button
                  onClick={() => handleJoinClass(session)}
                  disabled={session.status !== 'active'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: session.status === 'active' ? 'pointer' : 'not-allowed',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: session.status === 'active' 
                      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: session.status === 'active' ? '#0a0a0a' : 'rgba(255,255,255,0.5)',
                    opacity: session.status === 'active' ? 1 : 0.6
                  }}
                >
                  {session.status === 'active' ? (
                    <>
                      <Wifi size={14} />
                      Join Now
                    </>
                  ) : (
                    <>
                      <Clock size={14} />
                      Scheduled
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
