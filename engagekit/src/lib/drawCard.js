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

const CREATIVE_THEMES = {
  Festive: {
    colors:     ['#3d1500', '#1a0800'],
    accent:     '#e8a020',
    decorEmoji: '✨',
    tagline:    'Protecting what matters most is the greatest gift.',
    subline:    'This Diwali, let your loved ones feel truly secure.',
  },
  Occasion: {
    colors:     ['#1a0a40', '#0d0d2b'],
    accent:     '#a78bfa',
    decorEmoji: '⭐',
    tagline:    'Every year you grow is another chapter worth protecting.',
    subline:    'Wishing you a year full of milestones — and the security to enjoy them.',
  },
  default: {
    colors:     ['#1a3260', '#0f1f3d'],
    accent:     '#e8a020',
    decorEmoji: '💫',
    tagline:    'The right protection changes everything.',
    subline:    'Built for the moments that matter most.',
  },
}

export function drawCreativeCard(item, rpmName, rpmDesignation) {
  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = 1100
    const ctx = canvas.getContext('2d')

    const theme = CREATIVE_THEMES[item.category] ?? CREATIVE_THEMES.default
    const [c1, c2] = theme.colors

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, 1100)
    grad.addColorStop(0, c1)
    grad.addColorStop(1, c2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, 1100)

    // Decorative circles (accent at ~10% opacity via 8-digit hex)
    ctx.fillStyle = theme.accent + '1a'
    ctx.beginPath(); ctx.arc(W - 60, 80, 130, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(60, 880, 90, 0, Math.PI * 2); ctx.fill()

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Main emoji
    ctx.font = '130px sans-serif'
    ctx.fillText(item.emoji, W / 2, 200)

    // Decor emoji
    ctx.font = '55px sans-serif'
    ctx.fillText(theme.decorEmoji, W / 2, 315)

    // "ENGAGEKIT" label
    ctx.font = '400 16px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    setLetterSpacing(ctx, '4px')
    ctx.fillText('ENGAGEKIT', W / 2, 378)
    setLetterSpacing(ctx, '0px')

    // Title (bold, accent colour)
    ctx.font = 'bold 52px system-ui, sans-serif'
    ctx.fillStyle = theme.accent
    const titleLines = wrapLines(ctx, item.title, 640)
    const titleY = 455
    titleLines.forEach((line, i) => ctx.fillText(line, W / 2, titleY + i * 68))

    // Tagline
    const taglineY = titleY + titleLines.length * 68 + 42
    ctx.font = '400 27px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    const taglines = wrapLines(ctx, theme.tagline, 580)
    taglines.forEach((line, i) => ctx.fillText(line, W / 2, taglineY + i * 42))

    // Subline
    const sublineY = taglineY + taglines.length * 42 + 28
    ctx.font = '400 21px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    wrapLines(ctx, theme.subline, 560).forEach((line, i) =>
      ctx.fillText(line, W / 2, sublineY + i * 36)
    )

    // RPM strip
    const stripY = 1010
    ctx.fillStyle = 'rgba(0,0,0,0.65)'
    ctx.fillRect(0, stripY, W, 90)

    // Avatar circle
    const ax = 64, ay = stripY + 45
    ctx.beginPath(); ctx.arc(ax, ay, 28, 0, Math.PI * 2)
    ctx.fillStyle = '#e8a020'; ctx.fill()

    // Avatar initials
    const initials = (rpmName || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    ctx.font = 'bold 18px system-ui, sans-serif'
    ctx.fillStyle = '#0f1f3d'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(initials, ax, ay)

    // RPM name
    ctx.textAlign = 'left'
    ctx.font = '600 21px system-ui, sans-serif'
    ctx.fillStyle = 'white'
    ctx.fillText(rpmName || 'Your Advisor', 108, stripY + 29)

    // RPM designation
    ctx.font = '400 17px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(rpmDesignation || 'Relationship Portfolio Manager', 108, stripY + 57)

    // EngageKit watermark
    ctx.textAlign = 'right'
    ctx.font = '400 15px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.2)'
    ctx.fillText('EngageKit', W - 30, stripY + 45)

    canvas.toBlob(
      blob => resolve(blob ? new File([blob], 'result.png', { type: 'image/png' }) : null),
      'image/png'
    )
  })
}
