import { useNavigate } from 'react-router-dom'

const policyTypeBadge = {
  'Par':     'bg-emerald-50 text-emerald-700',
  'Non-Par': 'bg-purple-50 text-purple-700',
  'Term':    'bg-blue-50 text-blue-700',
  'Annuity': 'bg-amber-50 text-amber-700',
}

const avatarBg = ['bg-[#0f1f3d]', 'bg-indigo-700', 'bg-emerald-700', 'bg-rose-700', 'bg-violet-700']

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export default function CustomerCard({ customer }) {
  const navigate = useNavigate()
  const bg = avatarBg[customer.name.charCodeAt(0) % avatarBg.length]
  const badgeClass = policyTypeBadge[customer.policyType] || 'bg-gray-100 text-gray-600'

  return (
    <button
      onClick={() => navigate(`/app/customer/${customer.id}`)}
      className="w-full bg-white rounded-xl border border-[#e4e7f0] p-4 flex items-center gap-4 text-left hover:border-[#0f1f3d]/30 hover:shadow-sm transition-all group"
    >
      {/* Avatar */}
      <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-semibold text-sm">{initials(customer.name)}</span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-[#0f1f3d] text-sm">{customer.name}</p>
          {customer.persona ? (
            <span className="flex-shrink-0 text-[11px] px-2 py-0.5 bg-[#e8a020]/10 text-[#e8a020] font-semibold rounded-full border border-[#e8a020]/25">
              {customer.persona}
            </span>
          ) : (
            <span className="flex-shrink-0 text-[11px] px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full">
              No quiz yet
            </span>
          )}
        </div>

        <p className="text-gray-400 text-xs mt-0.5 mb-2">{customer.policyNumber}</p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${badgeClass}`}>
            {customer.policyType}
          </span>
          {customer.hasInteractions ? (
            <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              Active
            </span>
          ) : (
            <span className="text-gray-300 text-xs">No interactions yet</span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg
        className="w-4 h-4 text-gray-300 group-hover:text-[#0f1f3d] transition-colors flex-shrink-0"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
      </svg>
    </button>
  )
}
