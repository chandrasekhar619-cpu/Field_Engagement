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
    <>
      <Navbar activeView="reference" />
      {/* Fixed iframe fills the full viewport below the 60px navbar.
          Explicit top/bottom gives the iframe a guaranteed pixel height so
          the document inside creates its own scroll viewport — required for
          the handbook's sticky header and section-nav to work correctly. */}
      <iframe
        src="/reference/spoc-handbook.html"
        title="SPOC Handbook"
        style={{
          position: 'fixed',
          top: 60,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          border: 'none',
        }}
      />
    </>
  )
}
