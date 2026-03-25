import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, BarChart3, MapPin, Bell, LogOut,
  ShieldCheck, CheckCircle2, Shield, Menu, X, ChevronRight, Settings, FileText, Scan, Camera, Star, QrCode, Target, AlertTriangle
} from 'lucide-react'
import { RoleBadge, SecureBadge, ConfirmModal } from '../ui/UIComponents'
import clsx from 'clsx'

const supervisorNav = [
  { to: '/supervisor',         label: 'Monitor Dashboard', icon: LayoutDashboard, end: true },
  { to: '/supervisor/workers', label: 'Worker Info',       icon: Users },
  { to: '/user-info',          label: 'User Info',         icon: Users },
  { to: '/analytics',          label: 'Analytics',         icon: BarChart3 },
]

const workerNav = [
  { to: '/worker',     label: 'Daily Tasks',       icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Performance',       icon: BarChart3 },
]

const userNav = [
  { to: '/user',          label: 'Dashboard Home',  icon: LayoutDashboard, end: true },
  { to: '/user/scan',     label: 'Daily QR Code',   icon: ShieldCheck },
  { to: '/user/report',   label: 'Report Issue',    icon: CheckCircle2 },
  { to: '/user/feedback', label: 'Worker Feedback', icon: Star },
  { to: '/analytics',     label: 'Analytics',       icon: BarChart3 },
]

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = user?.role === 'worker' ? workerNav 
                 : user?.role === 'supervisor' ? supervisorNav 
                 : userNav

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = () => {
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className={clsx(
      'hidden md:flex flex-col h-screen sticky top-0 bg-white/90 backdrop-blur-xl border-r border-gray-200 transition-all duration-300 ease-in-out z-40 shadow-sm',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-gray-200 animate-fade-in bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-saffron-50 to-green-50 border border-saffron-200 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-gray-700">{user.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.employeeId}</p>
            </div>
          </div>
          <div className="mt-3">
            <RoleBadge role={user.role} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => clsx(
              'sidebar-item', isActive && 'active'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-200 space-y-1">
        {!collapsed && (
          <div className="px-4 py-2 mb-2">
            <SecureBadge label="Secure Session" size="sm" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-item w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        icon={LogOut}
        isDestructive={true}
      />
    </aside>
  )
}
