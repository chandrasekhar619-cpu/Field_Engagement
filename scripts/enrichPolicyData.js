// enrichPolicyData.js
// Reads policy_data_clean.csv and upserts into Supabase customers table.
// Run from the engagekit directory: node ..\scripts\enrichPolicyData.js

const https    = require('https')
const fs       = require('fs')
const readline = require('readline')
const path     = require('path')

// ── Config ────────────────────────────────────────────────────────────────────

const CSV_PATH  = 'C:\\Users\\chand\\Documents\\Field Engagement\\policy_data_clean.csv'
const ENV_PATH  = path.join(__dirname, '../engagekit/.env')
const BATCH     = 1000

// ── Read .env ─────────────────────────────────────────────────────────────────

const env = {}
fs.readFileSync(ENV_PATH, 'utf8').split('\n').forEach(line => {
  const eq = line.indexOf('=')
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const ANON_KEY     = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

// ── Supabase upsert via REST API ──────────────────────────────────────────────

function upsertBatch(records) {
  return new Promise((resolve, reject) => {
    const body    = JSON.stringify(records)
    const parsed  = new URL('/rest/v1/customers', SUPABASE_URL)

    const options = {
      hostname: parsed.hostname,
      path:     parsed.pathname + '?on_conflict=policy_number',
      method:   'POST',
      headers:  {
        'apikey':         ANON_KEY,
        'Authorization':  `Bearer ${ANON_KEY}`,
        'Content-Type':   'application/json',
        'Prefer':         'resolution=merge-duplicates,return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    }

    const req = https.request(options, res => {
      let raw = ''
      res.on('data', c => raw += c)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve()
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 300)}`))
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Parse CSV ─────────────────────────────────────────────────────────────────

async function parseCSV() {
  const records = []
  const rl = readline.createInterface({
    input:      fs.createReadStream(CSV_PATH, 'utf8'),
    crlfDelay:  Infinity,
  })

  let header = true
  for await (const line of rl) {
    if (header) { header = false; continue }
    const trimmed = line.trim()
    if (!trimmed) continue

    const parts = trimmed.split(',')
    // policy_number, premium_due_date, proposer_id, product_category, product_name, channel
    const [policy_number, premium_due_date, proposer_id, product_category, product_name, channel] = parts

    if (!policy_number?.trim()) continue

    records.push({
      policy_number:    policy_number.trim(),
      premium_due_date: premium_due_date?.trim()   || null,
      proposer_id:      proposer_id?.trim()         || null,
      policy_type:      product_category?.trim()    || null,
      product_name:     product_name?.trim()        || null,
      channel:          channel?.trim()             || null,
      customer_master_id: proposer_id?.trim()       || null,
    })
  }

  return records
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('Reading CSV...')
  const records     = await parseCSV()
  const totalBatches = Math.ceil(records.length / BATCH)

  console.log(`Parsed ${records.length.toLocaleString()} records. Upserting in ${totalBatches} batch${totalBatches === 1 ? '' : 'es'} of ${BATCH}...\n`)

  let done = 0
  for (let i = 0; i < records.length; i += BATCH) {
    const batchNum = Math.floor(i / BATCH) + 1
    const chunk    = records.slice(i, i + BATCH)
    await upsertBatch(chunk)
    done += chunk.length
    console.log(`Batch ${batchNum}/${totalBatches} — ${chunk.length.toLocaleString()} records updated`)
  }

  console.log(`\nDone. ${done.toLocaleString()} total records upserted.`)
}

run().catch(err => {
  console.error('\nScript failed:', err.message)
  process.exit(1)
})
