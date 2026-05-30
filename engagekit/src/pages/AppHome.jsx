import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABELS = {
  rpm: 'Relationship Portfolio Manager',
  admin: 'Admin',
  national_manager: 'National Manager',
}

export default function AppHome() {
  const { user, setUser, setWhitelistEntry } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    return <Navigate to="/" replace />
  }

  function signOut() {
    setUser(null)
    setWhitelistEntry(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#0F2040] rounded-2xl p-8 shadow-2xl border border-white/10 text-center">

          {/* Logo */}
          <h1 className="text-4xl mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
            <span className="text-white">Engage</span>
            <span className="text-amber-400">Kit</span>
          </h1>

          {/* Avatar */}
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-4 border-2 border-amber-400/40"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-amber-400 text-2xl font-semibold">
                {(user.name || user.phone || '?')[0].toUpperCase()}
              </span>
            </div>
          )}

          <p className="text-white text-lg font-semibold">{user.name || 'Welcome'}</p>
          <p className="text-slate-400 text-sm mt-1">{ROLE_LABELS[user.role] || user.role}</p>
          <p className="text-slate-600 text-xs mt-1">{user.phone}</p>

          <div className="mt-8 bg-white/5 rounded-xl p-4 text-left">
            <p className="text-slate-400 text-xs text-center">
              App content coming soon. You're logged in and ready.
            </p>
          </div>

          <button
            onClick={signOut}
            className="mt-6 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
