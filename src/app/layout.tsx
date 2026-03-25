import type { Metadata } from 'next'
import { Providers } from './providers'
import FloatingAIChat from '@/components/FloatingAIChat'
import './globals.css'

export const metadata: Metadata = {
  title: 'SanskritAI — Cyber-Vedic Learning Platform',
  description:
    'Master the ancient language of Sanskrit with AI-powered lessons, real-time pronunciation grading, and an intelligent adaptive curriculum.',
  keywords: ['Sanskrit', 'learning', 'AI', 'Devanagari', 'Vedic', 'language'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <div className="starfield" aria-hidden="true" />
        <Providers>
          {children}
        </Providers>
        <FloatingAIChat />
      </body>
    </html>
  )
}
