import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, BarChart3, X, Camera, Star, QrCode, Target, LogOut, AlertTriangle } from 'lucide-react'
import { SecureBadge, RoleBadge, ConfirmModal, TriColorMenu } from '../ui/UIComponents'
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
  { to: '/user', label: 'Dashboard Home', icon: LayoutDashboard, end: true },
  { to: '/user/scan', label: 'Daily QR Code', icon: QrCode },
  { to: '/user/report', label: 'Report Issue', icon: Camera },
  { to: '/user/feedback', label: 'Worker Feedback', icon: Star },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'worker' ? workerNav
    : user?.role === 'supervisor' ? supervisorNav
      : userNav

  const handleLogout = () => {
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = () => {
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
        'fixed md:relative top-0 left-0 h-full w-[280px] bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none flex-shrink-0',
        sidebarOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-[280px]'
      )}>
        {/* Sidebar Header — Logo and Close button */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center"
          >
            <TriColorMenu size={20} />
          </button>

          <div className="flex items-center select-none">
            <h1 className="text-lg font-black leading-tight tracking-tighter">
              <span className="text-saffron-600">Swachh</span>
              <span className="text-green-600">Drishti</span>
            </h1>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 hover:text-gray-900 p-1.5 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile */}
        {user && (
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-50 to-green-50 border border-saffron-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-saffron-700">{user.name.charAt(0)}</span>
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
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm',
                isActive
                  ? 'bg-saffron-50 text-saffron-700 relative before:w-1 before:h-8 before:bg-saffron-500 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:rounded-r-md shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="px-1 py-1 mb-3">
            <SecureBadge label="SSL Secured Session" size="sm" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-600 bg-red-50 border border-red-100 hover:bg-red-500 hover:text-white transition-all font-black tracking-wider uppercase text-xs shadow-sm hover:shadow-red-500/30 active:scale-95"
          >
            <LogOut size={18} />
            Secure Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative z-0">
        <Navbar
          onMenuToggle={() => setSidebarOpen(v => !v)}
          menuOpen={sidebarOpen}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 animate-fade-in bg-transparent w-full">
          <Outlet />
        </main>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account? You will need to login again to access your dashboard."
        confirmText="Sign Out"
        cancelText="Cancel"
        icon={LogOut}
        isDestructive={true}
      />
    </div>
  )
}
