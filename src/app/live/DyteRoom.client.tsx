'use client'
// All Dyte SDK imports live here — this file is NEVER server-rendered.
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Wifi, Loader, ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { DyteProvider, useDyteClient } from '@dytesdk/react-web-core'
import { DyteMeeting } from '@dytesdk/react-ui-kit'

type Phase = 'loading' | 'ready' | 'error'

function MeetingRoom({ authToken }: { authToken: string }) {
  const [client, initClient] = useDyteClient()
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || !authToken) return
    initialized.current = true
    initClient({ authToken, defaults: { audio: false, video: false } })
  }, [authToken, initClient])

  return (
    <DyteProvider value={client}>
      <div style={{ height: '100vh', width: '100%' }}>
        <DyteMeeting mode="fill" meeting={client!} showSetupScreen />
      </div>
    </DyteProvider>
  )
}

function Inner() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const meetingId = searchParams.get('meetingId')
  const lectureTitle = searchParams.get('title') ?? 'Live Lecture'
  const role = searchParams.get('role') ?? 'participant'

  const [phase, setPhase] = useState<Phase>('loading')
  const [authToken, setAuthToken] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!meetingId) { setError('No meeting ID provided.'); setPhase('error'); return }
    const userName = session?.user?.name ?? 'Student'
    fetch('/api/dyte/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetingId, name: userName, role }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); setPhase('error'); return }
        setAuthToken(data.authToken); setPhase('ready')
      })
      .catch(e => { setError(String(e)); setPhase('error') })
  }, [meetingId, session, role])

  if (phase === 'loading') return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', gap: '16px' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Loader size={32} style={{ color: 'var(--accent-gold)' }} />
      </motion.div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Joining: <strong style={{ color: 'var(--accent-gold)' }}>{lectureTitle}</strong></p>
    </div>
  )

  if (phase === 'error') return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', gap: '20px', padding: '40px' }}>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={24} style={{ color: '#ff6b35' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px' }}>Could not join the class</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: 0 }}>{error}</p>
      </div>
      <Link href="/courses" style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--accent-gold)', color: '#0a0a0a', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
        Back to Courses
      </Link>
    </div>
  )

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(6,9,20,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,107,53,0.3)' }}>
        <Link href={role === 'host' ? '/admin/courses' : '/courses'} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px' }}>
          <ArrowLeft size={14} /> Exit
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b35' }} />
          <span style={{ fontSize: '13px', color: '#ff6b35', fontWeight: 700 }}>LIVE</span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{lectureTitle}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Wifi size={13} style={{ color: '#ff6b35' }} /> {role === 'host' ? '🎙 Hosting' : 'Joined as student'}
        </div>
      </div>
      <div style={{ paddingTop: '50px', height: '100%' }}>
        <MeetingRoom authToken={authToken} />
      </div>
    </div>
  )
}

export default function DyteRoom() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060914' }}>
        <Loader size={32} style={{ color: '#f5a623', animation: 'spin 1s linear infinite' }} />
      </div>
    }>
      <Inner />
    </Suspense>
  )
}
