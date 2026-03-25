'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader, ArrowLeft, AlertCircle, Wifi, Languages } from 'lucide-react'

// Temporarily remove Jitsi import until installed
// import { JaaSMeeting, JitsiMeeting } from '@jitsi/react-sdk'

const translations = {
  en: {
    joining: 'Joining:',
    couldNotJoin: 'Could not join the class',
    backToCourses: 'Back to Courses',
    exit: 'Exit',
    live: 'LIVE',
    hosting: '🎙 Hosting',
    joinedAsStudent: 'Joined as student'
  },
  hi: {
    joining: 'शामिल हो रहे हैं:',
    couldNotJoin: 'कक्षा में शामिल नहीं हो सके',
    backToCourses: 'पाठ्यक्रमों पर वापस जाएं',
    exit: 'बाहर निकलें',
    live: 'लाइव',
    hosting: '🎙 होस्ट कर रहे हैं',
    joinedAsStudent: 'छात्र के रूप में शामिल हुए'
  }
}

type Phase = 'loading' | 'ready' | 'error'

export default function JitsiMeetingRoom() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  
  const roomId = searchParams.get('roomId')
  const title = searchParams.get('title') ?? 'Live Class'
  const role = searchParams.get('role') ?? 'participant'
  const userName = searchParams.get('name') ?? session?.user?.name ?? 'User'

  const [phase, setPhase] = useState<Phase>('loading')
  const [error, setError] = useState('')
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = translations[lang]

  useEffect(() => {
    if (!roomId) {
      setError('No room ID provided.')
      setPhase('error')
      return
    }
    setPhase('ready')
  }, [roomId])

  // Jitsi configuration based on user role
  const configOverwrite = role === 'host' ? {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    preJoinPageEnabled: false,
    enableWelcomePage: false,
    enableRecording: true,
    dropbox: {
      appKey: process.env.NEXT_PUBLIC_JITSI_DROPBOX_APP_KEY
    },
    liveStreaming: {
      enabled: true,
      youtubeStreamKey: process.env.NEXT_PUBLIC_YOUTUBE_STREAM_KEY
    },
    subject: title,
    displayName: userName
  } : {
    startWithAudioMuted: true,
    startWithVideoMuted: true,
    preJoinPageEnabled: false,
    enableWelcomePage: false,
    enableRecording: false,
    disableModeratorIndicator: true,
    disableSelfView: false,
    disableRemoteMute: true,
    disableRemoteControls: true,
    subject: title,
    displayName: userName
  }

  const interfaceConfigOverwrite = {
    TOOLBAR_BUTTONS: role === 'host' 
      ? [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'info', 'chat',
          'recording', 'livestreaming', 'etherpad', 'sharedvideo', 'settings',
          'raisehand', 'videoquality', 'filmstrip', 'tileview', 'e2ee',
          'download', 'help', 'mute-everyone', 'security'
        ]
      : [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'raisehand',
          'videoquality', 'filmstrip', 'tileview', 'settings', 'help'
        ],
    SETTINGS_SECTIONS: role === 'host' 
      ? ['devices', 'language', 'moderator', 'profile', 'calendar']
      : ['devices', 'language', 'profile'],
    SHOW_CHROMETAB_BAR: false
  }

  const userInfo = {
    displayName: userName,
    email: session?.user?.email || ''
  }

  if (phase === 'loading') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', gap: '16px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader size={32} style={{ color: 'var(--accent-gold)' }} />
        </motion.div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>{t.joining} <strong style={{ color: 'var(--accent-gold)' }}>{title}</strong></p>
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', gap: '20px', padding: '40px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AlertCircle size={24} style={{ color: '#ff6b35' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 8px' }}>{t.couldNotJoin}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '400px', margin: 0 }}>{error}</p>
        </div>
        <button
          onClick={() => router.push(role === 'host' ? '/admin/courses' : '/courses')}
          style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--accent-gold)', color: '#0a0a0a', fontWeight: 700, textDecoration: 'none', fontSize: '14px', border: 'none', cursor: 'pointer' }}
        >
          {t.backToCourses}
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Language Toggle Button */}
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        style={{
          position: 'absolute',
          top: '60px',
          right: '16px',
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '9999px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
          e.currentTarget.style.borderColor = 'rgba(255,107,53,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
        }}
      >
        <Languages size={18} style={{ color: '#ff6b35' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: lang === 'en' ? 'rgba(255,255,255,0.8)' : '#fff' }}>
          {lang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>

      {/* Header Bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'rgba(6,9,20,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,107,53,0.3)'
      }}>
        <button
          onClick={() => router.push(role === 'host' ? '/admin/courses' : '/courses')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '13px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={14} /> {t.exit}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff6b35' }} />
          <span style={{ fontSize: '13px', color: '#ff6b35', fontWeight: 700 }}>{t.live}</span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{title}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Wifi size={13} style={{ color: '#ff6b35' }} /> {role === 'host' ? t.hosting : t.joinedAsStudent}
        </div>
      </div>

      {/* Jitsi Meeting */}
      <div style={{ 
        position: 'absolute',
        top: '50px',
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100vh - 50px)',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ 
          padding: '40px', 
          borderRadius: '16px', 
          background: 'rgba(255,255,255,0.1)', 
          border: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <h3 style={{ color: '#ff6b35', margin: '0 0 20px', fontSize: '24px' }}>
            🎥 Jitsi Live Class
          </h3>
          <p style={{ color: 'white', margin: '0 0 20px', fontSize: '16px' }}>
            Room: <strong>{roomId}</strong>
          </p>
          <p style={{ color: 'white', margin: '0 0 20px', fontSize: '16px' }}>
            Title: <strong>{title}</strong>
          </p>
          <p style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', fontSize: '14px' }}>
            Role: <strong>{role}</strong> | User: <strong>{userName}</strong>
          </p>
          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            background: 'rgba(255,107,53,0.2)', 
            border: '1px solid rgba(255,107,53,0.4)',
            margin: '20px 0'
          }}>
            <p style={{ color: '#ff6b35', margin: 0, fontSize: '14px', fontWeight: 600 }}>
              🔧 Jitsi SDK Installation Required
            </p>
            <p style={{ color: 'white', margin: '10px 0 0', fontSize: '13px' }}>
              Please install the Jitsi SDK to enable live video functionality:
            </p>
            <code style={{ 
              display: 'block', 
              background: 'rgba(0,0,0,0.3)', 
              padding: '10px', 
              borderRadius: '8px', 
              color: '#00e5ff', 
              fontSize: '12px',
              margin: '10px 0'
            }}>
              npm install @jitsi/react-sdk
            </code>
          </div>
          <button
            onClick={() => router.push(role === 'host' ? '/admin/courses' : '/courses')}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff6b35, #f5a623)',
              color: '#0a0a0a',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Hidden container for Jitsi iframe */}
      <div id="jitsi-container" style={{ display: 'none' }} />
    </div>
  )
}
