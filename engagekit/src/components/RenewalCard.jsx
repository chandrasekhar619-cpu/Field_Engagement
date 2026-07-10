import { useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const PERSONA_FILE = {
  'Go-Getter': 'go-getter',
  'Protector':  'protector',
  'Caregiver':  'caregiver',
  'Thinker':    'thinker',
}

// Convert DD-MM-YYYY to YYYY-MM-DD for date parsing
function convertDDMMYYYY(dateStr) {
  if (!dateStr) return ''
  const [day, month, year] = dateStr.split('-')
  if (!day || !month || !year) return ''
  return `${year}-${month}-${day}`
}

function Disclaimer() {
  return (
    <div className="border-t border-[#e4e7f0] bg-white px-6 py-4 flex-shrink-0">
      <p className="text-gray-400 text-[11px] leading-relaxed text-center">
        This communication is for awareness purposes only and does not constitute a solicitation or offer of any insurance product.
      </p>
    </div>
  )
}

export default function RenewalCard({ customer, metadata, rpmName, token, linkId, customerIp, nomineeName }) {
  const markedUsedRef = useRef(false)

  const { card_number = 1, ppt, sum_assured, maturity, premium, payment_mode, product_name, policy_number, premium_due_date } = metadata || {}

  const personaSlug = PERSONA_FILE[customer?.persona] ?? null
  const fileName = personaSlug
    ? `renewalcard${card_number} ${personaSlug}.html`
    : `renewalcard${card_number}.html`

  const params = new URLSearchParams({
    name:         customer?.name          ?? '',
    policy:       product_name ?? customer?.product_name ?? '',
    policy_no:    policy_number ?? customer?.policy_number ?? '',
    due_date:     convertDDMMYYYY(premium_due_date ?? customer?.premium_due_date ?? ''),
    issue_date:   convertDDMMYYYY(customer?.issue_date ?? ''),
    rcd:          customer?.issue_date    ?? '',
    ppt:          ppt ?? '',
    premium:      premium     ?? '',
    sum_assured:  sum_assured ?? '',
    maturity:     maturity    ?? '',
    nominee_name: nomineeName ?? '',
    payment_mode: payment_mode ?? '',
  })

  const src = `/renewalcardshtml/${encodeURIComponent(fileName)}?${params.toString()}`

  async function handleLoad() {
    if (markedUsedRef.current || !token) return
    markedUsedRef.current = true

    // Renewal tokens allow up to 3 customer opens before expiring.
    // Count existing 'opened' interactions for this link; the current open
    // was already recorded in CustomerLanding before this component mounts.
    if (linkId) {
      const { count } = await supabase
        .from('interactions')
        .select('id', { count: 'exact', head: true })
        .eq('link_id', linkId)
        .eq('action', 'opened')

      if ((count ?? 0) >= 3) {
        supabase.from('share_tokens').update({ used: true }).eq('token', token)
          .then(({ error }) => { if (error) console.error('renewal mark-used failed:', error) })
      }
    }

    // Record completed interaction
    if (linkId) {
      supabase.from('interactions').insert({
        link_id:         linkId,
        customer_id:     customer?.id ?? null,
        action:          'completed',
        outcome:         'Viewed Renewal Card',
        customer_ip:     customerIp ?? null,
        customer_device: navigator.userAgent,
        steps:           [],
      }).catch(console.error)
    }
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Standard customer header */}
      <div className="bg-[#0f1f3d] px-5 pt-6 pb-5 flex-shrink-0">
        <h1 className="text-white text-2xl font-bold leading-snug">
          {customer?.name ? `Hi ${customer.name}! 👋` : 'Hello! 👋'}
        </h1>
        {rpmName && (
          <p className="text-white/50 text-xs mt-1">Sent by {rpmName}</p>
        )}
      </div>

      {/* iframe fills remaining space */}
      <iframe
        src={src}
        title="Renewal Reminder"
        onLoad={handleLoad}
        style={{ flex: 1, width: '100%', border: 'none', display: 'block', overflow: 'auto' }}
      />

      <Disclaimer />
    </div>
  )
}
