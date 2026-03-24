'use client'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: 'gold' | 'orange' | 'cyan' | 'none'
  delay?: number
  colSpan?: number
  rowSpan?: number
  style?: React.CSSProperties
}

export default function GlassCard({
  children,
  className,
  hover = true,
  glow = 'none',
  delay = 0,
  style,
}: GlassCardProps) {
  const glowClass = glow !== 'none' ? `glow-${glow}` : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn('glass p-8', hover && 'glass-hover', glowClass, className)}
      style={style}
    >
      {children}
    </motion.div>
  )
}
