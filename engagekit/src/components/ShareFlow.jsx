import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { customers as allCustomers } from '../data/mockData'
import { generateShareImage } from '../lib/generateShareImage'

// ── Link base URL — uses current origin so localhost works during dev ─────────
function linkUrl(token) { return `${window.location.origin}/c/${token}` }

// ── WhatsApp message templates (per demoType) ────────────────────────────────

const WA_TEMPLATES = {
  'quiz':            "Hi [Customer Name]! Here's a quick 4-question quiz that tells you your money personality — surprisingly accurate. Takes 2 minutes.",
  'fire-calculator': "Hi [Customer Name]! This tool shows you exactly when you could retire based on your savings. Worth a look.",
  'protection-gap':  "Hi [Customer Name]! Here's a quick calculator to check if your life cover is adequate for your family.",
  'poll':            "Hi [Customer Name]! One quick question — curious what you think.",
  'mood':            "Hi [Customer Name]! A quick one — how are you feeling about money right now?",
  'life-word':       "Hi [Customer Name]! Here's today's Life Word — a financial term explained simply through a quick game.",
  'creative':        "Hi [Customer Name]! Sharing this with you — hope it brings a smile.",
}

function buildWaText(demoType, customerName, link) {
  const template = WA_TEMPLATES[demoType] || WA_TEMPLATES.creative
  return template.replace('[Customer Name]', customerName) + '\n\n' + link
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateToken() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

const avatarBg = ['bg-[#0f1f3d]', 'bg-indigo-700', 'bg-emerald-700', 'bg-rose-700', 'bg-violet-700']

const policyBadge = {
  Par:       'bg-emerald-50 text-emerald-700',
  'Non-Par': 'bg-purple-50 text-purple-700',
  Term:      'bg-blue-50 text-blue-700',
  Annuity:   'bg-amber-50 text-amber-700',
}

const categoryStyle = {
  Quiz:       { bg: 'bg-blue-50',    tag: 'bg-blue-50 text-blue-600' },
  Calculator: { bg: 'bg-emerald-50', tag: 'bg-emerald-50 text-emerald-600' },
  Game:       { bg: 'bg-purple-50',  tag: 'bg-purple-50 text-purple-600' },
  Mood:       { bg: 'bg-pink-50',    tag: 'bg-pink-50 text-pink-600' },
  Festive:    { bg: 'bg-amber-50',   tag: 'bg-amber-50 text-amber-700' },
  Occasion:   { bg: 'bg-teal-50',    tag: 'bg-teal-50 text-teal-600' },
}

const CREATIVE_THEMES = {
  Festive:  { bg: 'from-[#1a0800] via-[#3d1500] to-[#1a0800]', accent: '#e8a020' },
  Occasion: { bg: 'from-[#0d0d2b] via-[#1a0a40] to-[#0d0d2b]', accent: '#a78bfa' },
  default:  { bg: 'from-[#0f1f3d] via-[#1a3260] to-[#0f1f3d]', accent: '#e8a020' },
}

// ── Preview sub-components ───────────────────────────────────────────────────

function CreativePreview({ item, name, designation }) {
  const theme = CREATIVE_THEMES[item.category] || CREATIVE_THEMES.default
  return (
    <div className={`relative bg-gradient-to-br ${theme.bg} aspect-[3/4] flex flex-col items-center justify-center overflow-hidden`}>
      <div className="absolute top-6 right-6 w-20 h-20 rounded-full opacity-10" style={{ background: theme.accent }} />
      <div className="absolute bottom-16 left-4 w-12 h-12 rounded-full opacity-10" style={{ background: theme.accent }} />
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <span className="text-6xl mb-3">{item.emoji}</span>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mb-2">EngageKit</p>
        <h2 className="text-2xl font-bold leading-snug mb-2" style={{ color: theme.accent, fontFamily: "'DM Serif Display', serif" }}>
          {item.title}
        </h2>
        <p className="text-white/60 text-xs max-w-[200px] leading-relaxed">{item.description}</p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-4 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#e8a020] flex items-center justify-center flex-shrink-0">
          <span className="text-[#0f1f3d] font-bold text-xs">{initials(name)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-xs truncate">{name}</p>
          <p className="text-white/50 text-[10px] truncate">{designation}</p>
        </div>
        <p className="text-white/25 text-[9px]">EngageKit</p>
      </div>
    </div>
  )
}

function InteractivePreview({ item, name }) {
  const style = categoryStyle[item.category] || { bg: 'bg-gray-50', tag: 'bg-gray-100 text-gray-600' }
  return (
    <div>
      <div className={`${style.bg} py-8 flex items-center justify-center text-5xl`}>{item.emoji}</div>
      <div className="p-5">
        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.tag}`}>
          {item.category}
        </span>
        <h3 className="text-[#0f1f3d] font-bold text-base mt-2 leading-snug">{item.title}</h3>
        <p className="text-gray-400 text-sm mt-2 leading-relaxed line-clamp-2">{item.description}</p>
      </div>
      <div className="bg-[#0f1f3d] px-5 py-3 flex items-center gap-2">
        <span className="text-white/50 text-xs">Shared by</span>
        <span className="text-white text-xs font-semibold truncate">{name}</span>
        <span className="text-white/30 text-xs">·</span>
        <span className="text-[#e8a020] text-xs font-medium flex-shrink-0">Edelweiss Life</span>
      </div>
    </div>
  )
}

function WaMessagePreview({ demoType, customerName }) {
  const template = WA_TEMPLATES[demoType] || WA_TEMPLATES.creative
  const displayName = customerName || '[Customer Name]'
  const message = template.replace('[Customer Name]', displayName)
  return (
    <div className="px-4 py-3 bg-gray-50 border-t border-[#e4e7f0]">
      <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2">WhatsApp message preview</p>
      <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <p className="text-gray-700 text-sm leading-relaxed">
          {message}{' '}
          <span className="text-blue-400 text-xs underline">[link]</span>
        </p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ShareFlow({ item, onClose, preselectedCustomer }) {
  const { user } = useAuth()

  // If a customer is already known (e.g., from CustomerDetail), skip the selector.
  const [step,            setStep]            = useState('preview')
  const [search,          setSearch]          = useState('')
  const [selected,        setSelected]        = useState(preselectedCustomer || null)
  const [generating,      setGenerating]      = useState(false)
  const [linkError,       setLinkError]       = useState('')
  const [token,           setToken]           = useState(null)
  const [copied,          setCopied]          = useState(false)
  const [shareImageFile,  setShareImageFile]  = useState(null)
  const [imageGenerating, setImageGenerating] = useState(false)

  const isCreative = item.demoType === 'creative'
  const name        = user?.name        || 'Your Advisor'
  const designation = user?.designation || 'Relationship Portfolio Manager'

  const filtered = allCustomers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.policyNumber?.toLowerCase().includes(search.toLowerCase())
  )

  async function generateLink(customerOverride) {
    const customer = customerOverride || selected
    if (!customer || generating) return
    setGenerating(true)
    setLinkError('')
    try {
      const newToken = generateToken()

      // Capture RPM's IP address at link-creation time
      let rpmIp = null
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        const ipData = await ipRes.json()
        rpmIp = ipData.ip ?? null
      } catch { /* non-fatal */ }

      const { error } = await supabase.from('links').insert({
        token:        newToken,
        rpm_id:       user?.id    ?? null,
        customer_id:  null,              // customers not in Supabase yet
        content_id:   item.id,
        content_type: item.category,
        is_demo:      false,
        rpm_ip:       rpmIp,
        rpm_device:   navigator.userAgent,
        rpm_name:     user?.name    ?? null,
        customer_name: customer.name ?? null,
      })
      if (error) throw error
      setSelected(customer)
      setToken(newToken)
      setStep('link')

      // Generate share image in parallel — ready by the time the RPM taps WhatsApp
      setImageGenerating(true)
      generateShareImage(item, name, designation)
        .then(file => { setShareImageFile(file); setImageGenerating(false) })
        .catch(() => setImageGenerating(false))
    } catch (err) {
      setLinkError('Could not generate link. Please try again.')
      console.error('Link generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  function handleSendThis() {
    if (preselectedCustomer) {
      // Customer already known — generate immediately, skip selector.
      generateLink(preselectedCustomer)
    } else {
      setStep('selector')
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(linkUrl(token))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openWhatsApp() {
    const link = linkUrl(token)
    const text = buildWaText(item.demoType, selected?.name || 'there', link)

    if (shareImageFile && navigator.share && navigator.canShare?.({ files: [shareImageFile] })) {
      // Mobile: native share sheet — image + text, user picks WhatsApp
      navigator.share({ files: [shareImageFile], text })
        .catch(err => {
          if (err.name !== 'AbortError') {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
          }
        })
      return
    }

    // Desktop or no file-share support: text-only wa.me
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const sendButtonLabel = generating
    ? 'Generating…'
    : preselectedCustomer
      ? `Send to ${preselectedCustomer.name.split(' ')[0]} →`
      : 'Send This →'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 max-h-[88vh] flex flex-col">

        {/* ══ STEP 1: Preview ══════════════════════════════════════════ */}
        {step === 'preview' && (
          <>
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center bg-black/25 hover:bg-black/45 text-white rounded-full text-xs transition-colors"
            >
              ✕
            </button>

            <div className="overflow-y-auto flex-1">
              {isCreative
                ? <CreativePreview item={item} name={name} designation={designation} />
                : <InteractivePreview item={item} name={name} />
              }
              <WaMessagePreview
                demoType={item.demoType}
                customerName={preselectedCustomer?.name}
              />
            </div>

            <div className="p-4 border-t border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={handleSendThis}
                disabled={generating}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {sendButtonLabel}
              </button>
            </div>
          </>
        )}

        {/* ══ STEP 2: Customer Selector ════════════════════════════════ */}
        {step === 'selector' && (
          <>
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={() => setStep('preview')}
                className="text-gray-400 hover:text-[#0f1f3d] transition-colors p-1 -ml-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-[#0f1f3d] font-bold text-base flex-1">Send to…</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="px-4 py-3 border-b border-[#e4e7f0] flex-shrink-0">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or policy…"
                  className="w-full bg-gray-50 border border-[#e4e7f0] focus:border-[#0f1f3d]/30 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-gray-400">
                  {allCustomers.length === 0 ? (
                    <>
                      <span className="text-4xl mb-2">👤</span>
                      <p className="text-sm font-medium text-gray-500">No customers loaded yet.</p>
                      <p className="text-xs mt-1 leading-relaxed">Upload your customer list from the admin panel.</p>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl mb-2">🔍</span>
                      <p className="text-sm">No match for "{search}"</p>
                    </>
                  )}
                </div>
              ) : (
                filtered.map(c => {
                  const isSelected = selected?.id === c.id
                  const bg         = avatarBg[c.name?.charCodeAt(0) % avatarBg.length] || avatarBg[0]
                  const badge      = policyBadge[c.policyType] || 'bg-gray-100 text-gray-600'
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#e4e7f0] text-left transition-all ${
                        isSelected ? 'bg-[#0f1f3d]/[0.04] border-l-[3px] border-l-[#0f1f3d]' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-semibold">{initials(c.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0f1f3d] font-semibold text-sm truncate">{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.policyNumber}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge}`}>{c.policyType}</span>
                          {c.persona && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e8a020]/10 text-[#e8a020] font-semibold border border-[#e8a020]/20">
                              {c.persona}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#0f1f3d] flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            <div className="p-4 border-t border-[#e4e7f0] flex-shrink-0">
              {linkError && <p className="text-red-400 text-xs mb-2">{linkError}</p>}
              <button
                onClick={() => generateLink()}
                disabled={!selected || generating}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {generating ? 'Generating…' : 'Generate Unique Link →'}
              </button>
            </div>
          </>
        )}

        {/* ══ STEP 3: Link Generated ═══════════════════════════════════ */}
        {step === 'link' && (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <div>
                <h3 className="text-[#0f1f3d] font-bold text-base">Link Ready 🎉</h3>
                <p className="text-gray-400 text-xs mt-0.5">For {selected?.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-[#f4f5f9] border border-[#e4e7f0] rounded-xl p-4">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">Unique link</p>
                <p className="text-[#0f1f3d] font-mono text-sm break-all leading-relaxed">
                  {`${window.location.origin}/c/`}<span className="text-[#e8a020] font-bold">{token}</span>
                </p>
              </div>

              {/* Personalised message preview */}
              <div>
                <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2">Message to be sent</p>
                <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {buildWaText(item.demoType, selected?.name || 'there', linkUrl(token))}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    copied
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-white border-[#e4e7f0] text-[#0f1f3d] hover:border-[#0f1f3d]/40'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={openWhatsApp}
                  className="flex-1 py-3 rounded-xl bg-[#25d366] hover:bg-[#1ebe5d] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </button>
              </div>

              {imageGenerating && (
                <p className="text-gray-400 text-[11px] text-center -mt-1">Preparing image…</p>
              )}

              <p className="text-gray-400 text-xs text-center leading-relaxed">
                When this customer opens and interacts with the link, you will see it in their profile.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
