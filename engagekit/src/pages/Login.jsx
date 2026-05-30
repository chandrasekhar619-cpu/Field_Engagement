import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { setWhitelistEntry, setUser, setPendingUserRecord } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: entry, error: wlError } = await supabase
        .from('whitelist')
        .select('*')
        .eq('phone', cleaned)
        .single()

      if (wlError || !entry) {
        setError("This number isn't on the approved list. Contact your manager.")
        return
      }

      setWhitelistEntry(entry)

      if (entry.role === 'admin' || entry.role === 'national_manager') {
        const { data: existingAdmin } = await supabase
          .from('users')
          .select('*')
          .eq('phone', cleaned)
          .single()
        setPendingUserRecord(existingAdmin ?? null)
        navigate('/pin')
        return
      }

      // rpm — check if already registered
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('phone', cleaned)
        .single()

      if (existingUser) {
        setUser(existingUser)
        navigate('/app')
      } else {
        navigate('/register')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            <span className="text-white">Engage</span>
            <span className="text-amber-400">Kit</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm tracking-widest uppercase">Field Engagement Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[#0F2040] rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-white text-xl font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Enter your registered mobile number to continue.</p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-slate-300 text-sm block mb-1.5">Mobile Number</label>
              <div className="flex items-center bg-white/5 border border-white/15 rounded-xl overflow-hidden focus-within:border-amber-400/50 transition-colors">
                <span className="text-slate-400 pl-4 pr-2 text-sm select-none border-r border-white/10 py-3">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  className="flex-1 bg-transparent text-white placeholder-slate-600 py-3 px-3 text-base outline-none"
                  maxLength={10}
                  inputMode="numeric"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition-colors text-base mt-1"
            >
              {loading ? 'Checking…' : 'Continue →'}
            </button>
          </form>
        </div>

        <p className="text-slate-600 text-xs text-center mt-6">
          Only approved field personnel can log in.
        </p>
      </div>
    </div>
  )
}
