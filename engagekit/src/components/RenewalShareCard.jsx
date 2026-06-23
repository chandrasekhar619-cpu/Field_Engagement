import { forwardRef } from 'react'

const HEADLINES = {
  2: {
    'Go-Getter': 'Is your nominee set up to back your ambitions?',
    'Thinker':   'Have you verified your nominee details recently?',
    'Protector': 'Is your nominee detail protecting your family?',
    'Caregiver': 'Is the right person named as your nominee?',
    generic:     'Have you checked your nominee details lately?',
  },
  3: {
    'Go-Getter': 'Your renewal is coming up — stay ahead of it',
    'Thinker':   'Your premium is due — keep your plan on track',
    'Protector': 'Your renewal is due — keep your family covered',
    'Caregiver': 'Your renewal is near — keep your circle protected',
    generic:     'Your policy renewal is coming up soon',
  },
  '1_pre': {
    'Go-Getter': "Your premium is due — don't let momentum stall",
    'Thinker':   'Your payment is due — act now to stay on schedule',
    'Protector': "Pay today — keep your family's cover intact",
    'Caregiver': 'Your premium is due — keep your loved ones safe',
    generic:     'Your premium is due — pay now to stay covered',
  },
  '1_post': {
    'Go-Getter': 'Your policy is at risk — pay immediately',
    'Thinker':   'Immediate action needed — your policy is in grace',
    'Protector': "Your family's cover is at risk — pay now",
    'Caregiver': "Don't leave your loved ones unprotected — pay now",
    generic:     'Urgent — your policy needs attention now',
  },
}

const CARD_LABEL = { 1: 'Final Reminder', 2: '30-Day Reminder', 3: '2-Week Reminder' }

function formatDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function InfoRow({ label, value }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 4 }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#0f1f3d', lineHeight: 1.3 }}>
        {value || '—'}
      </p>
    </div>
  )
}

// forwardRef so RenewalShareFlow can point html2canvas at this element
const RenewalShareCard = forwardRef(function RenewalShareCard(
  { cardNumber, persona, customerName, policyName, dueDate },
  ref
) {
  const isPostDue = dueDate ? new Date() > new Date(dueDate + 'T00:00:00') : false
  const headlineKey = cardNumber === 1 ? (isPostDue ? '1_post' : '1_pre') : cardNumber
  const bucket      = HEADLINES[headlineKey] ?? HEADLINES[3]
  const headline    = bucket[persona] ?? bucket.generic
  const cardLabel   = CARD_LABEL[cardNumber] ?? 'Renewal Reminder'
  const formattedDate = formatDate(dueDate)

  return (
    <div
      ref={ref}
      style={{
        width: 400,
        height: 500,
        background: '#ffffff',
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{ height: 6, background: '#0f1f3d', flexShrink: 0 }} />

      {/* Headline section */}
      <div style={{ padding: '28px 32px 26px', flexShrink: 0 }}>
        <div style={{
          display:       'inline-block',
          fontSize:      10,
          fontWeight:    700,
          color:         '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.09em',
          background:    '#f1f5f9',
          borderRadius:  4,
          padding:       '4px 8px',
          marginBottom:  16,
        }}>
          {cardLabel}
        </div>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f1f3d', lineHeight: 1.38 }}>
          {headline}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: '#e4e7f0', margin: '0 32px', flexShrink: 0 }} />

      {/* Info rows */}
      <div style={{ padding: '26px 32px 0', flex: 1 }}>
        <InfoRow label="Customer"   value={customerName} />
        <InfoRow label="Policy No." value={policyName} />
        {formattedDate && <InfoRow label="Due Date" value={formattedDate} />}
      </div>

      {/* Footer */}
      <div style={{
        borderTop:      '1px solid #e4e7f0',
        padding:        '16px 32px',
        flexShrink:     0,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f1f3d' }}>
          View your renewal details →
        </p>
      </div>
    </div>
  )
})

export default RenewalShareCard
