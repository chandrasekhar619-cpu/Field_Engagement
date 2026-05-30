import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ContentView from '../components/ContentView'
import CustomerView from '../components/CustomerView'

export default function Dashboard() {
  const { user, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) return (
    <div className="min-h-screen bg-[#f4f5f9] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#0f1f3d] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />

  const activeView = location.pathname === '/app/customers' ? 'customers' : 'content'

  return (
    <div className="min-h-screen bg-[#f4f5f9]">
      <Navbar activeView={activeView} />
      <div className="pt-[60px]">
        {activeView === 'content' ? <ContentView /> : <CustomerView />}
      </div>
    </div>
  )
}
