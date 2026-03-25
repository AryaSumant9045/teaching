'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Script from 'next/script'
import { Brain, Search, Filter, ChevronRight, Clock, CheckCircle, Loader, AlertCircle, ShoppingCart, Languages } from 'lucide-react'

const translations = {
  en: {
    badge: 'Quiz Arena',
    title: 'Test Your',
    titleHighlight: 'Knowledge',
    subtitle: 'Challenging quizzes crafted by Vedic scholars',
    searchPlaceholder: 'Search quizzes…',
    filter: 'Filter',
    results: 'results',
    error: 'Could not load quizzes:',
    errorMongo: 'Make sure MongoDB is connected.',
    loading: 'Loading quizzes from MongoDB…',
    noQuizzes: 'No quizzes match your search',
    questions: 'questions',
    minutes: 'mins',
    viewQuiz: 'View Quiz',
    buyQuiz: 'Buy Quiz',
    processing: 'Processing...',
    loginFirst: 'Please log in first to purchase a quiz.',
    paymentFailed: 'Payment verification failed.',
    paymentInitFailed: 'Failed to initialize payment.',
    categories: {
      All: 'All',
      Standard: 'Standard Quiz',
      Lecture: 'Lecture Test'
    }
  },
  hi: {
    badge: 'प्रश्नोत्तरी अखाड़ा',
    title: 'अपने',
    titleHighlight: 'ज्ञान को परखें',
    subtitle: 'वैदिक विद्वानों द्वारा निर्मित चुनौतीपूर्ण प्रश्नोत्तरी',
    searchPlaceholder: 'प्रश्नोत्तरी खोजें…',
    filter: 'फ़िल्टर',
    results: 'परिणाम',
    error: 'प्रश्नोत्तरी लोड नहीं हो सके:',
    errorMongo: 'सुनिश्चित करें कि MongoDB कनेक्ट है।',
    loading: 'MongoDB से प्रश्नोत्तरी लोड हो रही हैं…',
    noQuizzes: 'आपकी खोज से कोई प्रश्नोत्तरी मेल नहीं खाती',
    questions: 'प्रश्न',
    minutes: 'मिनट',
    viewQuiz: 'प्रश्नोत्तरी देखें',
    buyQuiz: 'प्रश्नोत्तरी खरीदें',
    processing: 'प्रक्रिया हो रही है...',
    loginFirst: 'कृपया प्रश्नोत्तरी खरीदने के लिए पहले लॉग इन करें।',
    paymentFailed: 'भुगतान सत्यापन विफल।',
    paymentInitFailed: 'भुगतान शुरू करने में विफल।',
    categories: {
      All: 'सभी',
      Standard: 'स्टैंडर्ड क्विज',
      Lecture: 'लैक्चर टेस्ट'
    }
  }
}

interface Quiz {
  _id: string; title: string; timer: number; lessonId: string
  questions: Array<{ id: string; text: string; marks: number; options: Array<{ text: string; isCorrect: boolean }> }>
  type: 'quiz' | 'lecture'
  isFree?: boolean; price?: number
}

const CATS = ['All', 'Standard', 'Lecture']
const CAT_COLORS: Record<string, string> = {
  Standard: '#00e5ff', Lecture: '#a78bfa', All: 'rgba(136,153,187,0.9)'
}

export default function QuizzesListPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [active, setActive] = useState('All')
  const [search, setSearch] = useState('')
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = translations[lang]
  
  // Purchases logic
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [payingFor, setPayingFor] = useState<string | null>(null)

  const { data: session } = useSession();
  useEffect(() => {
    fetch('/api/quizzes')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(quizzesData => {
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : [])
        setLoading(false)
      })
      .catch(e => { 
        console.error('Error fetching quizzes:', e);
        setError(String(e)); 
        setLoading(false);
      });
  }, [])

  useEffect(() => {
    if (!session?.user?.email) {
      setPurchasedIds([])
      return
    }
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

  const filtered = quizzes.filter(q => {
    const cat = active === 'All' || (active === 'Standard' && q.type === 'quiz') || (active === 'Lecture' && q.type === 'lecture')
    const qsearch = search === '' || q.title.toLowerCase().includes(search.toLowerCase())
    return cat && qsearch
  })

  const handlePay = async (e: React.MouseEvent, quiz: Quiz) => {
    e.preventDefault();
    if (!session?.user?.email) {
      alert(t.loginFirst);
      return;
    }
    if (!quiz.price) return;
    setPayingFor(quiz._id);
    try {
      const r = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: quiz.price, resourceId: quiz._id, resourceType: 'quiz' })
      });
      const data = await r.json();
      if (!data.order) throw new Error(data.error || 'Order creation failed');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: quiz.price * 100,
        currency: 'INR',
        name: lang === 'hi' ? 'संस्कृतAI' : 'SanskritAI',
        description: `${lang === 'hi' ? 'खरीदें' : 'Purchase'} ${quiz.title}`,
        order_id: data.order.id,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              resourceId: quiz._id,
              resourceType: 'quiz',
              amount: quiz.price
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setPurchasedIds(prev => {
              const normalizedId = String(quiz._id)
              return prev.includes(normalizedId) ? prev : [...prev, normalizedId]
            });
            window.location.href = `/quizzes/${quiz._id}`;
          } else {
            alert(t.paymentFailed);
          }
        },
        theme: { color: '#a78bfa' }
      };

      const rzp1 = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert(t.paymentInitFailed);
    } finally {
      setPayingFor(null);
    }
  };

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* Language Toggle Button */}
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        style={{ position: 'fixed', top: '90px', right: '16px', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', cursor: 'pointer', transition: 'all 0.3s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(0,229,255,0.5)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
      >
        <Languages size={18} style={{ color: '#00e5ff' }} />
        <span style={{ fontSize: '14px', fontWeight: 500, color: lang === 'en' ? 'rgba(255,255,255,0.8)' : '#fff' }}>
          {lang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>
      
      {/* Hero */}
      <div className="px-4 sm:px-6 lg:px-12" style={{ paddingTop: '110px', paddingBottom: '48px', textAlign: 'center', borderBottom: '1px solid var(--border-glass)', background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.08) 0%, transparent 60%)' }}>
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 14px', borderRadius: '99px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '11px', fontWeight: 700, color: '#a78bfa', marginBottom: '18px', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
            <Brain size={11} /> {t.badge}
          </div>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.1 }}>
            {t.title}{' '}
            <span style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{t.titleHighlight}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '500px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            {quizzes.length} {t.subtitle}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(14,22,48,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '0 18px', maxWidth: '400px', width: '100%' }}>
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '14px', padding: '13px 0', width: '100%' }} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Category Pills */}
      <div className="px-4 sm:px-6 lg:px-12" style={{ paddingTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={13} style={{ color: 'var(--text-muted)' }} />
        {CATS.map(cat => {
          const count = cat === 'All' ? quizzes.length : quizzes.filter(q => 
            (cat === 'Standard' && q.type === 'quiz') || (cat === 'Lecture' && q.type === 'lecture')
          ).length
          return (
            <button key={cat} onClick={() => setActive(cat)} style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', background: active === cat ? `${CAT_COLORS[cat]}18` : 'transparent', color: active === cat ? CAT_COLORS[cat] : 'var(--text-secondary)', border: `1px solid ${active === cat ? `${CAT_COLORS[cat]}50` : 'rgba(255,255,255,0.08)'}`, transition: 'all 0.2s' }}>
              {t.categories[cat as keyof typeof t.categories]} <span style={{ opacity: 0.55, fontSize: '11px' }}>{count}</span>
            </button>
          )
        })}
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>{filtered.length} {t.results}</span>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-12" style={{ marginTop: '24px', marginBottom: '24px', padding: '16px 20px', borderRadius: '12px', background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', gap: '10px', color: '#ff6b35' }}>
          <AlertCircle size={16} />
          <span>{t.error} {error}. {t.errorMongo}</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px', gap: '12px', color: 'var(--text-muted)' }}>
          <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> {t.loading}
        </div>
      ) : (
        <div className="px-4 sm:px-6 lg:px-12" style={{ paddingTop: '24px', paddingBottom: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: '20px' }}>
          {filtered.map((quiz, i) => {
            const isMonetized = quiz.isFree === false && quiz.price && quiz.price > 0
            const isOwned = purchasedIds.includes(String(quiz._id))
            const needsPurchase = isMonetized && !isOwned

            return (
              <motion.div key={quiz._id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 24px 48px rgba(124,58,237,0.15)' }}
                style={{ background: 'rgba(14,22,48,0.75)', backdropFilter: 'blur(16px)', border: `1px solid rgba(124,58,237,0.22)`, borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', transition: 'all 0.3s' }}>
                <div style={{ height: '3px', borderRadius: '3px', background: `linear-gradient(90deg, #a78bfa, #7c3aed66)`, boxShadow: '0 0 10px rgba(124,58,237,0.5)' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: `${CAT_COLORS[quiz.type === 'quiz' ? 'Standard' : 'Lecture']}15`, color: CAT_COLORS[quiz.type === 'quiz' ? 'Standard' : 'Lecture'], border: `1px solid ${CAT_COLORS[quiz.type === 'quiz' ? 'Standard' : 'Lecture']}40`, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    {t.categories[quiz.type === 'quiz' ? 'Standard' : 'Lecture']}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={11} style={{ color: '#a78bfa' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa' }}>{quiz.questions?.length || 0}</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontWeight: 800, fontSize: '16px', marginBottom: '6px', lineHeight: 1.3 }}>{quiz.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {quiz.timer} {t.minutes} · {quiz.questions?.length || 0} {t.questions}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Clock size={10} style={{ color: '#a78bfa' }} /> {quiz.timer} {t.minutes}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <Brain size={10} style={{ color: '#a78bfa' }} /> {quiz.questions?.length || 0} {t.questions}
                  </div>
                </div>
                <Link href={`/quizzes/${quiz._id}`} 
                      onClick={e => { if (needsPurchase) handlePay(e, quiz) }}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', 
                        borderRadius: '12px', fontSize: '13px', fontWeight: 800, 
                        background: needsPurchase ? 'rgba(16,185,129,0.1)' : 'rgba(124,58,237,0.18)', 
                        color: needsPurchase ? '#10b981' : '#a78bfa', 
                        border: `1px solid ${needsPurchase ? 'rgba(16,185,129,0.3)' : 'rgba(124,58,237,0.35)'}`, 
                        textDecoration: 'none', marginTop: 'auto', transition: 'all 0.2s' 
                      }}>
                  {payingFor === quiz._id ? (
                    <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> {t.processing}</>
                  ) : needsPurchase ? (
                    <><ShoppingCart size={14} /> {t.buyQuiz} - ₹{quiz.price}</>
                  ) : (
                    <>{t.viewQuiz} <ChevronRight size={14} /></>
                  )}
                </Link>
              </motion.div>
            )
          })}
          {!loading && filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
              <Brain size={40} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
              <p style={{ fontSize: '17px', margin: 0 }}>{t.noQuizzes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
