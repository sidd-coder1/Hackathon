import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserByEmail, addUser, getUserByUid } from '../services/firebaseService'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('swachh_user_session')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Re-verify with Firestore to get latest stats/data
        getUserByEmail(userData.email).then(profile => {
          if (profile) {
            const roleMapping = {
              'area watchmen': 'user',
              'area_watchman': 'user',
              'watchman': 'user',
              'secretary': 'user',
              'field worker': 'worker',
              'field-worker': 'worker',
              'ward-supervisor': 'supervisor'
            }
            const standardizedProfile = { 
              ...profile, 
              role: roleMapping[profile.role?.toLowerCase()] || profile.role?.toLowerCase() 
            }
            setUser(standardizedProfile)
          } else {
            localStorage.removeItem('swachh_user_session')
          }
          setLoading(false)
        }).catch(() => {
          setUser(userData) // Fallback to cached if offline/error
          setLoading(false)
        })
      } catch (e) {
        localStorage.removeItem('swachh_user_session')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (role, { email, password }) => {
    const profile = await getUserByEmail(email)
    
    if (!profile) {
      throw new Error("User not found. Please sign up first.")
    }
    
    // In a real app, we'd hash the password. For this hackathon bypass:
    if (profile.password && profile.password !== password) {
      throw new Error("Invalid password.")
    }

    // Role mapping / normalization
    const roleMapping = {
      'area watchmen': 'user',
      'area_watchman': 'user',
      'watchman': 'user',
      'secretary': 'user',
      'field worker': 'worker',
      'field-worker': 'worker',
      'ward-supervisor': 'supervisor'
    }

    const normalizedDocRole = roleMapping[profile.role?.toLowerCase()] || profile.role?.toLowerCase()
    const normalizedTargetRole = roleMapping[role.toLowerCase()] || role.toLowerCase()

    if (normalizedDocRole !== normalizedTargetRole) {
      throw new Error(`Unauthorized. This account is registered as a ${profile.role}.`)
    }

    const standardizedProfile = { ...profile, role: normalizedDocRole }
    setUser(standardizedProfile)
    localStorage.setItem('swachh_user_session', JSON.stringify(standardizedProfile))
    return standardizedProfile
  }

  const signup = async (userData) => {
    const { email, password, name, role } = userData
    
    // Check if user already exists
    const existing = await getUserByEmail(email)
    if (existing) {
      throw new Error("Email already registered.")
    }

    const roleMapping = {
      'area watchmen': 'user',
      'area_watchman': 'user',
      'watchman': 'user',
      'secretary': 'user',
      'field worker': 'worker',
      'field-worker': 'worker',
      'ward-supervisor': 'supervisor'
    }

    const standardizedRole = roleMapping[role.toLowerCase()] || role.toLowerCase()

    const newProfile = {
      uid: Math.random().toString(36).slice(2) + Date.now().toString(36), // Mock UID
      name,
      email,
      password, // Storing for direct login bypass
      role: standardizedRole,
      ward: standardizedRole === 'worker' ? 'Ward 14 – Karol Bagh' : standardizedRole === 'user' ? 'Sector 7 – Green Park' : 'Municipal HQ',
      employeeId: email.substring(0, 8).toUpperCase(),
      createdAt: new Date().toISOString(),
      score: 0,
      streak: 0,
      totalAttendance: 0,
      level: 1
    }

    const docRef = await addUser(newProfile)
    const finalProfile = { id: docRef.id, ...newProfile }
    
    setUser(finalProfile)
    localStorage.setItem('swachh_user_session', JSON.stringify(finalProfile))
    return finalProfile
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('swachh_user_session')
  }

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
