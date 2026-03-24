import React, { createContext, useContext, useState } from 'react'
import { addUser } from '../services/firebaseService'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = async (role, credentials) => {
    // Simulate authentication
    const userData = {
      id: Math.random().toString(36).slice(2),
      name: role === 'user' ? 'Mr. Suresh Varma' 
          : role === 'supervisor' ? 'Priya Sharma'
          : 'Ramesh Patel',
      role,
      email: credentials.email,
      ward: role === 'worker' ? 'Ward 14 – Karol Bagh' : role === 'user' ? 'Sector 7 – Green Park' : 'Municipal HQ',
      employeeId: role === 'user' ? 'USR-4002' : role === 'supervisor' ? 'SUP-042' : 'WRK-1087',
      avatar: null,
    }
    setUser(userData)
    try {
      await addUser(userData)
    } catch (error) {
      console.error("Error copying user to Firebase:", error)
    }
    return userData
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}
