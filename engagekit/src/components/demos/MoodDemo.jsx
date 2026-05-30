import { useState } from 'react'
import FeedbackSection from '../FeedbackSection'
import { logOutcome } from '../../lib/logOutcome'

const MOODS = [
  { emoji: '😊', label: 'Optimistic',  response: "That energy is contagious. The best time to plan is when you feel good about the future — let's lock in something that makes it permanent." },
  { emoji: '💪', label: 'Motivated',   response: "Channel that drive into something real. A motivated mindset is the best starting point for a plan that actually sticks." },
  { emoji: '😐', label: 'Just okay',   response: "Some days are steady, and that's completely fine. Good financial habits don't need peak energy — just consistency." },
  { emoji: '😟', label: 'Anxious',     response: "Feeling uncertain about money is more common than you think. The best antidote is a clear plan — even a small one. Let's talk." },
  { emoji: '😴', label: 'Overwhelmed', response: "Take a breath. Financial planning can feel like a lot, but it doesn't have to be. One decision at a time makes it manageable." },
  { emoji: '🎯', label: 'Focused',     response: "You're in the zone. Let's use that clarity to make one meaningful financial decision today — the kind you'll thank yourself for later." },
]

export default function MoodDemo({ onShare, onStep, isCustomerView = false, linkId }) {
  const [selected, setSelected] = useState(null)

  function pick(i) {
    if (selected !== null) return
    setSelected(i)
    onStep?.({ step: 'selected', mood: MOODS[i].label, timestamp: new Date().toISOString() })
    if (isCustomerView && linkId) logOutcome(linkId, MOODS[i].label)
  }

  return (
    <div className="flex flex-col">
      <div className="bg-[#0f1f3d] px-5 pt-5 pb-4 flex items-center gap-3">
        <span className="text-3xl">😊</span>
        <div>
          <h2 className="text-white font-bold text-base">Financial Wellness Check</h2>
          <p className="text-white/50 text-xs">How are you feeling about your finances today?</p>
        </div>
      </div>

      <div className="max-w-md mx-auto w-full px-5 py-5">
        {selected === null ? (
          /* Grid of mood tiles */
          <div className="grid grid-cols-2 gap-3">
            {MOODS.map((mood, i) => (
              <button
                key={i}
                onClick={() => pick(i)}
                className="flex flex-col items-center gap-2 py-5 rounded-2xl border-2 bg-white border-[#e4e7f0] hover:border-[#0f1f3d]/30 active:scale-[0.97] transition-all"
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-[#0f1f3d] text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
        ) : (
          /* Selected tile + response */
          <div className="anim-slide-up flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-[#0f1f3d] rounded-2xl px-5 py-4">
              <span className="text-4xl">{MOODS[selected].emoji}</span>
              <div>
                <p className="text-white/50 text-xs">You selected</p>
                <p className="text-white font-semibold text-base">{MOODS[selected].label}</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-amber-900 text-sm leading-relaxed">{MOODS[selected].response}</p>
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
