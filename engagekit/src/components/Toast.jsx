import { useEffect, useState } from 'react'

export default function Toast({ message, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const rAF = requestAnimationFrame(() => setVisible(true))
    const hide = setTimeout(() => setVisible(false), 2500)
    const done = setTimeout(onDone, 3000)
    return () => { cancelAnimationFrame(rAF); clearTimeout(hide); clearTimeout(done) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] bg-[#0f1f3d] text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl transition-opacity duration-500 pointer-events-none select-none whitespace-nowrap ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </div>
  )
}
