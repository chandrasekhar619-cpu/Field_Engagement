import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function Navbar({ activeView }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const firstName = user?.name?.split(' ')[0] || 'User'
  const initials = getInitials(user?.name)

  return (
    <nav className="fixed top-0 left-0 right-0 h-[60px] bg-[#0f1f3d] flex items-center px-4 md:px-6 z-50 shadow-md">

      {/* Left — Logo */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl leading-none" style={{ fontFamily: "'DM Serif Display', serif" }}>
          <span className="text-white">Engage</span>
          <span className="text-[#e8a020]">Kit</span>
        </h1>
      </div>

      {/* Centre — Mode toggle */}
      <div className="flex bg-white/10 rounded-full p-1 gap-0.5 flex-shrink-0">
        <button
          onClick={() => navigate('/app')}
          className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
            activeView === 'content'
              ? 'bg-white text-[#0f1f3d] shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => navigate('/app/customers')}
          className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
            activeView === 'customers'
              ? 'bg-white text-[#0f1f3d] shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => navigate('/app/reference')}
          className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
            activeView === 'reference'
              ? 'bg-white text-[#0f1f3d] shadow-sm'
              : 'text-white/60 hover:text-white'
          }`}
        >
          📘
        </button>
      </div>

      {/* Right — admin shortcut + user */}
      <div className="flex-1 flex justify-end items-center gap-2 min-w-0">
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin/upload')}
            className="text-[#e8a020] text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#e8a020]/30 hover:bg-[#e8a020]/10 transition-colors hidden sm:block flex-shrink-0"
          >
            Upload
          </button>
        )}
        <span className="text-white/70 text-sm hidden md:block truncate">{firstName}</span>
        <div className="w-8 h-8 rounded-full bg-[#e8a020] flex items-center justify-center flex-shrink-0">
          <span className="text-[#0f1f3d] font-bold text-xs">{initials}</span>
        </div>
      </div>

    </nav>
  )
}
