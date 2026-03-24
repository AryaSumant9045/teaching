'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Award, Lock, Play, CheckCircle } from 'lucide-react'

interface Option { text: string; isCorrect: boolean }
interface Question { id: string; text: string; marks: number; options: Option[] }
interface Quiz {
  _id: string; title: string; timer: number; lessonId: string;
  questions: Question[]; type: 'quiz' | 'lecture'
  isFree?: boolean; price?: number;
}

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Purchases logic
  const [isPurchased, setIsPurchased] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/quizzes').then(r => r.json()), // or fetch `/api/quizzes/${id}` if implemented for GET
      fetch(`/api/purchases/check?resourceId=${id}`).then(r => r.json().catch(() => ({ purchased: false })))
    ]).then(([quizzes, purchaseData]: [Quiz[], any]) => {
      const found = Array.isArray(quizzes) ? quizzes.find(q => q._id === id) ?? null : null
      setQuiz(found)
      setIsPurchased(purchaseData?.purchased || false)
      setUserId(purchaseData?.userId || null)
      setLoading(false)
    }).catch(e => { setError(String(e)); setLoading(false) })
  }, [id])

  const isLockedQuiz = quiz && quiz.isFree === false && !isPurchased;

  const handlePay = async () => {
    if (!quiz || !quiz.price || !userId) {
      if (!userId) alert('Please log in first to purchase.');
      return;
    }
    setPaying(true);
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
        name: 'SanskritAI',
        description: `Purchase Quiz: ${quiz.title}`,
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
              resourceId: quiz._id,
              resourceType: 'quiz',
              amount: quiz.price
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setIsPurchased(true);
          }
        },
        theme: { color: '#a78bfa' }
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

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)' }}>
      <p style={{ color: 'var(--text-muted)' }}>Loading quiz…</p>
    </div>
  )

  if (error || !quiz) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', flexDirection: 'column', gap: '16px' }}>
      <h2>Quiz not found</h2>
      <Link href="/dashboard" style={{ color: '#a78bfa', textDecoration: 'none' }}>Back to Dashboard</Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-deep)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* ── TOP NAV BAR ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', flexShrink: 0, padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={14} /> Back
        </Link>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{quiz.title}</p>
      </div>

      <div style={{ flex: 1, marginTop: '64px', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{ width: '100%', maxWidth: '700px', background: 'rgba(14,22,48,0.7)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '20px', padding: '40px', textAlign: 'center' }}>
          
          <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>{quiz.title}</h1>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}><Clock size={16} />{quiz.timer} mins</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}><Award size={16} />{quiz.questions.length} Questions</span>
          </div>

          {isLockedQuiz ? (
            <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(124,58,237,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Lock size={28} style={{ color: '#a78bfa' }} />
              </div>
              <h2 style={{ fontSize: '20px', margin: '0 0 10px' }}>Premium Quiz</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '300px' }}>
                This is a premium quiz. Purchase access to test your knowledge and unlock the results.
              </p>
              <h3 style={{ fontSize: '28px', color: 'white', margin: '0 0 24px' }}>₹{quiz.price}</h3>
              <button onClick={handlePay} disabled={paying} style={{ padding: '14px 32px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer', width: '100%', maxWidth: '300px' }}>
                {paying ? 'Processing...' : `Buy Quiz for ₹${quiz.price}`}
              </button>
            </div>
          ) : (
            <div style={{ background: 'rgba(52,211,153,0.05)', borderRadius: '16px', padding: '40px', border: '1px solid rgba(52,211,153,0.2)' }}>
              <CheckCircle size={48} style={{ color: '#34d399', margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '20px', margin: '0 0 10px', color: '#34d399' }}>Access Granted</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
                You have full access to this quiz. Are you ready to begin?
              </p>
              <button style={{ padding: '14px 32px', borderRadius: '12px', background: '#34d399', color: '#000', fontWeight: 800, fontSize: '15px', border: 'none', cursor: 'pointer' }}>
                Start Quiz Now
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
