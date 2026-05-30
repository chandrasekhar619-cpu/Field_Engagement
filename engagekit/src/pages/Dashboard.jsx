import { useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import ContentView from '../components/ContentView'
import CustomerView from '../components/CustomerView'

export default function Dashboard() {
  const { user } = useAuth()
  const location = useLocation()

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
