'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio, Loader, LogIn, Clock, AlertCircle } from 'lucide-react'

interface LiveStatus {
  isLive: boolean
  session?: {
    _id: string
    title: string
    description?: string
    startedAt: string
  }
  studentToken?: string
  meetingId?: string
  roomName?: string
  title?: string
  description?: string
  startedAt?: string
  message?: string
}

interface LiveClassStatusProps {
  courseId: string
  courseTitle: string
  userName: string
  userId: string
}

export default function LiveClassStatus({ 
  courseId, 
  courseTitle, 
  userName,
  userId 
}: LiveClassStatusProps) {
  const router = useRouter()
  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  // Poll interval in milliseconds (check every 10 seconds)
  const POLL_INTERVAL = 10000

  const checkLiveStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/live-status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await res.json().catch(() => ({ isLive: false }))

      if (!res.ok) {
        // If not enrolled or other error, just set not live
        setLiveStatus({ isLive: false, message: data.error || 'Error checking status' })
        setError(data.error || 'Error checking status')
        return
      }

      setLiveStatus(data)
      setError(null)
    } catch (err) {
      console.error('Failed to check live status:', err)
      setLiveStatus({ isLive: false })
    } finally {
      setLoading(false)
    }
  }, [courseId])

  // Initial check and polling setup
  useEffect(() => {
    // Initial check
    checkLiveStatus()

    // Set up polling interval
    const intervalId = setInterval(checkLiveStatus, POLL_INTERVAL)

    // Cleanup on unmount
    return () => clearInterval(intervalId)
  }, [checkLiveStatus])

  const handleJoinClass = async () => {
    if (!liveStatus?.isLive || !liveStatus.jitsiRoomName) return

    setJoining(true)

    try {
      // Navigate to the Jitsi live class page
      router.push(`/live/${liveStatus.jitsiRoomName}?title=${encodeURIComponent(liveStatus.title || 'Live Class')}&role=participant&name=${encodeURIComponent(userName)}`)
    } catch (err) {
      console.error('Failed to join class:', err)
      setError('Failed to join the live session')
      setJoining(false)
    }
  }

  // Format the duration since class started
  const getDuration = (startedAt?: string) => {
    if (!startedAt) return ''
    const start = new Date(startedAt).getTime()
    const now = Date.now()
    const diff = Math.floor((now - start) / 1000 / 60) // minutes
    
    if (diff < 1) return 'Just started'
    if (diff < 60) return `${diff} min`
    const hours = Math.floor(diff / 60)
    const mins = diff % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.6)' }}>
          <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '14px' }}>Checking live status...</span>
        </div>
      </div>
    )
  }

  // If not live, show subtle indicator
  if (!liveStatus?.isLive) {
    return (
      <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.4)' }}>
          <Radio size={18} />
          <span style={{ fontSize: '14px' }}>No active live session</span>
          {error && error.includes('not enrolled') && (
            <span style={{ fontSize: '12px', color: '#fbbf24', marginLeft: 'auto' }}>Enroll to join live classes</span>
          )}
        </div>
      </div>
    )
  }

  // If live, show glowing join button
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
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
            padding: '16px',
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
            {liveStatus.startedAt && (
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                <Clock size={12} />
                {getDuration(liveStatus.startedAt)}
              </span>
            )}
          </div>

          {/* Session title */}
          <h3 style={{ color: 'white', fontWeight: 600, margin: '0 0 4px' }}>
            {liveStatus.title || 'Live Class in Progress'}
          </h3>
          {liveStatus.description && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', margin: '0 0 16px' }}>{liveStatus.description}</p>
          )}

          {/* Join button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinClass}
            disabled={joining}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
            }}
          >
            {joining ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Joining...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Join Live Session
              </>
            )}
          </motion.button>

          {error && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontSize: '12px' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
