import { useState } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome, fmtRs } from '../../lib/logOutcome'

function fmt(n) {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`
  if (n >= 100_000)    return `₹${(n / 100_000).toFixed(2)} L`
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

function fmtInput(v, suffix) {
  const n = Number(v)
  if (!n) return `${v}${suffix}`
  if (suffix === '%') return `${v}%`
  return fmt(n)
}

function calcFIRE(monthlyExp, savings, monthlySavings, returnPct, inflationPct) {
  const annualExp = monthlyExp * 12
  const r = returnPct / 100
  const realR = (1 + r) / (1 + inflationPct / 100) - 1
  const targetCorpus = realR > 0.005 ? Math.round(annualExp / realR) : annualExp * 25

  let balance = savings
  const annualSavings = monthlySavings * 12
  let years = 0
  while (balance < targetCorpus && years < 100) { balance = balance * (1 + r) + annualSavings; years++ }
  return { targetCorpus, years: years >= 100 ? null : years }
}

const INPUTS = [
  { key: 'monthlyExp',     label: 'Monthly expenses',       suffix: '₹', pct: false },
  { key: 'savings',        label: 'Current savings',         suffix: '₹', pct: false },
  { key: 'monthlySavings', label: 'Monthly savings to add', suffix: '₹', pct: false },
  { key: 'returnPct',      label: 'Annual return',           suffix: '%', pct: true  },
  { key: 'inflation',      label: 'Annual inflation',        suffix: '%', pct: true  },
]

export default function FIRECalculatorDemo({ item, onShare, onStep, isCustomerView = false, linkId }) {
  const [fields, setFields] = useState({ monthlyExp: '', savings: '', monthlySavings: '', returnPct: '', inflation: '' })
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)   // null = form, object = result

  function set(k, v) { setFields(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  function calculate() {
    const errs = {}
    INPUTS.forEach(({ key }) => { if (!fields[key]) errs[key] = '!' })
    if (Object.keys(errs).length) { setErrors(errs); return }
    const r = calcFIRE(
      Number(fields.monthlyExp), Number(fields.savings), Number(fields.monthlySavings),
      Number(fields.returnPct), Number(fields.inflation),
    )
    onStep?.({
      step: 'calculated',
      inputs: {
        monthly_expenses:  Number(fields.monthlyExp),
        current_savings:   Number(fields.savings),
        monthly_savings:   Number(fields.monthlySavings),
        annual_return_pct: Number(fields.returnPct),
        inflation_pct:     Number(fields.inflation),
      },
      result: { corpus_needed: r.targetCorpus, years_to_retirement: r.years },
      timestamp: new Date().toISOString(),
    })
    setResult(r)
    if (isCustomerView && linkId) {
      const outcome = r.years !== null
        ? `Retirement in ${r.years} years · Corpus: ${fmtRs(r.targetCorpus)}`
        : `Corpus needed: ${fmtRs(r.targetCorpus)}`
      logOutcome(linkId, outcome)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Compact header */}
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 flex items-center gap-3">
        <span className="text-3xl">{item.emoji}</span>
        <div>
          <h2 className="text-white font-bold text-base">{item.title}</h2>
          <p className="text-white/50 text-xs">Find your retirement number</p>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-5 py-5">
        {!result ? (
          /* ── Form (2-column grid) ── */
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {INPUTS.slice(0, 4).map(({ key, label, suffix }) => (
                <div key={key}>
                  <label className="text-[#0f1f3d] text-xs font-semibold block mb-1">{label}</label>
                  <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-colors ${
                    errors[key] ? 'border-red-400' : 'border-[#e4e7f0] focus-within:border-[#0f1f3d]/50'
                  }`}>
                    <span className="text-gray-400 pl-2.5 pr-1 text-xs select-none">{suffix}</span>
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

            {/* Last input (inflation) full width */}
            <div>
              <label className="text-[#0f1f3d] text-xs font-semibold block mb-1">{INPUTS[4].label}</label>
              <div className={`flex items-center bg-white border-2 rounded-xl overflow-hidden transition-colors ${
                errors.inflation ? 'border-red-400' : 'border-[#e4e7f0] focus-within:border-[#0f1f3d]/50'
              }`}>
                <span className="text-gray-400 pl-3 pr-1.5 text-xs select-none">%</span>
                <input
                  type="number" inputMode="decimal"
                  value={fields.inflation}
                  onChange={e => set('inflation', e.target.value)}
                  placeholder="0"
                  className="flex-1 py-2.5 pr-3 text-[#0f1f3d] text-sm outline-none bg-transparent"
                />
              </div>
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
          /* ── Result view ── */
          <div className="anim-slide-up flex flex-col gap-4">
            {/* Compact summary chips */}
            <div className="flex flex-wrap gap-1.5 bg-gray-50 rounded-xl p-3">
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">
                {fmtInput(fields.monthlyExp, '')} /mo exp
              </span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">
                {fmt(Number(fields.savings))} savings
              </span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">
                {fmtInput(fields.monthlySavings, '')} /mo add
              </span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">
                {fields.returnPct}% return
              </span>
              <span className="text-[11px] bg-white border border-[#e4e7f0] text-gray-500 px-2 py-0.5 rounded-full">
                {fields.inflation}% inflation
              </span>
              <button
                onClick={() => setResult(null)}
                className="text-[11px] text-[#0f1f3d] underline underline-offset-1 px-1"
              >
                Edit
              </button>
            </div>

            {/* Result card */}
            <div className="bg-[#0f1f3d] rounded-2xl p-5 text-center">
              <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Corpus needed</p>
              <p className="text-[#e8a020] text-3xl font-bold">{fmt(result.targetCorpus)}</p>
              <div className="w-full h-px bg-white/10 my-3" />
              {result.years !== null ? (
                <>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Years to retirement</p>
                  <p className="text-white text-4xl font-bold">{result.years}</p>
                  <p className="text-white/30 text-[11px] mt-1">at current savings rate</p>
                </>
              ) : (
                <p className="text-amber-400 text-sm">Increase savings rate or return to reach FIRE in under 100 years.</p>
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
