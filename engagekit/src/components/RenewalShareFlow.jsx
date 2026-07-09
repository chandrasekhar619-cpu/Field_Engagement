import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { getWhatsAppMessage } from '../lib/whatsappMessages'
import RenewalShareCard from './RenewalShareCard'

function linkUrl(token, extra) {
  const base = `${window.location.origin}/c?token=${token}`
  if (!extra) return base
  return `${base}&${new URLSearchParams(extra).toString()}`
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

// Convert DD-MM-YYYY to YYYY-MM-DD for date parsing
function convertDDMMYYYY(dateStr) {
  if (!dateStr) return ''
  const [day, month, year] = dateStr.split('-')
  if (!day || !month || !year) return ''
  return `${year}-${month}-${day}`
}

// Format DD-MM-YYYY date for display
function formatDDMMYYYY(dateStr) {
  if (!dateStr) return ''
  const yyyy_mm_dd = convertDDMMYYYY(dateStr)
  if (!yyyy_mm_dd) return ''
  const d = new Date(yyyy_mm_dd)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN')
}

const avatarBg = ['bg-[#0f1f3d]', 'bg-indigo-700', 'bg-emerald-700', 'bg-rose-700', 'bg-violet-700']

const policyBadge = {
  Par:       'bg-emerald-50 text-emerald-700',
  'Non-Par': 'bg-purple-50 text-purple-700',
  Term:      'bg-blue-50 text-blue-700',
  Annuity:   'bg-amber-50 text-amber-700',
}

const CARD_OPTIONS = [
  { label: '30-Day Reminder',  desc: 'Send ~a month before renewal',                          cardNumber: 2 },
  { label: '2-Week Reminder',  desc: 'Send ~2 weeks before renewal',                           cardNumber: 3 },
  { label: 'Final Reminder',   desc: 'Send in the last few days before and during grace period', cardNumber: 1 },
]

const EMPTY_DETAILS = { premium: '', payment_mode: '' }

const PAYMENT_MODE_OPTIONS = [
  { value: 'Monthly',        label: 'Monthly' },
  { value: 'Quarterly',      label: 'Quarterly' },
  { value: 'Semi-annually',  label: 'Semi-annually' },
  { value: 'Annually',       label: 'Annually' },
]

export default function RenewalShareFlow({ item, onClose }) {
  const { user } = useAuth()

  const [step,         setStep]         = useState('card')
  const [selectedCard, setSelectedCard] = useState(null)    // card number 1/2/3
  const [search,       setSearch]       = useState('')
  const [selected,     setSelected]     = useState(null)    // customer
  const [details,      setDetails]      = useState(EMPTY_DETAILS)
  const [detailErrors, setDetailErrors] = useState({})
  const [generating,      setGenerating]      = useState(false)
  const [linkError,       setLinkError]       = useState('')
  const [token,           setToken]           = useState(null)
  const [copied,          setCopied]          = useState(false)
  const [shareImageFile,  setShareImageFile]  = useState(null)
  const [imageGenerating, setImageGenerating] = useState(false)
  const [prefilled,       setPrefilled]       = useState(false)
  const [nomineeName,     setNomineeName]     = useState('')
  const [paymentMode,     setPaymentMode]     = useState('')

  const [allCustomers,     setAllCustomers]     = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const debounceRef = useRef(null)
  const cardRef     = useRef(null)

  // Customer search — same pattern as ShareFlow
  useEffect(() => {
    const term = search.trim()
    clearTimeout(debounceRef.current)
    if (term.length < 2) { setAllCustomers([]); setCustomersLoading(false); return }
    setCustomersLoading(true)
    debounceRef.current = setTimeout(() => {
      supabase
        .from('customers')
        .select('id, name, policy_number, policy_type, persona, premium_due_date, product_name')
        .or(`name.ilike.%${term}%,policy_number.ilike.%${term}%`)
        .order('name', { ascending: true })
        .limit(20)
        .then(({ data }) => {
          setAllCustomers((data || []).map(r => ({
            ...r,
            policyNumber: r.policy_number,
            policyType:   r.policy_type,
          })))
          setCustomersLoading(false)
        })
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const [waPhoneNumber,   setWaPhoneNumber]   = useState('')

  // Capture the off-screen share card as a PNG once the link step mounts
  useEffect(() => {
    if (step !== 'link') return
    setShareImageFile(null)
    setImageGenerating(true)
    // Double-rAF ensures the card element is fully painted before html2canvas reads it
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!cardRef.current) { setImageGenerating(false); return }
      import('html2canvas').then(({ default: html2canvas }) =>
        html2canvas(cardRef.current, {
          scale:           2,
          useCORS:         true,
          backgroundColor: '#ffffff',
          logging:         false,
        })
          .then(canvas => canvas.toBlob(
            blob => {
              if (blob) setShareImageFile(new File([blob], 'renewal-reminder.png', { type: 'image/png' }))
              setImageGenerating(false)
            },
            'image/png'
          ))
          .catch(() => setImageGenerating(false))
      )
    }))
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSelectCustomer(c) {
    setSelected(c)
    setPrefilled(false)
    setDetails(EMPTY_DETAILS)
    setPaymentMode('')
    if (!c.policy_number) return
    const { data } = await supabase
      .from('policy_metadata')
      .select('premium, payment_mode')
      .eq('policy_number', c.policy_number)
      .single()
    if (data) {
      setDetails({
        premium: data.premium != null ? String(data.premium) : '',
        payment_mode: data.payment_mode != null ? String(data.payment_mode) : '',
      })
      setPaymentMode(data.payment_mode || '')
      setPrefilled(true)
    }
  }

  function validateDetails() {
    const errs = {}
    if (!details.premium)     errs.premium = 'Required'
    if (selectedCard === 2 && !paymentMode) errs.payment_mode = 'Required'
    setDetailErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function generateLink() {
    if (!validateDetails()) return
    setGenerating(true)
    setLinkError('')
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      const { data: tokenData, error: tokenErr } = await supabase
        .from('share_tokens')
        .insert({
          customer_id: selected.id,
          created_by:  authUser?.id ?? null,
          metadata: {
            card_number:  selectedCard,
            premium:      parseInt(details.premium),
            ...(selectedCard === 2 && paymentMode && { payment_mode: paymentMode }),
            ...(selectedCard === 3 && { product_name: selected.product_name, premium_due_date: selected.premium_due_date }),
          },
        })
        .select('token')
        .single()
      if (tokenErr || !tokenData?.token) {
        console.error('share_tokens insert failed:', tokenErr)
        throw tokenErr ?? new Error('No token returned')
      }

      const uuid = tokenData.token

      let rpmIp = null
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        rpmIp = (await ipRes.json()).ip ?? null
      } catch { /* non-fatal */ }

      const { error: linkErr } = await supabase.from('links').insert({
        token:         uuid,
        rpm_id:        user?.id      ?? null,
        customer_id:   selected.id,
        content_id:    'renewal-reminder',
        content_type:  'Reminder',
        is_demo:       false,
        rpm_ip:        rpmIp,
        rpm_device:    navigator.userAgent,
        rpm_name:      user?.name    ?? null,
        customer_name: selected.name ?? null,
        reminder_type: { 1: 'Final Reminder', 2: '30-Day Reminder', 3: '2-Week Reminder' }[selectedCard],
      })
      if (linkErr) throw linkErr

      // Fire-and-forget — store values so the next share for this policy auto-fills
      const { error: metaErr } = await supabase.from('policy_metadata').upsert({
        policy_number: selected.policy_number,
        premium:       parseInt(details.premium),
        ...(selectedCard === 2 && paymentMode && { payment_mode: paymentMode }),
        updated_at:    new Date().toISOString(),
      }, { onConflict: 'policy_number' })
      if (metaErr) console.error('policy_metadata upsert failed:', metaErr)

      setToken(uuid)
      setStep('link')
    } catch (err) {
      const msg = err?.message || err?.details || 'Unknown error'
      setLinkError(`Could not generate link: ${msg}`)
      console.error('Renewal link error:', err)
    } finally {
      setGenerating(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(activeMsg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardLink = token
    ? linkUrl(token, {
        ...(selectedCard === 2 && nomineeName.trim() && { nominee_name: nomineeName.trim() }),
        ...(selectedCard === 2 && { payment_mode: paymentMode || '' }),
        ...(selectedCard === 2 && details.premium && { premium: details.premium }),
      })
    : ''
  const activeMsg = cardLink && selected
    ? getWhatsAppMessage('renewal-card', selected.persona, selected.name || 'there', cardLink, user?.name || 'Your Advisor')
    : ''

  function openWhatsApp() {
    const num = waPhoneNumber.trim().replace(/\D/g, '')
    if (num && num.length === 10) {
      window.open(`https://wa.me/91${num}?text=${encodeURIComponent(activeMsg)}`, '_blank')
      return
    }
    if (shareImageFile && navigator.share && navigator.canShare?.({ files: [shareImageFile] })) {
      navigator.share({ files: [shareImageFile], text: activeMsg })
        .catch(err => {
          if (err.name !== 'AbortError') {
            window.open(`https://wa.me/?text=${encodeURIComponent(activeMsg)}`, '_blank')
          }
        })
      return
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(activeMsg)}`, '_blank')
  }

  function handleDetailChange(field, value) {
    setDetails(d => ({ ...d, [field]: value }))
    if (detailErrors[field]) setDetailErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function handleCardChange(card) {
    setSelectedCard(card)
    setNomineeName('')
    setPaymentMode('')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Off-screen card for html2canvas capture — never visible to user */}
      {step === 'link' && (
        <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
          <RenewalShareCard
            ref={cardRef}
            cardNumber={selectedCard}
            persona={selected?.persona}
            customerName={selected?.name}
            policyName={selected?.policyNumber}
            dueDate={selected?.premium_due_date}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 max-h-[88vh] flex flex-col">

        {/* ══ STEP 1: Select Card ═══════════════════════════════════════ */}
        {step === 'card' && (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <div>
                <h3 className="text-[#0f1f3d] font-bold text-base">Renewal Reminder</h3>
                <p className="text-gray-400 text-xs mt-0.5">Which reminder to send?</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
              {CARD_OPTIONS.map(opt => (
                <button
                  key={opt.cardNumber}
                  onClick={() => { setSelectedCard(opt.cardNumber); setNomineeName(''); setPaymentMode('') }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedCard === opt.cardNumber
                      ? 'border-[#0f1f3d] bg-[#0f1f3d]/[0.03]'
                      : 'border-[#e4e7f0] hover:border-[#0f1f3d]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[#0f1f3d] font-semibold text-sm">{opt.label}</p>
                    {selectedCard === opt.cardNumber && (
                      <span className="w-5 h-5 rounded-full bg-[#0f1f3d] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={() => setStep('customer')}
                disabled={!selectedCard}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                Next — Select Customer →
              </button>
            </div>
          </>
        )}

        {/* ══ STEP 2: Customer Selector ════════════════════════════════ */}
        {step === 'customer' && (
          <>
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={() => setStep('card')}
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
              {customersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : search.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-gray-400">
                  <span className="text-4xl mb-2">🔍</span>
                  <p className="text-sm font-medium text-gray-500">Search by name or policy number</p>
                  <p className="text-xs mt-1">Type at least 2 characters to find a customer</p>
                </div>
              ) : allCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-gray-400">
                  <span className="text-3xl mb-2">🔍</span>
                  <p className="text-sm">No match for "{search}"</p>
                </div>
              ) : (
                allCustomers.map(c => {
                  const isSelected = selected?.id === c.id
                  const bg         = avatarBg[c.name?.charCodeAt(0) % avatarBg.length] || avatarBg[0]
                  const badge      = policyBadge[c.policyType] || 'bg-gray-100 text-gray-600'
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
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
              <button
                onClick={() => setStep('details')}
                disabled={!selected}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                Next — Enter Policy Details →
              </button>
            </div>
          </>
        )}

        {/* ══ STEP 3: Policy Details ═══════════════════════════════════ */}
        {step === 'details' && (
          <>
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={() => setStep('customer')}
                className="text-gray-400 hover:text-[#0f1f3d] transition-colors p-1 -ml-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h3 className="text-[#0f1f3d] font-bold text-base">Policy Details</h3>
                <p className="text-gray-400 text-xs mt-0.5">{selected?.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
              {selectedCard === 2 && (
                <div>
                  <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                    Nominee Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={nomineeName}
                    onChange={e => setNomineeName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-gray-50 border border-[#e4e7f0] focus:border-[#0f1f3d]/30 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  />
                </div>
              )}
              {selectedCard === 3 && (
                <>
                  <div>
                    <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                      Product Name <span className="text-gray-400 font-normal">(auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      value={selected?.product_name || ''}
                      disabled
                      className="w-full bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm outline-none text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                      Renewal Due Date <span className="text-gray-400 font-normal">(auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      value={formatDDMMYYYY(selected?.premium_due_date)}
                      disabled
                      className="w-full bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm outline-none text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </>
              )}
              {[
                { field: 'premium', label: 'Annual Premium (₹)', type: 'number', placeholder: 'e.g. 24,500' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                    {label} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type={type}
                    value={details[field]}
                    onChange={e => handleDetailChange(field, e.target.value)}
                    placeholder={placeholder}
                    min={type === 'number' ? '0' : undefined}
                    className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
                      detailErrors[field]
                        ? 'border-red-300 focus:border-red-400'
                        : 'border-[#e4e7f0] focus:border-[#0f1f3d]/30'
                    }`}
                  />
                  {detailErrors[field] && (
                    <p className="text-red-400 text-xs mt-1">{detailErrors[field]}</p>
                  )}
                </div>
              ))}
              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                  Payment Mode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={paymentMode}
                  onChange={e => {
                    setPaymentMode(e.target.value)
                    if (detailErrors.payment_mode) setDetailErrors(er => { const n = { ...er }; delete n.payment_mode; return n })
                  }}
                  placeholder="e.g. Monthly, Quarterly, Annual"
                  className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
                    detailErrors.payment_mode
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-[#e4e7f0] focus:border-[#0f1f3d]/30'
                  }`}
                />
                {detailErrors.payment_mode && (
                  <p className="text-red-400 text-xs mt-1">{detailErrors.payment_mode}</p>
                )}
                {paymentMode && (
                  <p className="text-green-600 text-xs mt-2 px-3 py-1.5 bg-green-50 rounded-lg">✓ Entered: <strong>{paymentMode}</strong></p>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#e4e7f0] flex-shrink-0">
              {prefilled && (
                <p className="text-gray-400 text-xs mb-2">Pre-filled from last entry</p>
              )}
              {linkError && <p className="text-red-400 text-xs mb-2">{linkError}</p>}
              <button
                onClick={generateLink}
                disabled={generating}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {generating ? 'Generating…' : 'Generate Unique Link →'}
              </button>
            </div>
          </>
        )}

        {/* ══ STEP 4: Link Generated ═══════════════════════════════════ */}
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
                  {`${window.location.origin}/c?token=`}<span className="text-[#e8a020] font-bold">{token}</span>
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-gray-400 text-[10px] uppercase tracking-wider">Message to be sent</p>
                <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <p className="text-gray-700 text-sm leading-relaxed">{activeMsg}</p>
                </div>
              </div>

              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                  Share to WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="+91"
                    disabled
                    className="w-[60px] bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm outline-none font-semibold text-[#0f1f3d]"
                  />
                  <input
                    type="tel"
                    value={waPhoneNumber}
                    onChange={e => setWaPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    maxLength="10"
                    className="flex-1 bg-gray-50 border border-[#e4e7f0] focus:border-[#0f1f3d]/30 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                  />
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
                  {copied ? '✓ Copied!' : 'Copy Message'}
                </button>
                <button
                  onClick={openWhatsApp}
                  disabled={imageGenerating}
                  className="flex-1 py-3 rounded-xl bg-[#25d366] hover:bg-[#1ebe5d] disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  {imageGenerating ? 'Preparing…' : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </>
                  )}
                </button>
              </div>

              <p className="text-gray-400 text-xs text-center leading-relaxed">
                When this customer opens the link, you will see it in their profile.
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
