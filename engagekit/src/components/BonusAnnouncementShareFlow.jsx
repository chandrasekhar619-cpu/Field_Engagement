import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { getWhatsAppMessage } from '../lib/whatsappMessages'
import BonusAnnouncementShareCard from './BonusAnnouncementShareCard'

function linkUrl(token) {
  return `${window.location.origin}/c?token=${token}`
}

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

const avatarBg = ['bg-[#0f1f3d]', 'bg-indigo-700', 'bg-emerald-700', 'bg-rose-700', 'bg-violet-700']

const policyBadge = {
  Par: 'bg-emerald-50 text-emerald-700',
  'Non-Par': 'bg-purple-50 text-purple-700',
  Term: 'bg-blue-50 text-blue-700',
  Annuity: 'bg-amber-50 text-amber-700',
}

const VARIANTS = [
  {
    id: 'premium',
    label: 'Premium Paying',
    desc: 'Share this year bonus for premium-paying policies',
  },
  {
    id: 'rpu',
    label: 'Reduced Paid-Up',
    desc: 'Share this year bonus and revival bonus value',
  },
]

export default function BonusAnnouncementShareFlow({ item, onClose, preselectedCustomer }) {
  const { user } = useAuth()
  const [step, setStep] = useState('variant')
  const [variant, setVariant] = useState(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(preselectedCustomer || null)
  const [bonusAmount, setBonusAmount] = useState('')
  const [bonusAmountRevived, setBonusAmountRevived] = useState('')
  const [errors, setErrors] = useState({})
  const [generating, setGenerating] = useState(false)
  const [token, setToken] = useState(null)
  const [linkError, setLinkError] = useState('')
  const [copied, setCopied] = useState(false)
  const [shareImageFile, setShareImageFile] = useState(null)
  const [imageGenerating, setImageGenerating] = useState(false)
  const [waPhoneNumber, setWaPhoneNumber] = useState('')

  const [allCustomers, setAllCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(false)
  const debounceRef = useRef(null)
  const cardRef = useRef(null)

  const isRpu = variant === 'rpu'

  useEffect(() => {
    if (preselectedCustomer) setSelected(preselectedCustomer)
  }, [preselectedCustomer?.id])

  useEffect(() => {
    const term = search.trim()
    clearTimeout(debounceRef.current)
    if (term.length < 2) {
      setAllCustomers([])
      setCustomersLoading(false)
      return
    }

    setCustomersLoading(true)
    debounceRef.current = setTimeout(() => {
      supabase
        .from('customers')
        .select('id, name, policy_number, policy_type, persona, product_name')
        .or(`name.ilike.%${term}%,policy_number.ilike.%${term}%,product_name.ilike.%${term}%`)
        .order('name', { ascending: true })
        .limit(20)
        .then(({ data }) => {
          setAllCustomers((data || []).map(r => ({
            ...r,
            policyNumber: r.policy_number,
            policyType: r.policy_type,
          })))
          setCustomersLoading(false)
        })
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [search])

  useEffect(() => {
    if (step !== 'link') return
    setShareImageFile(null)
    setImageGenerating(true)

    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!cardRef.current) {
        setImageGenerating(false)
        return
      }

      import('html2canvas').then(({ default: html2canvas }) =>
        html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })
          .then(canvas => canvas.toBlob(
            blob => {
              if (blob) setShareImageFile(new File([blob], 'bonus-announcement.jpg', { type: 'image/jpeg' }))
              setImageGenerating(false)
            },
            'image/jpeg',
            0.92
          ))
          .catch(() => setImageGenerating(false))
      )
    }))
  }, [step])

  function validate() {
    const next = {}
    if (!bonusAmount) next.bonusAmount = 'Required'
    if (isRpu && !bonusAmountRevived) next.bonusAmountRevived = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function generateLink() {
    if (!selected || !validate()) return
    setGenerating(true)
    setLinkError('')

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      const metadata = {
        variant,
        product_name: selected.product_name || '',
        policy_number: selected.policy_number || '',
        bonus_amount: bonusAmount,
        ...(isRpu && { bonus_amount_revived: bonusAmountRevived }),
      }

      const { data: tokenData, error: tokenErr } = await supabase
        .from('share_tokens')
        .insert({
          customer_id: selected.id,
          created_by: authUser?.id ?? null,
          metadata,
        })
        .select('token')
        .single()

      if (tokenErr || !tokenData?.token) throw tokenErr ?? new Error('No token returned')

      const uuid = tokenData.token

      let rpmIp = null
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json')
        rpmIp = (await ipRes.json()).ip ?? null
      } catch {
        // non-fatal
      }

      const { error: linkErr } = await supabase.from('links').insert({
        token: uuid,
        rpm_id: user?.id ?? null,
        customer_id: selected.id,
        content_id: item.id || 'bonus-announcement',
        content_type: 'Reminder',
        is_demo: false,
        rpm_ip: rpmIp,
        rpm_device: navigator.userAgent,
        rpm_name: user?.name ?? null,
        customer_name: selected.name ?? null,
      })
      if (linkErr) throw linkErr

      setToken(uuid)
      setStep('link')
    } catch (err) {
      setLinkError(`Could not generate link: ${err?.message || 'Unknown error'}`)
    } finally {
      setGenerating(false)
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(activeMsg)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const activeMsg = token && selected
    ? getWhatsAppMessage(
      'bonus-announcement',
      selected.persona,
      selected.name || 'there',
      linkUrl(token),
      user?.name || 'Your Advisor',
      { productName: selected.product_name || 'your policy' }
    )
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {step === 'link' && (
        <div style={{ position: 'fixed', top: -9999, left: -9999, pointerEvents: 'none' }}>
          <BonusAnnouncementShareCard
            ref={cardRef}
            customerName={selected?.name}
            productName={selected?.product_name}
            policyNumber={selected?.policy_number}
            variant={isRpu ? 'rpu' : 'premium'}
            bonusAmount={bonusAmount}
            bonusAmountRevived={bonusAmountRevived}
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 max-h-[88vh] flex flex-col">
        {step === 'variant' && (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <div>
                <h3 className="text-[#0f1f3d] font-bold text-base">Bonus Announcement</h3>
                <p className="text-gray-400 text-xs mt-0.5">Select variant</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3">
              {VARIANTS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setVariant(opt.id)
                    setStep(preselectedCustomer ? 'details' : 'customer')
                  }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    variant === opt.id
                      ? 'border-[#0f1f3d] bg-[#0f1f3d]/[0.03]'
                      : 'border-[#e4e7f0] hover:border-[#0f1f3d]/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[#0f1f3d] font-semibold text-sm">{opt.label}</p>
                    {variant === opt.id && (
                      <span className="w-5 h-5 rounded-full bg-[#0f1f3d] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'customer' && (
          <>
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={() => setStep('variant')}
                className="text-gray-400 hover:text-[#0f1f3d] transition-colors p-1 -ml-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-[#0f1f3d] font-bold text-base flex-1">Select Customer</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="px-4 py-3 border-b border-[#e4e7f0] flex-shrink-0">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, policy, product..."
                className="w-full bg-gray-50 border border-[#e4e7f0] focus:border-[#0f1f3d]/30 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div className="overflow-y-auto flex-1">
              {customersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : search.trim().length < 2 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-gray-400">
                  <p className="text-sm font-medium text-gray-500">Type at least 2 characters to find a customer</p>
                </div>
              ) : allCustomers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-gray-400">
                  <p className="text-sm">No match for "{search}"</p>
                </div>
              ) : (
                allCustomers.map(c => {
                  const bg = avatarBg[c.name?.charCodeAt(0) % avatarBg.length] || avatarBg[0]
                  const badge = policyBadge[c.policyType] || 'bg-gray-100 text-gray-600'
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelected(c); setStep('details') }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-[#e4e7f0] text-left hover:bg-gray-50 transition-all"
                    >
                      <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-xs font-semibold">{initials(c.name)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#0f1f3d] font-semibold text-sm truncate">{c.name}</p>
                        <p className="text-gray-400 text-xs">{c.policyNumber}</p>
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${badge}`}>{c.policyType}</span>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}

        {step === 'details' && selected && (
          <>
            <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <button
                onClick={() => setStep(preselectedCustomer ? 'variant' : 'customer')}
                className="text-gray-400 hover:text-[#0f1f3d] transition-colors p-1 -ml-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex-1">
                <h3 className="text-[#0f1f3d] font-bold text-base">{isRpu ? 'Reduced Paid-Up' : 'Premium Paying'} Bonus</h3>
                <p className="text-gray-400 text-xs mt-0.5">{selected.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-4">
              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">Customer Name</label>
                <input value={selected.name || ''} disabled className="w-full bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm text-gray-600" />
              </div>
              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">Product Name</label>
                <input value={selected.product_name || ''} disabled className="w-full bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm text-gray-600" />
              </div>
              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">Policy Number</label>
                <input value={selected.policy_number || ''} disabled className="w-full bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm text-gray-600" />
              </div>

              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">Bonus Amount (This Year) <span className="text-red-400">*</span></label>
                <input
                  value={bonusAmount}
                  onChange={e => {
                    setBonusAmount(e.target.value.replace(/[^\d]/g, ''))
                    if (errors.bonusAmount) setErrors(er => ({ ...er, bonusAmount: undefined }))
                  }}
                  placeholder="e.g. 12500"
                  className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm outline-none ${errors.bonusAmount ? 'border-red-300' : 'border-[#e4e7f0] focus:border-[#0f1f3d]/30'}`}
                />
                {errors.bonusAmount && <p className="text-red-400 text-xs mt-1">{errors.bonusAmount}</p>}
              </div>

              {isRpu && (
                <div>
                  <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">Bonus Amount (If Policy Revived) <span className="text-red-400">*</span></label>
                  <input
                    value={bonusAmountRevived}
                    onChange={e => {
                      setBonusAmountRevived(e.target.value.replace(/[^\d]/g, ''))
                      if (errors.bonusAmountRevived) setErrors(er => ({ ...er, bonusAmountRevived: undefined }))
                    }}
                    placeholder="e.g. 24800"
                    className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm outline-none ${errors.bonusAmountRevived ? 'border-red-300' : 'border-[#e4e7f0] focus:border-[#0f1f3d]/30'}`}
                  />
                  {errors.bonusAmountRevived && <p className="text-red-400 text-xs mt-1">{errors.bonusAmountRevived}</p>}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#e4e7f0] flex-shrink-0">
              {linkError && <p className="text-red-400 text-xs mb-2">{linkError}</p>}
              <button
                onClick={generateLink}
                disabled={generating || !variant}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
              >
                {generating ? 'Generating…' : 'Generate & Prepare JPG →'}
              </button>
            </div>
          </>
        )}

        {step === 'link' && (
          <>
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e4e7f0] flex-shrink-0">
              <div>
                <h3 className="text-[#0f1f3d] font-bold text-base">Ready to Share 🎉</h3>
                <p className="text-gray-400 text-xs mt-0.5">JPG + message for {selected?.name}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
            </div>

            <div className="p-5 flex flex-col gap-4 overflow-y-auto">
              <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{activeMsg}</p>
              </div>

              <div>
                <label className="text-[#0f1f3d] text-xs font-semibold block mb-1.5">
                  Share to WhatsApp number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input type="text" value="+91" disabled className="w-[60px] bg-gray-100 border border-[#e4e7f0] rounded-xl px-3 py-2.5 text-sm font-semibold text-[#0f1f3d]" />
                  <input
                    type="tel"
                    value={waPhoneNumber}
                    onChange={e => setWaPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit number"
                    className="flex-1 bg-gray-50 border border-[#e4e7f0] focus:border-[#0f1f3d]/30 rounded-xl px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${copied ? 'bg-green-50 border-green-400 text-green-700' : 'bg-white border-[#e4e7f0] text-[#0f1f3d]'}`}
                >
                  {copied ? '✓ Copied!' : 'Copy Message'}
                </button>
                <button
                  onClick={openWhatsApp}
                  disabled={imageGenerating}
                  className="flex-1 py-3 rounded-xl bg-[#25d366] hover:bg-[#1ebe5d] disabled:opacity-60 text-white text-sm font-semibold"
                >
                  {imageGenerating ? 'Preparing JPG…' : 'WhatsApp'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
