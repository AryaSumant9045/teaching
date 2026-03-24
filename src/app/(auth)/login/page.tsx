'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles, ArrowRight } from 'lucide-react'
import GlassCard from '@/components/ui/GlassCard'
import { signIn } from 'next-auth/react'

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#050B14]">
      
      {/* Dynamic Cosmic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Deep space radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-30"
          style={{ background: 'radial-gradient(circle at center, rgba(16,30,60,0.8) 0%, #050B14 70%)' }} />
        
        {/* Floating Orbs */}
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-15, 15, -15], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full opacity-30 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ y: [30, -30, 30], x: [20, -20, 20], rotate: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[10%] w-[35vw] h-[45vw] rounded-full opacity-20 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
      </div>

      <Link href="/" className="absolute top-8 left-8 z-20 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-yellow-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,166,35,0.4)] group-hover:shadow-[0_0_30px_rgba(245,166,35,0.6)] transition-all duration-300 transform group-hover:scale-110">
          <BookOpen size={20} className="text-[#050B14]" />
        </div>
        <span className="font-bold tracking-tight text-xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Sanskrit</span>
          <span className="text-cyan-400">AI</span>
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-full max-w-xl z-10"
      >
        <div className="relative">
          {/* Decorative outer glow behind the card */}
          <div className="absolute -inset-2 rounded-[3rem] bg-gradient-to-r from-orange-500/20 via-cyan-500/20 to-purple-500/20 blur-3xl opacity-80"></div>
          
          <GlassCard hover={false} glow="gold" className="p-12 sm:p-20 relative bg-[#0B1224]/85 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
            
            {/* Top decorative element - pushed higher to not overlap text */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[90px] h-[90px] bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,166,35,0.8)] border-[8px] border-[#050B14] z-20">
              <Sparkles size={38} className="text-[#050B14]" />
            </div>

            <div className="text-center mb-16 mt-14">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                <p className="devanagari text-[3.5rem] mb-8 font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-orange-400" style={{ textShadow: '0 0 40px rgba(245,166,35,0.9), 0 0 15px rgba(255,255,255,0.6)' }}>
                  सुस्वागतम्
                </p>
              </motion.div>
              <h1 className="text-5xl font-black mb-6 tracking-tight text-white drop-shadow-lg">Welcome Back</h1>
              <p className="text-xl text-gray-400 font-medium tracking-wide">
                Continue your journey into the Vedas.
              </p>
            </div>

            <div className="space-y-8 mb-16">
              <button 
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="group relative w-full flex items-center justify-center gap-5 py-7 px-8 rounded-[1.5rem] font-bold text-xl transition-all duration-300 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_40px_rgba(66,133,244,0.4)]"
              >
                <div className="absolute inset-0 h-12 mb-2 bg-white/5 group-hover:bg-white/15 transition-colors border border-white/10 group-hover:border-white/20 rounded-[1.5rem]" />
                {/* Google Logo SVG */}
                <svg className="w-8 h-12 z-10 drop-shadow-md" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="z-10 text-white tracking-widest uppercase text-[17px]">Sign in with Google</span>
              </button>

              <button 
                onClick={() => signIn('credentials', { callbackUrl: '/dashboard' })}
                className="group w-full flex items-center justify-center gap-4 py-7 px-8 rounded-[1.5rem] font-bold text-xl transition-all overflow-hidden border-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_50px_rgba(0,229,255,0.5)] tracking-widest uppercase text-[17px]"
              >
                Explore as Guest <ArrowRight size={28} className="transition-transform group-hover:translate-x-3" />
              </button>
            </div>

            <div className="relative flex items-center justify-center my-16">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative px-10 bg-[#0B1224] text-base font-bold text-gray-500 uppercase tracking-[0.3em]">
                New Here?
              </div>
            </div>

            <p className="text-center text-lg text-gray-400 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-black text-orange-400 hover:text-orange-300 transition-colors drop-shadow-[0_0_15px_rgba(245,166,35,0.7)] ml-3">
                Begin your journey
              </Link>
            </p>
          </GlassCard>
        </div>
      </motion.div>
    </div>
  )
}
