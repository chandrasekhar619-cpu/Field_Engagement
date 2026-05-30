import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function FeedbackSection({ linkId, onDone }) {
  const [thumb,      setThumb]      = useState(null)   // 'up' | 'down'
  const [feedbackId, setFeedbackId] = useState(null)   // uuid of inserted row
  const [text,       setText]       = useState('')
  const [saving,     setSaving]     = useState(false)
  const [done,       setDone]       = useState(false)

  // Capture thumb immediately — non-blocking, logs error on failure
  async function pickThumb(t) {
    if (thumb !== null) return
    setThumb(t)
    if (linkId) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .insert({ link_id: linkId, thumb: t })
          .select('id')
          .single()
        if (error) throw error
        if (data?.id) setFeedbackId(data.id)
      } catch (err) {
        console.error('Feedback thumb save error:', err)
      }
    }
  }

  // Submit/Done — awaited so the button shows clear loading feedback
  async function handleDone() {
    setSaving(true)
    try {
      if (linkId && text.trim()) {
        if (feedbackId) {
          // Append comment to the existing thumb row
          const { error } = await supabase
            .from('feedback')
            .update({ comment: text.trim() })
            .eq('id', feedbackId)
          if (error) throw error
        } else {
          // Insert a fresh row (fallback if thumb INSERT failed earlier)
          const { error } = await supabase
            .from('feedback')
            .insert({ link_id: linkId, thumb, comment: text.trim() })
          if (error) throw error
        }
      }
    } catch (err) {
      console.error('Feedback submit error:', err)
      // Non-fatal — still mark as done so the user isn't stuck
    } finally {
      setSaving(false)
      setDone(true)
      onDone?.()
    }
  }

  if (done) {
    return (
      <div className="border-t border-[#e4e7f0] pt-4 mt-4 text-center">
        <p className="text-gray-400 text-sm">Thank you! Your feedback helps us make this better.</p>
      </div>
    )
  }

  return (
    <div className="border-t border-[#e4e7f0] pt-4 mt-4">
      <p className="text-[#0f1f3d] text-sm font-semibold mb-3">Did you enjoy this?</p>

      <div className="flex gap-3">
        {['up', 'down'].map(t => (
          <button
            key={t}
            type="button"
            onClick={() => pickThumb(t)}
            className={`flex-1 py-3 rounded-xl border-2 text-2xl transition-all active:scale-95 ${
              thumb === t
                ? t === 'up' ? 'bg-green-50 border-green-400' : 'bg-red-50 border-red-400'
                : thumb !== null
                  ? 'opacity-30 bg-white border-[#e4e7f0] cursor-default'
                  : 'bg-white border-[#e4e7f0] hover:border-gray-300'
            }`}
          >
            {t === 'up' ? '👍' : '👎'}
          </button>
        ))}
      </div>

      {thumb !== null && (
        <div className="anim-slide-up mt-3">
          <div className="flex items-center gap-1.5 text-green-600 text-xs mb-3">
            <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center font-bold text-[10px]">✓</span>
            <span className="font-medium">Got it, thank you!</span>
          </div>

          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Want to tell us more? (optional)"
            rows={2}
            className="w-full bg-gray-50 border border-[#e4e7f0] focus:border-[#0f1f3d]/30 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none transition-colors"
          />

          <button
            type="button"
            onClick={handleDone}
            disabled={saving}
            className="mt-2 w-full border border-[#e4e7f0] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? 'Saving…' : text.trim() ? 'Submit feedback' : 'Done'}
          </button>
        </div>
      )}
    </div>
  )
}
