const W = 800

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

function setLetterSpacing(ctx, value) {
  if ('letterSpacing' in ctx) ctx.letterSpacing = value
}

const PERSONA_COLORS = {
  A: ['#d97706', '#92400e'],  // Go-Getter: amber → dark brown
  B: ['#1d4ed8', '#1e3a8a'],  // Protector: blue → navy
  C: ['#be185d', '#831843'],  // Caregiver: rose → dark rose
  D: ['#166534', '#14532d'],  // Thinker: green → dark green
}

export function drawPersonaCard({ key, emoji, name, tagline }) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = 1000
    const ctx = canvas.getContext('2d')

    // Background gradient
    const [c1, c2] = PERSONA_COLORS[key] ?? PERSONA_COLORS['A']
    const grad = ctx.createLinearGradient(0, 0, W, 1000)
    grad.addColorStop(0, c1)
    grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, 1000)

    // Decorative circles
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath(); ctx.arc(720, 60, 120, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(80, 940, 80,  0, Math.PI * 2); ctx.fill()

    // Emoji
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = '100px sans-serif'
    ctx.fillStyle = 'white'
    ctx.fillText(emoji, W / 2, 200)

    // "YOUR MONEY PERSONA" label
    ctx.font = '600 18px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    setLetterSpacing(ctx, '3px')
    ctx.fillText('YOUR MONEY PERSONA', W / 2, 310)
    setLetterSpacing(ctx, '0px')

    // Persona name
    ctx.font = 'bold 84px system-ui, sans-serif'
    ctx.fillStyle = 'white'
    ctx.fillText(name, W / 2, 420)

    // Tagline word-wrapped
    ctx.font = '400 30px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    wrapLines(ctx, tagline, 580).forEach((line, i) =>
      ctx.fillText(line, W / 2, 510 + i * 46)
    )

    // Divider
    ctx.beginPath()
    ctx.moveTo(W / 2 - 120, 760)
    ctx.lineTo(W / 2 + 120, 760)
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Watermark
    ctx.font = '400 17px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    setLetterSpacing(ctx, '4px')
    ctx.fillText('EDELWEISS LIFE', W / 2, 840)
    setLetterSpacing(ctx, '0px')

    canvas.toBlob(
      blob => resolve(blob ? new File([blob], 'result.png', { type: 'image/png' }) : null),
      'image/png'
    )
  })
}

// Per-occasion gradients detected by title keyword, then category, then default
function getCreativeTheme(item) {
  const t = item.title.toLowerCase()
  if (t.includes('diwali'))   return { colors: ['#1a0a2e', '#2d1200'], accent: '#f97316' }
  if (t.includes('birthday')) return { colors: ['#1a0033', '#2d0055'], accent: '#e879f9' }
  if (t.includes('new year')) return { colors: ['#001a33', '#0d0d2e'], accent: '#60a5fa' }
  if (item.category === 'Festive')  return { colors: ['#1a0a00', '#2d1500'], accent: '#e8a020' }
  if (item.category === 'Occasion') return { colors: ['#0d0d2b', '#1a0a40'], accent: '#a78bfa' }
  return { colors: ['#0f1f3d', '#1a3260'], accent: '#e8a020' }
}

export function drawCreativeCard(item, rpmName, rpmDesignation) {
  return new Promise(resolve => {
    const H = 600
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    const theme = getCreativeTheme(item)
    const [c1, c2] = theme.colors

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, c1)
    grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    // Decorative circles (accent at ~13% opacity)
    ctx.fillStyle = theme.accent + '22'
    ctx.beginPath(); ctx.arc(W - 50, 50,  90, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(50,     450, 65, 0, Math.PI * 2); ctx.fill()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Main emoji (80px as specified)
    ctx.font = '80px sans-serif'
    ctx.fillText(item.emoji, W / 2, 125)

    // Title — bold, white, word-wrapped, vertically centred around y=235
    ctx.font = 'bold 44px system-ui, sans-serif'
    ctx.fillStyle = 'white'
    const titleLines = wrapLines(ctx, item.title, 680)
    const titleY = 235 - ((titleLines.length - 1) * 58) / 2
    titleLines.forEach((line, i) => ctx.fillText(line, W / 2, titleY + i * 58))

    // "Edelweiss Life Insurance" subtitle
    ctx.font = '400 18px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText('Edelweiss Life Insurance', W / 2, titleY + (titleLines.length - 1) * 58 + 54)

    // Bottom strip
    const stripY = 505
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, stripY, W, H - stripY)

    // Avatar circle
    const ax = 54, ay = stripY + 47
    ctx.beginPath(); ctx.arc(ax, ay, 22, 0, Math.PI * 2)
    ctx.fillStyle = '#e8a020'; ctx.fill()

    // Avatar initials
    const initials = (rpmName || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.fillStyle = '#0f1f3d'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, ax, ay)

    // RPM name
    ctx.textAlign = 'left'
    ctx.font = '600 17px system-ui, sans-serif'
    ctx.fillStyle = 'white'
    ctx.fillText(rpmName || 'Your Advisor', 92, stripY + 33)

    // RPM designation
    ctx.font = '400 14px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(rpmDesignation || 'Relationship Portfolio Manager', 92, stripY + 59)

    // "Edelweiss Life" watermark (right)
    ctx.textAlign = 'right'
    ctx.font = '400 13px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.25)'
    ctx.fillText('Edelweiss Life', W - 28, stripY + 47)

    canvas.toBlob(
      blob => resolve(blob ? new File([blob], 'result.png', { type: 'image/png' }) : null),
      'image/png'
    )
  })
}
