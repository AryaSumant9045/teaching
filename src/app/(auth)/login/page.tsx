'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, MapPin, ArrowRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
      </div>

      <Link href="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-yellow-400 flex items-center justify-center shadow-lg group-hover:glow-gold transition-all duration-300">
          <BookOpen size={16} className="text-black" />
        </div>
        <span className="font-bold tracking-tight">
          <span className="gradient-text-gold">Sanskrit</span>
          <span style={{ color: 'var(--accent-cyan)' }}>AI</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md z-10"
      >
        <GlassCard hover={false} glow="gold" className="p-8">
          <div className="text-center mb-8">
            <p className="devanagari text-3xl mb-2 text-glow-gold" style={{ color: 'var(--accent-gold)' }}>
              सुस्वागतम्
            </p>
            <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Continue your journey into the Vedas.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <button 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="btn-primary w-full py-3"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              Sign in with Google <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => signIn('credentials', { callbackUrl: '/dashboard' })}
              className="btn-ghost w-full py-3 border border-white/10 hover:bg-white/5 transition-all"
            >
              Explore Dashboard (Guest)
            </button>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link href="/register" className="font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent-cyan)' }}>
              Begin your journey
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
