import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [whitelistEntry, setWhitelistEntry] = useState(null)
  const [pendingUserRecord, setPendingUserRecord] = useState(undefined)
  // pendingUserRecord: undefined = not yet checked, null = no record exists, object = existing record

  return (
    <AuthContext.Provider value={{ user, setUser, whitelistEntry, setWhitelistEntry, pendingUserRecord, setPendingUserRecord }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
