import { useState, useRef } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [designation, setDesignation] = useState('')
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()
  const { whitelistEntry, setUser } = useAuth()

  if (!whitelistEntry) {
    return <Navigate to="/" replace />
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !designation.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      let photoUrl = null

      if (photo) {
        const ext = photo.name.split('.').pop()
        const path = `${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, photo, { upsert: false })

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          photoUrl = urlData.publicUrl
        }
        // non-fatal: proceed even if photo upload fails
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          phone: whitelistEntry.phone,
          name: name.trim(),
          designation: designation.trim(),
          photo_url: photoUrl,
          role: whitelistEntry.role,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setUser(newUser)
      navigate('/app')
    } catch {
      setError('Could not complete registration. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl leading-tight" style={{ fontFamily: "'DM Serif Display', serif" }}>
            <span className="text-white">Engage</span>
            <span className="text-amber-400">Kit</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Complete your profile to get started</p>
        </div>

        <div className="bg-[#0F2040] rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-white text-lg font-semibold mb-1">Create your profile</h2>
          <p className="text-slate-500 text-xs mb-6">{whitelistEntry.phone}</p>

          {/* Photo upload */}
          <div className="flex flex-col items-center mb-6">
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/20 hover:border-amber-400/50 transition-colors overflow-hidden flex items-center justify-center"
            >
              {preview ? (
                <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="text-amber-400/80 hover:text-amber-400 text-xs mt-2 transition-colors"
            >
              {preview ? 'Change photo' : 'Upload photo (optional)'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-300 text-sm block mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rajesh Kumar"
                className="w-full bg-white/5 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
                autoFocus
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm block mb-1.5">
                Designation <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                placeholder="Relationship Portfolio Manager"
                className="w-full bg-white/5 border border-white/15 focus:border-amber-400/50 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim() || !designation.trim()}
              className="w-full bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-semibold py-3 rounded-xl transition-colors text-sm mt-1"
            >
              {loading ? 'Creating profile…' : 'Get Started →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
