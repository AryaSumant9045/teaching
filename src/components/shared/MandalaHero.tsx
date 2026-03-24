'use client'
import { motion } from 'framer-motion'

export default function MandalaHero() {
  return (
    <div className="relative w-[360px] h-[360px] mx-auto mt-16 mb-4 flex items-center justify-center select-none pointer-events-none">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.5), transparent 70%)', filter: 'blur(30px)' }}
      />

      {/* Ring 1 — outermost */}
      <motion.svg
        className="absolute"
        width="360" height="360"
        viewBox="0 0 360 360"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180
          const cx = +(180 + 160 * Math.cos(angle)).toFixed(2)
          const cy = +(180 + 160 * Math.sin(angle)).toFixed(2)
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="5" fill="rgba(245,166,35,0.5)" />
              <line x1="180" y1="180" x2={cx} y2={cy} stroke="rgba(245,166,35,0.12)" strokeWidth="1" />
            </g>
          )
        })}
        <circle cx="180" cy="180" r="160" fill="none" stroke="rgba(245,166,35,0.15)" strokeWidth="1" strokeDasharray="6 4" />
      </motion.svg>

      {/* Ring 2 */}
      <motion.svg
        className="absolute"
        width="280" height="280"
        viewBox="0 0 280 280"
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180
          const cx = +(140 + 120 * Math.cos(angle)).toFixed(2)
          const cy = +(140 + 120 * Math.sin(angle)).toFixed(2)
          return (
            <g key={i}>
              <polygon
                points={`${cx},${cy - 8} ${cx + 7},${cy + 4} ${cx - 7},${cy + 4}`}
                fill="rgba(255,107,53,0.55)"
              />
            </g>
          )
        })}
        <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(255,107,53,0.15)" strokeWidth="1" strokeDasharray="4 6" />
      </motion.svg>

      {/* Ring 3 */}
      <motion.svg
        className="absolute"
        width="200" height="200"
        viewBox="0 0 200 200"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180
          const cx = +(100 + 80 * Math.cos(angle)).toFixed(2)
          const cy = +(100 + 80 * Math.sin(angle)).toFixed(2)
          return (
            <rect key={i} x={cx - 4} y={cy - 4} width="8" height="8"
              fill="rgba(0,229,255,0.55)" rx="2"
              transform={`rotate(45 ${cx} ${cy})`}
            />
          )
        })}
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(0,229,255,0.18)" strokeWidth="1" />
      </motion.svg>

      {/* Inner lotus / OM symbol */}
      <div
        className="relative z-10 w-28 h-28 rounded-full flex items-center justify-center animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle at 40% 40%, rgba(245,166,35,0.25), rgba(10,14,30,0.9))',
          border: '2px solid rgba(245,166,35,0.4)',
          boxShadow: 'var(--glow-gold)',
        }}
      >
        <span
          className="devanagari text-5xl text-glow-gold animate-flicker"
          style={{ color: 'var(--accent-gold)' }}
        >
          ॐ
        </span>
      </div>

      {/* Orbiting particle dots */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: i === 0 ? 'var(--accent-gold)' : i === 1 ? 'var(--accent-orange)' : 'var(--accent-cyan)',
            boxShadow: `0 0 8px ${i === 0 ? 'rgba(245,166,35,0.8)' : i === 1 ? 'rgba(255,107,53,0.8)' : 'rgba(0,229,255,0.8)'}`,
          }}
          animate={{
            x: [
              140 * Math.cos((deg * Math.PI) / 180),
              140 * Math.cos(((deg + 120) * Math.PI) / 180),
              140 * Math.cos(((deg + 240) * Math.PI) / 180),
              140 * Math.cos((deg * Math.PI) / 180),
            ],
            y: [
              140 * Math.sin((deg * Math.PI) / 180),
              140 * Math.sin(((deg + 120) * Math.PI) / 180),
              140 * Math.sin(((deg + 240) * Math.PI) / 180),
              140 * Math.sin((deg * Math.PI) / 180),
            ],
          }}
          transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  )
}
