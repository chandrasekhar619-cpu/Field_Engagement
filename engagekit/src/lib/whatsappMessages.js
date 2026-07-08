const MESSAGES = {
  quiz: {
    'Go-Getter': (name, link) => `Hi ${name}! Here's a quick quiz that'll show you just how much of a Go-Getter you are with money. 2 minutes. ${link}`,
    'Protector': (name, link) => `Hi ${name}! This quiz gives you a surprising read on how you think about protecting what matters most. ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! Something fun — a quick quiz on how you think about money and the people you love. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! Here's a data-backed personality quiz on money. Curious what it says about you. ${link}`,
    generic:     (name, link) => `Hi ${name}! Here's a quick 4-question quiz that tells you your money personality — surprisingly accurate. ${link}`,
  },
  'fire-calculator': {
    'Go-Getter': (name, link) => `Hi ${name}! This shows you exactly when you can stop working and start living fully. ${link}`,
    'Protector': (name, link) => `Hi ${name}! Here's a tool to plan your retirement so your family is always secure. ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! This shows you how to build enough so the people who depend on you always have what they need. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! Retirement corpus calculator. Enter your numbers and see the projection. ${link}`,
    generic:     (name, link) => `Hi ${name}! This tool shows you exactly when you could retire based on your savings. ${link}`,
  },
  'protection-gap': {
    'Go-Getter': (name, link) => `Hi ${name}! Quick check — is your cover keeping up with everything you've built? ${link}`,
    'Protector': (name, link) => `Hi ${name}! Here's a calculator to check if your family is fully covered if something unexpected happens. ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! This shows whether the people you love would be taken care of if you weren't around. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! Protection gap calculator — income, liabilities, current cover. See the number. ${link}`,
    generic:     (name, link) => `Hi ${name}! A quick check to see if your life cover is adequate for your family. ${link}`,
  },
  poll: {
    'Go-Getter': (name, link) => `Hi ${name}! One quick question — I think I already know your answer. ${link}`,
    'Protector': (name, link) => `Hi ${name}! One quick question about money. Curious what you'd do. ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! A fun one-tap question. Takes 5 seconds. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! One question. No right or wrong. Just curious about your instinct. ${link}`,
    generic:     (name, link) => `Hi ${name}! One quick question — curious what you think. ${link}`,
  },
  mood: {
    'Go-Getter': (name, link) => `Hi ${name}! How's the financial energy right now? One tap to tell me. ${link}`,
    'Protector': (name, link) => `Hi ${name}! Quick check-in — how are you feeling about money this month? ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! How are you feeling about things right now? A quick one-tap check-in. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! One-tap check-in on your current money mindset. ${link}`,
    generic:     (name, link) => `Hi ${name}! How are you feeling about money right now? One tap. ${link}`,
  },
  'life-word': {
    'Go-Getter': (name, link) => `Hi ${name}! Today's Life Word — can you crack it before your coffee gets cold? ${link}`,
    'Protector': (name, link) => `Hi ${name}! Today's Life Word — a financial term that every planner should know. ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! Something fun for today — a financial word game that explains a term simply. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! Today's Life Word — a financial term, Wordle-style. Worth knowing. ${link}`,
    generic:     (name, link) => `Hi ${name}! Here's today's Life Word — a financial term explained simply through a quick game. ${link}`,
  },
  'renewal-card': {
    'Go-Getter': (name, link) => `Hi ${name} 👋 Your policy renewal is coming up — here's a quick update put together just for you. ${link}`,
    'Thinker':   (name, link) => `Hi ${name} 👋 Your renewal details are ready for review. Take a look when you get a moment. ${link}`,
    'Protector': (name, link) => `Hi ${name} 👋 Wanted to make sure your family's cover stays uninterrupted. Here's your renewal update. ${link}`,
    'Caregiver': (name, link) => `Hi ${name} 👋 Just checking in — your renewal is coming up and I've put this together for you. ${link}`,
    generic:     (name, link) => `Hi ${name} 👋 Your policy renewal is coming up. Here's a quick update for you. ${link}`,
  },
  creative: {
    'Go-Getter': (name, link) => `Hi ${name}! Sharing this with you — keep winning. ${link}`,
    'Protector': (name, link) => `Hi ${name}! Sharing this with you and your family. ${link}`,
    'Caregiver': (name, link) => `Hi ${name}! Thought of you and wanted to share this. ${link}`,
    'Thinker':   (name, link) => `Hi ${name}! Sharing this with you. ${link}`,
    generic:     (name, link) => `Hi ${name}! Sharing this with you — hope it brings a smile. ${link}`,
  },
}

export function getWhatsAppMessage(demoType, persona, customerName, link, rpmName) {
  const variants = MESSAGES[demoType] || MESSAGES.creative
  const fn = (persona && variants[persona]) ? variants[persona] : variants.generic
  
  // For book-insight, use the special multi-line format with RPM name
  if (demoType === 'book-insight' && rpmName) {
    return `Hello,

Wanted to share this quick 60-second read with you! It's a clean, zero-fluff visual breakdown of how smart financial habits can insulate your family's long-term capital goals.

📲 ${link}

Best regards,

${rpmName}`
  }
  
  return fn(customerName || 'there', link)
}
