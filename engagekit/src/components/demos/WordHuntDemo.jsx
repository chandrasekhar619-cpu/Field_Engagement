import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { logOutcome } from '../../lib/logOutcome'
import FeedbackSection from '../FeedbackSection'

const gridData = [
  ['K','R','Q','X','A','B','M','P','Z','X'],
  ['F','J','N','Y','W','G','O','K','Q','S'],
  ['L','P','O','W','Q','V','B','N','M','E'],
  ['C','V','M','F','G','H','J','K','U','T'],
  ['Y','D','I','O','P','A','S','D','F','S'],
  ['H','J','N','L','Z','X','C','V','B','N'],
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','E','D','F','G','H','J','K','L'],
  ['Z','X','T','E','S','S','A','C','V','B'],
  ['M','N','B','V','C','X','Z','L','K','J'],
]

// BONUS: diagonal (1,1), NOMINEE: vertical (1,0), ASSET: reversed horizontal (0,-1)
const WORD_PATHS = {
  term1: [[0,5],[1,6],[2,7],[3,8],[4,9]],
  term2: [[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2]],
  term3: [[8,6],[8,5],[8,4],[8,3],[8,2]],
}

const TERM_ORDER = ['term1', 'term2', 'term3']
const WORD_LABELS = { term1: 'BONUS', term2: 'NOMINEE', term3: 'ASSET' }

const EXPLANATIONS = {
  term1: {
    title: 'BONUS UNLOCKED',
    body: 'A bonus is an additional benefit that may be added to participating life insurance policies and can enhance the overall value of your policy over time. You may notice policy illustrations showing values at 4% and 8%. These are regulatory-prescribed scenarios used to demonstrate how benefits may vary under different assumptions and should not be considered guaranteed returns. Depending on the policy, bonuses may be added and accumulated over time (Reversionary Bonus) or paid periodically during the policy term (Cash Bonus). Additionally, a **Terminal Bonus** may be declared and paid out as a one-time lump sum upon the termination of the contract through maturity or death, rewardingly boosting your long-term return metrics.',
    cta: 'Want to understand the type of bonus applicable to your policy and how it impacts your capital accumulation performance? Please connect with your Relationship Manager.',
  },
  term2: {
    title: 'NOMINEE UNLOCKED',
    body: "A nominee is the person chosen to receive policy benefits in the event of the policyholder's death. Keeping nominee details updated helps ensure a smoother, more efficient claim settlement process. Major life events such as marriage, the birth of a child, or structural shifts in family circumstances are excellent opportunities to optimize your beneficiary designations. Please ensure your nominee details are correctly registered and updated in the system to guarantee seamless asset transmission.",
    cta: 'If you would like to run a profile verification audit, connect with your Relationship Manager.',
  },
  term3: {
    title: 'ASSET UNLOCKED',
    body: 'A wealth-generating tool like a long-term life insurance policy serves as a cornerstone financial asset for your portfolio. It balances market volatility by locking in steady growth over long time horizons. By securing your baseline net worth against sudden economic downturns, it keeps your long-term capital accumulation engines running on an uninterrupted track.',
    cta: 'Want to map out how this protective growth asset fits into your broader portfolio allocation matrix? Please connect with your Relationship Manager.',
  },
}

const PERSONA_CONTENT = {
  go_getter:  { intro: "Ready to test your skills? Slide your finger or mouse across the grid to find these 3 hidden financial words:",                                                                               subtitle: "Find the hidden words in the puzzle grid to unlock your custom financial insights below." },
  caregiver:  { intro: "The future feels more secure when you're prepared for it. Find the hidden terms and discover ideas that can help support your loved ones and their aspirations.",                             subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way." },
  protector:  { intro: "Planning ahead is one of the best ways to protect what matters most. Find the hidden terms and learn concepts that can help strengthen your financial foundation.",                          subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way." },
  thinker:    { intro: "The more you understand, the more confident your decisions become. Find the hidden terms and explore the concepts behind important financial planning decisions.",                            subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way." },
  fallback:   { intro: "Every great financial decision starts with understanding a few key terms. Find these 3 hidden words in the grid below, and unlock a short explanation for each one as you go.",             subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way." },
}

const PERSONA_MAP = { 'Go-Getter': 'go_getter', 'Protector': 'protector', 'Caregiver': 'caregiver', 'Thinker': 'thinker' }
function resolvePersonaKey(persona) { return PERSONA_MAP[persona] ?? 'fallback' }

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

async function markTokenUsed(shareToken) {
  if (!shareToken) return
  try {
    const { error } = await supabase.from('share_tokens').update({ used: true }).eq('token', shareToken)
    if (error) console.error('share_token mark-used failed:', error)
  } catch (e) { console.error('share_token mark-used exception:', e) }
}

// ── CSS (injected once) ───────────────────────────────────────────────────────

const INJECTED_STYLES = `
  @keyframes wh-confetti {
    0%   { transform: translateY(0) rotate(0deg);      opacity: 1; }
    100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
  }
  @keyframes wh-cell-bounce {
    0%, 100% { transform: scale(1);    }
    40%       { transform: scale(1.28); }
    70%       { transform: scale(0.90); }
  }
  @keyframes wh-card-in {
    from { transform: scale(0.92); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }
  @keyframes wh-card-unlock {
    0%   { box-shadow: 0 0 0 0    rgba(0,91,172,0.55); }
    40%  { box-shadow: 0 0 0 10px rgba(0,91,172,0.25); }
    100% { box-shadow: 0 0 0 0    rgba(0,91,172,0);    }
  }
  @keyframes wh-toast-in {
    0%   { opacity: 0; transform: translateX(-50%) translateY(6px);  }
    15%  { opacity: 1; transform: translateX(-50%) translateY(0);     }
    75%  { opacity: 1; transform: translateX(-50%) translateY(0);     }
    100% { opacity: 0; transform: translateX(-50%) translateY(-4px);  }
  }
  @keyframes wh-dir-line {
    0%   { stroke-dashoffset: 60; opacity: 0; }
    12%  { stroke-dashoffset: 60; opacity: 1; }
    55%  { stroke-dashoffset: 0;  opacity: 1; }
    82%  { stroke-dashoffset: 0;  opacity: 1; }
    100% { stroke-dashoffset: 0;  opacity: 0; }
  }
  .wh-carousel::-webkit-scrollbar { display: none; }
`

// ── Confetti ──────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#005BAC','#2E7D32','#e8a020','#ef4444','#7c3aed','#0d9488']

function ConfettiEffect() {
  const piecesRef = useRef(null)
  if (!piecesRef.current) {
    piecesRef.current = Array.from({ length: 36 }, (_, i) => ({
      id: i, x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 7,
      delay: Math.random() * 0.45,
      duration: 0.85 + Math.random() * 0.7,
      round: i % 3 !== 0,
    }))
  }
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {piecesRef.current.map(p => (
        <div key={p.id} style={{
          position: 'absolute', top: -16, left: `${p.x}%`,
          width: p.size, height: p.size,
          borderRadius: p.round ? '50%' : 2,
          background: p.color,
          animation: `wh-confetti ${p.duration}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  )
}

// ── Directions demo for How to Play (FIX 3) ───────────────────────────────────

// 8 directions: right, down-right, down, down-left, left, up-left, up, up-right
const DEMO_DIRS = [
  [0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],
]
const DEMO_LETTERS = [['B','O','N'],['U','M','S'],['E','A','T']]
const DEMO_CELL = 34, DEMO_GAP = 3
const DEMO_SIZE = 3 * DEMO_CELL + 2 * DEMO_GAP  // 108

function DirectionsDemo() {
  const [dirIdx, setDirIdx] = useState(0)
  const lineRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setDirIdx(d => (d + 1) % 8), 900)
    return () => clearInterval(t)
  }, [])

  // Restart SVG animation when direction changes
  useEffect(() => {
    const el = lineRef.current
    if (!el) return
    el.style.animation = 'none'
    el.getBoundingClientRect() // force reflow
    el.style.animation = 'wh-dir-line 0.9s ease-out forwards'
  }, [dirIdx])

  const [dr, dc] = DEMO_DIRS[dirIdx]
  const step = DEMO_CELL + DEMO_GAP  // 37px per cell
  const cx = step + DEMO_CELL / 2    // center of [1,1] = 37 + 17 = 54
  const cy = step + DEMO_CELL / 2
  const tx = cx + dc * step
  const ty = cy + dr * step

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '4px 0 2px' }}>
      <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
        Words can run left to right, right to left, top to bottom, bottom to top, or diagonally in any direction.
      </p>
      <div style={{ position: 'relative', width: DEMO_SIZE, height: DEMO_SIZE }}>
        {/* 3×3 static grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${DEMO_CELL}px)`, gap: DEMO_GAP }}>
          {DEMO_LETTERS.map((row, r) => row.map((letter, c) => {
            const isCenter = r === 1 && c === 1
            const isTarget = r === 1 + dr && c === 1 + dc
            return (
              <div key={`${r}-${c}`} style={{
                width: DEMO_CELL, height: DEMO_CELL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13, borderRadius: 4,
                background: isCenter ? '#003366' : isTarget ? '#e3ecf7' : 'white',
                color: isCenter ? 'white' : '#003366',
                border: `1.5px solid ${isCenter ? '#003366' : isTarget ? '#005BAC' : '#cdd8e8'}`,
                transition: 'background 0.15s, border-color 0.15s',
              }}>
                {isCenter ? '★' : letter}
              </div>
            )
          }))}
        </div>

        {/* Animated SVG arrow */}
        <svg width={DEMO_SIZE} height={DEMO_SIZE}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="wh-da" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
              <polygon points="0 0, 7 3.5, 0 7" fill="#005BAC" />
            </marker>
          </defs>
          <line
            ref={lineRef}
            x1={cx} y1={cy} x2={tx} y2={ty}
            stroke="#005BAC" strokeWidth="2.5" strokeLinecap="round"
            markerEnd="url(#wh-da)"
            style={{ strokeDasharray: 60, strokeDashoffset: 60, opacity: 0 }}
          />
        </svg>
      </div>
    </div>
  )
}

// ── Intro modal (no word badges; directions demo added) ───────────────────────

function IntroModal({ persona, onClose }) {
  const pc = PERSONA_CONTENT[resolvePersonaKey(persona)]
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.55)' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', background: '#F5F8FC', borderRadius: '20px 20px 0 0', padding: '24px 20px', maxHeight: '82vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontWeight: 700, fontSize: 18, color: '#003366', margin: 0 }}>🔍 Word Hunt</h2>
          <button onClick={onClose} style={{ width: 32, height: 32, background: '#e8eef5', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#003366', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.7, color: '#334155', marginBottom: 18 }}>
          {pc.intro}
        </p>

        {/* Directions explainer (FIX 3) */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginBottom: 20 }}>
          <DirectionsDemo />
        </div>

        <button onClick={onClose} style={{ width: '100%', padding: '13px 0', background: '#005BAC', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          Got it →
        </button>
      </div>
    </div>
  )
}

// ── Cell styles ───────────────────────────────────────────────────────────────

const CELL_STYLES = {
  found:     { background: '#2E7D32', color: 'white',   borderColor: '#2E7D32' },
  bouncing:  { background: '#2E7D32', color: 'white',   borderColor: '#2E7D32' },
  selecting: { background: '#005BAC', color: 'white',   borderColor: '#005BAC' },
  default:   { background: 'white',   color: '#003366', borderColor: '#cdd8e8' },
}

// ── Direction-lock helpers (FIX 2) ────────────────────────────────────────────

// Returns step-count n if [r,c] lies exactly on the ray anchor+(n*dr, n*dc), n>0.
// Returns -1 if off the ray.
function getStepOnRay(ar, ac, r, c, dr, dc) {
  const dRow = r - ar
  const dCol = c - ac
  // Must move in the correct sign for non-zero axis
  if (dr !== 0 && Math.sign(dRow) !== dr) return -1
  if (dc !== 0 && Math.sign(dCol) !== dc) return -1
  // Non-zero axis must not drift on zero-axis
  if (dr === 0 && dRow !== 0) return -1
  if (dc === 0 && dCol !== 0) return -1
  // Compute n
  const n = dr !== 0 ? dRow / dr : dCol / dc
  if (!Number.isInteger(n) || n <= 0) return -1
  // Diagonal cross-check
  if (dr !== 0 && dc !== 0 && dCol !== dc * n) return -1
  return n
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WordHuntDemo({
  onShare, onStep,
  isCustomerView = false,
  linkId,
  persona,
  shareToken,
}) {
  const [selectedCells,    setSelectedCells]    = useState([])
  const [discoveredWords,  setDiscoveredWords]  = useState(new Set())
  const [discoveredCells,  setDiscoveredCells]  = useState({})
  const [showIntro,        setShowIntro]        = useState(false)
  const [wordsRevealed,    setWordsRevealed]    = useState(!isCustomerView)
  const [cellSize,         setCellSize]         = useState(32)
  const [unlockToast,      setUnlockToast]      = useState(false)
  const [justUnlockedTerm, setJustUnlockedTerm] = useState(null)
  const [activeCardIdx,    setActiveCardIdx]    = useState(0)
  const [bouncingTerm,     setBouncingTerm]     = useState(null)
  const [showConfetti,     setShowConfetti]     = useState(false)
  const [showCompletionCard, setShowCompletionCard] = useState(false)

  const isSelectingRef     = useRef(false)
  const selectedCellsRef   = useRef([])
  const discoveredWordsRef = useRef(new Set())
  const anchorRef          = useRef(null)   // FIX 2: anchor cell
  const dirRef             = useRef(null)   // FIX 2: locked direction {dr,dc}
  const markedUsedRef      = useRef(false)
  const outerRef           = useRef(null)
  const gridRef            = useRef(null)
  const carouselRef        = useRef(null)
  const cardRefs           = useRef([])
  const finalizeRef        = useRef(null)
  const unlockTimerRef     = useRef(null)
  const toastTimerRef      = useRef(null)
  const celebTimerRef      = useRef(null)

  const pc       = PERSONA_CONTENT[resolvePersonaKey(persona)]
  const allFound = discoveredWords.size === 3

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isCustomerView) return
    const t = setTimeout(() => setShowIntro(true), 300)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onStep?.({ step: 'viewed', timestamp: new Date().toISOString() })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!allFound || !isCustomerView || markedUsedRef.current) return
    markedUsedRef.current = true
    markTokenUsed(shareToken)
    if (linkId) logOutcome(linkId, 'Completed')
    onStep?.({ step: 'completed', timestamp: new Date().toISOString() })
  }, [allFound]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      clearTimeout(unlockTimerRef.current)
      clearTimeout(toastTimerRef.current)
      clearTimeout(celebTimerRef.current)
    }
  }, [])

  // FIX 1 — cell sizing: 8px side padding, gap always 3, cap raised to 52px
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    function measure(target) {
      const style = window.getComputedStyle(target)
      const padL = parseFloat(style.paddingLeft)  || 0
      const padR = parseFloat(style.paddingRight) || 0
      const w    = target.clientWidth - padL - padR
      if (!w) return
      setCellSize(Math.max(24, Math.min(Math.floor((w - 9 * 3) / 10), 52)))
    }
    const ro = new ResizeObserver(entries => { for (const e of entries) measure(e.target) })
    ro.observe(el)
    requestAnimationFrame(() => measure(el))
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onUp = () => { if (isSelectingRef.current) finalizeRef.current?.() }
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

  // ── Selection logic ────────────────────────────────────────────────────────

  function getCellFromEvent(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    if (!el) return null
    const cellEl = el.dataset?.row !== undefined ? el : el.closest?.('[data-row]')
    if (!cellEl) return null
    const r = parseInt(cellEl.dataset.row)
    const c = parseInt(cellEl.dataset.col)
    if (isNaN(r) || isNaN(c)) return null
    return [r, c]
  }

  function checkSelection(cells) {
    for (const [termKey, path] of Object.entries(WORD_PATHS)) {
      if (discoveredWordsRef.current.has(termKey)) continue
      if (cells.length !== path.length) continue
      const fwd = path.every((p, i) => p[0] === cells[i][0] && p[1] === cells[i][1])
      const bwd = path.every((p, i) => p[0] === cells[cells.length - 1 - i][0] && p[1] === cells[cells.length - 1 - i][1])
      if (fwd || bwd) return termKey
    }
    return null
  }

  function finalizeSelect() {
    if (!isSelectingRef.current) return
    isSelectingRef.current = false
    const cells = selectedCellsRef.current
    const found = checkSelection(cells)

    if (found) {
      const newCellMap = {}
      cells.forEach(([r, c]) => { newCellMap[`${r}-${c}`] = found })
      setDiscoveredCells(dc => ({ ...dc, ...newCellMap }))
      discoveredWordsRef.current.add(found)
      setDiscoveredWords(new Set(discoveredWordsRef.current))
      onStep?.({ step: 'found', word: WORD_LABELS[found], timestamp: new Date().toISOString() })

      setJustUnlockedTerm(found)
      clearTimeout(unlockTimerRef.current)
      unlockTimerRef.current = setTimeout(() => setJustUnlockedTerm(null), 700)

      setUnlockToast(true)
      clearTimeout(toastTimerRef.current)
      toastTimerRef.current = setTimeout(() => setUnlockToast(false), 1500)

      const cardIdx = TERM_ORDER.indexOf(found)
      setTimeout(() => {
        const card = cardRefs.current[cardIdx]
        if (card && carouselRef.current) {
          carouselRef.current.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' })
        }
      }, 60)

      if (discoveredWordsRef.current.size === 3) {
        if (isCustomerView) {
          setBouncingTerm(found)
          clearTimeout(celebTimerRef.current)
          celebTimerRef.current = setTimeout(() => {
            setBouncingTerm(null)
            setShowConfetti(true)
            clearTimeout(celebTimerRef.current)
            celebTimerRef.current = setTimeout(() => {
              setShowConfetti(false)
              setShowCompletionCard(true)
            }, 1200)
          }, 400)
        } else {
          setShowCompletionCard(true)
        }
      }
    }

    selectedCellsRef.current = []
    setSelectedCells([])
    anchorRef.current = null
    dirRef.current = null
  }

  finalizeRef.current = finalizeSelect

  function handleGridPointerDown(e) {
    e.preventDefault()
    const cell = getCellFromEvent(e)
    if (!cell) return
    const [r, c] = cell
    isSelectingRef.current = true
    anchorRef.current = [r, c]
    dirRef.current = null
    selectedCellsRef.current = [[r, c]]
    setSelectedCells([[r, c]])
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) {}
  }

  // FIX 2 — direction-locked pointer move
  function handleGridPointerMove(e) {
    if (!isSelectingRef.current) return
    const cell = getCellFromEvent(e)
    if (!cell) return
    const [r, c] = cell
    const cells  = selectedCellsRef.current
    const [ar, ac] = anchorRef.current

    // Skip if same as last selected
    if (cells.length > 0) {
      const [lr, lc] = cells[cells.length - 1]
      if (lr === r && lc === c) return
    }

    if (dirRef.current === null) {
      // ── Lock direction from anchor to this cell ──────────────────────────
      const dRow = r - ar
      const dCol = c - ac
      if (dRow === 0 && dCol === 0) return  // same as anchor, ignore

      const dr = Math.sign(dRow)
      const dc = Math.sign(dCol)
      dirRef.current = { dr, dc }

      // Fill cells from anchor+1 to as far as [r,c] lies on this ray
      const n = getStepOnRay(ar, ac, r, c, dr, dc)
      const fillTo = n > 0 ? n : 1  // at minimum add the first step
      const newCells = [[ar, ac]]
      for (let i = 1; i <= fillTo; i++) {
        const nr = ar + i * dr
        const nc = ac + i * dc
        if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) break
        newCells.push([nr, nc])
      }
      selectedCellsRef.current = newCells
      setSelectedCells(newCells)

    } else {
      // ── Direction locked: only accept cells on the ray ───────────────────
      const { dr, dc } = dirRef.current
      const n = getStepOnRay(ar, ac, r, c, dr, dc)
      if (n < 0) return  // off the locked direction line

      const lastN = cells.length - 1
      if (n <= lastN) return  // going backward or duplicate

      // Fill any skipped cells (handles fast swipes)
      const newCells = [...cells]
      for (let i = lastN + 1; i <= n; i++) {
        const nr = ar + i * dr
        const nc = ac + i * dc
        if (nr < 0 || nr >= 10 || nc < 0 || nc >= 10) break
        newCells.push([nr, nc])
      }
      if (newCells.length > cells.length) {
        selectedCellsRef.current = newCells
        setSelectedCells(newCells)
      }
    }
  }

  function getCellVisual(r, c) {
    const key = `${r}-${c}`
    const termKey = discoveredCells[key]
    if (termKey) return termKey === bouncingTerm ? 'bouncing' : 'found'
    if (selectedCells.some(([sr, sc]) => sr === r && sc === c)) return 'selecting'
    return 'default'
  }

  // ── Carousel dot tracking ─────────────────────────────────────────────────

  function handleCarouselScroll() {
    const carousel = carouselRef.current
    if (!carousel) return
    const scrollCenter = carousel.scrollLeft + carousel.clientWidth / 2
    let closest = 0, minDist = Infinity
    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - scrollCenter)
      if (dist < minDist) { minDist = dist; closest = i }
    })
    setActiveCardIdx(closest)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{INJECTED_STYLES}</style>
      {showConfetti && <ConfettiEffect />}
      {showIntro && (
        <IntroModal
          persona={persona}
          onClose={() => { setShowIntro(false); setWordsRevealed(true) }}
        />
      )}

      {unlockToast && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%',
          transform: 'translateX(-50%)',
          background: '#1a3060', color: 'white',
          padding: '9px 18px', borderRadius: 20,
          fontSize: 13, fontWeight: 600, zIndex: 100, whiteSpace: 'nowrap',
          animation: 'wh-toast-in 1.5s ease-out forwards',
        }}>
          🔓 New insight unlocked!
        </div>
      )}

      <div style={{ background: '#F5F8FC', paddingBottom: 32 }}>

        {/* Subtitle */}
        <div style={{ padding: '14px 16px 8px' }}>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.55, margin: 0 }}>{pc.subtitle}</p>
        </div>

        {/* Word chips — revealed after intro modal closes */}
        {wordsRevealed && (
          <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TERM_ORDER.map(key => {
              const found = discoveredWords.has(key)
              return (
                <div key={key} style={{
                  padding: '5px 13px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                  background: found ? '#2E7D32' : '#003366',
                  color: 'white',
                  textDecoration: found ? 'line-through' : 'none',
                  opacity: found ? 0.8 : 1,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'background 0.2s',
                }}>
                  {found && '✓ '}{WORD_LABELS[key]}
                </div>
              )
            })}
          </div>
        )}

        {/* Progress counter */}
        <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#003366' }}>
            {discoveredWords.size} / 3 Words Found
          </span>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < discoveredWords.size ? '#2E7D32' : '#cdd8e8' }} />
          ))}
        </div>

        {/* Grid — FIX 1: padding 0 8px, gap 3px always, cap 52px */}
        <div ref={outerRef} style={{ padding: '0 8px', boxSizing: 'border-box', overflow: 'hidden' }}>
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(10, ${cellSize}px)`,
              gap: '3px',
              boxSizing: 'border-box',
              touchAction: allFound ? 'auto' : 'none',
              userSelect: 'none', WebkitUserSelect: 'none',
              cursor: allFound ? 'default' : 'crosshair',
            }}
            onPointerDown={handleGridPointerDown}
            onPointerMove={handleGridPointerMove}
            onPointerUp={finalizeSelect}
            onPointerCancel={finalizeSelect}
          >
            {gridData.map((row, r) =>
              row.map((letter, c) => {
                const vis = getCellVisual(r, c)
                const cs  = CELL_STYLES[vis]
                return (
                  <div key={`${r}-${c}`} data-row={r} data-col={c} style={{
                    width: cellSize, height: cellSize,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: Math.max(10, Math.round(cellSize * 0.38)),
                    borderRadius: 4,
                    border: `1.5px solid ${cs.borderColor}`,
                    background: cs.background, color: cs.color,
                    boxSizing: 'border-box',
                    transition: 'background 0.12s, border-color 0.12s',
                    animation: vis === 'bouncing' ? 'wh-cell-bounce 0.4s ease-out' : 'none',
                  }}>
                    {letter}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Explanation carousel */}
        <div style={{ marginTop: 14 }}>
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="wh-carousel"
            style={{
              display: 'flex', overflowX: 'auto',
              scrollSnapType: 'x mandatory', scrollPaddingLeft: '16px',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', msOverflowStyle: 'none',
              gap: 12, padding: '4px 16px 8px',
            }}
          >
            {TERM_ORDER.map((termKey, idx) => {
              const unlocked = discoveredWords.has(termKey)
              const isNew    = justUnlockedTerm === termKey
              const exp      = EXPLANATIONS[termKey]
              const label    = WORD_LABELS[termKey]
              return (
                <div
                  key={termKey}
                  ref={el => { cardRefs.current[idx] = el }}
                  style={{
                    flexShrink: 0, width: 'clamp(280px, 85vw, 340px)',
                    scrollSnapAlign: 'start', borderRadius: 14, padding: 16,
                    background: unlocked ? 'white' : '#eef2f7',
                    border: `2px solid ${isNew ? '#005BAC' : unlocked ? '#e2e8f0' : '#dde4ed'}`,
                    transition: 'background 0.3s, border-color 0.3s',
                    animation: isNew ? 'wh-card-unlock 0.6s ease-out' : 'none',
                  }}
                >
                  {unlocked ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32', flexShrink: 0 }} />
                        <p style={{ fontWeight: 700, fontSize: 12, color: '#2E7D32', letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase' }}>{exp.title}</p>
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.65, color: '#334155', margin: '0 0 10px' }}>{renderBold(exp.body)}</p>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55, margin: 0, borderTop: '1px solid #f0f4f8', paddingTop: 10, fontStyle: 'italic' }}>{exp.cta}</p>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 0', gap: 10 }}>
                      <span style={{ fontSize: 28, opacity: 0.5 }}>🔒</span>
                      <div style={{ background: '#003366', color: 'white', borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', opacity: 0.6 }}>{label}</div>
                      <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>Find <strong style={{ color: '#475569' }}>{label}</strong> to unlock this insight</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '2px 0 4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === activeCardIdx ? '#003366' : '#cdd8e8', transition: 'background 0.2s' }} />
            ))}
          </div>
        </div>

        {/* Completion card */}
        {showCompletionCard && (
          <div style={{
            margin: '12px 16px 0', background: 'white', borderRadius: 16, padding: 16,
            border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,51,102,0.08)',
            animation: 'wh-card-in 0.4s ease-out',
          }}>
            <p style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: '#003366', margin: '0 0 4px' }}>
              🎉 You found all 3 words!
            </p>
            {isCustomerView
              ? <FeedbackSection linkId={linkId} onDone={onShare} />
              : <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: '8px 0 0' }}>All 3 hidden words found.</p>
            }
          </div>
        )}

        {/* RPM preview: share CTA */}
        {!isCustomerView && (
          <div style={{ padding: '16px 16px 0' }}>
            <button onClick={onShare} style={{ width: '100%', padding: '14px 0', background: '#003366', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Share with a customer →
            </button>
          </div>
        )}

      </div>
    </>
  )
}
