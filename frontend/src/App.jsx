import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Hammer, Ban } from 'lucide-react'
import AppLayout from './components/layout/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import WorkerDashboard from './pages/WorkerDashboard'
import WorkerMissionsPage from './pages/WorkerMissionsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import UserDashboard from './pages/UserDashboard'
import SupervisorDashboard from './pages/SupervisorDashboard'
import WorkerInfoPage from './pages/WorkerInfoPage'
import UserInfoPage from './pages/UserInfoPage'

// Simple placeholder pages for sub-routes

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="glass-card p-10 text-center max-w-sm flex flex-col items-center">
        <Hammer size={48} className="text-saffron-500 mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-500">This section is under active development.</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="glass-card p-10 text-center max-w-sm border border-red-500/30 flex flex-col items-center">
        <Ban size={48} className="text-red-500 mb-4 opacity-80" strokeWidth={1.5} />
        <h2 className="text-lg font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
        <p className="text-xs text-gray-600 mt-2">Role required: {roles.join(' / ')}</p>
      </div>
    </div>
  )
  return children
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={user.role === 'worker' ? '/worker' : user.role === 'user' ? '/user' : '/supervisor'} replace />
            : <LoginPage />
        }
      />

      {/* Protected layout routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Supervisor routes */}
        <Route path="/supervisor" element={
          <ProtectedRoute roles={['supervisor']}>
            <SupervisorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/supervisor/workers" element={
          <ProtectedRoute roles={['supervisor']}>
            <WorkerInfoPage />
          </ProtectedRoute>
        } />
        <Route path="/user-info" element={
          <ProtectedRoute roles={['supervisor']}>
            <UserInfoPage />
          </ProtectedRoute>
        } />

        {/* User routes */}
        <Route path="/user" element={
          <ProtectedRoute roles={['user']}>
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user/scan" element={
          <ProtectedRoute roles={['user']}>
            <UserDashboard view="scan" />
          </ProtectedRoute>
        } />
        <Route path="/user/report" element={
          <ProtectedRoute roles={['user']}>
            <UserDashboard view="report" />
          </ProtectedRoute>
        } />
        <Route path="/user/feedback" element={
          <ProtectedRoute roles={['user']}>
            <UserDashboard view="feedback" />
          </ProtectedRoute>
        } />

        {/* Worker routes */}
        <Route path="/worker" element={
          <ProtectedRoute roles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/worker/missions" element={
          <ProtectedRoute roles={['worker']}>
            <WorkerMissionsPage />
          </ProtectedRoute>
        } />

        {/* Common routes */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
