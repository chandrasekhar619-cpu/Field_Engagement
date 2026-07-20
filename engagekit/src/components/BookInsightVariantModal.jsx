export default function BookInsightVariantModal({ items, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10">
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#e4e7f0]">
          <div>
            <h3 className="text-[#0f1f3d] font-bold text-base">Choose a variant</h3>
            <p className="text-gray-400 text-xs mt-0.5">Same share flow and WhatsApp text</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="p-4 space-y-3">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="w-full text-left bg-white rounded-xl border border-[#e4e7f0] hover:border-[#0f1f3d]/30 hover:shadow-sm transition-all p-4 flex items-start gap-3"
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[#0f1f3d] font-semibold text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs leading-relaxed mt-0.5">{item.description}</p>
              </div>
              <span className="text-xs font-semibold text-[#e8a020] flex-shrink-0 mt-0.5">Select</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}