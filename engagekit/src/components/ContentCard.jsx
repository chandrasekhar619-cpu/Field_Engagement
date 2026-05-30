const categoryStyle = {
  Quiz:       { emoji: 'bg-blue-50',    tag: 'bg-blue-50 text-blue-600' },
  Calculator: { emoji: 'bg-emerald-50', tag: 'bg-emerald-50 text-emerald-600' },
  Game:       { emoji: 'bg-purple-50',  tag: 'bg-purple-50 text-purple-600' },
  Poll:       { emoji: 'bg-orange-50',  tag: 'bg-orange-50 text-orange-600' },
  Mood:       { emoji: 'bg-pink-50',    tag: 'bg-pink-50 text-pink-600' },
  Festive:    { emoji: 'bg-amber-50',   tag: 'bg-amber-50 text-amber-700' },
  Occasion:   { emoji: 'bg-teal-50',    tag: 'bg-teal-50 text-teal-600' },
}

const fallback = { emoji: 'bg-gray-50', tag: 'bg-gray-50 text-gray-600' }

export default function ContentCard({ item, onTryIt, onShare }) {
  const style = categoryStyle[item.category] || fallback

  return (
    <div className="bg-white rounded-xl border border-[#e4e7f0] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">

      <div className={`${style.emoji} rounded-t-xl flex items-center justify-center py-6 text-4xl select-none`}>
        {item.emoji}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className={`self-start text-[11px] font-semibold px-2 py-0.5 rounded-md ${style.tag}`}>
          {item.category}
        </span>

        <h3 className="font-semibold text-[#0f1f3d] text-sm leading-snug">{item.title}</h3>

        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-1 pt-1">
          {item.personas.length === 0 ? (
            <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">For all</span>
          ) : (
            item.personas.slice(0, 2).map(p => (
              <span key={p} className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{p}</span>
            ))
          )}
        </div>
      </div>

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
    </div>
  )
}
