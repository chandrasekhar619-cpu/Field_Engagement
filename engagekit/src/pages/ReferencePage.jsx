import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function ReferencePage() {
  const { user, authLoading } = useAuth()

  if (authLoading) return (
    <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar activeView="reference" />

      {/* Content area sits below the fixed 60px navbar */}
      <div style={{ paddingTop: 60, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Internal-use banner */}
        <div style={{
          flexShrink: 0,
          background: '#0f1f3d',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '6px 16px',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: 500, letterSpacing: '0.04em', margin: 0, textAlign: 'center' }}>
            📘 Reference Guide — Internal Use Only, Not for Customer Sharing
          </p>
        </div>

        {/* Handbook iframe — fills all remaining space */}
        <iframe
          src="/reference/spoc-handbook.html"
          title="SPOC Handbook"
          style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
        />
      </div>
    </div>
  )
}
