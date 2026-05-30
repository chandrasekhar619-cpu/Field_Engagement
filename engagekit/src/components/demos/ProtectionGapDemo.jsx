import { useState } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome, fmtRs } from '../../lib/logOutcome'

function fmt(n) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${Math.round(Math.abs(n)).toLocaleString('en-IN')}`
}

const INPUTS = [
  { key: 'income',   label: 'Annual income',             col: true  },
  { key: 'expenses', label: 'Monthly household expenses', col: true  },
  { key: 'loans',    label: 'Outstanding loans',          col: true  },
  { key: 'cover',    label: 'Current life cover',         col: true  },
]

export default function ProtectionGapDemo({ item, onShare, onStep, isCustomerView = false, linkId }) {
  const [fields, setFields] = useState({ income: '', expenses: '', loans: '', cover: '' })
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)

  function set(k, v) { setFields(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function calculate() {
    const errs = {}
    INPUTS.forEach(({ key }) => { if (!fields[key]) errs[key] = '!' })
    if (Object.keys(errs).length) { setErrors(errs); return }

    const income   = Number(fields.income)
    const expenses = Number(fields.expenses)
    const loans    = Number(fields.loans)
    const cover    = Number(fields.cover)
    const hlv          = income * 10
    const expCoverage  = expenses * 12 * 5
    const totalNeeded  = hlv + loans + expCoverage
    const gap = totalNeeded - cover
    onStep?.({
      step: 'calculated',
      inputs: {
        annual_income:     Number(fields.income),
        monthly_expenses:  Number(fields.expenses),
        outstanding_loans: Number(fields.loans),
        current_cover:     Number(fields.cover),
      },
      result: { total_needed: totalNeeded, gap, is_protected: gap <= 0 },
      timestamp: new Date().toISOString(),
    })
    setResult({ hlv, expCoverage, loans, totalNeeded, cover, gap })
    if (isCustomerView && linkId)
      logOutcome(linkId, gap > 0 ? `Gap: ${fmtRs(gap)}` : 'Fully covered')
  }

  return (
    <div className="flex flex-col">
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 flex items-center gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div>
          <h2 className="text-white font-bold text-base">{item.title}</h2>
          <p className="text-white/50 text-xs">Find out if your family is truly protected</p>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-5 py-5">
        {!result ? (
          <div className="flex flex-col gap-4">
            {/* 2×2 grid */}
            <div className="grid grid-cols-2 gap-3">
              {INPUTS.map(({ key, label }) => (
                <div key={key}>
                  <label className="text-[#0f1f3d] text-xs font-semibold block mb-1">{label}</label>
                  <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-colors ${
                    errors[key] ? 'border-red-400' : 'border-[#e4e7f0] focus-within:border-[#0f1f3d]/50'
                  }`}>
                    <span className="text-gray-400 pl-2.5 pr-1 text-xs select-none">₹</span>
                    <input
                      type="number" inputMode="decimal"
                      value={fields[key]}
                      onChange={e => set(key, e.target.value)}
                      placeholder="0"
                      className="flex-1 py-2.5 pr-2.5 text-[#0f1f3d] text-sm outline-none bg-transparent"
                    />
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(errors).length > 0 && (
              <p className="text-red-400 text-xs">Please fill in all fields.</p>
            )}

            <button
              onClick={calculate}
              className="w-full bg-[#e8a020] hover:bg-amber-400 text-white font-bold py-3.5 rounded-xl text-sm transition-colors"
            >
              Calculate →
            </button>
          </div>
        ) : (
          <div className="anim-slide-up flex flex-col gap-4">
            {/* Compact summary */}
            <div className="flex flex-wrap gap-1.5 bg-gray-50 rounded-xl p-3">
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">{fmt(Number(fields.income))} income/yr</span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">{fmt(Number(fields.expenses))} exp/mo</span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">{fmt(Number(fields.loans))} loans</span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">{fmt(Number(fields.cover))} cover</span>
              <button onClick={() => setResult(null)} className="text-[11px] text-[#0f1f3d] underline underline-offset-1 px-1">Edit</button>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl border border-[#e4e7f0] p-4">
              {[
                { label: 'Human life value (income × 10)', value: result.hlv },
                { label: 'Expense coverage (monthly × 5 yrs)', value: result.expCoverage },
                { label: 'Loan coverage', value: result.loans },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center text-xs py-1.5 border-b border-[#e4e7f0] last:border-0">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="text-[#0f1f3d] font-medium">{fmt(row.value)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm font-semibold pt-2.5 mt-0.5">
                <span className="text-[#0f1f3d]">Total needed</span>
                <span className="text-[#0f1f3d]">{fmt(result.totalNeeded)}</span>
              </div>
            </div>

            {/* Gap result */}
            <div className={`rounded-2xl p-5 text-center ${result.gap > 0 ? 'bg-[#0f1f3d]' : 'bg-emerald-50 border border-emerald-200'}`}>
              {result.gap > 0 ? (
                <>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Protection gap</p>
                  <p className="text-[#e8a020] text-3xl font-bold">{fmt(result.gap)}</p>
                  <p className="text-white/40 text-xs mt-1">Your family may be under-protected.</p>
                </>
              ) : (
                <>
                  <p className="text-emerald-700 text-xl font-bold mb-1">✅ Well Protected</p>
                  <p className="text-emerald-600 text-sm">Cover exceeds the need by {fmt(Math.abs(result.gap))}.</p>
                </>
              )}
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
