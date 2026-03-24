'use client'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const data = [
  { day: 'Mon', xp: 120, lessons: 2 },
  { day: 'Tue', xp: 280, lessons: 4 },
  { day: 'Wed', xp: 200, lessons: 3 },
  { day: 'Thu', xp: 350, lessons: 5 },
  { day: 'Fri', xp: 180, lessons: 2 },
  { day: 'Sat', xp: 420, lessons: 6 },
  { day: 'Sun', xp: 310, lessons: 4 },
]

export default function ProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f5a623" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#f5a623" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="lessonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00e5ff" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: '#8899bb', fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#8899bb', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: 'rgba(12,18,37,0.95)',
            border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: '10px',
            color: '#f0f4ff',
            fontSize: '12px',
          }}
          cursor={{ stroke: 'rgba(245,166,35,0.2)', strokeWidth: 1 }}
        />
        <Area type="monotone" dataKey="xp" stroke="#f5a623" strokeWidth={2} fill="url(#xpGradient)" name="XP Earned" />
        <Area type="monotone" dataKey="lessons" stroke="#00e5ff" strokeWidth={2} fill="url(#lessonGradient)" name="Lessons" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
