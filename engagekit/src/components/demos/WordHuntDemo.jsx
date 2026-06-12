import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'

const gridData = [
  ['K','R','Q','X','A','M','P','Z','X','A'],
  ['B','O','N','U','S','X','Y','R','L','S'],
  ['F','J','S','Y','W','G','H','K','Q','S'],
  ['L','P','O','W','Q','V','B','N','M','E'],
  ['N','O','M','I','N','E','E','X','F','T'],
  ['X','W','E','V','M','U','I','O','P','R'],
  ['A','S','D','F','G','H','J','K','L','Z'],
  ['C','V','B','N','M','Q','W','E','R','T'],
  ['Y','U','I','O','P','A','S','D','F','G'],
  ['H','J','K','L','Z','X','C','V','B','N'],
]

const WORD_PATHS = {
  term1: [[1,0],[1,1],[1,2],[1,3],[1,4]],
  term2: [[4,0],[4,1],[4,2],[4,3],[4,4],[4,5],[4,6]],
  term3: [[0,9],[1,9],[2,9],[3,9],[4,9]],
}

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
  go_getter: {
    intro: "Ready to test your skills? Slide your finger or mouse across the grid to find these 3 hidden financial words:",
    subtitle: "Find the hidden words in the puzzle grid to unlock your custom financial insights below.",
    completionTitle: "Crossword Completed!",
    cta: "Loved this challenge? Can't wait for more alpha insights!",
  },
  caregiver: {
    intro: "The future feels more secure when you're prepared for it. Find the hidden terms and discover ideas that can help support your loved ones and their aspirations.",
    subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way.",
    completionTitle: "Challenge Completed!",
    cta: "Explore Ways to Support Your Family's Future",
  },
  protector: {
    intro: "Planning ahead is one of the best ways to protect what matters most. Find the hidden terms and learn concepts that can help strengthen your financial foundation.",
    subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way.",
    completionTitle: "Challenge Completed!",
    cta: "Strengthen Your Financial Protection Plan",
  },
  thinker: {
    intro: "The more you understand, the more confident your decisions become. Find the hidden terms and explore the concepts behind important financial planning decisions.",
    subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way.",
    completionTitle: "Challenge Completed!",
    cta: "Learn More About Financial Planning",
  },
  fallback: {
    intro: "Every great financial decision starts with understanding a few key terms. Find these 3 hidden words in the grid below, and unlock a short explanation for each one as you go.",
    subtitle: "Find the hidden financial terms in the puzzle and unlock useful insights along the way.",
    completionTitle: "Challenge Completed!",
    cta: "Explore Plans That Fit Your Goals",
  },
}

const PERSONA_MAP = {
  'Go-Getter': 'go_getter',
  'Protector':  'protector',
  'Caregiver':  'caregiver',
  'Thinker':    'thinker',
}

function resolvePersonaKey(persona) {
  return PERSONA_MAP[persona] ?? 'fallback'
}

function renderBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

async function markTokenUsed(shareToken) {
  if (!shareToken) return
  try {
    const { error } = await supabase
      .from('share_tokens')
      .update({ used: true })
      .eq('token', shareToken)
    if (error) console.error('share_token mark-used failed:', error)
  } catch (e) {
    console.error('share_token mark-used exception:', e)
  }
}

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
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, background: '#e8eef5', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#003366', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.65, color: '#334155', marginBottom: 16 }}>
          {pc.intro}
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.values(WORD_LABELS).map(word => (
            <div
              key={word}
              style={{ background: '#003366', color: 'white', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em' }}
            >
              {word}
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{ width: '100%', padding: '13px 0', background: '#005BAC', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          Got it →
        </button>
      </div>
    </div>
  )
}

const GRID_GAP = 4

const CELL_STYLES = {
  found:     { background: '#2E7D32', color: 'white',   borderColor: '#2E7D32' },
  selecting: { background: '#005BAC', color: 'white',   borderColor: '#005BAC' },
  default:   { background: 'white',   color: '#003366', borderColor: '#cdd8e8' },
}

export default function WordHuntDemo({
  onShare, onStep,
  isCustomerView = false,
  persona,
  shareToken,
}) {
  const [selectedCells,   setSelectedCells]   = useState([])
  const [discoveredWords, setDiscoveredWords] = useState(new Set())
  const [discoveredCells, setDiscoveredCells] = useState({})
  const [showIntro,       setShowIntro]       = useState(false)
  const [cellSize,        setCellSize]        = useState(32)
  const [revealOrder,     setRevealOrder]     = useState([])

  const isSelectingRef     = useRef(false)
  const selectedCellsRef   = useRef([])
  const discoveredWordsRef = useRef(new Set())
  const markedUsedRef      = useRef(false)
  const outerRef           = useRef(null)
  const gridRef            = useRef(null)
  const finalizeRef        = useRef(null)

  const pc       = PERSONA_CONTENT[resolvePersonaKey(persona)]
  const allFound = discoveredWords.size === 3

  useEffect(() => {
    if (!isCustomerView) return
    const t = setTimeout(() => setShowIntro(true), 300)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onStep?.({ step: 'viewed', timestamp: new Date().toISOString() })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!allFound || !isCustomerView || !shareToken || markedUsedRef.current) return
    markedUsedRef.current = true
    markTokenUsed(shareToken)
    onStep?.({ step: 'completed', timestamp: new Date().toISOString() })
  }, [allFound]) // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamic cell sizing: measure outer container width
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    function measure(target) {
      const w = target.clientWidth
      if (!w) return
      setCellSize(Math.max(24, Math.min(Math.floor((w - 9 * GRID_GAP) / 10), 48)))
    }
    const ro = new ResizeObserver(entries => { for (const e of entries) measure(e.target) })
    ro.observe(el)
    requestAnimationFrame(() => measure(el))
    return () => ro.disconnect()
  }, [])

  // Global pointerup safety net in case pointer leaves window
  useEffect(() => {
    const onUp = () => { if (isSelectingRef.current) finalizeRef.current?.() }
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [])

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
      setRevealOrder(ro => [...ro, found])
      onStep?.({ step: 'found', word: WORD_LABELS[found], timestamp: new Date().toISOString() })
    }
    selectedCellsRef.current = []
    setSelectedCells([])
  }

  finalizeRef.current = finalizeSelect

  function handleGridPointerDown(e) {
    e.preventDefault()
    const cell = getCellFromEvent(e)
    if (!cell) return
    isSelectingRef.current = true
    selectedCellsRef.current = [cell]
    setSelectedCells([cell])
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch (_) {}
  }

  function handleGridPointerMove(e) {
    if (!isSelectingRef.current) return
    const cell = getCellFromEvent(e)
    if (!cell) return
    const [r, c] = cell
    if (selectedCellsRef.current.some(([pr, pc]) => pr === r && pc === c)) return
    selectedCellsRef.current = [...selectedCellsRef.current, cell]
    setSelectedCells([...selectedCellsRef.current])
  }

  function getCellVisual(r, c) {
    if (discoveredCells[`${r}-${c}`]) return 'found'
    if (selectedCells.some(([sr, sc]) => sr === r && sc === c)) return 'selecting'
    return 'default'
  }

  return (
    <>
      {showIntro && <IntroModal persona={persona} onClose={() => setShowIntro(false)} />}

      <div style={{ background: '#F5F8FC', paddingBottom: 32 }}>

        {/* Subtitle */}
        <div style={{ padding: '14px 16px 6px' }}>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.55, margin: 0 }}>
            {pc.subtitle}
          </p>
        </div>

        {/* Progress counter */}
        <div style={{ padding: '0 16px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#003366' }}>
            {discoveredWords.size} / 3 Words Found
          </span>
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              style={{ width: 8, height: 8, borderRadius: '50%', background: i < discoveredWords.size ? '#2E7D32' : '#cdd8e8' }}
            />
          ))}
        </div>

        {/* Grid */}
        <div ref={outerRef} style={{ padding: '0 16px' }}>
          <div
            ref={gridRef}
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(10, ${cellSize}px)`,
              gap: `${GRID_GAP}px`,
              touchAction: allFound ? 'auto' : 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              cursor: allFound ? 'default' : 'crosshair',
            }}
            onPointerDown={handleGridPointerDown}
            onPointerMove={handleGridPointerMove}
            onPointerUp={finalizeSelect}
            onPointerCancel={finalizeSelect}
          >
            {gridData.map((row, r) =>
              row.map((letter, c) => {
                const cs = CELL_STYLES[getCellVisual(r, c)]
                return (
                  <div
                    key={`${r}-${c}`}
                    data-row={r}
                    data-col={c}
                    style={{
                      width: cellSize, height: cellSize,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: Math.max(10, Math.round(cellSize * 0.38)),
                      borderRadius: 4,
                      border: `1.5px solid ${cs.borderColor}`,
                      background: cs.background,
                      color: cs.color,
                      transition: 'background 0.12s, border-color 0.12s',
                    }}
                  >
                    {letter}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Word target chips */}
        <div style={{ padding: '10px 16px 2px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(WORD_LABELS).map(([key, word]) => {
            const found = discoveredWords.has(key)
            return (
              <div
                key={key}
                style={{
                  padding: '5px 13px', borderRadius: 20,
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                  background: found ? '#2E7D32' : '#003366',
                  color: 'white',
                  textDecoration: found ? 'line-through' : 'none',
                  opacity: found ? 0.8 : 1,
                  display: 'flex', alignItems: 'center', gap: 4,
                  transition: 'background 0.2s',
                }}
              >
                {found && '✓ '}{word}
              </div>
            )
          })}
        </div>

        {/* Explanation cards — revealed in order found */}
        {revealOrder.map(termKey => {
          const exp = EXPLANATIONS[termKey]
          return (
            <div
              key={termKey}
              style={{ margin: '12px 16px 0', background: 'white', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,51,102,0.06)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2E7D32', flexShrink: 0 }} />
                <p style={{ fontWeight: 700, fontSize: 12, color: '#2E7D32', letterSpacing: '0.08em', margin: 0, textTransform: 'uppercase' }}>
                  {exp.title}
                </p>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: '#334155', margin: '0 0 10px' }}>
                {renderBold(exp.body)}
              </p>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.55, margin: 0, borderTop: '1px solid #f0f4f8', paddingTop: 10, fontStyle: 'italic' }}>
                {exp.cta}
              </p>
            </div>
          )
        })}

        {/* Completion card */}
        {allFound && (
          <div style={{ margin: '12px 16px 0', background: '#003366', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
            <span style={{ fontSize: 36 }}>🎉</span>
            <h2 style={{ color: 'white', fontWeight: 700, fontSize: 18, margin: '8px 0 8px', lineHeight: 1.3 }}>
              {pc.completionTitle}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, margin: '0 0 16px', lineHeight: 1.55 }}>
              You've found all 3 hidden words and unlocked important insights about your policy.
            </p>
            {isCustomerView && (
              <button
                onClick={onShare}
                style={{ width: '100%', padding: '13px 0', background: '#e8a020', border: 'none', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                {pc.cta}
              </button>
            )}
          </div>
        )}

        {/* RPM preview: share CTA */}
        {!isCustomerView && (
          <div style={{ padding: '16px 16px 0' }}>
            <button
              onClick={onShare}
              style={{ width: '100%', padding: '14px 0', background: '#003366', border: 'none', borderRadius: 12, color: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Share with a customer →
            </button>
          </div>
        )}

      </div>
    </>
  )
}
