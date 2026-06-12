import { useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { logOutcome } from '../../lib/logOutcome'
import { supabase } from '../../lib/supabaseClient'

const THEMES = {
  Festive: {
    bg: 'bg-gradient-to-br from-[#1a0800] via-[#3d1500] to-[#1a0800]',
    accentColor: '#e8a020',
    tagline: 'Protecting what matters most is the greatest gift.',
    subline: 'This Diwali, let your loved ones feel truly secure.',
    decorEmoji: '✨',
  },
  Occasion: {
    bg: 'bg-gradient-to-br from-[#0d0d2b] via-[#1a0a40] to-[#0d0d2b]',
    accentColor: '#a78bfa',
    tagline: 'Every year you grow is another chapter worth protecting.',
    subline: 'Wishing you a year full of milestones — and the security to enjoy them.',
    decorEmoji: '⭐',
  },
  default: {
    bg: 'bg-gradient-to-br from-[#0f1f3d] via-[#1a3260] to-[#0f1f3d]',
    accentColor: '#e8a020',
    tagline: 'The right protection changes everything.',
    subline: 'Built for the moments that matter most.',
    decorEmoji: '💫',
  },
}

export default function CreativesDemo({
  item, onShare,
  isCustomerView = false,
  linkId,
  rpmName,
  rpmDesignation,
  shareToken,
}) {
  const { user } = useAuth()
  const name        = rpmName        || user?.name        || 'Your Advisor'
  const designation = rpmDesignation || user?.designation || 'Relationship Portfolio Manager'

  const theme = THEMES[item.category] || THEMES.default

  // Viewing IS completion for creatives — log outcome and mark token used on render
  useEffect(() => {
    if (!isCustomerView) return
    if (linkId) logOutcome(linkId, 'Viewed')
    if (shareToken) {
      supabase.from('share_tokens').update({ used: true }).eq('token', shareToken)
        .then(({ error }) => { if (error) console.error('share_token mark-used failed:', error) })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`min-h-screen flex flex-col ${!isCustomerView ? 'pb-24' : ''}`}>
      {/* Creative canvas */}
      <div className={`relative flex-1 flex flex-col items-center justify-center min-h-[70vh] ${theme.bg} overflow-hidden`}>
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full opacity-10" style={{ background: theme.accentColor }} />
        <div className="absolute bottom-20 left-8 w-20 h-20 rounded-full opacity-10" style={{ background: theme.accentColor }} />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full opacity-30" style={{ background: theme.accentColor }} />
        <div className="absolute top-1/4 right-1/3 w-2 h-2 rounded-full opacity-30" style={{ background: theme.accentColor }} />

        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <span className="text-8xl mb-2 animate-[bounce_3s_ease-in-out_infinite]">{item.emoji}</span>
          <span className="text-3xl mb-6">{theme.decorEmoji}</span>
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mb-3">EngageKit</p>
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4" style={{ color: theme.accentColor, fontFamily: "'DM Serif Display', serif" }}>
            {item.title}
          </h2>
          <p className="text-white text-base leading-relaxed max-w-xs">{theme.tagline}</p>
          <p className="text-white/50 text-sm mt-2 max-w-xs">{theme.subline}</p>
        </div>

        {/* RPM identity strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e8a020] flex items-center justify-center flex-shrink-0">
            <span className="text-[#0f1f3d] font-bold text-sm">
              {(name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{name}</p>
            <p className="text-white/50 text-xs truncate">{designation}</p>
          </div>
          <p className="text-white/30 text-[10px] flex-shrink-0">EngageKit</p>
        </div>
      </div>

      {/* RPM preview CTA — not shown to customers */}
      {!isCustomerView && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e7f0] p-4 z-10">
          <button
            type="button"
            onClick={onShare}
            className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            Share this with a customer →
          </button>
        </div>
      )}
    </div>
  )
}
