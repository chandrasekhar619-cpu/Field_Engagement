export function toIST(utcString) {
  if (!utcString) return ''
  return new Date(utcString).toLocaleString('en-IN', {
    timeZone:  'Asia/Kolkata',
    day:       '2-digit',
    month:     'short',
    year:      'numeric',
    hour:      '2-digit',
    minute:    '2-digit',
    hour12:    true,
  })
}

export function toISTDate(utcString) {
  if (!utcString) return ''
  return new Date(utcString).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day:      '2-digit',
    month:    'short',
    year:     'numeric',
  })
}
