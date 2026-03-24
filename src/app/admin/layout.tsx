'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, BookOpen, Users, Brain, FileQuestion, LogOut, Shield
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, color: 'var(--accent-gold)' },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen, color: 'var(--accent-orange)' },
  { href: '/admin/students', label: 'Students', icon: Users, color: 'var(--accent-cyan)' },
  { href: '/admin/quizzes', label: 'Quiz Builder', icon: Brain, color: '#a78bfa' },
  { href: '/admin/pyq', label: 'PYQ Manager', icon: FileQuestion, color: 'var(--accent-orange)' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-deep)' }}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside style={{
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(14, 22, 48, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(245,166,35,0.2)',
        padding: '32px 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
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
            <div>
              <p style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)', margin: 0 }}>Admin Portal</p>
              <p style={{ fontSize: '11px', color: 'var(--accent-gold)', margin: 0 }}>Super Admin ✦</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(245,166,35,0.1)', margin: '0 24px 20px' }} />

        {/* Nav Label */}
        <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', padding: '0 28px 12px', textTransform: 'uppercase' }}>
          Navigation
        </p>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '0 12px', flex: 1 }}>
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const isExact = href === '/admin'
            const active = isExact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : 'var(--text-secondary)',
                  border: `1px solid ${active ? `${color}40` : 'transparent'}`,
                  fontWeight: active ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `${color}20` : 'rgba(255,255,255,0.04)',
                  flexShrink: 0,
                }}>
                  <Icon size={16} style={{ color: active ? color : 'var(--text-muted)' }} />
                </div>
                {label}
                {active && (
                  <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 24px 16px' }} />

        {/* Sign Out */}
        <div style={{ padding: '0 12px' }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', borderRadius: '12px', width: '100%',
              background: 'rgba(255,107,53,0.08)', color: 'var(--accent-orange)',
              border: '1px solid rgba(255,107,53,0.25)', cursor: 'pointer',
              fontSize: '14px', fontWeight: 500, transition: 'all 0.2s ease',
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,107,53,0.12)' }}>
              <LogOut size={15} style={{ color: 'var(--accent-orange)' }} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '48px 52px' }}>
        {children}
      </main>
    </div>
  )
}
