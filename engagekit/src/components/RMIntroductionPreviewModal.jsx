import { useAuth } from '../context/AuthContext'

export default function RMIntroductionPreviewModal({ onClose }) {
  const { user } = useAuth()
  const name = user?.name || 'Your Name'
  const designation = user?.designation || 'Relationship Manager'
  const phone = user?.phone ? `\n\nYou can reach me at +91 ${user.phone}.` : ''
  const message = `Hi [Customer Name],\n\nI’m ${name}, your ${designation} from Edelweiss Life Insurance.\n\nI hope you received our message introducing me as your Relationship Manager. Please save my number and feel free to reach out for any policy-related queries or assistance.${phone}\n\nBest regards,\n\n${name}\n(Service Manager)\nEdelweiss Life Insurance`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e4e7f0]">
          <div>
            <h2 className="text-[#0f1f3d] font-bold text-base">RM Introduction</h2>
            <p className="text-gray-400 text-xs mt-0.5">Trial preview</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none" aria-label="Close preview">✕</button>
        </div>
        <div className="p-5">
          <div className="bg-[#dcf8c6] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}