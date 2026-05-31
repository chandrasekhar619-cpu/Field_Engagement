import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import ShareFlow from '../components/ShareFlow'
import { contentItems } from '../data/mockData'
import { toISTDate } from '../lib/formatDate'

const PERSONA_GUIDANCE = {
  'Go-Getter': {
    dos:   ['Lead with growth stories and strong returns', 'Match their energy — be decisive and direct', 'Highlight flexibility to act fast'],
    donts: ['Overload with paperwork upfront', 'Slow them down with excessive caution'],
  },
  'Protector': {
    dos:   ['Emphasise guaranteed returns and capital safety', 'Show track record and stability data', 'Reference ratings and regulatory backing'],
    donts: ['Push market-linked or high-risk products', 'Downplay risks to close faster'],
  },
  'Caregiver': {
    dos:   ['Focus on family protection, term, and critical illness', 'Frame everything around loved ones\' security', 'Be warm and empathetic in tone'],
    donts: ['Lead with personal wealth accumulation', 'Use cold or transactional language'],
  },
  'Thinker': {
    dos:   ['Bring detailed comparisons, data sheets, and fine print', 'Give them time to research and decide', 'Match their analytical depth'],
    donts: ['Rush towards a close or skip details', 'Use emotional appeals without data'],
  },
}

const categoryStyle = {
  Quiz:       'bg-blue-50 text-blue-600',
  Calculator: 'bg-emerald-50 text-emerald-600',
  Game:       'bg-purple-50 text-purple-600',
  Mood:       'bg-pink-50 text-pink-600',
  Festive:    'bg-amber-50 text-amber-700',
  Occasion:   'bg-teal-50 text-teal-600',
}

const policyTypeBadge = {
  'Par':     'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Non-Par': 'bg-purple-50 text-purple-700 border-purple-100',
  'Term':    'bg-blue-50 text-blue-700 border-blue-100',
  'Annuity': 'bg-amber-50 text-amber-700 border-amber-100',
}

const avatarBg = ['bg-[#0f1f3d]', 'bg-indigo-700', 'bg-emerald-700', 'bg-rose-700', 'bg-violet-700']

const actionIcon  = { opened: '🔗', completed: '✅' }
const actionLabel = { opened: 'Link opened', completed: 'Completed' }

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function normalize(row) {
  return {
    ...row,
    policyNumber: row.policy_number,
    issueDate:    row.issue_date,
    policyType:   row.policy_type,
  }
}


export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, authLoading } = useAuth()

  const [shareItem,       setShareItem]       = useState(null)
  const [customer,        setCustomer]        = useState(null)
  const [interactions,    setInteractions]    = useState([])
  const [dataLoading,     setDataLoading]     = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false

    Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase
        .from('interactions')
        .select('*, links(content_id, content_type, rpm_name)')
        .eq('customer_id', id)
        .order('created_at', { ascending: false }),
    ]).then(([{ data: cust }, { data: ixns }]) => {
      if (cancelled) return
      setCustomer(cust ? normalize(cust) : null)
      setInteractions(ixns || [])
      setDataLoading(false)
    })

    return () => { cancelled = true }
  }, [id])

  if (authLoading || dataLoading) return (
    <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />

  if (!customer) {
    return (
      <div className="min-h-screen bg-[#f4f5f9]">
        <Navbar activeView="customers" />
        <div className="pt-[60px] flex flex-col items-center justify-center min-h-[60vh] text-gray-400">
          <span className="text-5xl mb-3">🔍</span>
          <p>Customer not found.</p>
          <button
            onClick={() => navigate('/app/customers')}
            className="mt-4 text-[#0f1f3d] text-sm font-medium underline underline-offset-2"
          >
            Back to customers
          </button>
        </div>
      </div>
    )
  }

  const bg         = avatarBg[customer.name?.charCodeAt(0) % avatarBg.length]
  const badgeClass = policyTypeBadge[customer.policyType] || 'bg-gray-100 text-gray-600 border-gray-200'

  return (
    <div className="min-h-screen bg-[#f4f5f9]">
      <Navbar activeView="customers" />

      <div className="pt-[60px]">
        {/* Back bar */}
        <div className="bg-white border-b border-[#e4e7f0] px-4 md:px-6">
          <button
            onClick={() => navigate('/app/customers')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0f1f3d] transition-colors py-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            All Customers
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">

          {/* Profile card */}
          <div className="bg-white rounded-xl border border-[#e4e7f0] p-6">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-bold text-xl">{initials(customer.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-[#0f1f3d]">{customer.name}</h2>
                <p className="text-gray-400 text-sm mt-0.5">{customer.policyNumber}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs px-2.5 py-1 rounded-lg font-medium border ${badgeClass}`}>
                    {customer.policyType || '—'}
                  </span>
                  {customer.persona ? (
                    <span className="text-xs px-2.5 py-1 bg-[#e8a020]/10 text-[#e8a020] font-semibold rounded-lg border border-[#e8a020]/25">
                      {customer.persona}
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-400 rounded-lg">
                      No quiz yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Persona guidance */}
          {customer.persona && PERSONA_GUIDANCE[customer.persona] && (() => {
            const g = PERSONA_GUIDANCE[customer.persona]
            return (
              <div className="bg-white rounded-xl border border-[#e4e7f0] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-[#0f1f3d]">Engagement Guidance</h3>
                  <span className="text-xs px-2 py-0.5 bg-[#e8a020]/10 text-[#e8a020] font-semibold rounded-full border border-[#e8a020]/25">
                    {customer.persona}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">Do</p>
                    <ul className="flex flex-col gap-1.5">
                      {g.dos.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                          <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Don't</p>
                    <ul className="flex flex-col gap-1.5">
                      {g.donts.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 leading-relaxed">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Policy details */}
          <div className="bg-white rounded-xl border border-[#e4e7f0] p-5">
            <h3 className="text-sm font-semibold text-[#0f1f3d] mb-4">Policy Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Policy Number</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.policyNumber || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Issue Date</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.issueDate || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Policy Type</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.policyType || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Persona</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.persona || '—'}</p>
              </div>
            </div>
          </div>

          {/* Interaction history */}
          <div className="bg-white rounded-xl border border-[#e4e7f0] p-5">
            <h3 className="text-sm font-semibold text-[#0f1f3d] mb-4">
              Engagement History
              {interactions.length > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">({interactions.length})</span>
              )}
            </h3>

            {interactions.length > 0 ? (
              <div className="flex flex-col gap-4">
                {interactions.map(ix => {
                  const link         = ix.links
                  const contentItem  = contentItems.find(c => c.id === link?.content_id)
                  const contentTitle = contentItem?.title || link?.content_type || 'Engagement'
                  const icon         = actionIcon[ix.action]  || '👁️'
                  const label        = actionLabel[ix.action] || ix.action
                  const detail       = ix.outcome
                    ? `${contentTitle} — ${ix.outcome}`
                    : contentTitle

                  return (
                    <div key={ix.id} className="flex gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0f1f3d]">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{detail}</p>
                      </div>
                      <span className="text-xs text-gray-300 flex-shrink-0 mt-0.5">
                        {toISTDate(ix.created_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-gray-400">
                <span className="text-3xl mb-2">📭</span>
                <p className="text-sm">No interactions yet.</p>
                <p className="text-xs mt-1">Share a content piece to get started.</p>
              </div>
            )}
          </div>

          {/* Share content section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#0f1f3d]">
                Share with {customer.name?.split(' ')[0]}
              </h3>
              <button
                onClick={() => navigate(`/app?customerId=${customer.id}`)}
                className="text-[#0f1f3d] text-xs font-medium underline underline-offset-2"
              >
                See all →
              </button>
            </div>

            {contentItems.slice(0, 4).map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#e4e7f0] p-4 flex items-start gap-3"
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[#0f1f3d] font-semibold text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed mt-0.5 line-clamp-2">{item.description}</p>
                  <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded mt-1.5 ${categoryStyle[item.category] || 'bg-gray-100 text-gray-500'}`}>
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => setShareItem(item)}
                  className="flex-shrink-0 bg-[#e8a020] hover:bg-amber-400 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors mt-0.5"
                >
                  Share →
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>

      {shareItem && (
        <ShareFlow
          item={shareItem}
          preselectedCustomer={customer}
          onClose={() => setShareItem(null)}
        />
      )}
    </div>
  )
}
