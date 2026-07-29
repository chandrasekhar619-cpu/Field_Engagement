function safe(v) {
  return v == null ? '' : String(v)
}

export default function BonusAnnouncement({ customer, contentId, metadata }) {
  const variant = metadata?.variant || (contentId === 'bonus-announcement-rpu' ? 'rpu' : 'premium')
  const fileName = variant === 'rpu'
    ? 'bonus-announcement reduced-paid-up.html'
    : 'bonus-announcement premium-paying.html'

  const params = new URLSearchParams({
    name: safe(customer?.name),
    product: safe(customer?.product_name || metadata?.product_name),
    policy: safe(customer?.policy_number || metadata?.policy_number),
    bonus_amount: safe(metadata?.bonus_amount),
    bonus_amount_revived: safe(metadata?.bonus_amount_revived),
  })

  const src = `/bonus-announcement/${encodeURIComponent(fileName)}?${params.toString()}`

  return (
    <iframe
      src={src}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="Bonus Announcement"
    />
  )
}
