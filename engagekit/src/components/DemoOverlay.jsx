import { useEffect } from 'react'
import QuizDemo           from './demos/QuizDemo'
import FIRECalculatorDemo from './demos/FIRECalculatorDemo'
import ProtectionGapDemo  from './demos/ProtectionGapDemo'
import PollDemo           from './demos/PollDemo'
import MoodDemo           from './demos/MoodDemo'
import CreativesDemo      from './demos/CreativesDemo'
import LifeWordDemo       from './demos/LifeWordDemo'

const DEMOS = {
  'quiz':             QuizDemo,
  'fire-calculator':  FIRECalculatorDemo,
  'protection-gap':   ProtectionGapDemo,
  'poll':             PollDemo,
  'mood':             MoodDemo,
  'creative':         CreativesDemo,
  'life-word':        LifeWordDemo,
}

export default function DemoOverlay({ item, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const Demo = DEMOS[item.demoType]

  return (
    <div className="fixed inset-0 z-[100] bg-[#f9fafb] overflow-y-auto">
      {/* Floating back button */}
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-[110] flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-[#e4e7f0] shadow-md rounded-full px-3.5 py-2 text-sm font-medium text-[#0f1f3d] hover:shadow-lg transition-shadow"
      >
        ← Back
      </button>

      {Demo
        ? <Demo item={item} onShare={onClose} />
        : (
          <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
            <span className="text-5xl mb-3">🔧</span>
            <p>Demo coming soon.</p>
          </div>
        )
      }
    </div>
  )
}
