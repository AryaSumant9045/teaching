'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles, ArrowRight, Languages } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

const translations = {
  en: {
    welcome: 'Welcome',
    subtitle: 'Continue your journey into the Vedas.',
    signInGoogle: 'Sign in with Google',
    exploreGuest: 'Explore as Guest',
    newHere: 'New Here?',
    noAccount: "Don't have an account?",
    beginJourney: 'Begin your journey',
  },
  hi: {
    welcome: 'स्वागत है',
    subtitle: 'वेदों की यात्रा जारी रखें।',
    signInGoogle: 'Google से साइन इन करें',
    exploreGuest: 'अतिथि के रूप में देखें',
    newHere: 'यहाँ नए हैं?',
    noAccount: 'खाता नहीं है?',
    beginJourney: 'अपनी यात्रा शुरू करें',
  }
}

export default function LoginPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en')
  const t = translations[lang]

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#050B14]">

      {/* ── Cosmic Background ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-30"
          style={{ background: 'radial-gradient(circle at center, rgba(16,30,60,0.8) 0%, #050B14 70%)' }}
        />
        <motion.div
          animate={{ y: [-20, 20, -20], x: [-15, 15, -15], rotate: [0, 90, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] rounded-full opacity-30 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}
        />
        <motion.div
          animate={{ y: [30, -30, 30], x: [20, -20, 20], rotate: [0, -90, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-[10%] right-[10%] w-[35vw] h-[45vw] rounded-full opacity-20 mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 60%)', filter: 'blur(80px)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30vw] h-[30vw] rounded-full mix-blend-screen"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
      </div>

      {/* ── Language Toggle ── */}
      <button
        onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
        className="absolute top-8 right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 group"
      >
        <Languages size={18} className="text-cyan-400 group-hover:text-cyan-300" />
        <span className="text-sm font-medium text-white/80 group-hover:text-white">
          {lang === 'en' ? 'हिंदी' : 'English'}
        </span>
      </button>

      {/* ── Logo ── */}
      <Link href="/" className="absolute top-8 left-8 z-20 flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-yellow-400 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,166,35,0.4)] group-hover:shadow-[0_0_30px_rgba(245,166,35,0.6)] transition-all duration-300 transform group-hover:scale-110">
          <BookOpen size={20} className="text-[#050B14]" />
        </div>
        <span className="font-bold tracking-tight text-xl">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">
            {lang === 'hi' ? 'संस्कृत' : 'Sanskrit'}
          </span>
          <span className="text-cyan-400">AI</span>
        </span>
      </Link>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="w-full max-w-md z-10"
      >
        <div className="relative">
          {/* Ambient glow behind card */}
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-r from-orange-500/15 via-cyan-500/15 to-purple-500/15 blur-3xl opacity-90" />

          {/* Frosted glass card */}
          <div
            className="relative rounded-[2.5rem] overflow-hidden"
            style={{
              background: 'rgba(10, 16, 34, 0.72)',
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 30px 100px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.12)',
            }}
          >
            {/* Top sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* ── Badge ── */}
            <div className="flex justify-center pt-12 pb-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-orange-400/25 blur-2xl scale-[1.8]" />
                <div
                  className="relative w-[80px] h-[80px] bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center border-4 border-[#050B14]/70"
                  style={{ boxShadow: '0 0 40px rgba(245,166,35,0.65)' }}
                >
                  <Sparkles size={30} className="text-[#050B14]" />
                </div>
              </div>
            </div>

            {/* ── Header ── */}
            <div className="text-center px-8 pt-6 pb-4">
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="devanagari text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-orange-400 mb-1"
              >
                सुस्वागतम्
              </motion.p>
              <h1 className="text-4xl font-black tracking-tight text-white mt-1 mb-2">{t.welcome}</h1>
              <p className="text-sm text-white/45 font-medium tracking-wide">{t.subtitle}</p>
            </div>

            {/* Top section divider */}
            <div className="mx-8 mt-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* ── Buttons ── */}
            <div className="px-8 pt-8 pb-7 flex flex-col gap-5">

              {/* Google Sign In */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                className="w-full flex items-center justify-center h-10 gap-3 py-[22px] px-6 rounded-2xl font-semibold text-sm uppercase tracking-widest text-white transition-all duration-250 relative overflow-hidden group"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-white/5 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <svg className="w-5 h-5 z-10 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="z-10">{t.signInGoogle}</span>
              </motion.button>

              {/* OR divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-[11px] font-bold text-white/25 uppercase tracking-[0.2em]">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Explore as Guest */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => signIn('credentials', { callbackUrl: '/dashboard' })}
                className="w-full flex items-center h-10 justify-center gap-3 py-[22px] px-6 rounded-2xl font-semibold text-sm uppercase tracking-widest text-cyan-300 transition-all duration-250 group relative overflow-hidden"
                style={{
                  background: 'rgba(0, 229, 255, 0.04)',
                  border: '1px solid rgba(0, 229, 255, 0.22)',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = 'rgba(0,229,255,0.09)'
                  el.style.border = '1px solid rgba(0,229,255,0.55)'
                  el.style.boxShadow = '0 0 30px rgba(0,229,255,0.18)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.background = 'rgba(0,229,255,0.04)'
                  el.style.border = '1px solid rgba(0,229,255,0.22)'
                  el.style.boxShadow = 'none'
                }}
              >
                <span className="z-10">{t.exploreGuest}</span>
                <ArrowRight size={15} className="z-10 transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>
            </div>

            {/* ── Footer ── */}
            <div className="px-8 pb-10 text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-5" />
              <p className="text-xs text-white/35 mb-1.5 font-medium tracking-wide">{t.newHere}</p>
              <p className="text-sm text-white/45">
                {t.noAccount}{' '}
                <Link
                  href="/register"
                  className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline underline-offset-2 transition-colors duration-200"
                >
                  {t.beginJourney}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
