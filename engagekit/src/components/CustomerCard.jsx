import { useNavigate } from 'react-router-dom'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const RENEWAL_ACTIVITY_MAP = {
  'M-10': ['Central Trigger into MSG', 'How do you think about money quiz'],
  'M-9':  ['Demystifying money', 'Word hunt'],
  'M-8':  ['ULIP/Payout Game', 'Demystifying money 2'],
  'M-7':  ['Financial Playbook for Kids', 'Demystifying money 3'],
  'M-6':  ['The Money word', 'Quizzes'],
  'M-5':  ['Demystifying money 4', 'Calculator'],
  'M-4':  ['Policy Snapshot', 'Word Hunt 2'],
  'M-3':  ['Demystifying money 5', 'Product and Org Knowledge'],
  'M-2':  ['Check-in Call', 'Renewal nominee'],
  'M-1':  ['Renewal Reminder Card m-30', '-'],
  M0:     ['Renewal final reminder', '-'],
}

function fmtDueDate(str) {
  if (!str) return null
  const [d, m, y] = str.split('-')
  const mi = parseInt(m, 10) - 1
  if (mi < 0 || mi > 11 || !y) return str
  return `Due: ${parseInt(d, 10)}-${MONTHS[mi]}-${y}`
}

function dueMonthIndex(str) {
  if (!str) return null
  const parts = str.split('-')
  if (parts.length < 2) return null

  const token = (parts[1] || '').trim()
  if (!token) return null

  if (/^\d+$/.test(token)) {
    const mi = parseInt(token, 10) - 1
    return mi >= 0 && mi <= 11 ? mi : null
  }

  const abbr = token.slice(0, 3).toLowerCase()
  const idx = MONTHS.findIndex(m => m.toLowerCase() === abbr)
  return idx >= 0 ? idx : null
}

function getMonthBucket(str) {
  const renewalMonth = dueMonthIndex(str)
  if (renewalMonth == null) return null

  const currentMonth = new Date().getMonth()
  let offset = currentMonth - renewalMonth
  if (offset > 0) offset -= 12
  return `M${offset}`
}

function getActivities(bucket) {
  if (!bucket) return ['-', '-']
  return RENEWAL_ACTIVITY_MAP[bucket] || ['-', '-']
}

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
  const monthBucket = getMonthBucket(customer.premium_due_date)
  const [activity1, activity2] = getActivities(monthBucket)

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

        <p className="text-gray-400 text-xs mt-0.5">{customer.policyNumber}</p>
        {customer.productName && (
          <p className="text-gray-500 text-xs mt-0.5">{customer.productName}</p>
        )}
        {fmtDueDate(customer.premium_due_date) && (
          <p className="text-gray-400 text-xs mb-1.5">{fmtDueDate(customer.premium_due_date)}</p>
        )}
        {!customer.premium_due_date && <div className="mb-2" />}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2.5">
          <div className="rounded-lg border border-[#cfd8ea] bg-[#eef3ff] px-2.5 py-2 shadow-[0_1px_0_rgba(15,31,61,0.06)]">
            <p className="text-[10px] uppercase tracking-wide text-[#4d5f86] font-semibold">Month</p>
            <p className="text-xs font-bold text-[#0f1f3d] mt-0.5">{monthBucket || '-'}</p>
          </div>
          <div className="rounded-lg border border-[#bcd2ff] bg-[#eaf2ff] px-2.5 py-2 shadow-[0_1px_0_rgba(24,62,120,0.08)]">
            <p className="text-[10px] uppercase tracking-wide text-[#36578c] font-semibold">Activity 1</p>
            <p className="text-xs font-semibold text-[#1f3d70] mt-0.5 leading-[1.15rem]">{activity1}</p>
          </div>
          <div className="rounded-lg border border-[#bfe6dc] bg-[#eaf8f3] px-2.5 py-2 shadow-[0_1px_0_rgba(24,88,74,0.08)]">
            <p className="text-[10px] uppercase tracking-wide text-[#2e7666] font-semibold">Activity 2</p>
            <p className="text-xs font-semibold text-[#1f6a5a] mt-0.5 leading-[1.15rem]">{activity2}</p>
          </div>
        </div>

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
