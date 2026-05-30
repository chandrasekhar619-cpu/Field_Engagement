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

// Parse decoded text — each line: policy_number,name,issue_date
function parseRecords(text) {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .flatMap(line => {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length < 3 || !parts[0]) return []
      const [policy_number, name, issue_date] = parts
      return [{ policy_number, name: name || null, issue_date: issue_date || null }]
    })
}

export default function AdminUpload() {
  const { user, authLoading } = useAuth()

  const [file,     setFile]     = useState(null)
  const [status,   setStatus]   = useState(null)   // null | 'processing' | 'done' | 'error'
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [count,    setCount]    = useState(0)
  const [error,    setError]    = useState('')

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
    setProgress({ done: 0, total: 0 })
  }

  async function handleUpload() {
    if (!file || status === 'processing') return
    setStatus('processing')
    setError('')

    try {
      const raw = await file.text()
      const decoded = xorDecode(raw, DECODE_KEY)
      const records = parseRecords(decoded)

      if (records.length === 0) {
        setError('No valid records found after decoding. Check the file format.')
        setStatus('error')
        return
      }

      setProgress({ done: 0, total: records.length })

      let uploaded = 0
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE)
        const { error: upsertErr } = await supabase
          .from('customers')
          .upsert(chunk, { onConflict: 'policy_number' })
        if (upsertErr) throw upsertErr
        uploaded += chunk.length
        setProgress({ done: uploaded, total: records.length })
      }

      setCount(uploaded)
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
          <div className="mt-5 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
            <span className="text-green-500 text-lg leading-none mt-0.5">✓</span>
            <div>
              <p className="text-green-800 font-semibold text-sm">{count} records uploaded</p>
              <p className="text-green-600 text-xs mt-0.5">Customers table updated successfully.</p>
            </div>
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
