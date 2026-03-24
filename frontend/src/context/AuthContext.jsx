import React, { createContext, useContext, useState } from 'react'
import { addUser } from '../services/firebaseService'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = async (role, credentials) => {
    // Standardize user data from credentials
    const userData = {
      id: credentials.email || Math.random().toString(36).slice(2),
      name: credentials.email?.split('@')[0] || 'Swachh Employee',
      role,
      email: credentials.email || 'employee@swachh.gov.in',
      ward: role === 'worker' ? 'Ward 14 – Karol Bagh' : role === 'user' ? 'Sector 7 – Green Park' : 'Municipal HQ',
      employeeId: credentials.email?.substring(0, 8).toUpperCase() || 'EMP-1XXX',
      avatar: null,
    }
    setUser(userData)
    // NOTE: Removed automatic addUser(userData) call to prevent Firestore bloat from fake/test logins.
    return userData
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
