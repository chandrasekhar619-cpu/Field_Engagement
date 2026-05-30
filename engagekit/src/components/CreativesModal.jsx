import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const THEMES = {
  Festive: {
    bg: 'from-[#1a0800] via-[#3d1500] to-[#1a0800]',
    accent: '#e8a020',
    taglineGeneric:    'Wishing you joy, health, and security this Diwali 🪔',
    taglinePersonal:   'A message crafted for your most valued customer 🪔',
    subGeneric:        'May your loved ones always be protected.',
    subPersonal:       'Personalised framing based on their financial profile.',
  },
  Occasion: {
    bg: 'from-[#0d0d2b] via-[#1a0a40] to-[#0d0d2b]',
    accent: '#a78bfa',
    taglineGeneric:    'Every milestone is worth celebrating and protecting 🎊',
    taglinePersonal:   'A message tailored to their next financial chapter 🎊',
    subGeneric:        'Wishing them a year of growth and security.',
    subPersonal:       'Personalised framing based on their financial profile.',
  },
  default: {
    bg: 'from-[#0f1f3d] via-[#1a3260] to-[#0f1f3d]',
    accent: '#e8a020',
    taglineGeneric:    'The right protection changes everything 💫',
    taglinePersonal:   'A message personalised for your customer 💫',
    subGeneric:        'Built for the moments that matter most.',
    subPersonal:       'Personalised framing based on their financial profile.',
  },
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

export default function CreativesModal({ item, onClose }) {
  const { user } = useAuth()
  const [personaOn, setPersonaOn] = useState(false)

  const name        = user?.name        || 'Your Advisor'
  const designation = user?.designation || 'Relationship Portfolio Manager'
  const theme       = THEMES[item.category] || THEMES.default

  const tagline = personaOn ? theme.taglinePersonal : theme.taglineGeneric
  const sub     = personaOn ? theme.subPersonal     : theme.subGeneric

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[360px] overflow-hidden z-10">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors text-sm"
        >
          ✕
        </button>

        {/* Creative preview */}
        <div className={`relative bg-gradient-to-br ${theme.bg} aspect-[3/4] flex flex-col items-center justify-center overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-6 right-6 w-20 h-20 rounded-full opacity-10" style={{ background: theme.accent }} />
          <div className="absolute bottom-16 left-4 w-12 h-12 rounded-full opacity-10" style={{ background: theme.accent }} />

          {/* Persona badge */}
          {personaOn && (
            <div className="absolute top-4 left-4 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-[10px] font-medium">✨ Personalised</span>
            </div>
          )}

          {/* Creative content */}
          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <span className="text-6xl mb-3">{item.emoji}</span>
            <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-2">EngageKit</p>
            <h2
              className="text-2xl font-bold leading-snug mb-3"
              style={{ color: theme.accent, fontFamily: "'DM Serif Display', serif" }}
            >
              {item.title}
            </h2>
            <p className="text-white text-xs leading-relaxed max-w-[220px]">{tagline}</p>
            <p className="text-white/40 text-[11px] mt-1.5 max-w-[200px]">{sub}</p>
          </div>

          {/* RPM identity strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-4 py-3 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#e8a020] flex items-center justify-center flex-shrink-0">
              <span className="text-[#0f1f3d] font-bold text-xs">{initials(name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-xs truncate">{name}</p>
              <p className="text-white/50 text-[10px] truncate">{designation}</p>
            </div>
            <p className="text-white/25 text-[9px] flex-shrink-0">EngageKit</p>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4">
          {/* Persona toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[#0f1f3d] text-sm font-semibold">Tailor to customer persona</p>
              <p className="text-gray-400 text-xs mt-0.5">
                {personaOn ? 'Personalised version' : 'Generic version'}
              </p>
            </div>
            <button
              onClick={() => setPersonaOn(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                personaOn ? 'bg-[#0f1f3d]' : 'bg-gray-300'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                personaOn ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#e4e7f0] text-[#0f1f3d] text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              className="flex-1 py-3 rounded-xl bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 text-white text-sm font-semibold transition-colors"
            >
              Share →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
