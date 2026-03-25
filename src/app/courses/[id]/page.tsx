'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Clock, Users, Star, BookOpen, Lock, Play, FileText,
  Video, Link2, Download, Wifi, Calendar, ExternalLink,
  CheckCircle, Loader, ChevronLeft, ChevronRight, ChevronDown,
  AlertCircle, X, Menu, BookMarked
} from 'lucide-react'
import LiveClassStatus from '@/components/LiveClassStatus'
import LiveClassSchedule from '@/components/student/LiveClassSchedule'
import CourseVideoPlayer from '@/components/ui/CourseVideoPlayer'

interface CourseMaterial { id: string; name: string; type: string; url: string }
interface LiveClass { scheduledAt: string; meetingUrl: string; isLive: boolean; title: string }
interface Lecture {
  _id: string; title: string; description: string; order: number
  duration: string; videoUrl: string; materials: CourseMaterial[]
  liveClass: LiveClass | null; isFree: boolean
}
interface Course {
  _id: string; title: string; description: string; category: string
  color: string; students: number; rating: number; totalLectures: number; duration: string
  isFree?: boolean; price?: number
}

const MAT_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, video: Video, slides: BookOpen, link: Link2
}
const MAT_COLORS: Record<string, string> = {
  pdf: '#ff6b35', video: '#a78bfa', slides: '#f5a623', link: '#00e5ff'
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [course, setCourse] = useState<Course | null>(null)
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [activeLec, setActiveLec] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedLec, setExpandedLec] = useState<string | null>(null)

  // Track completed lectures (in-session only)
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  // Purchases logic
  const [isPurchased, setIsPurchased] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/courses').then(r => { 
        if (!r.ok) throw new Error(`HTTP ${r.status}`); 
        return r.json().catch(() => []);
      }),
      fetch(`/api/lectures?courseId=${id}`).then(r => { 
        if (!r.ok) throw new Error(`HTTP ${r.status}`); 
        return r.json().catch(() => []);
      }),
      fetch(`/api/purchases/check?resourceId=${id}&resourceType=course`).then(r => 
        r.json().catch(() => ({ purchased: false }))
      )
    ]).then(([courses, lecs, purchaseData]: [Course[], Lecture[], any]) => {
      const found = Array.isArray(courses) ? courses.find(c => c._id === id) ?? null : null
      setCourse(found)
      const sorted = Array.isArray(lecs) ? lecs.sort((a, b) => a.order - b.order) : []
      setLectures(sorted)
      if (sorted.length > 0) setActiveLec(sorted[0])
      
      setIsPurchased(purchaseData?.purchased || false)
      setUserId(purchaseData?.userId || null)
      
      setLoading(false)
    }).catch(e => { setError(String(e)); setLoading(false) })
  }, [id])

  const isLockedCourse = course && course.isFree === false && !isPurchased;

  const handlePay = async () => {
    if (!course || !course.price || !userId) {
      if (!userId) alert('Please log in first to purchase.');
      return;
    }
    setPaying(true);
    try {
      const r = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: course.price, resourceId: course._id, resourceType: 'course' })
      });
      const data = await r.json().catch(() => ({}));
      if (!data.order) throw new Error(data.error || 'Order creation failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: course.price * 100,
        currency: 'INR',
        name: 'SanskritAI',
        description: `Purchase ${course.title}`,
        order_id: data.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              resourceId: course._id,
              resourceType: 'course',
              amount: course.price
            })
          });
          const verifyData = await verifyRes.json().catch((e) => {
            console.error('Error parsing verification response:', e);
            return {};
          });
          if (verifyData.success) {
            setIsPurchased(true);
          }
        },
        theme: { color: course.color || '#ff6b35' }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment.');
    } finally {
      setPaying(false);
    }
  };

  const selectLecture = (lec: Lecture) => {
    setActiveLec(lec)
    setSidebarOpen(false) // close sidebar on pick (mobile feel)
    setExpandedLec(null)
  }

  const markDone = () => {
    if (!activeLec) return
    setCompleted(prev => { const n = new Set(prev); n.add(activeLec._id); return n })
    // Auto advance to next lecture
    const idx = lectures.findIndex(l => l._id === activeLec._id)
    if (idx < lectures.length - 1) setActiveLec(lectures[idx + 1])
  }

  const joinLive = (lec: Lecture) => {
    const meetingId = localStorage.getItem(`dyte_meeting_${lec._id}`)
    if (meetingId) router.push(`/live?meetingId=${meetingId}&title=${encodeURIComponent(lec.title)}&role=participant`)
    else if (lec.liveClass?.meetingUrl) window.open(lec.liveClass.meetingUrl, '_blank')
  }

  const liveNow = lectures.find(l => l.liveClass?.isLive)
  const activeLecIdx = lectures.findIndex(l => l._id === activeLec?._id)
  const prevLec = activeLecIdx > 0 ? lectures[activeLecIdx - 1] : null
  const nextLec = activeLecIdx < lectures.length - 1 ? lectures[activeLecIdx + 1] : null
  const progressPct = lectures.length > 0 ? Math.round((completed.size / lectures.length) * 100) : 0

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', flexDirection: 'column', gap: '14px' }}>
      <Loader size={28} style={{ color: 'var(--accent-gold)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading course…</p>
    </div>
  )

  if (error || !course) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', flexDirection: 'column', gap: '16px', padding: '40px' }}>
      <AlertCircle size={40} style={{ color: '#ff6b35' }} />
      <h2 style={{ margin: 0 }}>Course not found</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>{error || 'This course does not exist.'}</p>
      <Link href="/courses" style={{ padding: '10px 24px', borderRadius: '10px', background: 'var(--accent-gold)', color: '#0a0a0a', fontWeight: 700, textDecoration: 'none', fontSize: '14px' }}>
        Back to Courses
      </Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* ── TOP NAV BAR ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/courses" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', flexShrink: 0, padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={14} /> Courses
        </Link>

        <button onClick={() => setSidebarOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: sidebarOpen ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${sidebarOpen ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.08)'}`, color: sidebarOpen ? 'var(--accent-gold)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
          <Menu size={14} /> {sidebarOpen ? 'Hide' : 'Show'} Lectures
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</p>
          {activeLec && <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Lecture {activeLec.order}: {activeLec.title}</p>}
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ width: '100px', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: course.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: course.color }}>{progressPct}%</span>
        </div>

        {/* Live badge */}
        {liveNow && (
          <motion.button animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            onClick={() => joinLive(liveNow)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.5)', color: '#ff6b35', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b35' }} />
            🔴 Join Live
          </motion.button>
        )}
      </div>

      {/* ── BODY (sidebar + content) ── */}
      <div style={{ display: 'flex', marginTop: '64px', flex: 1, minHeight: 'calc(100vh - 64px)', position: 'relative' }}>

        {/* ══ SIDEBAR ══ */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 35, stiffness: 320 }}
              className="fixed inset-0 z-[300] md:relative md:inset-auto md:z-50 h-[100dvh] md:h-full w-full md:w-[320px] md:min-w-[320px]"
              style={{ background: 'rgba(8,12,28,0.98)', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto', flexShrink: 0, boxShadow: '4px 0 24px rgba(0,0,0,0.5)' }}>

              {/* Sidebar Header */}
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'rgba(8,12,28,0.98)', backdropFilter: 'blur(12px)', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Link href="/courses" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '8px', color: 'var(--text-muted)', textDecoration: 'none' }} className="md:hidden font-bold text-[13px] hover:text-white transition-colors">
                      <ArrowLeft size={14} /> Courses
                    </Link>
                    <BookMarked size={14} style={{ color: course.color }} className="hidden md:block" />
                    <span style={{ fontWeight: 800, fontSize: '13px' }}>Course Contents</span>
                  </div>

                  {/* Right side controls */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Mobile Only: 0% + Hide Button */}
                    <div className="md:hidden flex items-center gap-3">
                      <span style={{ fontSize: '11px', fontWeight: 800, color: course.color }}>{progressPct}%</span>
                      <button onClick={() => setSidebarOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.4)', color: 'var(--accent-gold)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        <X size={12} /> Hide
                      </button>
                    </div>

                    {/* Desktop Only: Close X */}
                    <button className="hidden md:flex" onClick={() => setSidebarOpen(false)} style={{ padding: '4px', border: 'none', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span>{lectures.length} lectures</span>
                  <span>·</span>
                  <span>{completed.size} completed</span>
                  <span className="hidden md:inline">·</span>
                  <span className="hidden md:inline" style={{ color: course.color, fontWeight: 700 }}>{progressPct}%</span>
                </div>
                {/* Mini progress bar */}
                <div style={{ marginTop: '8px', height: '2px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: `${progressPct}%`, height: '100%', background: `linear-gradient(90deg, ${course.color}, ${course.color}88)`, transition: 'width 0.5s' }} />
                </div>

                {/* Live Class Status for Enrolled Students */}
                {isPurchased && course && userId && (
                  <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                    <LiveClassStatus 
                      courseId={course._id}
                      courseTitle={course.title}
                      userName={session?.user?.name || 'Student'}
                      userId={userId}
                    />
                  </div>
                )}
              </div>

              {/* Lecture List */}
              <div style={{ padding: '8px 0' }}>
                {lectures.map((lec, i) => {
                  const isActive = activeLec?._id === lec._id
                  const isDone = completed.has(lec._id)
                  const isLocked = isLockedCourse && !lec.isFree // Lock lectures if course is paid and unpurchased
                  const isExpanded = expandedLec === lec._id

                  return (
                    <div key={lec._id}>
                      {/* Lecture Row */}
                      <div
                        onClick={() => {
                          if (isLocked) return
                          if (isExpanded) setExpandedLec(null)
                          else setExpandedLec(lec._id)
                          selectLecture(lec)
                        }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '10px',
                          padding: '12px 18px', cursor: isLocked ? 'not-allowed' : 'pointer',
                          background: isActive ? `${course.color}12` : 'transparent',
                          borderLeft: `3px solid ${isActive ? course.color : 'transparent'}`,
                          opacity: isLocked ? 0.45 : 1,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { if (!isActive && !isLocked) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)' }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
                      >
                        {/* Status icon */}
                        <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: isActive ? `${course.color}25` : isDone ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                          {isLocked ? <Lock size={10} style={{ color: 'var(--text-muted)' }} />
                            : isDone ? <CheckCircle size={11} style={{ color: '#34d399' }} fill="#34d399" />
                            : isActive ? <Play size={11} style={{ color: course.color }} fill={course.color} />
                            : <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{lec.order}</span>}
                        </div>

                        {/* Title + meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: isActive ? 700 : 500, color: isActive ? course.color : isDone ? '#34d399' : 'var(--text-primary)', lineHeight: 1.35 }}>{lec.title}</p>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={8} />{lec.duration}</span>
                            {lec.isFree && <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '99px', background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>Free</span>}
                            {lec.liveClass?.isLive && (
                              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                                style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '99px', background: 'rgba(255,107,53,0.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,0.3)' }}>
                                🔴 Live
                              </motion.span>
                            )}
                            {lec.materials.length > 0 && <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}><FileText size={8} />{lec.materials.length}</span>}
                          </div>
                        </div>

                        {/* Expand toggle */}
                        {lec.materials.length > 0 && !isLocked && (
                          <ChevronDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '5px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }} />
                        )}
                      </div>

                      {/* ── MATERIALS ACCORDION ── */}
                      <AnimatePresence>
                        {isExpanded && lec.materials.length > 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '4px 18px 12px 54px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {lec.materials.map(mat => {
                                const Icon = MAT_ICONS[mat.type] ?? Link2
                                const mc = MAT_COLORS[mat.type] ?? '#888'
                                return (
                                  <a key={mat.id} href={mat.url || '#'} target="_blank" rel="noopener"
                                    onClick={e => !mat.url && e.preventDefault()}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: `${mc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Icon size={11} style={{ color: mc }} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ margin: 0, fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name || 'Material'}</p>
                                      <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.type}</p>
                                    </div>
                                    <Download size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                  </a>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ MAIN CONTENT ══ */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '28px 32px 60px' }}>

          {activeLec ? (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

              {/* Live Class Banner for Enrolled Students */}
              {isPurchased && course && userId && (
                <div style={{ marginBottom: '24px' }}>
                  <LiveClassStatus 
                    courseId={course._id}
                    courseTitle={course.title}
                    userName={session?.user?.name || 'Student'}
                    userId={userId}
                  />
                </div>
              )}

              {/* Video Player */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '16/9', border: `1px solid ${course.color}30`, boxShadow: `0 0 50px ${course.color}18`, marginBottom: '24px' }}>
                {isLockedCourse && !activeLec.isFree ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,22,48,0.95)', gap: '14px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${course.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={24} style={{ color: course.color }} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                      This course requires a one-time purchase to unlock full access.<br />
                      <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', display: 'block', marginTop: '6px' }}>₹{course.price}</span>
                    </p>
                    <button onClick={handlePay} disabled={paying} style={{ padding: '10px 24px', borderRadius: '10px', background: `linear-gradient(135deg, ${course.color}, ${course.color}aa)`, color: '#0a0a0a', fontWeight: 800, fontSize: '14px', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                      {paying ? 'Processing...' : `Buy Course for ₹${course.price}`}
                    </button>
                  </div>
                ) : activeLec.videoUrl ? (
                  <CourseVideoPlayer videoUrl={activeLec.videoUrl} title={activeLec.title} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(14,22,48,0.95)', gap: '14px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${course.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={24} style={{ color: course.color }} fill={course.color} />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0, textAlign: 'center' }}>
                      No video attached yet<br />
                      <span style={{ fontSize: '12px', opacity: 0.6 }}>Admin can add a video URL in lecture settings</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Lecture info row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lecture {activeLec.order}</span>
                    {activeLec.isFree && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '99px', background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.3)' }}>Free Preview</span>}
                  </div>
                  <h1 style={{ fontSize: 'clamp(20px,3vw,30px)', fontWeight: 900, margin: '0 0 8px', lineHeight: 1.2 }}>{activeLec.title}</h1>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, maxWidth: '600px' }}>{activeLec.description}</p>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={11} />{activeLec.duration}</span>
                    {activeLec.materials.length > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={11} />{activeLec.materials.length} material(s)</span>}
                  </div>
                </div>

                {/* Mark done button */}
                <button onClick={markDone} disabled={completed.has(activeLec._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', background: completed.has(activeLec._id) ? 'rgba(52,211,153,0.12)' : `${course.color}18`, color: completed.has(activeLec._id) ? '#34d399' : course.color, border: `1px solid ${completed.has(activeLec._id) ? 'rgba(52,211,153,0.3)' : `${course.color}40`}`, cursor: completed.has(activeLec._id) ? 'default' : 'pointer', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  <CheckCircle size={15} fill={completed.has(activeLec._id) ? '#34d399' : 'transparent'} />
                  {completed.has(activeLec._id) ? 'Completed ✓' : 'Mark as Done'}
                </button>
              </div>

              {/* Live class card */}
              {activeLec.liveClass && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ padding: '16px 20px', borderRadius: '14px', background: activeLec.liveClass.isLive ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${activeLec.liveClass.isLive ? 'rgba(255,107,53,0.4)' : 'rgba(255,255,255,0.08)'}`, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {activeLec.liveClass.isLive
                      ? <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff6b35', flexShrink: 0 }} />
                      : <Calendar size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', color: activeLec.liveClass.isLive ? '#ff6b35' : 'var(--text-primary)' }}>
                        {activeLec.liveClass.isLive ? '🔴 Live Class Is Happening Now!' : activeLec.liveClass.title || 'Scheduled Live Class'}
                      </p>
                      {!activeLec.liveClass.isLive && activeLec.liveClass.scheduledAt && (
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(activeLec.liveClass.scheduledAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  {activeLec.liveClass.isLive ? (
                    <button onClick={() => joinLive(activeLec)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '10px', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', color: '#0a0a0a', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                      <Wifi size={14} /> Join Live via Dyte
                    </button>
                  ) : activeLec.liveClass.meetingUrl ? (
                    <a href={activeLec.liveClass.meetingUrl} target="_blank" rel="noopener" style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
                      <ExternalLink size={13} /> Meeting Link
                    </a>
                  ) : null}
                </motion.div>
              )}

              {/* Materials Section */}
              {activeLec.materials.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontWeight: 800, fontSize: '16px', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: course.color }} /> Lecture Materials
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                    {activeLec.materials.map(mat => {
                      const Icon = MAT_ICONS[mat.type] ?? Link2
                      const mc = MAT_COLORS[mat.type] ?? '#888'
                      return (
                        <a key={mat.id} href={mat.url || '#'} target="_blank" rel="noopener"
                          onClick={e => !mat.url && e.preventDefault()}
                          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: 'rgba(14,22,48,0.8)', border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none', color: 'var(--text-secondary)', transition: 'all 0.2s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = mc + '50'; (e.currentTarget as HTMLAnchorElement).style.background = `${mc}08` }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(14,22,48,0.8)' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${mc}18`, border: `1px solid ${mc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Icon size={16} style={{ color: mc }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mat.name || 'Untitled'}</p>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mat.type}</p>
                          </div>
                          <Download size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Prev / Next Navigation */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={() => prevLec && setActiveLec(prevLec)} disabled={!prevLec}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: prevLec ? 'rgba(255,255,255,0.05)' : 'transparent', color: prevLec ? 'var(--text-secondary)' : 'var(--text-muted)', border: `1px solid ${prevLec ? 'rgba(255,255,255,0.1)' : 'transparent'}`, cursor: prevLec ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 600, opacity: prevLec ? 1 : 0.3 }}>
                  <ChevronLeft size={15} /> Previous
                </button>

                <button onClick={markDone} disabled={completed.has(activeLec._id)}
                  style={{ padding: '10px 22px', borderRadius: '10px', background: `linear-gradient(135deg, ${course.color}, ${course.color}bb)`, color: '#0a0a0a', fontWeight: 800, fontSize: '13px', border: 'none', cursor: completed.has(activeLec._id) ? 'default' : 'pointer', opacity: completed.has(activeLec._id) ? 0.5 : 1 }}>
                  {completed.has(activeLec._id) ? '✓ Done' : nextLec ? 'Complete & Next →' : 'Complete Lecture ✓'}
                </button>

                <button onClick={() => nextLec && setActiveLec(nextLec)} disabled={!nextLec}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: nextLec ? 'rgba(255,255,255,0.05)' : 'transparent', color: nextLec ? 'var(--text-secondary)' : 'var(--text-muted)', border: `1px solid ${nextLec ? 'rgba(255,255,255,0.1)' : 'transparent'}`, cursor: nextLec ? 'pointer' : 'not-allowed', fontSize: '13px', fontWeight: 600, opacity: nextLec ? 1 : 0.3 }}>
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '900px', margin: '80px auto 0', textAlign: 'center' }}>
              <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.15 }} />
              <h2 style={{ margin: '0 0 8px' }}>No Lectures Yet</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>This course doesn't have any lectures added yet.</p>
            </div>
          )}

          {/* Live Class Schedule for Enrolled Students */}
          {isPurchased && course && userId && (
            <div style={{ marginTop: '40px' }}>
              <LiveClassSchedule 
                courseId={course._id}
                courseTitle={course.title}
                userName={session?.user?.name || 'Student'}
                userId={userId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
