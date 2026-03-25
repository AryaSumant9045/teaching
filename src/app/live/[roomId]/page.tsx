'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Loader, ArrowLeft, AlertCircle, Wifi } from 'lucide-react'

declare global {
  interface Window { JitsiMeetExternalAPI: any }
}

// Default to free meet.jit.si — no API key required.
// To use paid 8x8.vc JaaS, set NEXT_PUBLIC_JITSI_DOMAIN=8x8.vc and NEXT_PUBLIC_JITSI_APP_ID in .env.local
const JITSI_DOMAIN =
  (typeof window !== 'undefined' && (window as any).__jitsiDomain) ||
  process.env.NEXT_PUBLIC_JITSI_DOMAIN ||
  'meet.jit.si'

const JITSI_APP_ID = process.env.NEXT_PUBLIC_JITSI_APP_ID ?? ''

type Phase = 'loadingScript' | 'ready' | 'error'

export default function JitsiMeetingRoom() {
  const params = useParams<{ roomId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()

  const roomId = decodeURIComponent(params.roomId ?? '')
  const title = searchParams.get('title') ?? 'Live Class'
  const role = searchParams.get('role') ?? 'participant'
  const userName = searchParams.get('name') ?? session?.user?.name ?? 'Student'
  const userEmail = session?.user?.email ?? ''

  const [phase, setPhase] = useState<Phase>('loadingScript')
  const [error, setError] = useState('')
  const jitsiContainerRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<any>(null)
  const scriptLoaded = useRef(false)

  // ── Step 1: Load Jitsi external_api.js script ──────────────────────────────
  useEffect(() => {
    if (!roomId) {
      setError('No room ID provided.')
      setPhase('error')
      return
    }

    // If already on page (hot-reload), skip
    if (document.getElementById('jitsi-api-script') && window.JitsiMeetExternalAPI) {
      scriptLoaded.current = true
      setPhase('ready') // DOM container will render; Step 2 useEffect mounts Jitsi
      return
    }

    const script = document.createElement('script')
    script.id = 'jitsi-api-script'
    script.src = `https://${JITSI_DOMAIN}/external_api.js`
    script.async = true
    script.onload = () => {
      scriptLoaded.current = true
      setPhase('ready') // Trigger re-render so jitsiContainerRef.current becomes valid
    }
    script.onerror = () => {
      setError(`Failed to load Jitsi meeting SDK from ${JITSI_DOMAIN}`)
      setPhase('error')
    }
    document.head.appendChild(script)

    return () => {
      if (apiRef.current) {
        try { apiRef.current.dispose() } catch (_) {}
        apiRef.current = null
      }
    }
  }, [roomId])

  // ── Step 2: Mount Jitsi AFTER DOM has rendered the container ───────────────
  // This runs AFTER phase='ready' causes the container div to appear in the DOM
  useEffect(() => {
    if (phase !== 'ready' || apiRef.current) return

    // Small delay to ensure React has flushed the DOM update
    const timer = setTimeout(() => {
      if (!jitsiContainerRef.current || !window.JitsiMeetExternalAPI) {
        setError('Jitsi container not ready. Please refresh.')
        setPhase('error')
        return
      }

      const fullRoomName = JITSI_APP_ID
        ? `${JITSI_APP_ID}/${roomId}`
        : roomId

      const toolbarButtons = role === 'host'
        ? ['microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat',
            'recording', 'settings', 'raisehand', 'videoquality',
            'filmstrip', 'tileview', 'download', 'help', 'mute-everyone', 'security']
        : ['microphone', 'camera', 'fullscreen', 'fodeviceselection',
            'hangup', 'profile', 'chat', 'raisehand', 'videoquality', 'tileview', 'filmstrip']

      try {
        apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: fullRoomName,
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: userName, email: userEmail },
          configOverwrite: {
            startWithAudioMuted: role !== 'host',
            startWithVideoMuted: role !== 'host',
            prejoinPageEnabled: false,
            enableWelcomePage: false,
            disableDeepLinking: true,
            subject: title,
            toolbarButtons,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            TOOLBAR_ALWAYS_VISIBLE: true,
            MOBILE_APP_PROMO: false,
          },
          ...(JITSI_APP_ID && process.env.NEXT_PUBLIC_JITSI_JWT
            ? { jwt: process.env.NEXT_PUBLIC_JITSI_JWT }
            : {}),
        })

        apiRef.current.on('readyToClose', () => {
          router.push(role === 'host' ? '/admin/courses' : '/courses')
        })
      } catch (e: any) {
        setError(`Could not start meeting: ${e.message}`)
        setPhase('error')
      }
    }, 100) // 100ms ensures React has committed the DOM

    return () => clearTimeout(timer)
  }, [phase]) // only re-run when phase changes to 'ready'

  // ── Loading ────────────────────────────────────────────────────────────────
  if (phase === 'loadingScript') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060914', gap: '16px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader size={32} style={{ color: '#f5a623' }} />
        </motion.div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
          Joining: <strong style={{ color: '#f5a623' }}>{title}</strong>
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
          Loading meeting SDK…
        </p>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#060914', gap: '20px', padding: '40px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={24} style={{ color: '#ff6b35' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px', color: 'white' }}>Could not join the class</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', maxWidth: '400px', margin: 0 }}>{error}</p>
        </div>
        <button
          onClick={() => router.push(role === 'host' ? '/admin/courses' : '/courses')}
          style={{ padding: '10px 24px', borderRadius: '10px', background: '#f5a623', color: '#0a0a0a', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer' }}
        >
          Back to Courses
        </button>
      </div>
    )
  }

  // ── Ready: Jitsi mounts into jitsiContainerRef ─────────────────────────────
  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative', background: '#000' }}>
      {/* Top header bar — non-blocking */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px',
        background: 'rgba(6,9,20,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,107,53,0.3)',
      }}>
        <button
          onClick={() => router.push(role === 'host' ? '/admin/courses' : '/courses')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}
        >
          <ArrowLeft size={14} /> Exit
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b35' }} />
          <span style={{ fontSize: '13px', color: '#ff6b35', fontWeight: 700 }}>LIVE</span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'white' }}>{title}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
          <Wifi size={13} style={{ color: '#ff6b35' }} />
          {role === 'host' ? '🎙 Hosting' : 'Joined as student'}
        </div>
      </div>

      {/* Jitsi mounts here — this div MUST exist before initJitsi() runs */}
      <div
        ref={jitsiContainerRef}
        style={{ position: 'absolute', top: '44px', left: 0, right: 0, bottom: 0 }}
      />
    </div>
  )
}
