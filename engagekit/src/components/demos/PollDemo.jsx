import { useState } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome } from '../../lib/logOutcome'

const OPTIONS = [
  { label: 'Invest it in the market',         response: "A strong instinct. Putting money to work early is how compounding starts. A protection plan running alongside it makes sure nothing disrupts the journey." },
  { label: 'Park it as an emergency fund',     response: "Safe and steady. A solid buffer is step one — and pairing it with life cover ensures one unexpected event doesn't undo everything you've saved." },
  { label: 'Clear a pending loan or EMI',      response: "Financially smart. Reducing liability before growing assets is a sound strategy — and it frees up breathing room for better decisions ahead." },
  { label: "Spend on something I've been putting off", response: "You've earned it. Spending intentionally is part of financial balance — just make sure your future self is protected too." },
]

export default function PollDemo({ onShare, onStep, isCustomerView = false, linkId }) {
  const [selected, setSelected] = useState(null)

  function pick(i) {
    if (selected !== null) return
    setSelected(i)
    onStep?.({ step: 'selected', option: OPTIONS[i].label, timestamp: new Date().toISOString() })
    if (isCustomerView && linkId) logOutcome(linkId, OPTIONS[i].label)
  }

  return (
    <div className="flex flex-col">
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 flex items-center gap-3">
        <span className="text-3xl">📊</span>
        <div>
          <h2 className="text-white font-bold text-base">Your Money Mood</h2>
          <p className="text-white/50 text-xs">One question poll</p>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-5 py-5">
        <h3 className="text-[#0f1f3d] text-base font-bold leading-snug mb-4">
          If Rs. 1 lakh landed in your account tomorrow, what would you do first?
        </h3>

        {/* Options — non-selected collapse after pick */}
        <div className="flex flex-col">
          {OPTIONS.map((opt, i) => {
            const isSelected = selected === i
            const isDimming  = selected !== null && !isSelected
            return (
              <div
                key={i}
                style={{
                  maxHeight:    isDimming ? '0px' : '64px',
                  opacity:      isDimming ? 0     : 1,
                  overflow:     'hidden',
                  marginBottom: isDimming ? '0px' : '10px',
                  transition:   'max-height 0.28s ease-out, opacity 0.18s ease-out, margin 0.28s ease-out',
                }}
              >
                <button
                  onClick={() => pick(i)}
                  disabled={selected !== null}
                  className={`w-full px-4 py-3.5 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-[#0f1f3d] border-[#0f1f3d] text-white'
                      : 'bg-white border-[#e4e7f0] text-[#0f1f3d] hover:border-[#0f1f3d]/40'
                  }`}
                >
                  {opt.label}
                </button>
              </div>
            )
          })}
        </div>

        {/* Response + feedback (appear inline after collapse) */}
        {selected !== null && (
          <div className="anim-slide-up flex flex-col gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-amber-900 text-sm leading-relaxed">{OPTIONS[selected].response}</p>
            </div>

            <FeedbackSection linkId={linkId} onDone={isCustomerView ? onShare : undefined} />

            {!isCustomerView && (
              <button
                onClick={onShare}
                className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
              >
                Share with a customer →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
