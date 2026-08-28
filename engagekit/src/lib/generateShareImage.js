import { drawCreativeCard } from './drawCard'

const W = 800
const H = 600
const PAD = 30

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

// Config per engagement type — bg, radial glow colour/position, headline, subtext
const TYPE_CONFIG = {
  'quiz': {
    bg:             '#0a1628',
    gradientColor:  '#e8a020',
    gradientPos:    [580, 80],
    gradientRadius: 380,
    headline:       "What's your money personality?",
    subtext:        '4 quick questions. Surprisingly accurate.',
  },
  'fire-calculator': {
    bg:             '#120800',
    gradientColor:  '#f97316',
    gradientPos:    [400, 100],
    gradientRadius: 360,
    headline:       'When can you actually retire?',
    subtext:        'Find out in 2 minutes.',
  },
  'protection-gap': {
    bg:             '#080e1e',
    gradientColor:  '#3b82f6',
    gradientPos:    [200, 100],
    gradientRadius: 380,
    headline:       'Is your family fully covered?',
    subtext:        'A quick check that could change everything.',
  },
  'poll': {
    bg:             '#0d0a1a',
    gradientColor:  '#8b5cf6',
    gradientPos:    [400, 200],
    gradientRadius: 350,
    headline:       'Quick question for you',
    subtext:        'What would you do with Rs.1 lakh?',
  },
  'mood': {
    bg:             '#1a0808',
    gradientColor:  '#f43f5e',
    gradientPos:    [400, 150],
    gradientRadius: 360,
    headline:       'How are you feeling about money?',
    subtext:        'One tap. No wrong answers.',
  },
  'life-word': {
    bg:             '#080f08',
    gradientColor:  '#22c55e',
    gradientPos:    [400, 100],
    gradientRadius: 380,
    headline:       "Today's Life Word",
    subtext:        'Can you guess the financial term?',
    grid:           true,
  },
}

function drawEngagementCard(item, rpmName) {
  return new Promise(resolve => {
    const config = TYPE_CONFIG[item.demoType]
    if (!config) { resolve(null); return }

    const canvas = document.createElement('canvas')
    canvas.width  = W
    canvas.height = H
    const ctx = canvas.getContext('2d')

    // Dark base
    ctx.fillStyle = config.bg
    ctx.fillRect(0, 0, W, H)

    // Radial glow
    const [gx, gy] = config.gradientPos
    const radGrad = ctx.createRadialGradient(gx, gy, 0, gx, gy, config.gradientRadius)
    radGrad.addColorStop(0,   config.gradientColor + '44')
    radGrad.addColorStop(0.6, config.gradientColor + '18')
    radGrad.addColorStop(1,   config.gradientColor + '00')
    ctx.fillStyle = radGrad
    ctx.fillRect(0, 0, W, H)

    // Life Word: faint 5×6 Wordle grid as background decoration
    if (config.grid) {
      const cell = 38, gap = 6
      const gw = 5 * cell + 4 * gap  // 214
      const gh = 6 * cell + 5 * gap  // 258
      const sx = (W - gw) / 2
      const sy = (H - gh) / 2 - 20
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1.5
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
          ctx.strokeRect(sx + col * (cell + gap), sy + row * (cell + gap), cell, cell)
        }
      }
    }

    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    // Engagement emoji (large, top-centre)
    ctx.font = '80px sans-serif'
    ctx.fillText(item.emoji, W / 2, 145)

    // Headline — gold, bold, word-wrapped, vertically centred around y=265
    ctx.font      = 'bold 46px system-ui, sans-serif'
    ctx.fillStyle = '#e8a020'
    const headLines  = wrapLines(ctx, config.headline, W - PAD * 2)
    const headStartY = 265 - ((headLines.length - 1) * 62) / 2
    headLines.forEach((line, i) => ctx.fillText(line, W / 2, headStartY + i * 62))

    // Subtext — white, below headline
    const subStartY = headStartY + (headLines.length - 1) * 62 + 50
    ctx.font      = '400 25px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    wrapLines(ctx, config.subtext, W - PAD * 2 - 60).forEach((line, i) =>
      ctx.fillText(line, W / 2, subStartY + i * 38)
    )

    // Bottom attribution
    ctx.font      = '400 15px system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(`Shared by ${rpmName}`, W / 2, 565)

    canvas.toBlob(
      blob => resolve(blob ? new File([blob], 'share.png', { type: 'image/png' }) : null),
      'image/png'
    )
  })
}

// Public entry point — creatives delegate to the existing drawCreativeCard
export function generateShareImage(item, rpmName, rpmDesignation) {
  if (item.shareImageSrc) {
    return fetch(item.shareImageSrc)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load share image: ${response.status}`)
        return response.blob()
      })
      .then(blob => new File([blob], 'raksha-bandhan.png', { type: blob.type || 'image/png' }))
  }
  if (item.demoType === 'creative') {
    return drawCreativeCard(item, rpmName, rpmDesignation)
  }
  return drawEngagementCard(item, rpmName)
}
