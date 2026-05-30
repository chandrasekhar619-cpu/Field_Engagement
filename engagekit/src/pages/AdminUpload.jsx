import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const DECODE_KEY = 'EWL27FY'
const CHUNK_SIZE = 100

// XOR-decode: each character is XOR'd with cycling key characters
function xorDecode(encoded, key) {
  return [...encoded].map((ch, i) =>
    String.fromCharCode(ch.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('')
}

// Strip non-printable / non-ASCII characters
// Field-specific sanitizers — targeted rather than broad ASCII strip
function cleanPolicyNumber(s) { return s.replace(/[^A-Za-z0-9]/g, '').trim() }
function cleanName(s)         { return s.replace(/[^A-Za-z\s\-'.]/g, '').trim() }
function cleanIssueDate(s)    { return s.replace(/[^0-9\-]/g, '').trim() }

// Parse decoded text — each line: policy_number|name|issue_date
// Returns { records, skipped } — bad lines are skipped, never throw
function parseRecords(text) {
  let skipped = 0
  const records = []
  for (const line of text.split('\n')) {
    try {
      if (!line.trim()) continue
      const parts = line.split('|')
      if (parts.length !== 3) { skipped++; continue }
      const policy_number = cleanPolicyNumber(parts[0])
      const name          = cleanName(parts[1])
      const issue_date    = cleanIssueDate(parts[2])
      if (!policy_number) { skipped++; continue }
      records.push({ policy_number, name: name || null, issue_date: issue_date || null })
    } catch {
      skipped++
    }
  }
  // Deduplicate by policy_number — keep last occurrence to match upsert semantics
  const deduped = [...new Map(records.map(r => [r.policy_number, r])).values()]
  const dedupSkipped = records.length - deduped.length
  return { records: deduped, skipped: skipped + dedupSkipped }
}

export default function AdminUpload() {
  const { user, authLoading } = useAuth()

  const [file,        setFile]        = useState(null)
  const [status,      setStatus]      = useState(null)  // null | 'processing' | 'done' | 'error'
  const [progress,    setProgress]    = useState({ done: 0, total: 0 })
  const [count,       setCount]       = useState(0)
  const [skipped,     setSkipped]     = useState(0)
  const [batchErrors, setBatchErrors] = useState([])
  const [error,       setError]       = useState('')

  if (authLoading) return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />

  function reset(newFile) {
    setFile(newFile)
    setStatus(null)
    setError('')
    setCount(0)
    setSkipped(0)
    setBatchErrors([])
    setProgress({ done: 0, total: 0 })
  }

  async function handleUpload() {
    if (!file || status === 'processing') return
    setStatus('processing')
    setError('')
    setBatchErrors([])

    try {
      const raw = await file.text()
      const decoded = xorDecode(raw, DECODE_KEY)
      const { records, skipped: parseSkipped } = parseRecords(decoded)

      if (records.length === 0) {
        setError(`No valid records found after decoding (${parseSkipped} lines skipped). Check the file format.`)
        setStatus('error')
        return
      }

      setSkipped(parseSkipped)
      setProgress({ done: 0, total: records.length })

      let uploaded = 0
      const errors = []

      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const batchNum = Math.floor(i / CHUNK_SIZE) + 1
        const chunk = records.slice(i, i + CHUNK_SIZE)
        try {
          const { error: upsertErr } = await supabase
            .from('customers')
            .upsert(chunk, { onConflict: 'policy_number' })
          if (upsertErr) {
            errors.push(`Batch ${batchNum}: ${upsertErr.message}`)
          } else {
            uploaded += chunk.length
          }
        } catch (err) {
          errors.push(`Batch ${batchNum}: ${err.message ?? 'unknown error'}`)
        }
        setProgress({ done: i + chunk.length, total: records.length })
      }

      setCount(uploaded)
      setBatchErrors(errors)
      setStatus('done')
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Upload failed — check the file format and try again.')
      setStatus('error')
    }
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#e4e7f0] w-full max-w-md p-8">

        {/* Header */}
        <div className="mb-7">
          <p className="text-[#e8a020] text-[11px] font-bold uppercase tracking-widest mb-1">Admin</p>
          <h1 className="text-[#0f1f3d] text-2xl font-bold">Upload Customer Data</h1>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">
            Select the encoded <span className="font-mono text-gray-500">export.txt</span> file.
            It will be XOR-decoded and upserted into the customers table.
          </p>
        </div>

        {/* File picker */}
        <label className="block mb-6 cursor-pointer">
          <span className="text-[#0f1f3d] text-sm font-semibold block mb-2">Export file</span>
          <div className={`border-2 border-dashed rounded-xl px-5 py-6 text-center transition-colors ${
            file
              ? 'border-[#0f1f3d]/25 bg-[#0f1f3d]/[0.02]'
              : 'border-[#e4e7f0] hover:border-[#0f1f3d]/20'
          }`}>
            {file ? (
              <div>
                <p className="text-[#0f1f3d] font-medium text-sm">{file.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB — tap to change
                </p>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Tap to select export.txt</p>
            )}
          </div>
          <input
            type="file"
            accept=".txt"
            className="sr-only"
            onChange={e => reset(e.target.files[0] || null)}
          />
        </label>

        {/* Action button */}
        <button
          onClick={handleUpload}
          disabled={!file || status === 'processing'}
          className="w-full bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {status === 'processing' ? 'Uploading…' : 'Decode & Upload'}
        </button>

        {/* Progress bar */}
        {status === 'processing' && (
          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Uploading records…</span>
              <span>{progress.done} / {progress.total} ({pct}%)</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#e8a020] rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'done' && (
          <div className="mt-5 space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
              <span className="text-green-500 text-lg leading-none mt-0.5">✓</span>
              <div>
                <p className="text-green-800 font-semibold text-sm">
                  {count} record{count !== 1 ? 's' : ''} uploaded
                  {skipped > 0 && `, ${skipped} skipped`}
                </p>
                <p className="text-green-600 text-xs mt-0.5">Customers table updated successfully.</p>
              </div>
            </div>
            {batchErrors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                <p className="text-amber-800 font-semibold text-sm mb-1">
                  {batchErrors.length} batch{batchErrors.length !== 1 ? 'es' : ''} failed
                </p>
                {batchErrors.map((e, i) => (
                  <p key={i} className="text-amber-700 text-xs leading-relaxed">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-red-700 font-semibold text-sm">Upload failed</p>
            <p className="text-red-500 text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
