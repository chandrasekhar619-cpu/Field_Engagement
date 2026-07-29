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
function localDayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function fmtDay(date) {
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function startOfNextMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1)
}
function fmtMonth(date) {
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

function mapEngagementLabel(link) {
  if (link.content_id === 'renewal-reminder')                              return 'Renewal Reminder'
  if (link.content_id === 'bonus-announcement-premium')                    return 'Bonus Announcement (Premium Paying)'
  if (link.content_id === 'bonus-announcement-rpu')                        return 'Bonus Announcement (Reduced Paid-Up)'
  if (link.content_id === '13')                                            return 'Word Hunt'
  if (link.content_id === '3')                                             return 'Money Word'
  if (link.content_id === 'book-insight-2')                                return 'Demystifying Money 2'
  if (link.content_id === 'book-insight')                                  return 'Demystifying Money'
  if (link.content_id === 'financial-playbook-kids')                       return 'Financial Playbook for Kids'
  if (link.content_id === '1' || link.content_type === 'Quiz')            return 'Persona Quiz'
  if (link.content_id === '5')                                             return 'Diwali Savings Gift'
  if (link.content_id === '8')                                             return 'Birthday Wealth Wish'
  if (link.content_id === '12')                                            return 'New Year Goal Setter'
  if (link.content_type)                                                   return `${link.content_type} — ${link.content_id}`
  return link.content_id || '—'
}

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

function SortTh({ col, sortCol, sortDir, onSort, children, right }) {
  const active = sortCol === col
  return (
    <th
      onClick={() => onSort(col)}
      className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider border-b border-[#e4e7f0] whitespace-nowrap cursor-pointer select-none transition-colors hover:text-[#0f1f3d] ${right ? 'text-right' : 'text-left'} ${active ? 'text-[#0f1f3d]' : 'text-gray-400'}`}
    >
      {children}{active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
    </th>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, authLoading } = useAuth()

  const [loading,        setLoading]        = useState(true)
  const [rawData,        setRawData]        = useState(null)
  const [chartRange,     setChartRange]     = useState(30)
  const [activityView,   setActivityView]   = useState('chart')
  const [activityPeriod, setActivityPeriod] = useState('yesterday')
  const [showAllAlerts,  setShowAllAlerts]  = useState(false)
  const [tableRpmFilter, setTableRpmFilter] = useState('all')

  // Engagement Activity section state
  const [eaDateRange,    setEaDateRange]    = useState('30')
  const [eaRpmFilter,    setEaRpmFilter]    = useState('all')
  const [eaEngFilter,    setEaEngFilter]    = useState('all')
  const [eaSortCol,      setEaSortCol]      = useState('date')
  const [eaSortDir,      setEaSortDir]      = useState('desc')
  const [eaPage,         setEaPage]         = useState(0)
  const [eaOpenedFilter,  setEaOpenedFilter]  = useState('all')
  const [eaOutcomeFilter, setEaOutcomeFilter] = useState('all')
  const yesterday = useMemo(() => daysAgo(1), [])

  function handleEaSort(col) {
    if (eaSortCol === col) {
      setEaSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setEaSortCol(col)
      setEaSortDir('desc')
    }
    setEaPage(0)
  }

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

    // 5. Feedback
    const { data: feedbacks } = await supabase
      .from('feedback')
      .select('token, thumbs_up, feedback_text')
      .limit(5000)

    setRawData({
      links:        links        || [],
      interactions: interactions || [],
      customers:    customers    || [],
      feedbacks:    feedbacks    || [],
    })
    setLoading(false)
  }

  useEffect(() => {
    if (user && ADMIN_PHONES.includes(user.phone)) load()
  }, [user]) // eslint-disable-line

  // All hooks must be above early returns
  const d = useMemo(() => {
    if (!rawData) return null
    const { links, interactions, customers, feedbacks } = rawData

    const linkMap = {}
    links.forEach(l => { linkMap[l.id] = l })
    const custMap = {}
    customers.forEach(c => { custMap[c.id] = c })
    const feedbackByToken = {}
    feedbacks.forEach(f => { if (f.token) feedbackByToken[f.token] = f })

    const intersByLinkId = {}
    interactions.forEach(i => {
      if (!intersByLinkId[i.link_id]) intersByLinkId[i.link_id] = []
      intersByLinkId[i.link_id].push(i)
    })

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

    const yesterdayKey = localDayKey(yesterday)
    const renewalLinksYesterday = renewalLinks.filter(
      l => localDayKey(new Date(l.created_at)) === yesterdayKey
    )
    const renewalYesterdayLinkIds = new Set(renewalLinksYesterday.map(l => l.id))
    const renewalOpensYesterday = renewalOpens.filter(i => renewalYesterdayLinkIds.has(i.link_id))

    const rpmRenewalMap = {}
    renewalLinksYesterday.forEach(l => {
      const key = l.rpm_id || l.rpm_name || 'Unknown'
      if (!rpmRenewalMap[key]) rpmRenewalMap[key] = { name: l.rpm_name || 'Unknown', sent: 0, opened: 0, lastSent: l.created_at }
      rpmRenewalMap[key].sent++
      if (l.created_at > rpmRenewalMap[key].lastSent) rpmRenewalMap[key].lastSent = l.created_at
    })
    renewalOpensYesterday.forEach(i => {
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

    const monthStart = startOfMonth(new Date())
    const nextMonthStart = startOfNextMonth(new Date())

    function buildPeriodRows(periodLinks, periodOpens) {
      const rpmMap = {}
      periodLinks.forEach(l => {
        const key = l.rpm_id || l.rpm_name || 'Unknown'
        if (!rpmMap[key]) rpmMap[key] = { name: l.rpm_name || 'Unknown', sent: 0, opened: 0, lastSent: l.created_at }
        rpmMap[key].sent++
        if (l.created_at > rpmMap[key].lastSent) rpmMap[key].lastSent = l.created_at
      })
      periodOpens.forEach(i => {
        const l = linkMap[i.link_id]
        if (!l) return
        const key = l.rpm_id || l.rpm_name || 'Unknown'
        if (rpmMap[key]) rpmMap[key].opened++
      })
      return Object.values(rpmMap)
        .map(r => ({ ...r, rate: pct(r.opened, r.sent) }))
        .sort((a, b) => b.sent - a.sent)
    }

    const activityLinksYesterday = links.filter(
      l => localDayKey(new Date(l.created_at)) === yesterdayKey
    )
    const activityYesterdayLinkIds = new Set(activityLinksYesterday.map(l => l.id))
    const activityOpensYesterday = opens.filter(i => activityYesterdayLinkIds.has(i.link_id))

    const activityLinksMonth = links.filter(l => {
      const created = new Date(l.created_at)
      return created >= monthStart && created < nextMonthStart
    })
    const activityMonthLinkIds = new Set(activityLinksMonth.map(l => l.id))
    const activityOpensMonth = opens.filter(i => activityMonthLinkIds.has(i.link_id))

    const rpmActivityYesterdayRows = buildPeriodRows(activityLinksYesterday, activityOpensYesterday)
    const rpmActivityMonthRows = buildPeriodRows(activityLinksMonth, activityOpensMonth)

    const rpmSummaryMap = {}
    activityRows.forEach(r => {
      if (!rpmSummaryMap[r.rpm]) rpmSummaryMap[r.rpm] = { rpm: r.rpm, links: 0, opens: 0 }
      rpmSummaryMap[r.rpm].links += r.links
      rpmSummaryMap[r.rpm].opens += r.opens
    })
    const rpmSummaryRows = Object.values(rpmSummaryMap).sort((a, b) => b.links - a.links)

    // ── Engagement Activity — filter at interaction level, not link level ─────
    // An interaction is IP-matched if the customer's IP equals the RPM's share IP.
    // We only count non-IP-matched interactions for Opened and Outcome so that
    // an RPM opening/completing their own link doesn't inflate either column.
    const allEngagementRows = links.map(l => {
      const ints      = intersByLinkId[l.id] || []
      const validInts = ints.filter(i =>
        !(l.rpm_ip && i.customer_ip && l.rpm_ip === i.customer_ip)
      )
      const isCompleted = validInts.some(i => i.action === 'completed')
      const engLabel    = mapEngagementLabel(l)
      let outcome = '—'
      if (isCompleted) {
        if (engLabel === 'Persona Quiz') {
          outcome = custMap[l.customer_id]?.persona || 'Completed'
        } else {
          outcome = 'Completed'
        }
      }
      return {
        rpmName:      l.rpm_name      || '—',
        date:         l.created_at,
        customerName: l.customer_name || '—',
        engagement:   engLabel,
        opened:       validInts.some(i => i.action === 'opened') ? 'Yes' : 'No',
        outcome,
        feedback:     feedbackByToken[l.token] ?? null,
      }
    })
    const eaAllRpms = [...new Set(allEngagementRows.map(r => r.rpmName).filter(n => n !== '—'))].sort()
    const eaAllEngs = [...new Set(allEngagementRows.map(r => r.engagement))].sort()

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
      allEngagementRows, eaAllRpms, eaAllEngs,
      rTotalSent, rTotalOpens, rOpenRate, reminderRows, personaRows, rpmRenewalRows,
      chartData, activityRows, allRpms, rpmSummaryRows, rpmActivityYesterdayRows, rpmActivityMonthRows,
      alertRows,
    }
  }, [rawData, chartRange])

  const activitySummaryRows = useMemo(() => {
    if (!d) return []
    return activityPeriod === 'month' ? d.rpmActivityMonthRows : d.rpmActivityYesterdayRows
  }, [d, activityPeriod])

  const filteredActivityRows = useMemo(() => {
    if (!d) return []
    return tableRpmFilter === 'all' ? d.activityRows : d.activityRows.filter(r => r.rpm === tableRpmFilter)
  }, [d, tableRpmFilter])

  const eaRows = useMemo(() => {
    if (!d) return []
    let rows = d.allEngagementRows

    if (eaDateRange !== 'all') {
      const cutoff = daysAgo(parseInt(eaDateRange))
      rows = rows.filter(r => new Date(r.date) >= cutoff)
    }
    if (eaRpmFilter    !== 'all') rows = rows.filter(r => r.rpmName === eaRpmFilter)
    if (eaEngFilter    !== 'all') rows = rows.filter(r => r.engagement === eaEngFilter)
    if (eaOpenedFilter !== 'all') rows = rows.filter(r => eaOpenedFilter === 'yes' ? r.opened === 'Yes' : r.opened === 'No')
    if (eaOutcomeFilter !== 'all') rows = rows.filter(r => eaOutcomeFilter === 'has' ? r.outcome !== '—' : r.outcome === '—')

    return [...rows].sort((a, b) => {
      const av = a[eaSortCol] ?? '', bv = b[eaSortCol] ?? ''
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return eaSortDir === 'asc' ? cmp : -cmp
    })
  }, [d, eaDateRange, eaRpmFilter, eaEngFilter, eaOpenedFilter, eaOutcomeFilter, eaSortCol, eaSortDir])

  const EA_PAGE_SIZE  = 25
  const eaTotalPages  = Math.max(1, Math.ceil(eaRows.length / EA_PAGE_SIZE))
  const eaPageRows    = eaRows.slice(eaPage * EA_PAGE_SIZE, (eaPage + 1) * EA_PAGE_SIZE)

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

        {/* ── Engagement Activity ───────────────────────────────────────── */}
        <section>
          <SectionHead title="Engagement Activity" />

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Date range */}
            <div className="flex bg-white border border-[#e4e7f0] rounded-lg overflow-hidden">
              {[['7','Last 7 days'],['30','Last 30 days'],['90','Last 90 days'],['all','All time']].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setEaDateRange(val); setEaPage(0) }}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-[#e4e7f0] last:border-r-0 ${
                    eaDateRange === val ? 'bg-[#0f1f3d] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <select
              value={eaRpmFilter}
              onChange={e => { setEaRpmFilter(e.target.value); setEaPage(0) }}
              className="text-sm border border-[#e4e7f0] rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All RPMs</option>
              {(d?.eaAllRpms || []).map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select
              value={eaEngFilter}
              onChange={e => { setEaEngFilter(e.target.value); setEaPage(0) }}
              className="text-sm border border-[#e4e7f0] rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All Engagements</option>
              {(d?.eaAllEngs || []).map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            <select
              value={eaOpenedFilter}
              onChange={e => { setEaOpenedFilter(e.target.value); setEaPage(0) }}
              className="text-sm border border-[#e4e7f0] rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All (Opened)</option>
              <option value="yes">Opened: Yes</option>
              <option value="no">Opened: No</option>
            </select>

            <select
              value={eaOutcomeFilter}
              onChange={e => { setEaOutcomeFilter(e.target.value); setEaPage(0) }}
              className="text-sm border border-[#e4e7f0] rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none"
            >
              <option value="all">All (Outcome)</option>
              <option value="has">Has outcome</option>
              <option value="none">No outcome</option>
            </select>

            {!loading && (
              <span className="text-xs text-gray-400 self-center">
                {eaRows.length} row{eaRows.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr>
                  <SortTh col="rpmName"      sortCol={eaSortCol} sortDir={eaSortDir} onSort={handleEaSort}>RPM Name</SortTh>
                  <SortTh col="date"         sortCol={eaSortCol} sortDir={eaSortDir} onSort={handleEaSort}>Date</SortTh>
                  <SortTh col="customerName" sortCol={eaSortCol} sortDir={eaSortDir} onSort={handleEaSort}>Customer Name</SortTh>
                  <SortTh col="engagement"   sortCol={eaSortCol} sortDir={eaSortDir} onSort={handleEaSort}>Engagement</SortTh>
                  <SortTh col="opened"       sortCol={eaSortCol} sortDir={eaSortDir} onSort={handleEaSort}>Opened</SortTh>
                  <SortTh col="outcome"      sortCol={eaSortCol} sortDir={eaSortDir} onSort={handleEaSort}>Outcome</SortTh>
                  <Th>Feedback</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <LoadingRow cols={7} />
                ) : eaPageRows.length ? (
                  eaPageRows.map((r, i) => (
                    <tr key={i} className="border-t border-[#f0f2f7] hover:bg-gray-50/50">
                      <Td>{r.rpmName}</Td>
                      <Td>{fmtDate(r.date)}</Td>
                      <Td>{r.customerName}</Td>
                      <Td>{r.engagement}</Td>
                      <Td>
                        <span className={r.opened === 'Yes' ? 'text-green-600 font-medium' : 'text-gray-400'}>
                          {r.opened}
                        </span>
                      </Td>
                      <Td>
                        <span className={r.outcome !== '—' ? 'text-[#0f1f3d] font-medium' : 'text-gray-300'}>
                          {r.outcome}
                        </span>
                      </Td>
                      <Td>
                        {r.feedback ? (
                          <span
                            title={r.feedback.feedback_text || ''}
                            className="cursor-default flex items-center gap-1 flex-wrap"
                          >
                            {r.feedback.thumbs_up === true && <span>👍</span>}
                            {r.feedback.thumbs_up === false && <span>👎</span>}
                            {r.feedback.feedback_text ? (
                              <span className="text-gray-500 text-xs">
                                {r.feedback.feedback_text.length > 40
                                  ? r.feedback.feedback_text.slice(0, 40) + '…'
                                  : r.feedback.feedback_text}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </Td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow cols={7} msg="No activity in the selected period." />
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && eaTotalPages > 1 && (
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-400">
                Page {eaPage + 1} of {eaTotalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEaPage(p => Math.max(0, p - 1))}
                  disabled={eaPage === 0}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#e4e7f0] bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setEaPage(p => Math.min(eaTotalPages - 1, p + 1))}
                  disabled={eaPage >= eaTotalPages - 1}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#e4e7f0] bg-white text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
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
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex bg-white border border-[#e4e7f0] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActivityPeriod('yesterday')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-[#e4e7f0] ${
                      activityPeriod === 'yesterday' ? 'bg-[#0f1f3d] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Yesterday ({fmtDay(yesterday)})
                  </button>
                  <button
                    onClick={() => setActivityPeriod('month')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      activityPeriod === 'month' ? 'bg-[#0f1f3d] text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {fmtMonth(new Date())}
                  </button>
                </div>

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
              </div>

              <div className="bg-white rounded-xl border border-[#e4e7f0] overflow-hidden">
                <p className="px-4 pt-4 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Activity Summary — {activityPeriod === 'month' ? fmtMonth(new Date()) : `Yesterday (${fmtDay(yesterday)})`}
                </p>
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
                      : activitySummaryRows.length
                        ? activitySummaryRows.map(r => (
                            <tr key={`${activityPeriod}-${r.name}`} className="border-t border-[#f0f2f7]">
                              <Td>{r.name}</Td>
                              <Td right>{r.sent}</Td>
                              <Td right>{r.opened}</Td>
                              <Td right>{r.rate}</Td>
                              <Td right>{fmtDate(r.lastSent)}</Td>
                            </tr>
                          ))
                        : <EmptyRow cols={5} msg={`No activity found for ${activityPeriod === 'month' ? fmtMonth(new Date()) : fmtDay(yesterday)}.`} />
                    }
                  </tbody>
                </table>
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
