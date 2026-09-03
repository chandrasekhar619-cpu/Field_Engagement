import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function buildContactFile(user) {
  const name = user?.name || 'Relationship Manager'
  const designation = user?.designation || 'Relationship Manager'
  const phone = (user?.phone || '').replace(/\D/g, '')
  const vCard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    'ORG:Edelweiss Life Insurance',
    `TITLE:${designation}`,
    phone ? `TEL;TYPE=CELL:+91${phone}` : '',
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  return new File([vCard], `${name.replace(/[^A-Za-z0-9]/g, '-').toLowerCase() || 'relationship-manager'}.vcf`, {
    type: 'text/vcard',
  })
}

export default function ContactShareTrial() {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const name = user?.name || 'Your Name'
  const designation = user?.designation || 'Relationship Manager'
  const phone = user?.phone || 'Your mobile number'

  async function shareContact() {
    const contactFile = buildContactFile(user)
    if (navigator.share && navigator.canShare?.({ files: [contactFile] })) {
      try {
        await navigator.share({
          files: [contactFile],
          title: 'Save my contact',
          text: `Please save ${name}'s contact details.`,
        })
        setMessage('Contact card ready to share.')
        return
      } catch (error) {
        if (error.name === 'AbortError') return
      }
    }

    const url = URL.createObjectURL(contactFile)
    const link = document.createElement('a')
    link.href = url
    link.download = contactFile.name
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Contact card downloaded. Attach it in WhatsApp to test it.')
  }

  return (
    <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-[#e4e7f0] rounded-xl shadow-sm overflow-hidden">
        <div className="bg-[#0f1f3d] px-6 py-7 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#e8a020] flex items-center justify-center">
            <span className="text-[#0f1f3d] text-2xl font-bold">{name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span>
          </div>
          <h1 className="text-white text-xl font-bold mt-3">{name}</h1>
          <p className="text-white/65 text-sm mt-1">{designation}</p>
        </div>

        <div className="p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Edelweiss Life Insurance</p>
          <p className="text-[#0f1f3d] text-base font-semibold mt-2">+91 {phone}</p>
          <p className="text-gray-500 text-sm leading-relaxed mt-5">This trial creates a contact card that a customer can save directly to their phone.</p>

          <button
            onClick={shareContact}
            className="w-full mt-6 bg-[#25d366] hover:bg-[#1ebe5d] text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Share My Contact
          </button>

          {message && <p className="text-center text-xs text-gray-500 mt-3">{message}</p>}
        </div>
      </div>
    </div>
  )
}