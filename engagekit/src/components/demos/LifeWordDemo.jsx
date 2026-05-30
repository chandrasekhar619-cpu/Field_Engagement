import { useEffect } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome } from '../../lib/logOutcome'

const GRID = [
  [
    { letter: 'C', state: 'absent'  },
    { letter: 'O', state: 'correct' },
    { letter: 'I', state: 'absent'  },
    { letter: 'N', state: 'present' },
    { letter: 'S', state: 'correct' },
  ],
  [
    { letter: 'B', state: 'correct' },
    { letter: 'O', state: 'correct' },
    { letter: 'N', state: 'correct' },
    { letter: 'E', state: 'absent'  },
    { letter: 'S', state: 'correct' },
  ],
  [
    { letter: 'B', state: 'correct' },
    { letter: 'O', state: 'correct' },
    { letter: 'N', state: 'correct' },
    { letter: 'U', state: 'correct' },
    { letter: 'S', state: 'correct' },
  ],
  null, null, null,
]

const TILE = {
  correct: 'bg-[#538d4e] text-white border-[#538d4e]',
  present: 'bg-[#b59f3b] text-white border-[#b59f3b]',
  absent:  'bg-[#3a3a3c] text-white border-[#3a3a3c]',
  empty:   'bg-transparent text-transparent border-gray-300',
}

function Tile({ cell }) {
  return (
    <div className={`w-11 h-11 md:w-12 md:h-12 border-2 flex items-center justify-center rounded font-bold text-base uppercase ${TILE[cell?.state ?? 'empty']}`}>
      {cell?.letter ?? ''}
    </div>
  )
}

const EXAMPLES = [
  {
    label: 'Example 1 — Simple Reversionary Bonus',
    rows: [
      { key: 'Sum assured',       value: '₹10,00,000' },
      { key: 'Bonus rate',        value: '3% p.a.' },
      { key: 'Policy term',       value: '10 years' },
      { key: 'Annual bonus',      value: '₹30,000' },
      { key: 'Total bonus',       value: '₹3,00,000' },
    ],
    result: 'Maturity payout: ₹13,00,000',
    sensitivity: 'At 4% bonus rate → Payout ₹14,00,000',
  },
  {
    label: 'Example 2 — Compound Reversionary Bonus',
    rows: [
      { key: 'Sum assured',       value: '₹20,00,000' },
      { key: 'Bonus rate',        value: '3% p.a.' },
      { key: 'Policy term',       value: '20 years' },
      { key: 'Year 1 bonus',      value: '₹60,000' },
      { key: 'Year 20 bonus',     value: '≈ ₹1,02,853' },
    ],
    result: 'Approx. maturity payout: ₹36,12,000',
    sensitivity: 'At 4% bonus rate → ₹43,82,000  (₹7,70,000 more)',
  },
]

export default function LifeWordDemo({ onShare, onStep, isCustomerView = false, linkId }) {
  // Fire once on mount — LifeWord is static so "viewed" is the only step
  useEffect(() => {
    onStep?.({ step: 'viewed', timestamp: new Date().toISOString() })
    if (isCustomerView && linkId) logOutcome(linkId, 'Viewed — BONUS')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="flex flex-col">
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 text-center">
        <p className="text-white/40 text-[10px] uppercase tracking-widest mb-0.5">Life Word · Today's word</p>
        <h2 className="text-white font-bold text-base" style={{ fontFamily: "'DM Serif Display', serif" }}>Daily Finance Word</h2>
      </div>

      <div className="max-w-md mx-auto w-full px-5 py-5 flex flex-col gap-6">

        {/* Grid */}
        <div className="flex flex-col items-center gap-1.5">
          {GRID.map((row, ri) => (
            <div key={ri} className="flex gap-1.5">
              {(row ?? [{},{},{},{},{}]).map((cell, ci) => (
                <Tile key={ci} cell={row ? cell : null} />
              ))}
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-emerald-600 font-semibold text-sm">🎉 Solved in 3 tries!</p>
          <p className="text-[#0f1f3d] text-3xl font-bold mt-1 tracking-[0.2em]" style={{ fontFamily: "'DM Serif Display', serif" }}>
            BONUS
          </p>
        </div>

        {/* Explanation */}
        <div className="flex flex-col gap-5">
          <div>
            <h3 className="text-[#0f1f3d] text-base font-bold mb-2">What is a Bonus?</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              A share of the insurer's profits added to your policy's sum assured.{' '}
              <strong className="text-[#0f1f3d]">Par (Participating) policies</strong> are eligible, and bonuses can significantly increase what your family receives.
            </p>
          </div>

          <div>
            <h3 className="text-[#0f1f3d] text-base font-bold mb-3">Three Types</h3>
            <div className="flex flex-col gap-3">
              {[
                { dot: 'bg-blue-500',   title: 'Reversionary Bonus', body: 'Declared annually, permanently added. Two kinds: Simple (flat % on sum assured) and Compound (% on sum assured + previous bonuses).' },
                { dot: 'bg-[#e8a020]',  title: 'Terminal Bonus',     body: 'One-time payout at maturity or on a claim. Rewards loyalty — longer you hold, higher it gets.' },
                { dot: 'bg-gray-400',   title: 'Cash Bonus',         body: 'Paid out annually in cash. Provides liquidity but total payout over time is lower.' },
              ].map(t => (
                <div key={t.title} className="flex gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${t.dot} mt-1.5 flex-shrink-0`} />
                  <div>
                    <p className="text-[#0f1f3d] font-semibold text-sm">{t.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {EXAMPLES.map(ex => (
            <div key={ex.label} className="bg-white rounded-2xl border border-[#e4e7f0] p-4">
              <h4 className="text-[#0f1f3d] font-semibold text-sm mb-3">{ex.label}</h4>
              {ex.rows.map(r => (
                <div key={r.key} className="flex justify-between text-xs py-1 border-b border-[#e4e7f0] last:border-0">
                  <span className="text-gray-500">{r.key}</span>
                  <span className="text-[#0f1f3d] font-medium">{r.value}</span>
                </div>
              ))}
              <div className="mt-3 pt-2 border-t border-[#e4e7f0]">
                <p className="text-[#0f1f3d] font-bold text-sm">{ex.result}</p>
                <p className="text-[#e8a020] text-xs mt-0.5">📈 {ex.sensitivity}</p>
              </div>
            </div>
          ))}
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
    </div>
  )
}
