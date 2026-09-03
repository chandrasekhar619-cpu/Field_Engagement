import { useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const PERSONA_FILE = {
  'Go-Getter': 'go-getter',
  'Protector': 'protector',
  'Caregiver': 'caregiver',
  'Thinker': 'thinker',
}

export default function FinancialPlaybookKids({ customer, token, linkId, customerIp }) {
  const markedUsedRef = useRef(false)

  const personaSlug = PERSONA_FILE[customer?.persona] ?? null
  const fileName = personaSlug
    ? `financial-playbook-kids ${personaSlug}.html`
    : 'financial-playbook-kids.html'

  const params = new URLSearchParams({
    name: customer?.name ?? '',
    policy: customer?.policy_number ?? '',
  })

  const src = `/financial-playbook-kids/${encodeURIComponent(fileName)}?${params.toString()}`

  async function handleLoad() {
    if (markedUsedRef.current || !token) return
    markedUsedRef.current = true

    if (linkId) {
      await supabase
        .from('interactions')
        .insert({
          link_id: linkId,
          customer_id: customer?.id,
          action: 'opened',
          customer_ip: customerIp,
          customer_device: 'mobile',
        })
        .then(({ error }) => { if (error) console.error('Failed to log interaction:', error) })
    }
  }

  return (
    <iframe
      src={src}
      onLoad={handleLoad}
      style={{ width: '100%', height: '100vh', border: 'none' }}
    />
  )
}