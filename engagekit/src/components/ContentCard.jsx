const categoryStyle = {
  Quiz:             { emoji: 'bg-blue-50',    tag: 'bg-blue-50 text-blue-600' },
  Calculator:       { emoji: 'bg-emerald-50', tag: 'bg-emerald-50 text-emerald-600' },
  Game:             { emoji: 'bg-purple-50',  tag: 'bg-purple-50 text-purple-600' },
  Poll:             { emoji: 'bg-orange-50',  tag: 'bg-orange-50 text-orange-600' },
  Mood:             { emoji: 'bg-pink-50',    tag: 'bg-pink-50 text-pink-600' },
  Festive:          { emoji: 'bg-amber-50',   tag: 'bg-amber-50 text-amber-700' },
  Occasion:         { emoji: 'bg-teal-50',    tag: 'bg-teal-50 text-teal-600' },
  'Interactive Game': { emoji: 'bg-violet-50', tag: 'bg-violet-50 text-violet-600' },
  Read:             { emoji: 'bg-indigo-50',  tag: 'bg-indigo-50 text-indigo-600' },
  Reminder:         { emoji: 'bg-rose-50',    tag: 'bg-rose-50 text-rose-600' },
}

const fallback = { emoji: 'bg-gray-50', tag: 'bg-gray-50 text-gray-600' }

export default function ContentCard({ item, onTryIt, onShare }) {
  const style = categoryStyle[item.category] || fallback

  return (
    <div className="bg-white rounded-xl border border-[#e4e7f0] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">

      {/* Emoji area — TRIAL badge overlaid top-right */}
      <div className="relative">
        <div className={`${style.emoji} rounded-t-xl flex items-center justify-center py-6 text-4xl select-none`}>
          {item.emoji}
        </div>
        {item.trialOnly && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#e8a020] text-[#e8a020] bg-white leading-none">
            TRIAL
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.tag}`}>
          {item.category}
        </span>

        <h3 className="font-semibold text-[#0f1f3d] text-sm leading-snug">{item.title}</h3>

        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
          {item.description}
        </p>
      </div>

      {item.trialOnly ? (
        /* Trial-only: single full-width "Try it now" button, no Share */
        <div className="border-t border-[#e4e7f0]">
          <button
            onClick={() => onTryIt(item)}
            className="w-full py-2.5 text-xs font-semibold text-[#e8a020] hover:bg-amber-50 transition-colors rounded-b-xl active:bg-amber-100"
          >
            Try it now →
          </button>
        </div>
      ) : item.renewalOnly ? (
        /* Renewal-only: Try it disabled, Share enabled */
        <div className="border-t border-[#e4e7f0] flex">
          <button
            disabled
            title="Select a customer to preview"
            className="flex-1 py-2.5 text-xs font-semibold text-gray-300 cursor-not-allowed rounded-bl-xl"
          >
            Try it
          </button>
          <div className="w-px bg-[#e4e7f0]" />
          <button
            onClick={() => onShare(item)}
            className="flex-1 py-2.5 text-xs font-semibold text-[#e8a020] hover:bg-amber-50 transition-colors rounded-br-xl active:bg-amber-100"
          >
            Share
          </button>
        </div>
      ) : (
        /* Standard: Try it + Share */
        <div className="border-t border-[#e4e7f0] flex">
          <button
            onClick={() => onTryIt(item)}
            className="flex-1 py-2.5 text-xs font-semibold text-[#0f1f3d] hover:bg-gray-50 transition-colors rounded-bl-xl active:bg-gray-100"
          >
            Try it
          </button>
          <div className="w-px bg-[#e4e7f0]" />
          <button
            onClick={() => onShare(item)}
            className="flex-1 py-2.5 text-xs font-semibold text-[#e8a020] hover:bg-amber-50 transition-colors rounded-br-xl active:bg-amber-100"
          >
            Share
          </button>
        </div>
      )}
    </div>
  )
}
