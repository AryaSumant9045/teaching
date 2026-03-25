// /live/page.tsx — redirect to /courses since the live room is now at /live/[roomId]
// Admin goes to /live/[jitsiRoomName]?role=host
// Students go to /live/[jitsiRoomName]?role=participant
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader } from 'lucide-react'

export default function LiveRedirectPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/courses')
  }, [router])

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060914' }}>
      <Loader size={32} style={{ color: '#f5a623', animation: 'spin 1s linear infinite' }} />
    </div>
  )
}
