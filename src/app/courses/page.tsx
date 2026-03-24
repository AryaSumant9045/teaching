'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Script from 'next/script'
import { BookOpen, Search, Filter, ChevronRight, Clock, Users, Star, Loader, AlertCircle, ShoppingCart } from 'lucide-react'

interface Course {
  _id: string; title: string; description: string
  category: 'Beginner' | 'Intermediate' | 'Advanced'
  color: string; status: string; students: number
  rating: number; totalLectures: number; duration: string
  isFree?: boolean; price?: number
}

const CATS = ['All', 'Beginner', 'Intermediate', 'Advanced']
const CAT_COLORS: Record<string, string> = {
  Beginner: '#00e5ff', Intermediate: '#f5a623', Advanced: '#a78bfa', All: 'rgba(136,153,187,0.9)'
}

export default function CoursesListPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState('All')
  const [search, setSearch] = useState('')
  
  // Purchases logic
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  // Remove userId state, use session instead
  const [payingFor, setPayingFor] = useState<string | null>(null)

  const { data: session } = useSession();
  useEffect(() => {
    fetch('/api/courses')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(coursesData => {
        setCourses(Array.isArray(coursesData) ? coursesData.filter(c => c.status === 'active') : [])
        setLoading(false)
      })
      .catch(e => { 
        console.error('Error fetching data:', e);
        setError(String(e)); 
        setLoading(false);
      });
  }, [])

  useEffect(() => {
    fetch('/api/purchases/user')
      .then(r => r.json().catch(() => ({ purchasedResourceIds: [] })))
      .then(data => {
        const normalizedIds = Array.isArray(data?.purchasedResourceIds)
          ? data.purchasedResourceIds.map((id: unknown) => String(id))
          : []
        setPurchasedIds(normalizedIds)
      })
      .catch(() => setPurchasedIds([]))
  }, [session?.user?.email])

  const filtered = courses.filter(c => {
    const cat = active === 'All' || c.category === active
    const q = search === '' || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())
    return cat && q
  })

  const handlePay = async (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    if (!session?.user?.email) {
      alert('Please log in first to purchase a course.');
      return;
    }
    if (!course.price) return;
    setPayingFor(course._id);
    try {
      const r = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: course.price, resourceId: course._id, resourceType: 'course' })
      });
      const data = await r.json();
      if (!data.order) throw new Error(data.error || 'Order creation failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: course.price * 100,
        currency: 'INR',
        name: 'SanskritAI',
        description: `Purchase ${course.title}`,
        order_id: data.order.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              resourceId: course._id,
              resourceType: 'course',
              amount: course.price
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPurchasedIds(prev => {
              const normalizedId = String(course._id)
              return prev.includes(normalizedId) ? prev : [...prev, normalizedId]
            });
            window.location.href = `/courses/${course._id}`;
          } else {
            alert('Payment verification failed.');
          }
        },
        theme: { color: course.color || '#ff6b35' }
      };

      const rzp1 = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert('Failed to initialize payment.');
    } finally {
      setPayingFor(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* Hero */}
      <div style={{ padding: '110px 48px 48px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', background: 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.08) 0%, transparent 60%)' }}>
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '99px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            <BookOpen size={11} /> Sacred Library
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1 }}>
            Explore All{' '}
            <span style={{ background: 'linear-gradient(135deg,#f5a623,#ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Courses</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            {courses.length} world-class Sanskrit courses crafted by Vedic scholars and AI
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(14,22,48,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0 18px', maxWidth: '400px', width: '100%' }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses…"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '13px 0', width: '100%' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Pills */}
      <div style={{ padding: '20px 48px 0', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={13} style={{ color: 'var(--text-muted)' }} />
        {CATS.map(cat => {
          const count = cat === 'All' ? courses.length : courses.filter(c => c.category === cat).length
          return (
            <button key={cat} onClick={() => setActive(cat)} style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: active === cat ? `${CAT_COLORS[cat]}18` : 'transparent', color: active === cat ? CAT_COLORS[cat] : 'var(--text-secondary)', border: `1px solid ${active === cat ? `${CAT_COLORS[cat]}50` : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
              {cat} <span style={{ opacity: 0.55, fontSize: '11px' }}>{count}</span>
            </button>
          )
        })}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{filtered.length} results</span>
      </div>

      {/* Error */}
      {error && (
        <div style={{ margin: '24px 48px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6b35' }}>
          <AlertCircle size={16} />
          <span>Could not load courses: {error}. Make sure MongoDB is connected.</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> Loading courses from MongoDB…
        </div>
      ) : (
        <div style={{ padding: '24px 48px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '20px' }}>
          {filtered.map((course, i) => {
            const isMonetized = course.isFree === false && course.price && course.price > 0
            const isOwned = purchasedIds.includes(String(course._id))
            const needsPurchase = isMonetized && !isOwned

            return (
              <motion.div key={course._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, boxShadow: `0 24px 48px ${course.color}20` }}
                style={{ background: 'rgba(14,22,48,0.75)', backdropFilter: 'blur(16px)', border: `1px solid ${course.color}22`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.3s' }}>
                <div style={{ height: '3px', borderRadius: '3px', background: `linear-gradient(90deg, ${course.color}, ${course.color}66)`, boxShadow: `0 0 10px ${course.color}50` }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: `${CAT_COLORS[course.category]}15`, color: CAT_COLORS[course.category], border: `1px solid ${CAT_COLORS[course.category]}40`, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{course.category}</span>
                  {course.rating > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={11} style={{ color: '#f5a623' }} fill="#f5a623" />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#f5a623' }}>{course.rating}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px', lineHeight: 1.3 }}>{course.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  {[
                    { Icon: Clock, val: course.duration || '—' },
                    { Icon: Users, val: `${course.students} students` },
                    { Icon: BookOpen, val: `${course.totalLectures} lectures` },
                  ].map(({ Icon, val }) => (
                    <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Icon size={10} style={{ color: course.color }} /> {val}
                    </div>
                  ))}
                </div>
                <Link href={`/courses/${course._id}`} 
                      onClick={e => { if (needsPurchase) handlePay(e, course) }}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', 
                        borderRadius: '12px', fontSize: '13px', fontWeight: 800, 
                        background: needsPurchase ? 'rgba(16,185,129,0.1)' : `${course.color}18`, 
                        color: needsPurchase ? '#10b981' : course.color, 
                        border: `1px solid ${needsPurchase ? 'rgba(16,185,129,0.3)' : course.color + '35'}`, 
                        textDecoration: 'none', marginTop: 'auto', transition: 'all 0.2s' 
                      }}>
                  {payingFor === course._id ? (
                    <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  ) : needsPurchase ? (
                    <><ShoppingCart size={14} /> Buy Course - ₹{course.price}</>
                  ) : (
                    <>View Course <ChevronRight size={14} /></>
                  )}
                </Link>
              </motion.div>
            )
          })}
          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <BookOpen size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: '17px', margin: 0 }}>No courses match your search</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
