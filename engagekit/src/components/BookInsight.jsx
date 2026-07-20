import { useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const PERSONA_FILE = {
  'Go-Getter': 'go-getter',
  'Protector':  'protector',
  'Caregiver':  'caregiver',
  'Thinker':    'thinker',
}

export default function BookInsight({ customer, token, linkId, customerIp, contentId }) {
  const markedUsedRef = useRef(false)

  const personaSlug = PERSONA_FILE[customer?.persona] ?? null
  const fileName = contentId === 'book-insight-2'
    ? 'demystifying-money-2.html'
    : personaSlug
    ? `book-insight ${personaSlug}.html`
    : `book-insight.html`

  const params = new URLSearchParams({
    name:   customer?.name          ?? '',
    policy: customer?.policy_number ?? '',
  })

  const src = `/book-insight/${encodeURIComponent(fileName)}?${params.toString()}`

  async function handleLoad() {
    if (markedUsedRef.current || !token) return
    markedUsedRef.current = true

    // Mark token as used
    await supabase
      .from('share_tokens')
      .update({ used: true })
      .eq('token', token)
      .then(({ error }) => { if (error) console.error('Failed to mark token as used:', error) })

    // Log the interaction
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
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
      }}
    />
  )
}
