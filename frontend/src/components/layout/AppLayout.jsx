import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, BarChart3, X, Camera, Star, QrCode, Target, LogOut } from 'lucide-react'
import { SecureBadge, RoleBadge } from '../ui/UIComponents'
import clsx from 'clsx'

const supervisorNav = [
  { to: '/supervisor', label: 'Monitor Dashboard', icon: LayoutDashboard, end: true },
  { to: '/supervisor/workers', label: 'Worker Info', icon: Users },
  { to: '/user-info', label: 'User Info', icon: Users },
  { to: '/assign-worker-task', label: 'Assign Task to Worker', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const workerNav = [
  { to: '/worker', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/worker/missions', label: 'Daily Missions', icon: Target },
  { to: '/worker/scan', label: 'Scan QR Code', icon: QrCode },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

const userNav = [
  { to: '/user/scan', label: 'Daily QR Code', icon: QrCode },
  { to: '/user/report', label: 'Report Issue', icon: Camera },
  { to: '/user/feedback', label: 'Worker Feedback', icon: Star },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'worker' ? workerNav
    : user?.role === 'supervisor' ? supervisorNav
      : userNav

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden pointer-events-auto"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed md:relative top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none flex-shrink-0',
        sidebarOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-64'
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 select-none">
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex flex-col items-center justify-center gap-[5px] w-8 h-8 rounded-xl hover:bg-gray-100 transition-all flex-shrink-0 group"
              aria-label="Close menu"
            >
              <span className="block w-5 h-[2px] rounded-full bg-orange-500 group-hover:bg-orange-600 transition-colors" />
              <span className="block w-4 h-[2px] rounded-full bg-gray-500 group-hover:bg-gray-800 transition-colors" />
              <span className="block w-5 h-[2px] rounded-full bg-gray-500 group-hover:bg-gray-800 transition-colors" />
            </button>
            <div className="flex flex-col ml-1">
              <span className="text-sm font-bold text-gray-900 leading-tight tracking-tight">SwachhDrishti</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-900 p-1.5 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-orange-600">{user.name.charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-bold text-gray-900 truncate tracking-tight">{user.name}</p>
                <p className="text-xs text-gray-500 truncate font-medium">{user.employeeId}</p>
              </div>
            </div>
            <RoleBadge role={user.role} />
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false) }}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm',
                isActive
                  ? 'bg-orange-50 text-orange-600 font-semibold'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-all font-semibold text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto overflow-x-hidden w-full relative z-0">
        <Navbar
          onMenuToggle={() => setSidebarOpen(v => !v)}
          menuOpen={sidebarOpen}
        />
        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 animate-fade-in bg-transparent w-full">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}