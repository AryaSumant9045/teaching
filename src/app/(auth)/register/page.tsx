'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, MapPin, Zap } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[40vw] h-[40vw] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,107,53,0.4) 0%, transparent 70%)', filter: 'blur(80px)' }}
        />
        <div className="absolute bottom-[-10%] left-[10%] w-[45vw] h-[45vw] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
      </div>

      {/* Nav logo */}
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
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard hover={false} glow="orange" className="p-8 pb-10">
          <div className="text-center mb-8">
            <p className="devanagari text-3xl mb-2 text-glow-orange" style={{ color: 'var(--accent-orange)' }}>
              आरम्भः
            </p>
            <h1 className="text-2xl font-bold mb-1">Begin Your Path</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create an account to track your Sanskrit progress.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <button 
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="btn-primary w-full py-3 gap-2"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Zap size={16} /> Continue with Google
            </button>
            <button 
              onClick={() => signIn('credentials', { callbackUrl: '/dashboard' })}
              className="btn-ghost w-full py-3 border border-white/10 hover:bg-white/5 transition-all"
            >
              Explore Dashboard (Guest)
            </button>
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Already a student?{' '}
            <Link href="/login" className="font-semibold transition-colors hover:text-white" style={{ color: 'var(--accent-orange)' }}>
              Sign in to your ashrama
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
