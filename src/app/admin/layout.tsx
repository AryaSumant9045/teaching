'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, BookOpen, Users, Brain, FileQuestion, LogOut, Shield, CreditCard, Home, Menu, X
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, color: 'var(--accent-gold)' },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, color: 'var(--accent-orange)' },
  { href: '/admin/students', label: 'Students', icon: Users, color: 'var(--accent-cyan)' },
  { href: '/admin/quizzes', label: 'Quiz Builder', icon: Brain, color: '#a78bfa' },
  { href: '/admin/pyq', label: 'PYQ Manager', icon: FileQuestion, color: 'var(--accent-orange)' },
  { href: '/admin/payments', label: 'Payment Manager', icon: CreditCard, color: '#10b981' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Use inline padding based on window width to ensure it works even if Tailwind misses arbitrary classes, or just use safer standard classes.
  // Actually, standard classes are fine, but since we have a fixed mobile header, we use standard padding.
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-deep)', position: 'relative' }}>

      
      {/* Mobile Top Bar */}
      <div className="md:hidden" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: 'rgba(14, 22, 48, 0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(245,166,35,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield size={20} color="var(--accent-gold)" />
          <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Admin Portal</p>
        </div>
        <button onClick={() => setSidebarOpen(true)} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-primary)', border: 'none' }}>
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden" 
          onClick={() => setSidebarOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 45 }}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside 
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        style={{
          width: '260px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(14, 22, 48, 0.98)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(245,166,35,0.2)',
          padding: '32px 0',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          overflowY: 'auto',
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Mobile Close Button */}
        <button 
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'absolute', top: '20px', right: '20px', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-muted)', border: 'none' }}
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <div style={{ padding: '0 24px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--accent-orange), var(--accent-gold))',
              boxShadow: '0 0 20px rgba(245,166,35,0.4)',
            }}>
              <Shield size={18} color="#0a0a0a" />
            </div>
            <div style={{ paddingRight: '30px' }}> {/* Breathing room for mobile X btn */}
              <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Admin Portal</p>
              <p style={{ fontSize: '11px', color: 'var(--accent-gold)', margin: 0 }}>Super Admin ✦</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(245,166,35,0.1)', margin: '0 24px 16px' }} />

        {/* Main Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 12px', flex: 1 }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 16px 8px', textTransform: 'uppercase', margin: 0 }}>
            Navigation
          </p>
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const isExact = href === '/admin'
            const active = isExact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
                  background: active ? `${color}18` : 'transparent', color: active ? color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${color}40` : 'transparent'}`, fontWeight: active ? 600 : 400, fontSize: '14px', transition: 'all 0.2s ease',
                }}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? `${color}20` : 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
                  <Icon size={16} style={{ color: active ? color : 'var(--text-muted)' }} />
                </div>
                {label}
                {active && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />}
              </Link>
            )
          })}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '16px 12px' }} />

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 16px 8px', textTransform: 'uppercase', margin: 0 }}>
            System
          </p>
          
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', textDecoration: 'none',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid transparent', fontWeight: 400, fontSize: '14px', transition: 'all 0.2s ease',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
              <Home size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            Back to App Home
          </Link>
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 24px 16px' }} />

        {/* Sign Out */}
        <div style={{ padding: '0 12px' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', width: '100%',
              background: 'rgba(255,107,53,0.08)', color: 'var(--accent-orange)',
              border: '1px solid rgba(255,107,53,0.25)', cursor: 'pointer', fontSize: '14px', fontWeight: 500, transition: 'all 0.2s ease',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,107,53,0.12)' }}>
              <LogOut size={15} style={{ color: 'var(--accent-orange)' }} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Spacer for desktop sidebar (since aside is fixed now) */}
      <div className="hidden md:block" style={{ width: '260px', flexShrink: 0 }} />

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="md:p-12 p-6" style={{ flex: 1, overflowY: 'auto', paddingTop: '80px' }}>
        {children}
      </main>
    </div>
  )
}
