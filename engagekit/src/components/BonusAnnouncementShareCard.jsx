import { forwardRef } from 'react'

function fmtINR(value) {
  const n = Number(String(value || '').replace(/,/g, ''))
  if (!Number.isFinite(n)) return '-'
  return n.toLocaleString('en-IN')
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
          height: 1540,
          background: '#f4f7fa',
          color: '#334155',
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          padding: 48,
    <div
      ref={ref}
          justifyContent: 'center',
        height: 1350,
        background: 'linear-gradient(160deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)',
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '0.08em', color: '#b45309' }}>BONUS ANNOUNCEMENT</div>
        <h1 style={{ marginTop: 14, fontSize: 58, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
            width: '100%',
          Good news! Your policy bonus is declared.
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: 40,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden',
      </div>

          <div style={{ background: '#0056b3', padding: '56px 42px 72px', textAlign: 'center' }}>
            <h1 style={{ color: '#ffffff', fontSize: 48, fontWeight: 700, margin: 0, letterSpacing: '0.5px' }}>
              Big Policy Milestone Alert
            </h1>
          </div>

          <div style={{ display: 'flex', gap: 16, margin: '-46px auto 32px', maxWidth: '90%', position: 'relative', zIndex: 2 }}>
            {[
              { n: '14', label: 'Years' },
              { n: '14', label: 'Bonuses' },
              { n: '0', label: 'Misses' },
            ].map((c) => (
              <div key={c.label} style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderRadius: 16, padding: '18px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: '#0056b3', lineHeight: 1.1, marginBottom: 4 }}>{c.n}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '18px 48px 48px', textAlign: 'center' }}>
            <div style={{ fontSize: 38, fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>Hi {customerName || '-'},</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Guess what?</div>
            <div style={{ height: 1, background: '#e2e8f0', width: 100, margin: '0 auto 24px' }} />

            {!isRpu ? (
              <p style={{ color: '#475569', fontSize: 28, lineHeight: 1.6, margin: '0 0 28px' }}>
                We have some <span style={{ color: '#0056b3', fontWeight: 800, letterSpacing: '0.5px', fontSize: 30 }}>GOOD NEWS</span> heading your way! We have officially declared bonuses for the 14th consecutive year, calculated at the industry's highest benchmark illustrated scenario of <span style={{ color: '#0056b3', fontWeight: 600 }}>8% as promised</span>.
              </p>
            ) : (
              <p style={{ color: '#475569', fontSize: 28, lineHeight: 1.6, margin: '0 0 28px' }}>
                We have some <span style={{ color: '#0056b3', fontWeight: 800, letterSpacing: '0.5px', fontSize: 30 }}>GOOD NEWS</span> heading your way! Even on Reduced Paid-Up status, your money continues to grow. We have officially declared bonuses for the 14th consecutive year, calculated at the industry's highest benchmark illustrated scenario of <span style={{ color: '#0056b3', fontWeight: 600 }}>8% as promised</span>.
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '0 auto 24px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 12, padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Product Name</div>
                <div style={{ color: '#475569', fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productName || '-'}</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #edf2f7', borderRadius: 12, padding: '14px 8px', textAlign: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>Policy Number</div>
                <div style={{ color: '#475569', fontSize: 18, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{policyNumber || '-'}</div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: 24, padding: 28, marginBottom: 24 }}>
              {!isRpu ? (
                <>
                  <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                    Declared Bonus Amount This Year
                  </div>
                  <div style={{ color: '#0f172a', fontSize: 62, fontWeight: 800, letterSpacing: '-1px' }}>₹{fmtINR(bonusAmount)}</div>
                </>
              ) : (
                <>
                  <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                    Declared Bonus For The Current Year
                  </div>
                  <div style={{ color: '#0056b3', fontSize: 50, fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>₹{fmtINR(bonusAmount)}</div>
                  <div style={{ height: 1, background: '#e2e8f0', margin: '12px 0' }} />
                  <div style={{ color: '#64748b', fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>
                    Bonus Potential On Full Policy Continuity
                  </div>
                  <div style={{ color: '#0f172a', fontSize: 58, fontWeight: 800, letterSpacing: '-1px' }}>₹{fmtINR(bonusAmountRevived)}</div>
                </>
              )}
            </div>

            {!isRpu ? (
              <p style={{ color: '#64748b', fontSize: 24, lineHeight: 1.6, marginBottom: 0, fontStyle: 'italic' }}>
                "From shielding your parents to building your children's tomorrow, your love connects generations. For 14 consecutive years, we have kept our promise to protect that circle. We remain committed to standing by you and your entire family, year after year."
              </p>
            ) : (
              <>
                <p style={{ color: '#475569', fontSize: 24, lineHeight: 1.6, marginBottom: 15 }}>
                  Your dedication to securing your family's future continues to pay off. Your accumulated funds remain 100% safe and are steadily building wealth year after year. Whenever you choose to resume your regular premiums, your policy instantly unlocks its maximum payout potential and full life cover.
                </p>
                <p style={{ fontSize: 20, fontWeight: 600, color: '#0056b3', margin: 0 }}>
                  Want to explore upgrading back to your full benefit potential? Reach out to us anytime.
                </p>
              </>
            )}
          </div>

          <div style={{ background: '#f8fafc', borderTop: '1px solid #edf2f7', padding: '24px 30px', textAlign: 'center', fontSize: 20, color: '#64748b' }}>
            Want to know more about your policy?
            <br />
            Call Toll-Free at <span style={{ color: '#0056b3', fontWeight: 600 }}>1800-212-1212</span> <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span> WhatsApp "Hi" to <span style={{ color: '#0056b3', fontWeight: 600 }}>+91 98335 21212</span>
          </div>
            Bonus (This Year): {fmtINR(bonusAmount)}
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
