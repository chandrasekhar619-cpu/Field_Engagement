import { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import Navbar from '../components/Navbar'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'

const ADMIN_PHONES    = ['8320978236', '9404557489']
const EXCLUDED_PHONES = ['8320978236', '7893933006', '9404557489']

const ENGAGEMENT_DEFS = [
  { label: 'Quiz',             test: l => l.content_id === '1' },
  { label: 'Word Hunt',        test: l => l.content_id === '13' },
  { label: 'Money Word',       test: l => l.content_id === '3' },
  { label: 'Renewal Reminder', test: l => l.content_id === 'renewal-reminder' },
]
const REMINDER_TYPES = ['30-Day Reminder', '2-Week Reminder', 'Final Reminder']
const PERSONAS       = ['Go-Getter', 'Thinker', 'Protector', 'Caregiver']

function pct(n, d)    { return d ? (n / d * 100).toFixed(1) + '%' : '—' }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—' }
function isoDay(date) { return date.toISOString().split('T')[0] }
function daysAgo(n)   { const d = new Date(); d.setDate(d.getDate() - n); d.setHours(0, 0, 0, 0); return d }

// ── Mini UI ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function StatTile({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#e4e7f0] px-5 py-4 flex-1 min-w-[140px]">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#0f1f3d]">{value ?? '—'}</p>
    </div>
  )
}

function SkeletonTile() {
  return (
    <div className="bg-white rounded-xl border border-[#e4e7f0] px-5 py-4 flex-1 min-w-[140px] animate-pulse">
      <div className="h-2.5 bg-gray-200 rounded w-16 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-12" />
    </div>
  )
}

function SectionHead({ title, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xs font-bold text-[#0f1f3d] uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

function Th({ children, right }) {
  return (
    <th className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-[#e4e7f0] whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}

function Td({ children, right, mono }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-700 ${right ? 'text-right' : ''} ${mono ? 'font-mono text-xs' : ''}`}>
      {children}
    </td>
  )
}

function EmptyRow({ cols, msg = 'No data yet' }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-sm text-gray-400">{msg}</td>
    </tr>
  )
}

function LoadingRow({ cols }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-6 text-center text-sm text-gray-300 animate-pulse">Loading…</td>
    </tr>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, authLoading } = useAuth()

  const [loading,        setLoading]        = useState(true)
  const [rawData,        setRawData]        = useState(null)
  const [chartRange,     setChartRange]     = useState(30)
  const [activityView,   setActivityView]   = useState('chart')
  const [showAllAlerts,  setShowAllAlerts]  = useState(false)
  const [tableRpmFilter, setTableRpmFilter] = useState('all')

  async function load() {
    setLoading(true)

    // 1. Resolve UUIDs to exclude
    const { data: exUsers } = await supabase
      .from('users')
      .select('id')
      .in('phone', EXCLUDED_PHONES)
    const exIds = (exUsers || []).map(u => u.id).filter(Boolean)

    // 2. Fetch links (exclude admin RPMs)
    let lq = supabase
      .from('links')
      .select('id, token, rpm_id, rpm_name, customer_id, customer_name, content_id, content_type, reminder_type, rpm_ip, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (exIds.length) lq = lq.not('rpm_id', 'in', `(${exIds.join(',')})`)
    const { data: links } = await lq

    // 3. Fetch interactions (exclude admin RPMs)
    let iq = supabase
      .from('interactions')
      .select('id, link_id, rpm_id, customer_id, action, customer_ip, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)
    if (exIds.length) iq = iq.not('rpm_id', 'in', `(${exIds.join(',')})`)
    const { data: interactions } = await iq

    // 4. Customers for persona lookup
    const { data: customers } = await supabase
      .from('customers')
      .select('id, persona')
      .limit(5000)

    setRawData({
      links:        links        || [],
      interactions: interactions || [],
      customers:    customers    || [],
    })
    setLoading(false)
  }

  useEffect(() => {
    if (user && ADMIN_PHONES.includes(user.phone)) load()
  }, [user]) // eslint-disable-line

  // All hooks must be above early returns
  const d = useMemo(() => {
    if (!rawData) return null
    const { links, interactions, customers } = rawData

    const linkMap = {}
    links.forEach(l => { linkMap[l.id] = l })
    const custMap = {}
    customers.forEach(c => { custMap[c.id] = c })

    const opens = interactions.filter(i => i.action === 'opened')

    // ── Section 1 ──────────────────────────────────────────────────────────
    const totalLinks       = links.length
    const totalOpens       = opens.length
    const activeRpms       = new Set(links.map(l => l.rpm_id).filter(Boolean)).size
    const customersEngaged = new Set(interactions.map(i => i.customer_id).filter(Boolean)).size
    const overallOpenRate  = pct(totalOpens, totalLinks)

    const engagementRows = ENGAGEMENT_DEFS.map(({ label, test }) => {
      const sent   = links.filter(test).length
      const opened = opens.filter(i => linkMap[i.link_id] && test(linkMap[i.link_id])).length
      return { label, sent, opened, rate: pct(opened, sent) }
    })

    // ── Section 2 — Renewal ────────────────────────────────────────────────
    const renewalLinks = links.filter(l => l.content_id === 'renewal-reminder')
    const renewalOpens = opens.filter(i => linkMap[i.link_id]?.content_id === 'renewal-reminder')
    const rTotalSent   = renewalLinks.length
    const rTotalOpens  = renewalOpens.length
    const rOpenRate    = pct(rTotalOpens, rTotalSent)

    const reminderRows = REMINDER_TYPES.map(type => {
      const sent   = renewalLinks.filter(l => l.reminder_type === type).length
      const opened = renewalOpens.filter(i => linkMap[i.link_id]?.reminder_type === type).length
      return { type, sent, opened, rate: pct(opened, sent) }
    })

    const personaRows = [
      ...PERSONAS.map(p => {
        const sent   = renewalLinks.filter(l => custMap[l.customer_id]?.persona === p).length
        const opened = renewalOpens.filter(i => custMap[linkMap[i.link_id]?.customer_id]?.persona === p).length
        return { label: p, sent, opened, rate: pct(opened, sent) }
      }),
      (() => {
        const sent   = renewalLinks.filter(l => !custMap[l.customer_id]?.persona).length
        const opened = renewalOpens.filter(i => !custMap[linkMap[i.link_id]?.customer_id]?.persona).length
        return { label: 'Generic (no persona)', sent, opened, rate: pct(opened, sent) }
      })(),
    ]

    const rpmRenewalMap = {}
    renewalLinks.forEach(l => {
      const key = l.rpm_id || l.rpm_name || 'Unknown'
      if (!rpmRenewalMap[key]) rpmRenewalMap[key] = { name: l.rpm_name || 'Unknown', sent: 0, opened: 0, lastSent: l.created_at }
      rpmRenewalMap[key].sent++
      if (l.created_at > rpmRenewalMap[key].lastSent) rpmRenewalMap[key].lastSent = l.created_at
    })
    renewalOpens.forEach(i => {
      const l = linkMap[i.link_id]
      if (!l) return
      const key = l.rpm_id || l.rpm_name || 'Unknown'
      if (rpmRenewalMap[key]) rpmRenewalMap[key].opened++
    })
    const rpmRenewalRows = Object.values(rpmRenewalMap)
      .map(r => ({ ...r, rate: pct(r.opened, r.sent) }))
      .sort((a, b) => b.sent - a.sent)

    // ── Section 3 — Activity ───────────────────────────────────────────────
    const cutoff       = daysAgo(chartRange)
    const linksInRange = links.filter(l => new Date(l.created_at) >= cutoff)
    const opensInRange = opens.filter(i => new Date(i.created_at) >= cutoff)

    const linksByDay = {}
    linksInRange.forEach(l => { const k = isoDay(new Date(l.created_at)); linksByDay[k] = (linksByDay[k] || 0) + 1 })
    const opensByDay = {}
    opensInRange.forEach(i => { const k = isoDay(new Date(i.created_at)); opensByDay[k] = (opensByDay[k] || 0) + 1 })

    const chartData = []
    for (let i = chartRange - 1; i >= 0; i--) {
      const dt = new Date()
      dt.setDate(dt.getDate() - i)
      const k = isoDay(dt)
      chartData.push({
        date:  dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        Links: linksByDay[k] || 0,
        Opens: opensByDay[k] || 0,
      })
    }

    const rpmDayMap = {}
    linksInRange.forEach(l => {
      const rpm = l.rpm_name || 'Unknown'
      const day = isoDay(new Date(l.created_at))
      const key = `${rpm}__${day}`
      if (!rpmDayMap[key]) rpmDayMap[key] = { rpm, day, links: 0, opens: 0 }
      rpmDayMap[key].links++
    })
    opensInRange.forEach(i => {
      const l = linkMap[i.link_id]
      if (!l) return
      const rpm = l.rpm_name || 'Unknown'
      const day = isoDay(new Date(i.created_at))
      const key = `${rpm}__${day}`
      if (!rpmDayMap[key]) rpmDayMap[key] = { rpm, day, links: 0, opens: 0 }
      rpmDayMap[key].opens++
    })
    const activityRows = Object.values(rpmDayMap).sort((a, b) => b.day.localeCompare(a.day))
    const allRpms = [...new Set(activityRows.map(r => r.rpm))].sort()

    const rpmSummaryMap = {}
    activityRows.forEach(r => {
      if (!rpmSummaryMap[r.rpm]) rpmSummaryMap[r.rpm] = { rpm: r.rpm, links: 0, opens: 0 }
      rpmSummaryMap[r.rpm].links += r.links
      rpmSummaryMap[r.rpm].opens += r.opens
    })
    const rpmSummaryRows = Object.values(rpmSummaryMap).sort((a, b) => b.links - a.links)

    // ── Section 4 — Alerts ─────────────────────────────────────────────────
    const alertRows = opens.map(i => {
      const l = linkMap[i.link_id]
      if (!l) return null
      const match = !!(l.rpm_ip && i.customer_ip && l.rpm_ip === i.customer_ip)
      return {
        customerName: l.customer_name || '—',
        rpmName:      l.rpm_name || '—',
        engagement:   l.content_id || '—',
        linkCreated:  l.created_at,
        linkOpened:   i.created_at,
        rpmIp:        l.rpm_ip || '—',
        customerIp:   i.customer_ip || '—',
        match,
      }
    }).filter(Boolean)

    return {
      totalLinks, totalOpens, activeRpms, customersEngaged, overallOpenRate,
      engagementRows,
      rTotalSent, rTotalOpens, rOpenRate, reminderRows, personaRows, rpmRenewalRows,
      chartData, activityRows, allRpms, rpmSummaryRows,
      alertRows,
    }
  }, [rawData, chartRange])

  const filteredActivityRows = useMemo(() => {
    if (!d) return []
    return tableRpmFilter === 'all' ? d.activityRows : d.activityRows.filter(r => r.rpm === tableRpmFilter)
  }, [d, tableRpmFilter])

  // Early returns after all hooks
  if (authLoading) return <Spinner />
  if (!user || !ADMIN_PHONES.includes(user.phone)) return <Navigate to="/app" replace />

  const filteredAlertRows = d
    ? (showAllAlerts ? d.alertRows : d.alertRows.filter(r => r.match))
    : []

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f4f5f9]">
      <Navbar activeView="admin" />
      <div className="pt-[60px] max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-10">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#0f1f3d]">Dashboard</h1>
          <button
            onClick={load}
            disabled={loading}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#e4e7f0] bg-white text-[#0f1f3d] hover:bg-[#f4f5f9] disabled:opacity-40 transition-colors"
          >
            {loading ? 'Loading…' : '↺ Refresh'}
          </button>
        </div>

        {/* ── Section 1 — Platform Overview ─────────────────────────────── */}
        <section>
          <SectionHead title="Platform Overview" />
          <div className="flex flex-wrap gap-3 mb-5">
            {loading ? (
              [1,2,3,4,5].map(k => <SkeletonTile key={k} />)
            ) : (
              <>
                <StatTile label="Links Shared"      value={d?.totalLinks} />
                <StatTile label="Customer Opens"    value={d?.totalOpens} />
                <StatTile label="Overall Open Rate" value={d?.overallOpenRate} />
                <StatTile label="Active RPMs"       value={d?.activeRpms} />
                <StatTile label="Customers Engaged" value={d?.customersEngaged} />
              </>
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
            <table className="w-full">
              <thead><tr>
                <Th>Engagement</Th>
                <Th right>Links Shared</Th>
                <Th right>Opens</Th>
                <Th right>Open Rate</Th>
              </tr></thead>
              <tbody>
                {loading
                  ? <LoadingRow cols={4} />
                  : d?.engagementRows.map(r => (
                      <tr key={r.label} className="border-t border-[#f0f2f7]">
                        <Td>{r.label}</Td>
                        <Td right>{r.sent}</Td>
                        <Td right>{r.opened}</Td>
                        <Td right>{r.rate}</Td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 2 — Renewal Reminder ──────────────────────────────── */}
        <section>
          <SectionHead title="Renewal Reminder" />
          <div className="flex flex-wrap gap-3 mb-5">
            {loading ? (
              [1,2,3].map(k => <SkeletonTile key={k} />)
            ) : (
              <>
                <StatTile label="Renewal Links Sent" value={d?.rTotalSent} />
                <StatTile label="Total Opens"        value={d?.rTotalOpens} />
                <StatTile label="Open Rate"          value={d?.rOpenRate} />
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* By reminder type */}
            <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
              <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">By Reminder Type</p>
              <table className="w-full">
                <thead><tr>
                  <Th>Type</Th><Th right>Sent</Th><Th right>Opened</Th><Th right>Rate</Th>
                </tr></thead>
                <tbody>
                  {loading
                    ? <LoadingRow cols={4} />
                    : d?.reminderRows.map(r => (
                        <tr key={r.type} className="border-t border-[#f0f2f7]">
                          <Td>{r.type}</Td>
                          <Td right>{r.sent}</Td>
                          <Td right>{r.opened}</Td>
                          <Td right>{r.rate}</Td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* By persona */}
            <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
              <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">By Persona</p>
              <table className="w-full">
                <thead><tr>
                  <Th>Persona</Th><Th right>Sent</Th><Th right>Opened</Th><Th right>Rate</Th>
                </tr></thead>
                <tbody>
                  {loading
                    ? <LoadingRow cols={4} />
                    : d?.personaRows.map(r => (
                        <tr key={r.label} className="border-t border-[#f0f2f7]">
                          <Td>{r.label}</Td>
                          <Td right>{r.sent}</Td>
                          <Td right>{r.opened}</Td>
                          <Td right>{r.rate}</Td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>

          {/* RPM-level renewal */}
          <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
            <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">By RPM</p>
            <table className="w-full">
              <thead><tr>
                <Th>RPM Name</Th>
                <Th right>Sent</Th>
                <Th right>Opened</Th>
                <Th right>Open Rate</Th>
                <Th right>Last Sent</Th>
              </tr></thead>
              <tbody>
                {loading
                  ? <LoadingRow cols={5} />
                  : d?.rpmRenewalRows.length
                    ? d.rpmRenewalRows.map(r => (
                        <tr key={r.name} className="border-t border-[#f0f2f7]">
                          <Td>{r.name}</Td>
                          <Td right>{r.sent}</Td>
                          <Td right>{r.opened}</Td>
                          <Td right>{r.rate}</Td>
                          <Td right>{fmtDate(r.lastSent)}</Td>
                        </tr>
                      ))
                    : <EmptyRow cols={5} />
                }
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Section 3 — RPM Activity ───────────────────────────────────── */}
        <section>
          <SectionHead title="RPM Activity">
            <div className="flex bg-white border border-[#e4e7f0] rounded-full p-0.5 gap-0.5">
              {['chart', 'table'].map(v => (
                <button
                  key={v}
                  onClick={() => setActivityView(v)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activityView === v ? 'bg-[#0f1f3d] text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'chart' ? 'Chart' : 'Table'}
                </button>
              ))}
            </div>
          </SectionHead>

          {activityView === 'chart' && (
            <div className="bg-white rounded-xl border border-[#e4e7f0] p-5">
              <div className="flex gap-2 mb-5">
                {[7, 30, 90].map(n => (
                  <button
                    key={n}
                    onClick={() => setChartRange(n)}
                    className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                      chartRange === n
                        ? 'bg-[#0f1f3d] text-white border-[#0f1f3d]'
                        : 'border-[#e4e7f0] text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    Last {n} days
                  </button>
                ))}
              </div>
              {loading ? (
                <div className="h-52 flex items-center justify-center text-gray-300 animate-pulse text-sm">Loading…</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={d?.chartData || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      interval={chartRange > 30 ? 6 : chartRange > 7 ? 3 : 0}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e4e7f0' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Links" stroke="#0f1f3d" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Opens" stroke="#e8a020" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {activityView === 'table' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-medium">RPM</span>
                <select
                  value={tableRpmFilter}
                  onChange={e => setTableRpmFilter(e.target.value)}
                  className="text-sm border border-[#e4e7f0] rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
                >
                  <option value="all">All RPMs</option>
                  {(d?.allRpms || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
                <table className="w-full">
                  <thead><tr>
                    <Th>RPM Name</Th>
                    <Th>Date</Th>
                    <Th right>Links Shared</Th>
                    <Th right>Customer Opens</Th>
                  </tr></thead>
                  <tbody>
                    {loading
                      ? <LoadingRow cols={4} />
                      : filteredActivityRows.length
                        ? filteredActivityRows.map((r, i) => (
                            <tr key={i} className="border-t border-[#f0f2f7]">
                              <Td>{r.rpm}</Td>
                              <Td>{r.day}</Td>
                              <Td right>{r.links}</Td>
                              <Td right>{r.opens}</Td>
                            </tr>
                          ))
                        : <EmptyRow cols={4} />
                    }
                  </tbody>
                </table>
              </div>

              {!loading && (d?.rpmSummaryRows || []).length > 0 && (
                <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
                  <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    RPM Totals — Last {chartRange} days
                  </p>
                  <table className="w-full">
                    <thead><tr>
                      <Th>RPM</Th><Th right>Links</Th><Th right>Opens</Th>
                    </tr></thead>
                    <tbody>
                      {d.rpmSummaryRows.map(r => (
                        <tr key={r.rpm} className="border-t border-[#f0f2f7]">
                          <Td>{r.rpm}</Td>
                          <Td right>{r.links}</Td>
                          <Td right>{r.opens}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <p className="text-xs text-gray-400">Try Now tracking coming soon.</p>
            </div>
          )}
        </section>

        {/* ── Section 4 — Alerts ────────────────────────────────────────── */}
        <section className="pb-12">
          <SectionHead title="Alerts — IP Mismatch">
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showAllAlerts}
                onChange={e => setShowAllAlerts(e.target.checked)}
                className="rounded border-gray-300"
              />
              Show all
            </label>
          </SectionHead>

          <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead><tr>
                <Th>Customer</Th>
                <Th>RPM</Th>
                <Th>Engagement</Th>
                <Th>Link Created</Th>
                <Th>Link Opened</Th>
                <Th>RPM IP</Th>
                <Th>Customer IP</Th>
                <Th>Match?</Th>
              </tr></thead>
              <tbody>
                {loading
                  ? <LoadingRow cols={8} />
                  : filteredAlertRows.length
                    ? filteredAlertRows.map((r, i) => (
                        <tr key={i} className={`border-t border-[#f0f2f7] ${r.match ? 'bg-red-50' : ''}`}>
                          <Td>{r.customerName}</Td>
                          <Td>{r.rpmName}</Td>
                          <Td>{r.engagement}</Td>
                          <Td>{fmtDate(r.linkCreated)}</Td>
                          <Td>{fmtDate(r.linkOpened)}</Td>
                          <Td mono>{r.rpmIp}</Td>
                          <Td mono>{r.customerIp}</Td>
                          <Td>
                            {r.match
                              ? <span className="text-red-600 font-bold text-xs">YES ⚠</span>
                              : <span className="text-green-600 text-xs">No</span>
                            }
                          </Td>
                        </tr>
                      ))
                    : <EmptyRow cols={8} msg={showAllAlerts ? 'No data yet' : 'No IP matches found'} />
                }
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  )
}
