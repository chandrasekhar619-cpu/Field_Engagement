import { useState } from 'react'
import { customers } from '../data/mockData'
import CustomerCard from './CustomerCard'

export default function CustomerView() {
  const [search, setSearch] = useState('')

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.policyNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">

      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-[#0f1f3d]">Customers</h2>
        <p className="text-gray-500 text-sm mt-0.5">{customers.length} customers in your portfolio</p>
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

      {/* List */}
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map(c => (
            <CustomerCard key={c.id} customer={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <span className="text-5xl mb-3">👤</span>
          <p className="text-sm">No customers match "{search}".</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-[#0f1f3d] text-sm font-medium underline underline-offset-2"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  )
}
