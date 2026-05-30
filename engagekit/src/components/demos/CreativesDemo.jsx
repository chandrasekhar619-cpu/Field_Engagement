import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Toast from '../Toast'
import { logOutcome } from '../../lib/logOutcome'
import { drawCreativeCard } from '../../lib/drawCard'

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

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
  rpmName,           // override for customer context (from link.rpm_name)
  rpmDesignation,    // optional override
}) {
  const { user } = useAuth()
  // rpmName / rpmDesignation props take priority over auth context
  const name        = rpmName        || user?.name        || 'Your Advisor'
  const designation = rpmDesignation || user?.designation || 'Relationship Portfolio Manager'

  const theme = THEMES[item.category] || THEMES.default

  const [shareFile, setShareFile] = useState(null)
  const [toast,     setToast]     = useState(null)

  // Log outcome when viewed in customer mode
  useEffect(() => {
    if (isCustomerView && linkId) logOutcome(linkId, 'Viewed')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Draw the creative card programmatically as soon as it mounts in customer view
  useEffect(() => {
    if (!isCustomerView) return
    let cancelled = false

    drawCreativeCard(item, name, designation)
      .then(file => { if (!cancelled && file) setShareFile(file) })
      .catch(err => console.error('[CreativesDemo] drawCreativeCard failed:', err))

    return () => { cancelled = true }
  }, [isCustomerView]) // eslint-disable-line react-hooks/exhaustive-deps

  function downloadAndToast(file) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url; a.download = file.name
    document.body.appendChild(a); a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast('Image saved — attach it in WhatsApp')
  }

  function handleShare() {
    console.log('[CreativesDemo] shareFile at tap time:', shareFile)
    if (!shareFile) {
      setToast('Could not prepare image — try again')
      return
    }

    if (navigator.share && navigator.canShare({ files: [shareFile] })) {
      navigator.share({ files: [shareFile] })
        .catch(err => { if (err.name !== 'AbortError') downloadAndToast(shareFile) })
    } else {
      downloadAndToast(shareFile)
    }
  }

  return (
    <div className="min-h-screen flex flex-col pb-24">
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

      {/* RPM share CTA */}
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

      {/* Customer share CTA — copies blob to clipboard then opens WhatsApp */}
      {isCustomerView && (
        <>
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e7f0] p-4 z-10">
            <button
              type="button"
              onClick={handleShare}
              className="w-full bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <WaIcon />
              Share this creative
            </button>
          </div>
        </>
      )}
    </div>
  )
}
