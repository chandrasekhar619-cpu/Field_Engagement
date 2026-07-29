const MESSAGES = {
  quiz: {
  'Go-Getter': (name, link, rpmName) => `Hi ${name},

I wanted to share a quick activity with you: How do you think about money?
It is a 4-question quiz that takes less than 2 minutes.

Please try it here:

${link}

Best regards,

${rpmName}
(Service Manager)
Edelweiss Life Insurance Company`,
  'Protector': (name, link, rpmName) => `Hi ${name},

I wanted to share a quick activity with you: How do you think about money?
It is a 4-question quiz that takes less than 2 minutes.

Please try it here:

${link}

Best regards,

${rpmName}
(Service Manager)
Edelweiss Life Insurance Company`,
  'Caregiver': (name, link, rpmName) => `Hi ${name},

I wanted to share a quick activity with you: How do you think about money?
It is a 4-question quiz that takes less than 2 minutes.

Please try it here:

${link}

Best regards,

${rpmName}
(Service Manager)
Edelweiss Life Insurance Company`,
  'Thinker':   (name, link, rpmName) => `Hi ${name},

I wanted to share a quick activity with you: How do you think about money?
It is a 4-question quiz that takes less than 2 minutes.

Please try it here:

${link}

Best regards,

${rpmName}
(Service Manager)
Edelweiss Life Insurance Company`,
  generic:     (name, link, rpmName) => `Hi ${name},

I wanted to share a quick activity with you: How do you think about money?
It is a 4-question quiz that takes less than 2 minutes.

Please try it here:

${link}

Best regards,

${rpmName}
(Service Manager)
Edelweiss Life Insurance Company`,
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
  'financial-playbook-kids': {
    generic: (name, link) => `Hi ${name},

As parents, teaching our children how to make smart money choices early sets them up for lifelong independence.

We've put together a quick 1-minute guide featuring 5 essential financial rules to help pass down smart money habits to the next generation.

Read it here: ${link}

Feel free to share this with anyone in your network who might benefit from it!`,
  },
}

// Persona-specific messages for word-hunt and book-insight
const PERSONA_MESSAGES = {
  'word-hunt': {
    'Go-Getter': (name, link, rpmName) => `Hi ${name},

Challenge accepted? This word hunt puzzle tests your financial knowledge in under a minute. Speed and smarts required — let's see if you can crack all three.

Give it a try now:

🧩 ${link}

Best regards,

${rpmName}`,
    'Protector': (name, link, rpmName) => `Hi ${name},

We've created this word hunt to help you learn 3 key wealth protection concepts. Understanding these terms ensures your family's financial security.

Give it a try now:

🧩 ${link}

Best regards,

${rpmName}`,
    'Caregiver': (name, link, rpmName) => `Hi ${name},

A fun way to learn important financial concepts — this word hunt breaks down wealth ideas in a gentle, gamified format. Perfect for growing your money knowledge.

Give it a try now:

🧩 ${link}

Best regards,

${rpmName}`,
    'Thinker': (name, link, rpmName) => `Hi ${name},

Designed for the analytical mind — this word hunt challenges you to find 3 hidden financial terms in a logical puzzle grid. Data-backed financial learning.

Give it a try now:

🧩 ${link}

Best regards,

${rpmName}`,
    generic: (name, link, rpmName) => `Hi ${name},

We have designed this interactive word hunt puzzle and wanted to share it with you. It will take less than a minute to play and breaks down core wealth concepts through a simple, gamified crossword grid.

Give it a try now:

🧩 ${link}

Best regards,

${rpmName}`
  },
  'book-insight': {
    'Go-Getter': (name, link, rpmName) => `Hi ${name},

  Thought I'd share a quick 60-sec read from "I Will Teach You To Be Rich" on how automation can make savings easier.
  Hope you enjoy it.

  📲 ${link}

  Best regards,

  ${rpmName}`,
    'Protector': (name, link, rpmName) => `Hi ${name},

  Thought I'd share a quick 60-sec read from "I Will Teach You To Be Rich" on how automation can make savings easier.
  Hope you enjoy it.

  📲 ${link}

  Best regards,

  ${rpmName}`,
    'Caregiver': (name, link, rpmName) => `Hi ${name},

  Thought I'd share a quick 60-sec read from "I Will Teach You To Be Rich" on how automation can make savings easier.
  Hope you enjoy it.

  📲 ${link}

  Best regards,

  ${rpmName}`,
    'Thinker': (name, link, rpmName) => `Hi ${name},

  Thought I'd share a quick 60-sec read from "I Will Teach You To Be Rich" on how automation can make savings easier.
  Hope you enjoy it.

  📲 ${link}

  Best regards,

  ${rpmName}`,
    generic: (name, link, rpmName) => `Hi ${name},

  Thought I'd share a quick 60-sec read from "I Will Teach You To Be Rich" on how automation can make savings easier.
  Hope you enjoy it.

  📲 ${link}

  Best regards,

  ${rpmName}`
  },
  'mood': {
    'Go-Getter': (name, link, rpmName) => `Hi ${name},

This is a quick 4-question profile assessment for you. It will take less than a minute to complete and instantly shows your natural money style.

Let me know if it matches how you think. Give it a try now:

📊 ${link}

Best regards,

${rpmName}`,
    'Protector': (name, link, rpmName) => `Hi ${name},

This is a quick 4-question profile assessment for you. It will take less than a minute to complete and helps you understand your natural approach to money and security.

Let me know if it resonates with you. Give it a try now:

📊 ${link}

Best regards,

${rpmName}`,
    'Caregiver': (name, link, rpmName) => `Hi ${name},

This is a quick 4-question profile assessment for you. It will take less than a minute to complete and reveals your natural style in caring for money and loved ones.

Let me know what you think. Give it a try now:

📊 ${link}

Best regards,

${rpmName}`,
    'Thinker': (name, link, rpmName) => `Hi ${name},

This is a quick 4-question profile assessment for you. It will take less than a minute to complete and maps your natural thinking style about money.

See if it aligns with how you see things. Give it a try now:

📊 ${link}

Best regards,

${rpmName}`,
    generic: (name, link, rpmName) => `Hi ${name},

This is a quick 4-question profile assessment for you. It will take less than a minute to complete and instantly maps out your natural style to a financial personality profile.

Do let me know if it relates to your financial personality. Give it a try now:

📊 ${link}

Best regards,

${rpmName}`
  },
  'renewal-card': {
    'Go-Getter': (name, link, rpmName) => `Hi ${name} 👋 Your policy renewal is coming up — here's a quick update put together just for you.

${link}

Best regards,

${rpmName}`,
    'Protector': (name, link, rpmName) => `Hi ${name} 👋 Wanted to make sure your family's cover stays uninterrupted. Here's your renewal update.

${link}

Best regards,

${rpmName}`,
    'Caregiver': (name, link, rpmName) => `Hi ${name} 👋 Just checking in — your renewal is coming up and I've put this together for you.

${link}

Best regards,

${rpmName}`,
    'Thinker': (name, link, rpmName) => `Hi ${name} 👋 Your renewal details are ready for review. Take a look when you get a moment.

${link}

Best regards,

${rpmName}`,
    generic: (name, link, rpmName) => `Hi ${name} 👋 Your policy renewal is coming up. Here's a quick update for you.

${link}

Best regards,

${rpmName}`
  }
}

function stripExistingSignature(message = '') {
  // Remove any trailing "Best regards" block so we can enforce one standard signature.
  return message.replace(/\n+\s*Best regards,?\s*\n+[\s\S]*$/i, '').trim()
}

function buildSignature(rpmName) {
  const safeRpmName = rpmName || 'Your Advisor'
  return `Best regards,\n\n${safeRpmName}\n(Service Manager)\nEdelweiss Life Insurance`
}

function withStandardSignature(message, rpmName) {
  const body = stripExistingSignature(message)
  return `${body}\n\n${buildSignature(rpmName)}`
}

export function getWhatsAppMessage(demoType, persona, customerName, link, rpmName) {
  const variants = MESSAGES[demoType] || MESSAGES.creative
  const fn = (persona && variants[persona]) ? variants[persona] : variants.generic
  
  // For word-hunt, book-insight, mood, and renewal-card, use persona-specific multi-line format with RPM name
  if ((demoType === 'word-hunt' || demoType === 'book-insight' || demoType === 'mood' || demoType === 'renewal-card') && rpmName) {
    const personaMessages = PERSONA_MESSAGES[demoType]
    const messageFn = (persona && personaMessages[persona]) ? personaMessages[persona] : personaMessages.generic
    return withStandardSignature(messageFn(customerName || 'there', link, rpmName), rpmName)
  }

  return withStandardSignature(fn(customerName || 'there', link, rpmName || 'Your Advisor'), rpmName || 'Your Advisor')
}
