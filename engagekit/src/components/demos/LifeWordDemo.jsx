import { useState, useEffect, useCallback } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome } from '../../lib/logOutcome'

const WORDS = [
  { word: "BONUS", definition: "A share of the insurer's profits added to your policy's sum assured each year. Only Par (Participating) policies earn a bonus — and it can significantly increase what your family receives." },
  { word: "CLAIM", definition: "A formal request made to the insurer to receive a payout under your policy — whether on death, maturity, or a covered event. A smooth claims process is the real test of any insurer." },
  { word: "RIDER", definition: "An optional add-on to your base policy that extends your coverage. Common riders include accidental death, critical illness, and waiver of premium." },
  { word: "LAPSE", definition: "When a policy becomes inactive because the premium wasn't paid within the grace period. A lapsed policy offers no coverage — but many can be revived." },
  { word: "ASSET", definition: "Something of financial value that you own. Your life insurance policy is an asset — it holds a surrender value and can even be used as loan collateral." },
  { word: "YIELD", definition: "The return earned on an investment over a period. In insurance, yield matters in ULIPs where your premium is invested in market-linked funds." },
  { word: "TRUST", definition: "A legal arrangement where assets are held by one party for the benefit of another. Placing a policy in trust ensures the payout goes directly to your chosen beneficiary." },
  { word: "COVER", definition: "The protection your insurance policy provides. Your cover is the amount your family receives if a claim is made — also called sum assured." },
  { word: "GRACE", definition: "A short window after your premium due date — typically 15 to 30 days — during which your policy stays active even if payment is delayed." },
  { word: "RATES", definition: "The pricing applied to your insurance premium. Rates are determined by age, health, lifestyle, and the type and duration of cover you choose." },
  { word: "TERMS", definition: "The conditions and duration that define how your policy works — including the premium amount, payout rules, exclusions, and the policy period." },
  { word: "VALUE", definition: "The monetary worth of your policy. This includes the sum assured, accumulated bonuses, and the surrender value if you decide to exit the policy early." },
  { word: "ENDOW", definition: "An endowment policy pays a lump sum at maturity or on death — whichever comes first. It combines life cover with disciplined long-term savings." },
  { word: "FIXED", definition: "A fixed return is guaranteed by the insurer regardless of market performance. Traditional life insurance plans often offer fixed or declared bonus rates." },
  { word: "GAINS", definition: "The profit earned on an investment above its original cost. In ULIPs and mutual funds, gains are what grow your wealth over time." },
  { word: "INDEX", definition: "A benchmark that tracks the performance of a group of assets — like the Nifty 50 or Sensex. Some ULIP funds are index-linked." },
  { word: "RENEW", definition: "Extending your insurance policy for another term at the end of its period. Renewing on time ensures continuous coverage without a break." },
  { word: "REPAY", definition: "Returning borrowed money along with any interest. If you take a loan against your policy's surrender value, repayment keeps the policy intact." },
  { word: "TAXES", definition: "Life insurance is one of the most effective tools for tax saving. Premiums paid qualify for deduction under Section 80C, and maturity proceeds are often tax-free under 10(10D)." },
  { word: "TENOR", definition: "The duration of a financial product — how long your policy runs, or how long a loan is to be repaid. Longer tenors in insurance often mean better coverage and bonus accumulation." },
  { word: "FUNDS", definition: "In ULIPs, your premium is split between life cover and investment funds. You can choose funds based on your risk appetite — equity, debt, or balanced." },
  { word: "AGENT", definition: "A licensed professional who sells and services insurance policies. A good agent helps you choose the right cover, not just the most expensive one." },
  { word: "HEDGE", definition: "A strategy to reduce financial risk. Life insurance itself is a hedge — it protects your family's future against the uncertainty of income loss." },
  { word: "LOANS", definition: "You can borrow money against the surrender value of your life insurance policy. It's often cheaper than a personal loan and your cover stays intact." },
  { word: "SHARE", definition: "A unit of ownership in a company. In ULIP equity funds, your premium buys units in funds that hold shares — giving you indirect market exposure." },
  { word: "MONEY", definition: "The medium of exchange behind every financial decision. Life insurance ensures the money you've earned continues to protect your family even when you can't." },
]

function getTodaysWord() {
  const today = new Date()
  const dayIndex = Math.floor(today.getTime() / 86400000) % WORDS.length
  return WORDS[dayIndex]
}

function evaluateGuess(guess, answer) {
  const result = Array(5).fill('absent')
  const available = answer.split('')

  // Pass 1: correct positions (green)
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
      available[i] = null
    }
  }

  // Pass 2: present letters (yellow)
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue
    const idx = available.indexOf(guess[i])
    if (idx !== -1) {
      result[i] = 'present'
      available[idx] = null
    }
  }

  return result
}

const TILE_STYLE = {
  correct: 'bg-[#538d4e]  text-white border-[#538d4e]',
  present: 'bg-[#b59f3b]  text-white border-[#b59f3b]',
  absent:  'bg-[#3a3a3c]  text-white border-[#3a3a3c]',
  tbd:     'bg-white      text-[#0f1f3d] border-[#0f1f3d]',
  empty:   'bg-transparent text-transparent border-gray-300',
}

const KEY_BASE = 'h-[52px] rounded-lg font-bold text-xs uppercase flex items-center justify-center transition-colors select-none'

const KEY_STYLE = {
  correct: `${KEY_BASE} bg-[#538d4e] text-white`,
  present: `${KEY_BASE} bg-[#b59f3b] text-white`,
  absent:  `${KEY_BASE} bg-[#3a3a3c] text-white`,
  unused:  `${KEY_BASE} bg-[#dde0ea] text-[#0f1f3d]`,
}

const KEYBOARD_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

const STATE_PRIORITY = { correct: 3, present: 2, absent: 1 }

export default function LifeWordDemo({ onShare, onStep, isCustomerView = false, linkId }) {
  const { word: answer, definition } = getTodaysWord()

  const [rows,      setRows]      = useState([])        // committed rows [{letter,state}[]]
  const [input,     setInput]     = useState('')        // current row being typed
  const [letterMap, setLetterMap] = useState({})        // letter → best state
  const [status,    setStatus]    = useState('playing') // 'playing' | 'won' | 'lost'

  useEffect(() => {
    onStep?.({ step: 'viewed', timestamp: new Date().toISOString() })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const submitGuess = useCallback(() => {
    if (input.length !== 5 || status !== 'playing') return

    const evaluation = evaluateGuess(input, answer)
    const newRow     = input.split('').map((letter, i) => ({ letter, state: evaluation[i] }))
    const nextCount  = rows.length + 1

    setRows(prev => [...prev, newRow])

    setLetterMap(prev => {
      const next = { ...prev }
      input.split('').forEach((letter, i) => {
        const s = evaluation[i]
        if (!next[letter] || STATE_PRIORITY[s] > STATE_PRIORITY[next[letter]]) {
          next[letter] = s
        }
      })
      return next
    })

    const won = evaluation.every(s => s === 'correct')
    if (won) {
      setStatus('won')
      onStep?.({ step: 'won', tries: nextCount, timestamp: new Date().toISOString() })
      if (isCustomerView && linkId) logOutcome(linkId, `Won in ${nextCount}`)
    } else if (nextCount >= 6) {
      setStatus('lost')
      onStep?.({ step: 'lost', timestamp: new Date().toISOString() })
      if (isCustomerView && linkId) logOutcome(linkId, 'Lost')
    }

    setInput('')
  }, [input, answer, rows, status, isCustomerView, linkId, onStep])

  const handleKey = useCallback((key) => {
    if (status !== 'playing') return
    if (key === 'BACKSPACE' || key === '⌫') { setInput(v => v.slice(0, -1)); return }
    if (key === 'ENTER') { submitGuess(); return }
    const letter = key.toUpperCase()
    if (/^[A-Z]$/.test(letter)) setInput(v => v.length < 5 ? v + letter : v)
  }, [status, submitGuess])

  // Physical keyboard support
  useEffect(() => {
    const handler = (e) => {
      const k = e.key.toUpperCase()
      if (k === 'ENTER' || k === 'BACKSPACE' || /^[A-Z]$/.test(k)) {
        e.preventDefault()
        handleKey(k)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleKey])

  const currentRowIndex = rows.length

  return (
    <div className="flex flex-col">

      {/* Header */}
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 text-center">
        <p className="text-[#e8a020] text-[10px] uppercase tracking-widest font-semibold mb-0.5">Finance Word Game</p>
        <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'DM Serif Display', serif" }}>
          The Money Word
        </h2>
        <p className="text-white/40 text-[11px] mt-0.5">A new finance word every day</p>
      </div>

      <div className="max-w-sm mx-auto w-full px-4 pt-5 pb-6 flex flex-col gap-5">

        {/* Grid — 6 rows × 5 tiles */}
        <div className="flex flex-col items-center gap-1.5">
          {Array.from({ length: 6 }, (_, ri) => {
            const committed    = rows[ri]
            const isActiveRow  = ri === currentRowIndex && status === 'playing'
            return (
              <div key={ri} className="flex gap-1.5">
                {Array.from({ length: 5 }, (_, ci) => {
                  let letter   = ''
                  let styleKey = 'empty'
                  if (committed) {
                    letter   = committed[ci].letter
                    styleKey = committed[ci].state
                  } else if (isActiveRow) {
                    letter   = input[ci] || ''
                    styleKey = letter ? 'tbd' : 'empty'
                  }
                  return (
                    <div
                      key={ci}
                      className={`w-[52px] h-[52px] border-2 flex items-center justify-center rounded font-bold text-lg uppercase ${TILE_STYLE[styleKey]}`}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Result banner */}
        {status === 'won' && (
          <div className="text-center">
            <p className="text-emerald-600 font-bold text-sm">🎉 Solved in {rows.length} {rows.length === 1 ? 'try' : 'tries'}!</p>
            <p className="text-[#0f1f3d] text-2xl font-bold mt-1 tracking-[0.25em]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {answer}
            </p>
          </div>
        )}
        {status === 'lost' && (
          <div className="text-center">
            <p className="text-gray-400 text-sm font-medium">The word was</p>
            <p className="text-[#0f1f3d] text-2xl font-bold mt-1 tracking-[0.25em]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {answer}
            </p>
          </div>
        )}

        {/* On-screen keyboard */}
        <div className="flex flex-col gap-1.5">
          {KEYBOARD_ROWS.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.map(key => {
                const isWide  = key === 'ENTER' || key === '⌫'
                const state   = letterMap[key] || 'unused'
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={`${isWide ? 'flex-[1.5]' : 'flex-1'} ${KEY_STYLE[state]}`}
                  >
                    {key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Definition card — shown after win or lose */}
        {status !== 'playing' && (
          <div className="bg-[#0f1f3d]/[0.04] border border-[#e4e7f0] rounded-2xl p-4">
            <p className="text-[#e8a020] text-[10px] uppercase tracking-wider font-semibold mb-1.5">Definition</p>
            <p className="text-gray-700 text-sm leading-relaxed">{definition}</p>
          </div>
        )}

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
