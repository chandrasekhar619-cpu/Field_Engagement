import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import CustomerCard from './CustomerCard'

function normalize(row) {
  return {
    ...row,
    policyNumber:        row.policy_number,
    issueDate:           row.issue_date,
    policyType:          row.policy_type,
    lastInteraction:     null,
    lastInteractionDate: null,
  }
}

export default function CustomerView() {
  const [customers, setCustomers] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [fetchErr,  setFetchErr]  = useState(null)
  const [search,    setSearch]    = useState('')

  useEffect(() => {
    supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data, error }) => {
        if (error) setFetchErr(error.message)
        else setCustomers((data || []).map(normalize))
        setLoading(false)
      })
  }, [])

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.policyNumber?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#0f1f3d]">Customers</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {loading ? 'Loading…' : `${customers.length} customers in your portfolio`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or policy number…"
          className="w-full bg-white border border-[#e4e7f0] rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-[#0f1f3d]/40 transition-colors"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && fetchErr && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600 text-sm">
          Could not load customers: {fetchErr}
        </div>
      )}

      {!loading && !fetchErr && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map(c => <CustomerCard key={c.id} customer={c} />)}
        </div>
      )}

      {!loading && !fetchErr && customers.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">🔍</span>
          <p className="text-sm">No customers match "{search}".</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-[#0f1f3d] text-sm font-medium underline underline-offset-2"
          >
            Clear search
          </button>
        </div>
      )}

      {!loading && !fetchErr && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">👤</span>
          <p className="text-sm">No customers found.</p>
          <p className="text-xs mt-1">Upload your customer list from the admin panel.</p>
        </div>
      )}
    </div>
  )
}
