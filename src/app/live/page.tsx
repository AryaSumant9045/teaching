// This is a pure thin client shell.
// All Dyte logic lives in DyteRoom.client.tsx, loaded with dynamic + ssr:false.
'use client'
import dynamic from 'next/dynamic'
import { Loader } from 'lucide-react'

const DyteRoom = dynamic(() => import('./DyteRoom.client'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060914' }}>
      <Loader size={32} style={{ color: '#f5a623', animation: 'spin 1s linear infinite' }} />
    </div>
  ),
})

export default function LiveRoomPage() {
  return <DyteRoom />
}
