import { useState } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ShareFlow from '../components/ShareFlow'
import { customers, contentItems } from '../data/mockData'

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

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

const mockTimeline = [
  { action: 'Link opened', detail: 'Retirement Planner shared via WhatsApp', time: '2 days ago', icon: '🔗' },
  { action: 'Content viewed', detail: 'Spent 4 min on Retirement Planner', time: '2 days ago', icon: '👁️' },
  { action: 'Quiz completed', detail: 'Life Goals Quiz — scored "Security-first"', time: '1 week ago', icon: '✅' },
  { action: 'Link opened', detail: 'Tax Saver Planner shared via SMS', time: '2 weeks ago', icon: '🔗' },
]

export default function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [shareItem, setShareItem] = useState(null)

  if (!user) return <Navigate to="/" replace />

  const customer = customers.find(c => c.id === id)

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

  const bg = avatarBg[customer.name.charCodeAt(0) % avatarBg.length]
  const badgeClass = policyTypeBadge[customer.policyType] || 'bg-gray-100 text-gray-600 border-gray-200'
  const hasInteractions = customer.lastInteraction !== null

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
                    {customer.policyType}
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

          {/* Policy details */}
          <div className="bg-white rounded-xl border border-[#e4e7f0] p-5">
            <h3 className="text-sm font-semibold text-[#0f1f3d] mb-4">Policy Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Policy Number</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.policyNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Issue Date</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.issueDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Policy Type</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.policyType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Persona</p>
                <p className="text-sm font-medium text-[#0f1f3d]">{customer.persona || '—'}</p>
              </div>
            </div>
          </div>

          {/* Engagement summary */}
          <div className="bg-white rounded-xl border border-[#e4e7f0] p-5">
            <h3 className="text-sm font-semibold text-[#0f1f3d] mb-4">Engagement</h3>
            {hasInteractions ? (
              <div className="flex flex-col gap-4">
                {mockTimeline.map((event, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">{event.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0f1f3d]">{event.action}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{event.detail}</p>
                    </div>
                    <span className="text-xs text-gray-300 flex-shrink-0">{event.time}</span>
                  </div>
                ))}
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
                Share with {customer.name.split(' ')[0]}
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
