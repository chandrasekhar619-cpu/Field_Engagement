import { supabase } from './supabaseClient'

/**
 * Update the interactions row for this link to mark it as completed with an outcome.
 * Called from customer-facing demo components once the engagement is done.
 */
export async function logOutcome(linkId, outcome) {
  if (!linkId) return
  try {
    const { error } = await supabase
      .from('interactions')
      .update({ action: 'completed', outcome })
      .eq('link_id', linkId)
    if (error) console.error('Outcome log failed:', error)
  } catch (err) {
    console.error('Outcome log failed:', err)
  }
}

/** Compact Rs. formatter for outcome strings (e.g. "Rs.1.2Cr", "Rs.42L") */
export function fmtRs(n) {
  const abs = Math.abs(n)
  if (abs >= 10_000_000) return `Rs.${(abs / 10_000_000).toFixed(1)}Cr`
  if (abs >= 100_000)    return `Rs.${(abs / 100_000).toFixed(1)}L`
  return `Rs.${Math.round(abs).toLocaleString('en-IN')}`
}
