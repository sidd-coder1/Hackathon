import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = (role, credentials) => {
    // Simulate authentication
    const userData = {
      id: Math.random().toString(36).slice(2),
      name: role === 'admin' ? 'Dr. Rajesh Kumar' 
          : role === 'supervisor' ? 'Priya Sharma'
          : 'Ramesh Patel',
      role,
      email: credentials.email,
      ward: role === 'worker' ? 'Ward 14 – Karol Bagh' : 'Municipal HQ',
      employeeId: role === 'admin' ? 'ADM-001' : role === 'supervisor' ? 'SUP-042' : 'WRK-1087',
      avatar: null,
    }
    setUser(userData)
    return userData
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
