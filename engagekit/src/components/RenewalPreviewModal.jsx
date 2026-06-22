import { useState } from 'react'

const CARD_OPTIONS = [
  { label: '30-Day Reminder', cardNumber: 2 },
  { label: '2-Week Reminder', cardNumber: 3 },
  { label: 'Final Reminder',  cardNumber: 1 },
]

export default function RenewalPreviewModal({ customer, onClose }) {
  const [activeCard, setActiveCard] = useState(2) // default to Card 2 — 30-Day Reminder

  const params = new URLSearchParams({
    name:        customer?.name          ?? 'Sample Customer',
    policy:      customer?.policy_number ?? '--',
    due_date:    customer?.due_date      ?? '',
    rcd:         customer?.issue_date    ?? '',
    ppt:         '10',
    premium:     '25000',
    sum_assured: '500000',
    maturity:    '850000',
  })
  const src = `/renewalcardshtml/renewalcard${activeCard}.html?${params}`

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f9fafb]">

      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-[#0f1f3d] flex items-center justify-between px-4 py-2.5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e8a020] animate-pulse" />
          <span className="text-white/70 text-xs">Renewal Reminder — Preview</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#e8a020] text-xs font-semibold hover:text-amber-300 transition-colors"
        >
          Close preview ✕
        </button>
      </div>

      {/* Card selector */}
      <div className="bg-white border-b border-[#e4e7f0] px-4 py-2.5 flex gap-2 flex-shrink-0">
        {CARD_OPTIONS.map(opt => (
          <button
            key={opt.cardNumber}
            onClick={() => setActiveCard(opt.cardNumber)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCard === opt.cardNumber
                ? 'bg-[#0f1f3d] text-white'
                : 'bg-gray-50 text-gray-500 border border-[#e4e7f0] hover:border-[#0f1f3d]/30 hover:text-[#0f1f3d]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* iframe — key forces reload when card changes */}
      <iframe
        key={activeCard}
        src={src}
        title="Renewal Reminder Preview"
        style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
      />

    </div>
  )
}
