import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Pin from './pages/Pin'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CustomerDetail from './pages/CustomerDetail'
import PreviewPage from './pages/PreviewPage'
import CustomerLanding from './pages/CustomerLanding'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/pin" element={<Pin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<Dashboard />} />
          <Route path="/app/customers" element={<Dashboard />} />
          <Route path="/app/customer/:id" element={<CustomerDetail />} />
          <Route path="/preview/:contentId" element={<PreviewPage />} />
          <Route path="/c/:token" element={<CustomerLanding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
