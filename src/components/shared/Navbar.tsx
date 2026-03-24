'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, BookOpen, Zap, LogOut, Shield, ChevronDown, LayoutDashboard, Settings } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

const navLinks = [
  { href: '/',          label: 'Home'      },
  { href: '/courses',   label: 'Courses'   },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/lessons/1', label: 'Lessons'   },
  { href: '/practice',  label: 'Practice'  },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { data: session } = useSession()
  const isAdmin = (session?.user as { role?: string })?.role === 'admin'

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          margin: '12px 16px 0',
          padding: '0 20px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '16px',
          background: 'rgba(6, 9, 20, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(245,166,35,0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* ── Logo ─────────────────────────── */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #ff6b35 0%, #f5a623 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(245,166,35,0.5)',
          }}>
            <BookOpen size={16} color="#0a0a0a" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '17px', letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg, #f5a623, #ff6b35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Sanskrit</span>
            <span style={{ color: '#00e5ff' }}>AI</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ─────────────── */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="hidden-mobile">
          {navLinks.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href} style={{
                padding: '7px 14px', borderRadius: '10px', fontSize: '13.5px', fontWeight: active ? 600 : 400,
                color: active ? 'var(--accent-gold)' : 'rgba(136,153,187,0.9)',
                background: active ? 'rgba(245,166,35,0.12)' : 'transparent',
                border: `1px solid ${active ? 'rgba(245,166,35,0.25)' : 'transparent'}`,
                textDecoration: 'none', transition: 'all 0.2s ease',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = '#f0f4ff' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(136,153,187,0.9)' }}
              >
                {label}
                {active && (
                  <span style={{
                    position: 'absolute', bottom: '-2px', left: '50%', transform: 'translateX(-50%)',
                    width: '20px', height: '2px', borderRadius: '2px',
                    background: 'var(--accent-gold)', boxShadow: '0 0 6px var(--accent-gold)',
                  }} />
                )}
              </Link>
            )
          })}

          {/* Admin Portal Link (only for admins) */}
          {isAdmin && (
            <Link href="/admin" style={{
              padding: '7px 14px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 600,
              color: pathname.startsWith('/admin') ? '#a78bfa' : 'rgba(167,139,250,0.8)',
              background: pathname.startsWith('/admin') ? 'rgba(124,58,237,0.15)' : 'transparent',
              border: `1px solid ${pathname.startsWith('/admin') ? 'rgba(124,58,237,0.35)' : 'rgba(124,58,237,0.2)'}`,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease',
            }}>
              <Shield size={13} /> Admin
            </Link>
          )}
        </nav>

        {/* ── Right Side ─────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }} className="hidden-mobile">
          {session ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px 6px 6px', borderRadius: '12px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'}
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt="User"
                    style={{ width: '28px', height: '28px', borderRadius: '8px', border: isAdmin ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.2)' }} />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#0a0a0a' }}>
                    {session.user?.name?.[0] ?? 'U'}
                  </div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                    {session.user?.name?.split(' ')[0] ?? 'User'}
                  </p>
                  <p style={{ fontSize: '10px', margin: 0, color: isAdmin ? '#a78bfa' : 'var(--text-muted)', lineHeight: 1.2 }}>
                    {isAdmin ? '✦ Super Admin' : 'Student'}
                  </p>
                </div>
                <ChevronDown size={13} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: userMenuOpen ? 'rotate(180deg)' : 'none' }} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px',
                      background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                      padding: '8px', zIndex: 100,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    }}
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    {/* User info */}
                    <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '6px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>{session.user?.name}</p>
                      <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: 0 }}>{session.user?.email}</p>
                    </div>

                    {/* Go to Dashboard */}
                    <Link href={isAdmin ? '/admin' : '/dashboard'} onClick={() => setUserMenuOpen(false)} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px',
                      borderRadius: '9px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px',
                      transition: 'all 0.15s ease',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}>
                      <LayoutDashboard size={14} style={{ color: 'var(--accent-gold)' }} />
                      {isAdmin ? 'Admin Portal' : 'Dashboard'}
                    </Link>

                    {/* Courses (admin) */}
                    {isAdmin && (
                      <Link href="/admin/courses" onClick={() => setUserMenuOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px',
                        borderRadius: '9px', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '13px',
                        transition: 'all 0.15s ease',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}>
                        <Settings size={14} style={{ color: '#a78bfa' }} />
                        Manage Courses
                      </Link>
                    )}

                    {/* Sign out */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px', paddingTop: '6px' }}>
                      <button onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', width: '100%',
                          borderRadius: '9px', color: 'var(--accent-orange)', fontSize: '13px', cursor: 'pointer',
                          background: 'transparent', border: 'none', transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,107,53,0.1)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href="/login" style={{
                padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500,
                color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.12)',
                textDecoration: 'none', transition: 'all 0.2s ease', background: 'transparent',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
              >
                Sign In
              </Link>
              <Link href="/register" style={{
                padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
                color: '#0a0a0a', background: 'linear-gradient(135deg, #ff6b35, #f5a623)',
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 0 16px rgba(255,107,53,0.4)', transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}
              >
                <Zap size={13} /> Start Learning
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Burger ─────────────────── */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{ padding: '8px', borderRadius: '8px', color: 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', display: 'none' }}
          className="show-mobile"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* ── Mobile Menu ─────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              margin: '8px 16px 0', padding: '16px',
              background: 'rgba(6,9,20,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(245,166,35,0.15)', borderRadius: '16px',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}
          >
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} style={{
                padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 500,
                color: pathname === href ? 'var(--accent-gold)' : 'var(--text-secondary)',
                background: pathname === href ? 'rgba(245,166,35,0.1)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.2s ease',
              }}>
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setOpen(false)} style={{
                padding: '12px 16px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
                color: '#a78bfa', background: 'rgba(124,58,237,0.12)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <Shield size={14} /> Admin Portal
              </Link>
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {session ? (
                <button onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }) }}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', color: 'var(--accent-orange)', fontSize: '14px', cursor: 'pointer', background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.2)' }}>
                  <LogOut size={14} /> Sign Out
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', color: 'var(--text-secondary)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', textAlign: 'center' }}>Sign In</Link>
                  <Link href="/register" onClick={() => setOpen(false)} style={{ padding: '12px 16px', borderRadius: '10px', color: '#0a0a0a', background: 'linear-gradient(135deg, #ff6b35, #f5a623)', textDecoration: 'none', fontSize: '14px', fontWeight: 600, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Zap size={14} /> Start Learning
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hide/show utility CSS */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </header>
  )
}
