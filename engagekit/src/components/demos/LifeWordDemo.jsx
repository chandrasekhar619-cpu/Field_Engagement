import { useState, useRef, useEffect } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome } from '../../lib/logOutcome'

// ── Word bank ─────────────────────────────────────────────────────────────────

const WORDS = [
  { word: "BONUS", note: "Only PAR (participating) plans share profits with policyholders through bonuses — non-PAR and ULIP plans don't. There are three kinds. Reversionary Bonus is declared annually and added to your sum assured — once declared, it becomes guaranteed. For example, if your sum assured is ₹10 lakh and the bonus rate is ₹50 per ₹1,000, that's ₹50,000 added that year. Cash Bonus is also declared annually, but paid out as cash rather than accumulated — useful if you want regular income from the policy. Terminal Bonus is paid once, at maturity or on death, as a reward for staying invested through the full policy term." },
  { word: "CLAIM", note: "A claim is a formal request to the insurer for a payout. Three types: death claim (filed by the nominee), maturity claim (filed by the policyholder when the policy completes its term), and rider claim (for specific events like critical illness or accidental disability). Edelweiss Life settled 99.29% of individual claims in FY 2024-25. Keeping nominee details updated is the single most important thing you can do to make the process smooth for your family." },
  { word: "RIDER", note: "A rider is an optional add-on bought with your base policy for a small extra premium. Common types: Accidental Death Benefit (additional payout if death is due to an accident), Critical Illness (lump sum on diagnosis of listed conditions like cancer or heart attack), Waiver of Premium (all future premiums are waived if you become disabled or critically ill — and the policy continues as normal), and Accidental Total and Permanent Disability cover. The extra premium for a rider is usually small relative to the protection it adds." },
  { word: "GRACE", note: "After your premium due date, every policy gives you a buffer window before it is treated as inactive — called the grace period. Under Edelweiss Life plans: 15 days if you pay monthly, and 30 days for quarterly, half-yearly, or annual modes. Your cover stays fully active during this period even if you haven't paid yet. Miss it, and the policy lapses — though most plans allow revival by paying outstanding premiums with interest." },
  { word: "FUNDS", note: "Relevant to ULIPs specifically. In a Unit Linked Insurance Plan, your premium is split — part goes toward life cover, and part is invested in funds you choose. Options typically include equity funds (market-linked, higher growth potential but more volatility), debt funds (steadier, lower risk), and balanced funds (a mix of both). You can switch between funds as your goals or risk appetite change. One important rule: ULIPs have a mandatory 5-year lock-in period — you cannot fully access the money before that." },
  { word: "COVER", note: "Cover — the Sum Assured on Death — is the guaranteed minimum your family receives if you pass away during the policy term. How it works by plan type: in most traditional and PAR plans, the minimum is typically 10 times the annualized premium. In guaranteed income plans, you choose a coverage multiple — 5, 7, or 10 times — and a higher multiple means higher cover but affects the income payout. In a ULIP, your nominee receives whichever is higher — the sum assured or the fund value at the time of death. More cover means higher premium, but it is the core reason the policy exists." },
  { word: "RENEW", note: "Renewing your policy means paying your premium on time to keep it active. What is at stake if you miss it differs by plan type. In PAR plans, missing a renewal stops bonus accumulation for that year. In guaranteed income plans, it can interrupt scheduled payouts. In ULIPs, the policy enters a discontinuance mode — your funds are moved to a lower-yield Discontinued Policy Fund until the policy is revived or the 5-year lock-in period ends. The simplest fix across all plan types: set up an auto-debit and never think about it again." },
  { word: "FIXED", note: "In non-participating, non-linked plans — the guaranteed income and savings plans — your return is locked at inception. No market risk, no bonus variability. What the policy document shows you on day one is exactly what you receive. For example, pay ₹1 lakh a year for 10 years, and the plan guarantees ₹2.2 lakh a year as income for the next 15 years — regardless of how markets move. No upside potential, but complete predictability. It is the plan type built for people who want certainty over possibility." },
  { word: "WHOLE", note: "A whole life policy covers you until age 100 — not just for a fixed term of 15 or 20 years. The death benefit is payable whenever you die, not just within a policy window. Many whole life plans also pay regular income from an early policy year, making them useful for both long-term protection and retirement income planning. The premium paying term is usually shorter — typically 8 to 12 years — while the cover runs for life." },
  { word: "ASSET", note: "Most people think of life insurance as a cost. It is actually a financial asset. After 2 to 3 years of premium payments, the policy acquires a surrender value — money you can access in an emergency. PAR plans accumulate bonuses that increase the policy's worth over time. You can take a loan against it — up to 90% of surrender value in many plans — at rates typically lower than a personal loan. The surrender value is also tax-free if premiums have been paid for at least the first two years." },
  { word: "YIELD", note: "Effective return varies significantly by plan type. PAR plans: return comes from bonuses declared annually, historically around 5 to 6% for traditional plans. Non-PAR guaranteed plans: return is locked at inception, typically in the 6 to 7% effective return range for longer-term plans. ULIPs: depends on fund performance plus policy additions like Loyalty and Booster Additions — equity funds can return 8 to 12% over long periods, but nothing is guaranteed. Comparing yields across plan types only makes sense over the full policy term. Surrendering early reduces effective returns in every category." },
  { word: "LOANS", note: "Once your policy acquires a surrender value — typically after 2 to 3 years for traditional plans — you can borrow against it. Most Edelweiss Life plans allow loans up to 90% of the surrender value, at interest rates that are generally lower than personal loans. Your life cover stays active while the loan is outstanding. One thing to keep in mind: any unpaid loan balance, principal plus interest, is deducted from the final maturity or death payout. Borrow if you need to, but factor in repayment." },
  { word: "TAXES", note: "Life insurance has two main tax benefits. Section 80C: premiums paid are deductible up to ₹1.5 lakh per year, across all 80C investments combined. Section 10(10D): maturity and survival proceeds are tax-free, subject to annual premium not exceeding ₹5 lakh for policies issued after April 2023. Death benefits are always fully tax-free. For ULIPs specifically, switching between funds inside the plan carries no capital gains tax — an advantage over switching between mutual funds directly. If you surrender too early, some benefits claimed earlier may need to be reversed." },
  { word: "ENDOW", note: "An endowment plan is a savings-plus-insurance plan that pays a lump sum at the end of a fixed term, or on death — whichever is earlier. You pay premiums for a set number of years and receive a guaranteed amount at maturity, with bonuses added on top in PAR plans. For example, pay ₹1 lakh a year for 12 years and receive ₹18 to 20 lakh at maturity depending on bonuses declared. The fixed structure is the point — the money is committed for a purpose, which is why it actually gets saved." },
  { word: "GAINS", note: "In ULIPs, your total gain comes from two sources: market returns on your chosen funds, and policy-level additions credited at set milestones. Loyalty Additions — credited from around year 6 in many plans — and Booster Additions in the final years sit on top of whatever the fund earns. For example, a fund returning 10% per year plus a 2% Loyalty Addition is meaningfully better than holding the same fund outside a ULIP. This is why staying invested through the full term — rather than exiting when markets dip — makes such a significant difference." },
  { word: "INDEX", note: "An index fund tracks a market benchmark — like the Nifty 50 or Nifty Next 50 — rather than trying to beat it, typically at a lower fund management cost than actively managed equity funds. In a ULIP, index fund options let you participate in broad market growth without picking between individual sectors or fund managers. For someone who wants equity exposure without complexity, an index fund within a ULIP is a clean, straightforward starting point." },
  { word: "VALUE", note: "Surrender value is what you receive if you exit the policy before maturity. There are two components: Guaranteed Surrender Value, typically around 30% of premiums paid after the first year; and Special Surrender Value, which is usually higher and accounts for bonuses in PAR plans or fund value in ULIPs. The insurer pays whichever is greater. For ULIPs, the policy cannot be fully surrendered within the 5-year lock-in. In every plan type, the maturity payout is significantly higher than the surrender value at any intermediate point." },
  { word: "RATES", note: "Bonus rates in PAR plans are declared annually by the insurer based on the participating fund's performance — not guaranteed in advance, and can go up or down year to year. Edelweiss Life publishes its declared bonus rates on its website. For non-PAR guaranteed plans, the income or maturity rate is locked at policy inception — no surprises either way. For ULIPs, the relevant rate is the Net Asset Value of your chosen fund, recalculated every day as markets move." },
  { word: "TENOR", note: "Policy term is how long the plan runs; premium paying term is how long you actually pay premiums. These are often different — you might pay for 10 years but stay covered for 30. What the term affects by plan type: in PAR plans, a longer term means more years of bonus accumulation and compounding. In guaranteed plans, longer terms generally unlock higher guaranteed income rates. In ULIPs, a longer term lets market returns smooth out short-term volatility and gives policy additions time to fully accumulate. A 10-year ULIP and a 25-year ULIP are very different propositions even with identical fund choices." },
  { word: "SHARE", note: "In a ULIP's equity funds, your premium buys fund units backed by shares of listed companies. The Net Asset Value of the fund moves every day with the market. Unlike PAR plans where the insurer absorbs investment risk, in a ULIP the investment risk is entirely yours — if markets fall, your fund value falls. The upside: when markets perform well over a long period, returns can significantly exceed those of guaranteed or PAR plans. It is the plan type built for wealth accumulation over the long term, not just protection." },
  { word: "MONEY", note: "Life insurance works best when you think of it as money that keeps working — not a cost. A PAR plan shares the insurer's profits with you through bonuses that accumulate year on year. A guaranteed plan locks in a known return from day one. A ULIP builds a market-linked corpus while your life stays covered. What is common across all three: your premium is committed to a purpose, compounding over time, and the plan ensures it reaches your family — with or without you." },
  { word: "AGENT", note: "At Edelweiss Life, field agents are called Financial Life Consultants. Their role is to understand your existing cover, your income, your dependents, and your goals — and then recommend accordingly. A good Financial Life Consultant knows the difference between a PAR plan, a guaranteed plan, and a ULIP, and when each is appropriate. The quality of that first conversation has a direct bearing on whether the policy stays in-force for its full term — which is when it actually does what it was designed to do." },
  { word: "HEDGE", note: "Every life insurance plan is, at its core, a hedge — protection against the income loss your family would face if you were no longer around. PAR plans offer a secondary hedge against inflation, since bonuses declared on top of the base payout grow over time. ULIPs offer a market-participation hedge for long-term wealth goals. The right hedge depends on which risk you are most exposed to — loss of income, inflation eroding savings, or missing out on long-term market growth." },
  { word: "TERMS", note: "The terms of your policy are the conditions under which it operates — premium amount, payment frequency, policy and premium paying term, sum assured, benefit structure, exclusions, free-look period, and revival conditions. The free-look period gives you 30 days from receipt of the policy document to return it if it does not meet your expectations, with a refund minus processing charges. The exclusions section — what the policy will not cover — is the most commonly skipped and most commonly regretted part of any policy document." },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTodaysWord() {
  const dayIndex = Math.floor(Date.now() / 86400000) % WORDS.length
  return WORDS[dayIndex]
}

function evaluateGuess(guess, answer) {
  const result = Array(5).fill('absent')
  const available = answer.split('')
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) { result[i] = 'correct'; available[i] = null }
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue
    const idx = available.indexOf(guess[i])
    if (idx !== -1) { result[i] = 'present'; available[idx] = null }
  }
  return result
}

const STATE_PRIORITY = { correct: 3, present: 2, absent: 1 }

// ── Colour maps ───────────────────────────────────────────────────────────────

const TILE_BG     = { empty: 'transparent', filled: '#1a3060', correct: '#538d4e', present: '#b59f3b', absent: '#3a3a3c' }
const TILE_BORDER = { empty: '#3a4a6b',     filled: '#3a4a6b',  correct: '#538d4e', present: '#b59f3b', absent: '#3a3a3c' }
const KEY_BG      = { unused: '#818384', correct: '#538d4e', present: '#b59f3b', absent: '#3a3a3c' }

// ── Keyboard layout ───────────────────────────────────────────────────────────

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['ENTER','Z','X','C','V','B','N','M','⌫'],
]

// ── How To Play — static tiles, letters always visible ───────────────────────

const HTP_ROWS = [
  { word: ['B','O','N','U','S'], hi: 0, hiState: 'correct', label: 'Right letter, right spot' },
  { word: ['C','L','A','I','M'], hi: 3, hiState: 'present', label: 'Right letter, wrong spot' },
  { word: ['R','I','D','E','R'], hi: 2, hiState: 'absent',  label: 'Not in the word'          },
]

const HTP_COLOR = { correct: '#538d4e', present: '#b59f3b', absent: '#3a3a3c' }

function HowToPlay({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.78)' }} />
      <div
        className="relative rounded-t-3xl overflow-y-auto"
        style={{ background: '#0d2244', borderTop: '1px solid #1a3060', maxHeight: '88vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-base tracking-wide">How to Play</h2>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, background: '#1a3060', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'white', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              ✕
            </button>
          </div>

          <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Guess today's finance word in 6 tries. Each guess must be 5 letters.
            After each guess, the tiles change colour to show how close you were.
          </p>

          {/* Example rows — static, letters always visible */}
          <div className="flex flex-col gap-5 border-t pt-5" style={{ borderColor: '#1a3060' }}>
            {HTP_ROWS.map((ex, i) => (
              <div key={i}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  {ex.word.map((letter, li) => {
                    const isHi = li === ex.hi
                    const bg     = isHi ? HTP_COLOR[ex.hiState] : 'transparent'
                    const border = isHi ? HTP_COLOR[ex.hiState] : '#3a4a6b'
                    return (
                      <div
                        key={li}
                        style={{
                          width: 48, height: 48, flexShrink: 0,
                          background: bg,
                          border: `2px solid ${border}`,
                          borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: 20, color: '#ffffff',
                        }}
                      >
                        {letter}
                      </div>
                    )
                  })}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 500 }}>
                  {ex.label}
                </p>
              </div>
            ))}
          </div>

          {/* Got it */}
          <button
            onClick={onClose}
            style={{ marginTop: 24, width: '100%', padding: '12px 0', background: '#e8a020', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Got it →
          </button>

        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function LifeWordDemo({
  onShare, onStep,
  isCustomerView = false,
  linkId,
  customerName,
  rpmName,
  customerId,
}) {
  const { word: answer, note } = getTodaysWord()

  // Game state
  const [rows,         setRows]         = useState([])
  const [revealedMap,  setRevealedMap]  = useState({})
  const [animRowIdx,   setAnimRowIdx]   = useState(-1)
  const [input,        setInput]        = useState('')
  const [letterMap,    setLetterMap]    = useState({})
  const [status,       setStatus]       = useState('playing')
  const [shakeRowIdx,  setShakeRowIdx]  = useState(-1)
  const [bounceRowIdx, setBounceRowIdx] = useState(-1)
  const [showHowTo,    setShowHowTo]    = useState(false)
  const [tileSize,     setTileSize]     = useState(52)

  const gridContainerRef = useRef(null)
  const resultRef        = useRef(null)
  const handleKeyRef     = useRef(null)

  // ── FIX 1: ResizeObserver on grid container → dynamic tile sizing ──────────
  useEffect(() => {
    const el = gridContainerRef.current
    if (!el) return

    function measure(target) {
      const H = target.clientHeight
      const W = target.clientWidth
      if (!H || !W) return
      const gap = 6
      const heightBased = Math.floor((H - 5 * gap) / 6)
      const widthBased  = Math.floor((W - 4 * gap) / 5)
      setTileSize(Math.max(30, Math.min(heightBased, widthBased, 72)))
    }

    const ro = new ResizeObserver(entries => {
      for (const e of entries) measure(e.target)
    })
    ro.observe(el)
    // Also measure after first paint in case observer fires late
    requestAnimationFrame(() => measure(el))

    return () => ro.disconnect()
  }, [])

  // ── Auto-show How to Play for customers ────────────────────────────────────
  useEffect(() => {
    if (!isCustomerView) return
    const t = setTimeout(() => setShowHowTo(true), 400)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onStep?.({ step: 'viewed', timestamp: new Date().toISOString() })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Guess submission ────────────────────────────────────────────────────────
  function submitGuess() {
    const guess = input
    if (guess.length !== 5 || status !== 'playing') return

    const evaluation = evaluateGuess(guess, answer)
    const newRow     = guess.split('').map((letter, i) => ({ letter, state: evaluation[i] }))
    const ri         = rows.length
    const nextCount  = ri + 1
    const won        = evaluation.every(s => s === 'correct')

    setRows(prev => [...prev, newRow])
    setAnimRowIdx(ri)
    setInput('')

    for (let ci = 0; ci < 5; ci++) {
      setTimeout(() => {
        setRevealedMap(prev => ({ ...prev, [`${ri}-${ci}`]: true }))
      }, ci * 300 + 150)
    }

    setTimeout(() => {
      setAnimRowIdx(-1)
      setLetterMap(prev => {
        const next = { ...prev }
        guess.split('').forEach((l, i) => {
          const s = evaluation[i]
          if (!next[l] || STATE_PRIORITY[s] > STATE_PRIORITY[next[l]]) next[l] = s
        })
        return next
      })

      if (won) {
        setStatus('won')
        onStep?.({ step: 'won', tries: nextCount, timestamp: new Date().toISOString() })
        if (isCustomerView && linkId) logOutcome(linkId, `Won in ${nextCount}`)
        setTimeout(() => setBounceRowIdx(ri), 80)
      } else if (nextCount >= 6) {
        setStatus('lost')
        onStep?.({ step: 'lost', timestamp: new Date().toISOString() })
        if (isCustomerView && linkId) logOutcome(linkId, 'Lost')
      }

      if (won || nextCount >= 6) {
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 800)
      }
    }, 1550)
  }

  // ── Key handler ─────────────────────────────────────────────────────────────
  function handleKey(key) {
    if (status !== 'playing') return
    if (key === '⌫' || key === 'BACKSPACE') { setInput(v => v.slice(0, -1)); return }
    if (key === 'ENTER') {
      if (input.length < 5) {
        setShakeRowIdx(rows.length)
        setTimeout(() => setShakeRowIdx(-1), 400)
        return
      }
      submitGuess()
      return
    }
    if (key.length === 1 && /^[A-Z]$/.test(key) && input.length < 5) setInput(v => v + key)
  }

  handleKeyRef.current = handleKey

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return
      if      (e.key === 'Enter')     { e.preventDefault(); handleKeyRef.current('ENTER') }
      else if (e.key === 'Backspace') { e.preventDefault(); handleKeyRef.current('BACKSPACE') }
      else if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault(); handleKeyRef.current(e.key.toUpperCase())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const currentRowIdx = rows.length

  function tileVisual(ri, ci) {
    const c = rows[ri]
    if (c) return revealedMap[`${ri}-${ci}`] ? c[ci].state : 'filled'
    if (ri === currentRowIdx && input[ci]) return 'filled'
    return 'empty'
  }

  // ── FIX 1: game-wrapper is exactly 100dvh (customer view) or calc(...) for RPM preview
  const gameWrapperH = isCustomerView ? '100dvh' : 'calc(100dvh - 48px)'

  return (
    <>
      {showHowTo && <HowToPlay onClose={() => setShowHowTo(false)} />}

      {/* ── Game wrapper: locked to viewport height ─────────────────────── */}
      <div style={{
        height:         gameWrapperH,
        display:        'flex',
        flexDirection:  'column',
        overflow:       'hidden',
        background:     '#0d2244',
      }}>

        {/* 1. Customer header — compact, flex-shrink 0, ~70px */}
        {isCustomerView && (
          <div style={{ flexShrink: 0, background: '#0f1f3d', padding: '12px 20px 8px' }}>
            <p style={{ color: 'white', fontSize: 20, fontWeight: 700, lineHeight: '28px', margin: 0 }}>
              {customerName ? `Hi ${customerName}! 👋` : 'Hello! 👋'}
            </p>
            {rpmName && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: '2px 0 0' }}>
                Sent by {rpmName} · <span style={{ color: '#e8a020' }}>Edelweiss Life</span>
              </p>
            )}
          </div>
        )}

        {/* 2. Title section — compact, flex-shrink 0 */}
        <div style={{
          flexShrink:   0,
          padding:      '6px 16px',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1a3060',
        }}>
          <div style={{ width: 32 }} />
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              The Money Word
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, margin: 0 }}>
              A new finance word every day
            </p>
          </div>
          <button
            onClick={() => setShowHowTo(true)}
            style={{ width: 32, height: 32, background: '#1a3060', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="How to play"
          >
            ⓘ
          </button>
        </div>

        {/* 3. Grid container — flex: 1, ResizeObserver measures this */}
        <div
          ref={gridContainerRef}
          style={{
            flex:           1,
            minHeight:      0,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            overflow:       'hidden',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: 6 }, (_, ri) => {
              const isFlipping = animRowIdx === ri && rows[ri] != null
              const isBouncing = bounceRowIdx === ri
              const isShaking  = shakeRowIdx === ri

              return (
                <div
                  key={ri}
                  className={isShaking ? 'mw-shake' : ''}
                  style={{ display: 'flex', gap: 6 }}
                >
                  {Array.from({ length: 5 }, (_, ci) => {
                    const vis    = tileVisual(ri, ci)
                    const letter = rows[ri]
                      ? rows[ri][ci].letter
                      : ri === currentRowIdx ? (input[ci] || '') : ''

                    const tileKey = rows[ri]
                      ? `c-${ri}-${ci}`
                      : ri === currentRowIdx
                        ? `i-${ci}-${input[ci] || ''}`
                        : `e-${ri}-${ci}`

                    const isPop = !rows[ri] && ri === currentRowIdx
                      && input.length > 0 && ci === input.length - 1

                    return (
                      <div
                        key={tileKey}
                        style={{ width: tileSize, height: tileSize, flexShrink: 0, perspective: '250px' }}
                      >
                        <div
                          className={`w-full h-full border-2 flex items-center justify-center
                            font-bold uppercase rounded select-none
                            ${isFlipping  ? 'mw-flip'   : ''}
                            ${isPop       ? 'mw-pop'    : ''}
                            ${isBouncing  ? 'mw-bounce' : ''}`}
                          style={{
                            fontSize:       Math.max(14, Math.round(tileSize * 0.42)),
                            background:     TILE_BG[vis],
                            borderColor:    TILE_BORDER[vis],
                            color:          'white',
                            animationDelay: isFlipping ? `${ci * 300}ms`
                                          : isBouncing ? `${ci * 80}ms`
                                          : '0ms',
                          }}
                        >
                          {letter}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* 4. Keyboard — flex-shrink 0 */}
        <div style={{ flexShrink: 0, padding: '6px 8px 10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 500, margin: '0 auto' }}>
            {KB_ROWS.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 5 }}>
                {row.map(key => {
                  const isWide = key === 'ENTER' || key === '⌫'
                  const state  = key.length === 1 ? (letterMap[key] || 'unused') : 'unused'
                  return (
                    <button
                      key={key}
                      onPointerDown={e => { e.preventDefault(); handleKey(key) }}
                      style={{
                        flex:       isWide ? '0 0 auto' : '1 1 0',
                        minWidth:   isWide ? 44 : undefined,
                        height:     52,
                        background: KEY_BG[state],
                        border:     'none',
                        borderRadius: 6,
                        color:      'white',
                        fontWeight: 700,
                        fontSize:   isWide ? '11px' : '13px',
                        textTransform: 'uppercase',
                        cursor:     'pointer',
                        display:    'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                    >
                      {key}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

      </div>{/* end game-wrapper */}

      {/* ── Below fold: result + feedback (page scrolls to here on game end) ── */}
      {status !== 'playing' && (
        <div ref={resultRef} style={{ background: '#0d2244', padding: '16px 12px 0' }}>
          <div style={{ background: '#1a3060', borderRadius: 16, padding: 20, maxWidth: 384, margin: '0 auto' }}>
            {status === 'won' ? (
              <>
                <p style={{ color: '#e8a020', fontWeight: 700, fontSize: 20, margin: '0 0 4px' }}>
                  🎉 Solved in {rows.length} {rows.length === 1 ? 'try' : 'tries'}!
                </p>
                <p style={{ color: '#e8a020', fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', fontFamily: "'DM Serif Display', serif", margin: '0 0 16px' }}>
                  {answer}
                </p>
              </>
            ) : (
              <>
                <p style={{ color: 'white', fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>Today's word was</p>
                <p style={{ color: '#e8a020', fontWeight: 700, fontSize: 28, letterSpacing: '0.2em', fontFamily: "'DM Serif Display', serif", margin: '0 0 16px' }}>
                  {answer}
                </p>
              </>
            )}
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              {note}
            </p>
          </div>
        </div>
      )}

      {status !== 'playing' && (
        <div style={{ background: '#0d2244', padding: '12px 12px 16px' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 16, maxWidth: 384, margin: '0 auto' }}>
            <FeedbackSection linkId={linkId} onDone={isCustomerView ? onShare : undefined} />
          </div>
        </div>
      )}

      {!isCustomerView && (
        <div style={{ background: '#0d2244', padding: '0 12px 24px' }}>
          <button
            onClick={onShare}
            style={{ display: 'block', width: '100%', maxWidth: 384, margin: '0 auto', padding: '14px 0', background: '#e8a020', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Share with a customer →
          </button>
        </div>
      )}
    </>
  )
}
