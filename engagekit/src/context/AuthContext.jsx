import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)
const USER_KEY = 'ek_user'

export function AuthProvider({ children }) {
  const [user,              setUserState]         = useState(null)
  const [authLoading,       setAuthLoading]       = useState(true)
  const [whitelistEntry,    setWhitelistEntry]    = useState(null)
  const [pendingUserRecord, setPendingUserRecord] = useState(undefined)

  // Restore session from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY)
      if (stored) setUserState(JSON.parse(stored))
    } catch {
      localStorage.removeItem(USER_KEY)
    }
    setAuthLoading(false)
  }, [])

  function setUser(u) {
    setUserState(u)
    if (u) {
      localStorage.setItem(USER_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }

  return (
    <AuthContext.Provider value={{
      user, setUser, authLoading,
      whitelistEntry, setWhitelistEntry,
      pendingUserRecord, setPendingUserRecord,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
