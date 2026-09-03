import { useParams, Navigate, useSearchParams } from 'react-router-dom'
import { contentItems } from '../data/mockData'
import { useAuth } from '../context/AuthContext'
import QuizDemo           from '../components/demos/QuizDemo'
import FIRECalculatorDemo from '../components/demos/FIRECalculatorDemo'
import ProtectionGapDemo  from '../components/demos/ProtectionGapDemo'
import PollDemo           from '../components/demos/PollDemo'
import MoodDemo           from '../components/demos/MoodDemo'
import LifeWordDemo       from '../components/demos/LifeWordDemo'
import WordHuntDemo       from '../components/demos/WordHuntDemo'
import FinancialPlaybookKids from '../components/FinancialPlaybookKids'

const DEMOS = {
  'quiz':             QuizDemo,
  'fire-calculator':  FIRECalculatorDemo,
  'protection-gap':   ProtectionGapDemo,
  'poll':             PollDemo,
  'mood':             MoodDemo,
  'life-word':        LifeWordDemo,
  'word-hunt':        WordHuntDemo,
  'financial-playbook-kids': FinancialPlaybookKids,
}

function Disclaimer() {
  return (
    <div className="border-t border-[#e4e7f0] bg-white px-6 py-4 flex-shrink-0">
      <p className="text-gray-400 text-[11px] leading-relaxed text-center">
        This communication is for awareness purposes only and does not constitute a solicitation or offer of any insurance product.
      </p>
    </div>
  )
}

// Rendered in a new tab for TRIAL-only cards — shows realistic customer view
function TrialPreview({ item, variant }) {
  const { user } = useAuth()
  const rpmName = user?.name || 'Your Advisor'
  const trialSrc = item.id === 'bonus-announcement'
    ? `/bonus-announcement/${encodeURIComponent(variant === 'rpu' ? 'bonus-announcement reduced-paid-up.html' : 'bonus-announcement premium-paying.html')}?v=v4-20260729`
    : item.previewSrc

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f9fafb' }}>
      {/* Trial preview banner */}
      <div className="sticky top-0 z-50 bg-[#0f1f3d] flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e8a020] animate-pulse" />
          <span className="text-white/70 text-xs">Trial preview — not yet shareable</span>
        </div>
        <button
          onClick={() => window.close()}
          className="text-[#e8a020] text-xs font-semibold hover:text-amber-300 transition-colors"
        >
          Close ✕
        </button>
      </div>

      {/* Customer header — realistic simulation with fixed sample name */}
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 flex-shrink-0">
        <h1 className="text-white text-2xl font-bold leading-snug">Hi Aadhya! 👋</h1>
        <p className="text-white/50 text-xs mt-1">
          Sent by {rpmName}
        </p>
      </div>

      {/* Iframe filling all remaining space */}
      <iframe
        src={trialSrc}
        title={item.title}
        style={{ flex: 1, width: '100%', border: 'none', display: 'block', overflow: 'auto' }}
      />

      <Disclaimer />
    </div>
  )
}

export default function PreviewPage() {
  const { contentId } = useParams()
  const [searchParams] = useSearchParams()
  const variant = searchParams.get('variant') === 'rpu' ? 'rpu' : 'premium'
  const item = contentItems.find(c => c.id === contentId)

  // Bonus announcement uses static HTML preview with selectable variant.
  if (item?.id === 'bonus-announcement') {
    return <TrialPreview item={item} variant={variant} />
  }

  // Trial-only cards get the customer-simulation preview
  if (item?.demoType === 'trial') {
    return <TrialPreview item={item} variant={variant} />
  }

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
