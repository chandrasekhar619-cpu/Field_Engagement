import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { sha256 } from '../lib/hash'

const ROLE_LABELS = {
  admin:            'Admin',
  national_manager: 'National Manager',
}

function Logo() {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
        <span className="text-white">Engage</span>
        <span className="text-amber-400">Kit</span>
      </h1>
    </div>
  )
}

export default function Pin() {
  // ── PIN flow state ──────────────────────────────────────────────────────────
  const [pin,        setPin]        = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [step,       setStep]       = useState(1)   // 1 = enter, 2 = confirm
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  // ── Profile capture state (shown after PIN is validated) ────────────────────
  const [profilePhase,       setProfilePhase]       = useState(false)
  const [profileName,        setProfileName]        = useState('')
  const [profileDesignation, setProfileDesignation] = useState('')
  const [profileError,       setProfileError]       = useState('')
  // pendingHash: hash computed on step-2 confirm, held until profile is saved
  const [pendingHash,  setPendingHash]  = useState(null)
  // doInsert: true = no user record yet → use INSERT; false = record exists → use UPDATE
  const [doInsert,     setDoInsert]     = useState(false)

  const navigate = useNavigate()
  const { whitelistEntry, pendingUserRecord, setUser } = useAuth()

  if (!whitelistEntry)                 return <Navigate to="/" replace />
  if (pendingUserRecord === undefined) return <Navigate to="/" replace />

  const isFirstLogin = !pendingUserRecord || !pendingUserRecord.pin_hash

  // ── Shared: decide next screen after PIN is accepted ────────────────────────
  // If the user record has no name, collect it before going to the dashboard.
  function goToProfileOrDashboard(userRecord, hash, insertNeeded) {
    if (!userRecord?.name?.trim()) {
      setPendingHash(hash ?? null)
      setDoInsert(insertNeeded)
      setProfilePhase(true)
    } else {
      setUser(userRecord)
      navigate('/app')
    }
  }

  // ── First login: set a new PIN ──────────────────────────────────────────────
  async function handleSetPin(e) {
    e.preventDefault()
    const activePin = step === 1 ? pin : confirmPin
    if (activePin.length !== 4) return

    if (step === 1) { setStep(2); setError(''); return }

    // Step 2 — confirm match
    if (confirmPin !== pin) {
      setError("PINs don't match. Please try again.")
      setConfirmPin('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const hash = await sha256(pin)

      if (pendingUserRecord) {
        // Record exists but has no pin_hash yet — just store hash and show profile
        // We'll UPDATE with both pin_hash + name in one shot from the profile form.
        goToProfileOrDashboard(pendingUserRecord, hash, false)
      } else {
        // No record at all — defer INSERT until profile is collected.
        goToProfileOrDashboard(null, hash, true)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Returning login: verify PIN ─────────────────────────────────────────────
  async function handleVerifyPin(e) {
    e.preventDefault()
    if (pin.length !== 4) return

    setLoading(true)
    setError('')

    try {
      const hash = await sha256(pin)

      if (hash !== pendingUserRecord.pin_hash) {
        setPin('')
        setError('Incorrect PIN. Please try again.')
        return
      }

      goToProfileOrDashboard(pendingUserRecord, null, false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Profile form submit ─────────────────────────────────────────────────────
  async function handleProfileSubmit(e) {
    e.preventDefault()
    if (!profileName.trim()) { setProfileError('Please enter your full name.'); return }

    setLoading(true)
    setProfileError('')

    try {
      let savedUser

      if (doInsert) {
        // Brand-new user record — single INSERT with all required fields.
        const { data, error: dbErr } = await supabase
          .from('users')
          .insert({
            phone:       whitelistEntry.phone,   // must match whitelist
            role:        whitelistEntry.role,
            pin_hash:    pendingHash,
            name:        profileName.trim(),
            designation: profileDesignation.trim() || null,
          })
          .select()
          .single()
        if (dbErr) throw dbErr
        savedUser = data
      } else {
        // Existing record — UPDATE with name, designation, and pin_hash if needed.
        const updates = {
          name:        profileName.trim(),
          designation: profileDesignation.trim() || null,
        }
        if (pendingHash) updates.pin_hash = pendingHash  // case: record existed, no pin_hash

        const { data, error: dbErr } = await supabase
          .from('users')
          .update(updates)
          .eq('id', pendingUserRecord.id)
          .select()
          .single()
        if (dbErr) throw dbErr
        savedUser = data
      }

      setUser(savedUser)
      navigate('/app')
    } catch (err) {
      console.error('Profile save error:', err)
      setProfileError('Could not save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Profile collection screen ───────────────────────────────────────────────
  if (profilePhase) {
    return (
      <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-xs">
          <Logo />

          <div className="bg-[#0F2040] rounded-2xl p-8 shadow-2xl border border-white/10">
            <h2 className="text-white font-semibold text-base mb-1">One last step</h2>
            <p className="text-slate-500 text-xs mb-6 leading-relaxed">
              Tell us your name so customers know who's reaching out when you share a link.
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="text-slate-300 text-sm block mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  placeholder="Anjali Sharma"
                  className="w-full bg-white/5 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-1.5">Designation</label>
                <input
                  type="text"
                  value={profileDesignation}
                  onChange={e => setProfileDesignation(e.target.value)}
                  placeholder="National Manager"
                  className="w-full bg-white/5 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
                />
              </div>

              {profileError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{profileError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !profileName.trim()}
                className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                {loading ? 'Saving…' : 'Go to Dashboard →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── PIN entry / confirmation screen ────────────────────────────────────────
  const activePin    = step === 1 ? pin : confirmPin
  const setActivePin = val => step === 1 ? setPin(val) : setConfirmPin(val)
  const handleSubmit = isFirstLogin ? handleSetPin : handleVerifyPin

  const title = isFirstLogin
    ? (step === 1 ? 'Set a PIN' : 'Confirm your PIN')
    : 'Enter your PIN'

  const subtitle = isFirstLogin
    ? (step === 1 ? "Choose a 4-digit PIN. You'll use this every time you log in." : 'Enter the same PIN again to confirm.')
    : 'Enter your 4-digit PIN to continue.'

  const buttonLabel = loading
    ? 'Please wait…'
    : isFirstLogin
      ? (step === 1 ? 'Next →' : 'Set PIN')
      : 'Continue →'

  function handleBack() {
    if (isFirstLogin && step === 2) { setStep(1); setConfirmPin(''); setError('') }
    else navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <Logo />

        <div className="bg-[#0F2040] rounded-2xl p-8 shadow-2xl border border-white/10">
          <div className="flex flex-col items-center mb-6">
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Signing in as</p>
            <span className="bg-amber-400/10 text-amber-400 text-sm font-medium px-3 py-1 rounded-full border border-amber-400/25">
              {ROLE_LABELS[whitelistEntry.role]}
            </span>
          </div>

          <h2 className="text-white text-base font-semibold text-center mb-1">{title}</h2>
          <p className="text-slate-500 text-xs text-center mb-6">{subtitle}</p>

          <div className="flex justify-center gap-4 mb-5">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
                  i < activePin.length
                    ? 'bg-amber-400 border-amber-400 scale-110'
                    : 'bg-transparent border-white/25'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <input
              key={step}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={activePin}
              onChange={e => { setActivePin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError('') }}
              placeholder="····"
              className="w-full bg-white/5 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-3 text-white text-center text-xl tracking-[0.5em] outline-none transition-colors"
              autoFocus
            />

            {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}

            <button
              type="submit"
              disabled={loading || activePin.length !== 4}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition-colors text-sm mt-4"
            >
              {buttonLabel}
            </button>
          </form>

          <button
            onClick={handleBack}
            className="w-full text-slate-500 hover:text-slate-300 text-sm mt-4 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  )
}
