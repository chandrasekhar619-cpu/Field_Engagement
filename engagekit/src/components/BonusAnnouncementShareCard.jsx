import { forwardRef } from 'react'

function fmtINR(value) {
  const n = Number(String(value || '').replace(/,/g, ''))
  if (!Number.isFinite(n)) return '—'
  return `Rs. ${n.toLocaleString('en-IN')}`
}

const BonusAnnouncementShareCard = forwardRef(function BonusAnnouncementShareCard(
  {
    customerName,
    productName,
    policyNumber,
    variant,
    bonusAmount,
    bonusAmountRevived,
  },
  ref
) {
  const isRpu = variant === 'rpu'

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1350,
        background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)',
        color: '#0f172a',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        padding: 64,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.08em', color: '#b45309' }}>BONUS ANNOUNCEMENT</div>
        <h1 style={{ marginTop: 14, fontSize: 58, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
          Good news! Your policy bonus is declared.
        </h1>
        <p style={{ marginTop: 20, fontSize: 28, color: '#334155', lineHeight: 1.45 }}>
          We have declared our 14th consecutive annual bonus on your policy.
        </p>
      </div>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #dbe2f0',
          borderRadius: 28,
          padding: 36,
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontSize: 16, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Customer Name</div>
            <div style={{ marginTop: 6, fontSize: 32, fontWeight: 800 }}>{customerName || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: 16, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Policy Number</div>
            <div style={{ marginTop: 6, fontSize: 32, fontWeight: 800 }}>{policyNumber || '—'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 16, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Product Name</div>
            <div style={{ marginTop: 6, fontSize: 32, fontWeight: 800 }}>{productName || '—'}</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            padding: 24,
            borderRadius: 20,
            background: '#fff7ed',
            border: '1px solid #fed7aa',
          }}
        >
          <div style={{ fontSize: 16, color: '#9a3412', fontWeight: 800, textTransform: 'uppercase' }}>
            {isRpu ? 'Reduced Paid-Up Policy' : 'Premium Paying Policy'}
          </div>
          <div style={{ marginTop: 12, fontSize: 42, fontWeight: 900, color: '#7c2d12' }}>
            Bonus (This Year): {fmtINR(bonusAmount)}
          </div>
          {isRpu && (
            <div style={{ marginTop: 10, fontSize: 34, fontWeight: 800, color: '#9a3412' }}>
              Bonus (If Policy Revived): {fmtINR(bonusAmountRevived)}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: 22, color: '#475569', fontWeight: 600 }}>
        Click this image preview to review your bonus amount details.
      </div>
    </div>
  )
})

export default BonusAnnouncementShareCard
