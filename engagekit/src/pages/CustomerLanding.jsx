import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { contentItems } from '../data/mockData'
import QuizDemo           from '../components/demos/QuizDemo'
import FIRECalculatorDemo from '../components/demos/FIRECalculatorDemo'
import ProtectionGapDemo  from '../components/demos/ProtectionGapDemo'
import PollDemo           from '../components/demos/PollDemo'
import MoodDemo           from '../components/demos/MoodDemo'
import LifeWordDemo       from '../components/demos/LifeWordDemo'
import CreativesDemo      from '../components/demos/CreativesDemo'
import WordHuntDemo       from '../components/demos/WordHuntDemo'
import RenewalCard        from '../components/RenewalCard'

function Disclaimer() {
  return (
    <div className="border-t border-[#e4e7f0] bg-white px-6 py-4">
      <p className="text-gray-400 text-[11px] leading-relaxed text-center">
        This communication is for awareness purposes only and does not constitute a solicitation or offer of any insurance product.
      </p>
    </div>
  )
}

const DEMOS = {
  'quiz':            QuizDemo,
  'fire-calculator': FIRECalculatorDemo,
  'protection-gap':  ProtectionGapDemo,
  'poll':            PollDemo,
  'mood':            MoodDemo,
  'life-word':       LifeWordDemo,
  'creative':        CreativesDemo,
  'word-hunt':       WordHuntDemo,
}

async function fetchIp() {
  try {
    const res  = await fetch('https://api.ipify.org?format=json')
    const data = await res.json()
    return data.ip ?? null
  } catch {
    return null
  }
}

export default function CustomerLanding() {
  const [searchParams] = useSearchParams()
  const token       = searchParams.get('token')
  const nomineeName = searchParams.get('nominee_name') || ''

  const [link,       setLink]       = useState(null)
  const [content,    setContent]    = useState(null)
  const [customer,   setCustomer]   = useState(null)
  const [customerIp, setCustomerIp] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [done,       setDone]       = useState(false)

  // steps are collected locally and flushed on completion
  const stepsRef          = useRef([])
  const openedRecordedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function init() {
      if (!token) {
        setError('This link has expired.')
        setLoading(false)
        return
      }

      try {
        // 1. Validate the share token
        const { data: shareToken, error: stErr } = await supabase
          .from('share_tokens')
          .select('*')
          .eq('token', token)
          .single()

        if (cancelled) return
        if (stErr || !shareToken) {
          setError('This link has expired.')
          return
        }
        if (shareToken.used || (shareToken.expires_at && new Date(shareToken.expires_at) < new Date())) {
          setError('This link has expired.')
          return
        }

        // 2. Fetch customer from customers table using customer_id from the token
        const { data: customerData, error: custErr } = await supabase
          .from('customers')
          .select('*')
          .eq('id', shareToken.customer_id)
          .single()

        if (cancelled) return
        if (custErr || !customerData) {
          setError('This link is not valid or has expired.')
          return
        }
        setCustomer(customerData)

        // 3. Look up the link record for content_id and RPM metadata
        const { data: linkRecord, error: linkErr } = await supabase
          .from('links')
          .select('*')
          .eq('token', token)
          .single()

        if (cancelled) return
        if (linkErr || !linkRecord) {
          setError('The content for this link could not be loaded.')
          return
        }
        setLink(linkRecord)

        // 4. Resolve content from local mock (content_id is the item id string)
        const item = contentItems.find(c => c.id === linkRecord.content_id)
        if (!item) {
          setError('The content for this link could not be loaded.')
          return
        }

        if (item.demoType === 'renewal-card') {
          // Renewal cards route via links.content_id like all other engagements.
          // Metadata (card_number, ppt, etc.) is read from share_tokens.metadata.
          setContent({ demoType: 'renewal-card', metadata: shareToken.metadata })
        } else if (!DEMOS[item.demoType]) {
          setError('The content for this link could not be loaded.')
          return
        } else {
          setContent(item)
        }

        // 5. Capture customer IP
        const ip = await fetchIp()
        if (cancelled) return
        setCustomerIp(ip)

        // 6. Record "opened" interaction (fire-and-forget, insert once)
        if (!openedRecordedRef.current) {
          openedRecordedRef.current = true
          await supabase.from('interactions').insert({
            link_id:         linkRecord.id,
            customer_id:     shareToken.customer_id ?? null,
            rpm_id:          linkRecord.rpm_id ?? null,
            action:          'opened',
            customer_ip:     ip,
            customer_device: navigator.userAgent,
            steps:           [],
          })
        }
      } catch {
        if (!cancelled) setError('Something went wrong. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [token])

  function handleStep(step) {
    stepsRef.current = [...stepsRef.current, step]
  }

  async function handleComplete() {
    if (link) {
      await supabase.from('interactions').insert({
        link_id:         link.id,
        customer_id:     customer?.id ?? null,
        rpm_id:          link.rpm_id ?? null,
        action:          'completed',
        outcome:         stepsRef.current.find(s => s.persona)?.persona ?? null,
        customer_ip:     customerIp,
        customer_device: navigator.userAgent,
        steps:           stepsRef.current,
      }).catch(console.error)
    }
    setDone(true)
  }

  /* ── Render states ───────────────────────────────────────────────────── */

  if (loading) return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="text-center max-w-xs">
        <span className="text-5xl">🔗</span>
        <p className="font-semibold text-gray-700 mt-3">{error}</p>
        <p className="text-gray-400 text-sm mt-1">Please ask the sender to share a new link.</p>
      </div>
    </div>
  )

  if (done) return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-xs">
          <span className="text-5xl">🙏</span>
          <h2 className="text-[#0f1f3d] font-bold text-xl mt-3">Thank you!</h2>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">
            Your advisor will be in touch. Feel free to close this page.
          </p>
          {link?.rpm_name && (
            <p className="text-gray-400 text-xs mt-5">
              Sent by <span className="font-medium">{link.rpm_name}</span>
            </p>
          )}
        </div>
      </div>
      <Disclaimer />
    </div>
  )

  // Renewal card — full-screen iframe, no demo component
  if (content?.demoType === 'renewal-card') {
    return (
      <RenewalCard
        customer={customer}
        metadata={content.metadata}
        rpmName={link?.rpm_name}
        token={token}
        linkId={link?.id}
        customerIp={customerIp}
        nomineeName={nomineeName}
      />
    )
  }

  const Demo = DEMOS[content?.demoType]

  // Word game: Demo manages its own 100dvh container + customer header internally
  if (content?.demoType === 'life-word') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#0d2244' }}>
        <Demo
          item={content}
          onStep={handleStep}
          onShare={handleComplete}
          isCustomerView={true}
          linkId={link.id}
          customerName={customer?.name ?? link.customer_name}
          rpmName={link.rpm_name}
          customerId={customer?.id}
          shareToken={token}
        />
        <Disclaimer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header — customer greeting + advisor attribution */}
      <div className="bg-[#0f1f3d] px-5 pt-6 pb-5 flex-shrink-0">
        <h1 className="text-white text-2xl font-bold leading-snug">
          {customer?.name ? `Hi ${customer.name}! 👋` : 'Hello! 👋'}
        </h1>
        {link?.rpm_name && (
          <p className="text-white/50 text-xs mt-1">
            Sent by {link.rpm_name}
          </p>
        )}
      </div>

      <div className="flex-1">
        <Demo
          item={content}
          onStep={handleStep}
          onShare={handleComplete}
          isCustomerView={true}
          linkId={link.id}
          customerName={customer?.name ?? link.customer_name}
          rpmName={link.rpm_name}
          customerId={customer?.id}
          shareToken={token}
          persona={customer?.persona}
        />
      </div>

      <Disclaimer />
    </div>
  )
}
