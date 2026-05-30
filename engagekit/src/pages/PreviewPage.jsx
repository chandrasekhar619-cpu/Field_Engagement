import { useParams, Navigate } from 'react-router-dom'
import { contentItems } from '../data/mockData'
import QuizDemo           from '../components/demos/QuizDemo'
import FIRECalculatorDemo from '../components/demos/FIRECalculatorDemo'
import ProtectionGapDemo  from '../components/demos/ProtectionGapDemo'
import PollDemo           from '../components/demos/PollDemo'
import MoodDemo           from '../components/demos/MoodDemo'
import LifeWordDemo       from '../components/demos/LifeWordDemo'

const DEMOS = {
  'quiz':             QuizDemo,
  'fire-calculator':  FIRECalculatorDemo,
  'protection-gap':   ProtectionGapDemo,
  'poll':             PollDemo,
  'mood':             MoodDemo,
  'life-word':        LifeWordDemo,
}

export default function PreviewPage() {
  const { contentId } = useParams()
  const item = contentItems.find(c => c.id === contentId)

  // Creatives are shown in a modal in the main app, not in a preview tab
  if (!item || item.demoType === 'creative' || !DEMOS[item.demoType]) {
    return <Navigate to="/" replace />
  }

  const Demo = DEMOS[item.demoType]

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      {/* Demo-mode banner */}
      <div className="sticky top-0 z-50 bg-[#0f1f3d] flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e8a020] animate-pulse" />
          <span className="text-white/70 text-xs">Viewing as customer</span>
        </div>
        <button
          onClick={() => window.close()}
          className="text-[#e8a020] text-xs font-semibold hover:text-amber-300 transition-colors"
        >
          Close preview ✕
        </button>
      </div>

      <Demo item={item} onShare={() => window.close()} />
    </div>
  )
}
