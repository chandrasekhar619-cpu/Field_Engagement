import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import CustomerCard from './CustomerCard'

function normalize(row, activeIds) {
  return {
    ...row,
    policyNumber:    row.policy_number,
    issueDate:       row.issue_date,
    policyType:      row.policy_type,
    hasInteractions: activeIds ? activeIds.has(row.id) : false,
  }
}

export default function CustomerView() {
  const [customers,  setCustomers]  = useState([])
  const [totalCount, setTotalCount] = useState(null)
  const [activeIds,  setActiveIds]  = useState(new Set())
  const [loading,    setLoading]    = useState(true)
  const [searching,  setSearching]  = useState(false)
  const [fetchErr,   setFetchErr]   = useState(null)
  const [search,     setSearch]     = useState('')
  const debounceRef = useRef(null)

  // Fetch total count and active customer IDs once on mount
  useEffect(() => {
    Promise.all([
      supabase.from('customers').select('*', { count: 'exact', head: true }),
      supabase.from('interactions').select('customer_id').not('customer_id', 'is', null),
    ]).then(([countRes, activeRes]) => {
      if (countRes.count != null) setTotalCount(countRes.count)
      setActiveIds(new Set(activeRes.data?.map(r => r.customer_id) || []))
    })
  }, [])

  // Propagate hasInteractions to existing customers when activeIds arrives
  useEffect(() => {
    setCustomers(cs => cs.map(c => ({ ...c, hasInteractions: activeIds.has(c.id) })))
  }, [activeIds])

  // Fetch/search customers — debounced, server-side
  useEffect(() => {
    const term = search.trim()
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setFetchErr(null)

      let q = supabase.from('customers').select('*').order('name', { ascending: true }).limit(50)
      if (term) q = q.or(`name.ilike.%${term}%,policy_number.ilike.%${term}%`)

      const { data, error } = await q
      if (error) {
        setFetchErr(error.message)
      } else {
        setCustomers((data || []).map(r => normalize(r, activeIds)))
      }
      setSearching(false)
      setLoading(false)
    }, term ? 300 : 0)

    return () => clearTimeout(debounceRef.current)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSearching = !!search.trim()
  const countLabel  = totalCount != null
    ? totalCount.toLocaleString('en-IN')
    : '…'

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">

      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#0f1f3d]">Customers</h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {loading ? 'Loading…' : `${countLabel} customers total`}
        </p>
      </div>

      {/* Search bar */}
      <div className="relative mb-1.5">
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
        {searching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Search hint */}
      {!loading && !isSearching && (
        <p className="text-gray-400 text-xs mb-5 pl-1">
          Showing first 50 — search by name or policy number to find a specific customer
        </p>
      )}
      {!loading && isSearching && (
        <p className="text-gray-400 text-xs mb-5 pl-1">
          {customers.length} result{customers.length !== 1 ? 's' : ''} for "{search.trim()}"
        </p>
      )}
      {loading && <div className="mb-5" />}

      {/* Initial spinner */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && fetchErr && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-600 text-sm">
          Could not load customers: {fetchErr}
        </div>
      )}

      {/* Results */}
      {!loading && !fetchErr && customers.length > 0 && (
        <div className="flex flex-col gap-3">
          {customers.map(c => <CustomerCard key={c.id} customer={c} />)}
        </div>
      )}

      {/* No results */}
      {!loading && !fetchErr && customers.length === 0 && isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">🔍</span>
          <p className="text-sm">No customers match "{search.trim()}".</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-[#0f1f3d] text-sm font-medium underline underline-offset-2"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchErr && customers.length === 0 && !isSearching && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">👤</span>
          <p className="text-sm">No customers found.</p>
          <p className="text-xs mt-1">Upload your customer list from the admin panel.</p>
        </div>
      )}
    </div>
  )
}
