import { useState, useEffect } from 'react'
import FeedbackSection from '../FeedbackSection'
import Toast from '../Toast'
import { logOutcome } from '../../lib/logOutcome'
import { drawPersonaCard } from '../../lib/drawCard'
import { supabase } from '../../lib/supabaseClient'

const QUESTIONS = [
  {
    text: "When it comes to money, what matters most to you?",
    options: [
      "Building wealth and making the most of every opportunity",
      "Stability and long-term security for my family",
      "Taking care of the people who depend on me",
      "Understanding exactly what I have and making smart, informed choices",
    ],
  },
  {
    text: "How do you handle a big financial decision?",
    options: [
      "I trust my instincts — I back myself to figure it out",
      "I plan ahead so I am never caught off guard",
      "I think about how it will affect the people I care about",
      "I do my homework and decide only when I am fully informed",
    ],
  },
  {
    text: "How do you feel about financial risk?",
    options: [
      "I embrace it — risk is how you grow",
      "I manage it carefully — I would rather be safe than sorry",
      "It worries me, especially if it could affect my family",
      "I take calculated risks only after understanding every angle",
    ],
  },
  {
    text: "Which of these sounds most like you?",
    options: [
      "I set ambitious targets and push myself to reach them",
      "I am the person my family relies on to have things sorted",
      "Everything I do financially is ultimately for the people I love",
      "I trust my own research and analysis over anyone else's advice",
    ],
  },
]

const PERSONAS = {
  A: {
    name: 'Go-Getter', emoji: '🚀',
    headerBg: 'bg-orange-50', accent: 'text-orange-600',
    gradient: 'from-orange-500 to-rose-500',
    tagline: 'Moves fast, backs every decision, and never waits for the perfect moment.',
    waMessage: "I just found out I'm a Go-Getter 🚀 — someone who moves fast, backs every decision, and never waits for the perfect moment. What's your money personality?",
    paragraphs: [
      "You move fast and you back yourself. When opportunity shows up, your instinct is to act — not wait. That energy is rare.",
      "You're not reckless — you're decisive. The only real risk is moving without a plan behind you.",
      "The right plan for you grows as fast as you do, while keeping everything you're building safe.",
    ],
    content: n => ({
      paragraphs: [
        `${n} does not wait for the good things in life. They go after them. Whether it is the next career move, the next investment, or the next upgrade, ${n} has already thought about it — and has a plan to get there.`,
        `Money, for ${n}, is not something to be handled carefully. It is something to be used well. They invest not out of fear but out of ambition — not saving for a rainy day, but building towards something specific.`,
        `People like ${n} make bold decisions, back themselves when others hesitate, and find ways to grow their wealth while still enjoying the journey. The plan is not a safety net. It is part of the vision.`,
      ],
      closing: `The right plan for someone like ${n} does not slow them down — it keeps everything they are building safe while they keep moving.`,
    }),
  },
  B: {
    name: 'Protector', emoji: '🛡️',
    headerBg: 'bg-blue-50', accent: 'text-blue-600',
    gradient: 'from-blue-600 to-indigo-700',
    tagline: 'Knows where every rupee goes and makes sure it earns its place.',
    waMessage: "I just found out I'm a Protector 🛡️ — someone who knows where every rupee goes and makes sure it earns its place. What's your money personality?",
    paragraphs: [
      "You take money seriously — not from fear, but from responsibility. You know where every rupee is.",
      "Your discipline is your greatest asset. While others sprint and stumble, you build reserves and finish strong.",
      "You deserve a plan that rewards your consistency — steady, guaranteed, and exactly as reliable as you are.",
    ],
    content: n => ({
      paragraphs: [
        `Behind every important decision ${n} makes, there is a quiet question: will this keep my family safe? That question guides how they spend, save, and plan.`,
        `${n} thinks in decades, not months. They build methodically — not because they fear the future, but because they respect it. They know that real security is not luck. It is preparation, done consistently and without fanfare.`,
        `People like ${n} are the ones their families lean on. Not because they are loud about it — but because they have already taken care of it.`,
      ],
      closing: `For someone like ${n}, a good financial plan is not a product. It is peace of mind — quietly doing its job in the background.`,
    }),
  },
  C: {
    name: 'Caregiver', emoji: '🤝',
    headerBg: 'bg-green-50', accent: 'text-green-600',
    gradient: 'from-emerald-600 to-teal-700',
    tagline: "Always puts family first — security isn't a choice, it's a commitment.",
    waMessage: "I just found out I'm a Caregiver 🤝 — someone who always puts family first, because security isn't a choice, it's a commitment. What's your money personality?",
    paragraphs: [
      "For you, every financial decision starts with one question: how does this affect my family?",
      "You pick stability over speed and peace over profit. That quiet instinct has protected your loved ones more than you know.",
      "You need a plan that works for your family while you're here — and especially when you're not.",
    ],
    content: n => ({
      paragraphs: [
        `For ${n}, money is not the point. The people in their life are. Every financial decision they make traces back to someone they love — a child's future, a parent's comfort, a partner's peace of mind.`,
        `${n} moves on instinct and love. And that instinct is almost always right. When they put something aside, it is not for themselves — it is for the moment when someone they love needs it most.`,
        `People like ${n} give more than they take, plan more than they talk, and care more deeply than most people ever will.`,
      ],
      closing: `The best thing ${n} can do for the people they love is make sure the plan is in place — so love never has to worry about money.`,
    }),
  },
  D: {
    name: 'Thinker', emoji: '🔍',
    headerBg: 'bg-purple-50', accent: 'text-purple-600',
    gradient: 'from-purple-700 to-violet-800',
    tagline: 'Engineers every decision, stress-tests every outcome, and acts with certainty.',
    waMessage: "I just found out I'm a Thinker 🔍 — someone who engineers every decision, stress-tests every outcome, and always acts with certainty. What's your money personality?",
    paragraphs: [
      "You don't make financial decisions — you engineer them. Research comes first, always.",
      "Your rigour is rare. When you commit, it's because you've already stress-tested the outcome.",
      "You need a partner who respects your intelligence — full data, full transparency, zero pressure.",
    ],
    content: n => ({
      paragraphs: [
        `${n} does not make decisions on instinct. They make them on evidence. Before any choice — financial or otherwise — they have already read, compared, questioned, and concluded. By the time they act, they are certain.`,
        `This is not caution. It is precision. ${n} trusts data over opinions, specifics over generalities, and their own research over anyone's recommendation.`,
        `People like ${n} build wealth quietly and deliberately. No shortcuts, no noise — just a clear-eyed understanding of where they are, where they want to be, and the most intelligent path between the two.`,
      ],
      closing: `For someone like ${n}, the right financial plan is one they have looked at closely, understood fully, and chosen deliberately. Nothing less.`,
    }),
  },
}

function getPersona(answers) {
  const counts = { A: 0, B: 0, C: 0, D: 0 }
  answers.forEach(a => counts[a]++)
  return ['A', 'B', 'C', 'D'].reduce((best, k) => counts[k] > counts[best] ? k : best, 'A')
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function QuizDemo({ onShare, onStep, isCustomerView = false, linkId, customerName, customerId: customerIdProp }) {

  const [currentQ,  setCurrentQ]  = useState(0)
  const [answers,   setAnswers]   = useState([])
  const [selected,  setSelected]  = useState(null)
  const [phase,     setPhase]     = useState('quiz')
  const [shareFile, setShareFile] = useState(null)
  const [toast,     setToast]     = useState(null)

  // Log outcome when result screen appears in customer mode
  useEffect(() => {
    if (phase !== 'result' || !isCustomerView || !linkId) return
    const personaName = PERSONAS[getPersona(answers)].name
    logOutcome(linkId, personaName)

    ;(async () => {
      // Use customer_id passed directly from CustomerLanding; fall back to links lookup
      let customerId = customerIdProp
      if (!customerId) {
        const { data: link, error: linkErr } = await supabase
          .from('links').select('customer_id').eq('id', linkId).single()
        if (linkErr) { console.error('Persona save — link fetch failed:', linkErr); return }
        customerId = link?.customer_id
      }
      if (!customerId) { console.log('Persona save — no customer_id'); return }

      // Update this specific customer record
      const { data: customerData, error: updateErr } = await supabase
        .from('customers')
        .update({ persona: personaName })
        .eq('id', customerId)
        .select('customer_master_id')
        .single()
      if (updateErr) { console.error('Persona save failed:', updateErr); return }
      console.log('Persona saved:', personaName, '→ customer', customerId)

      // Propagate to all other policies for the same person
      if (customerData?.customer_master_id) {
        const { error: masterErr } = await supabase
          .from('customers')
          .update({ persona: personaName })
          .eq('customer_master_id', customerData.customer_master_id)
        if (masterErr) console.error('Persona propagation failed:', masterErr)
        else console.log('Persona propagated to all records with master_id:', customerData.customer_master_id)
      }
    })()
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Draw the persona card programmatically as soon as the result screen mounts
  useEffect(() => {
    if (phase !== 'result' || !isCustomerView) return
    let cancelled = false

    const personaKey = getPersona(answers)
    const p = PERSONAS[personaKey]
    drawPersonaCard({ key: personaKey, emoji: p.emoji, name: p.name, tagline: p.tagline })
      .then(file => { if (!cancelled && file) setShareFile(file) })
      .catch(err => console.error('[QuizDemo] drawPersonaCard failed:', err))

    return () => { cancelled = true }
  }, [phase, isCustomerView]) // eslint-disable-line react-hooks/exhaustive-deps

  function pick(idx) {
    if (selected !== null) return
    setSelected(idx)
    onStep?.({ step: `Q${currentQ + 1}`, selection: QUESTIONS[currentQ].options[idx], timestamp: new Date().toISOString() })
    setTimeout(() => {
      const next = [...answers, ['A', 'B', 'C', 'D'][idx]]
      setAnswers(next)
      setSelected(null)
      if (currentQ + 1 < QUESTIONS.length) {
        setCurrentQ(q => q + 1)
      } else {
        const personaKey = getPersona(next)
        onStep?.({ step: 'result', persona: PERSONAS[personaKey].name, timestamp: new Date().toISOString() })
        setPhase('result')
      }
    }, 400)
  }

  /* ── Result ──────────────────────────────────────────────────────────── */
  if (phase === 'result') {
    const p = PERSONAS[getPersona(answers)]

    function downloadAndToast(file) {
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url; a.download = file.name
      document.body.appendChild(a); a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast('Image saved — attach it in WhatsApp')
    }

    function handleShareResult() {
      console.log('[QuizDemo] shareFile at tap time:', shareFile)
      if (!shareFile) {
        setToast('Could not prepare image — try again')
        return
      }

      if (navigator.share && navigator.canShare({ files: [shareFile] })) {
        // Native share sheet — called synchronously from tap, gesture is intact
        navigator.share({ files: [shareFile], text: p.waMessage })
          .catch(err => { if (err.name !== 'AbortError') downloadAndToast(shareFile) })
      } else {
        downloadAndToast(shareFile)
      }
    }

    /* Customer-facing result */
    if (isCustomerView) {
      const firstName = customerName?.split(' ')[0] || 'You'
      const personaContent = p.content(firstName)

      return (
        <div className="flex flex-col">
          {toast && <Toast message={toast} onDone={() => setToast(null)} />}
          <div className="max-w-sm mx-auto w-full px-5 py-6 flex flex-col gap-5">

            {/* Shareable persona card */}
            <div
              className={`bg-gradient-to-br ${p.gradient} rounded-2xl p-6 text-center shadow-xl relative overflow-hidden`}
            >
              <div className="absolute top-2 right-2 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
              <div className="absolute bottom-6 left-3 w-12 h-12 rounded-full bg-white/10 pointer-events-none" />

              <span className="text-6xl block mb-3 relative z-10">{p.emoji}</span>
              <p className="text-white/60 text-[10px] uppercase tracking-widest mb-1 relative z-10">
                Your money persona
              </p>
              <h2 className="text-white text-3xl font-bold relative z-10">{p.name}</h2>
              <p className="text-white/80 text-sm mt-3 leading-relaxed max-w-[220px] mx-auto relative z-10">
                {p.tagline}
              </p>
              <div className="border-t border-white/20 mt-5 pt-3 relative z-10">
                <p className="text-white/30 text-[9px] uppercase tracking-[0.2em]">Edelweiss Life</p>
              </div>
            </div>

            {/* Persona description */}
            <div className="flex flex-col gap-3">
              {personaContent.paragraphs.map((para, i) => (
                <p key={i} className="text-gray-700 text-sm leading-relaxed">{para}</p>
              ))}
              <p className="text-[#0f1f3d] text-sm font-medium leading-relaxed border-t border-[#e4e7f0] pt-3 mt-1">
                {personaContent.closing}
              </p>
            </div>

            {/* Share result */}
            <button
              type="button"
              onClick={handleShareResult}
              className="w-full bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold py-3.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <WaIcon />
              Share my result
            </button>

            {/* Feedback — saved to Supabase; Done triggers completion screen */}
            <FeedbackSection linkId={linkId} onDone={onShare} />
          </div>
        </div>
      )
    }

    /* RPM preview result */
    return (
      <div className="flex flex-col">
        <div className={`${p.headerBg} pt-8 pb-5 text-center px-6`}>
          <span className="text-5xl block mb-2">{p.emoji}</span>
          <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-0.5">Your money persona</p>
          <h2 className={`text-2xl font-bold ${p.accent}`}>{p.name}</h2>
        </div>

        <div className="max-w-lg mx-auto w-full px-5 py-5 flex flex-col gap-3">
          {p.paragraphs.map((para, i) => (
            <p key={i} className="text-gray-600 text-sm leading-snug">{para}</p>
          ))}

          <FeedbackSection />

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onShare}
              className="flex-1 bg-[#0f1f3d] hover:bg-[#0f1f3d]/90 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Share with a customer →
            </button>
            <button
              type="button"
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl text-sm transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Question ────────────────────────────────────────────────────────── */
  const q        = QUESTIONS[currentQ]
  const progress = (currentQ / QUESTIONS.length) * 100

  return (
    <div className="flex flex-col">
      <div className="h-1.5 bg-gray-100 flex-shrink-0">
        <div className="h-full bg-[#e8a020] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div key={currentQ} className="anim-slide-up max-w-lg mx-auto w-full px-5 pt-6 pb-6">
        <p className="text-[#e8a020] text-[11px] font-bold uppercase tracking-widest mb-3">
          Question {currentQ + 1} of {QUESTIONS.length}
        </p>
        <h2 className="text-[#0f1f3d] text-lg font-bold leading-snug mb-5">{q.text}</h2>

        <div className="flex flex-col">
          {q.options.map((opt, i) => {
            const isSelected = selected === i
            const isDimming  = selected !== null && !isSelected
            return (
              <div
                key={i}
                style={{
                  maxHeight:    isDimming ? '0px'  : '80px',
                  opacity:      isDimming ? 0      : 1,
                  overflow:     'hidden',
                  marginBottom: isDimming ? '0px'  : '10px',
                  transition:   'max-height 0.25s ease-out, opacity 0.18s ease-out, margin 0.25s ease-out',
                }}
              >
                <button
                  type="button"
                  onClick={() => pick(i)}
                  disabled={selected !== null}
                  className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#0f1f3d] border-[#0f1f3d] text-white'
                      : 'bg-white border-[#e4e7f0] text-[#0f1f3d] hover:border-[#0f1f3d]/40'
                  }`}
                >
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    isSelected ? 'border-white/50 text-white/80' : 'border-gray-300 text-gray-400'
                  }`}>
                    {['A','B','C','D'][i]}
                  </span>
                  <span className="text-sm leading-snug">{opt}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
