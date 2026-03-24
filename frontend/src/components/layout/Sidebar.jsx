import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleBadge, SecureBadge } from '../ui/UIComponents'
import {
  LayoutDashboard, Users, BarChart3, MapPin, Bell, LogOut,
  Shield, Menu, X, ChevronRight, Settings, FileText, Scan, Camera, Star, QrCode
} from 'lucide-react'
import clsx from 'clsx'

const supervisorNav = [
  { to: '/supervisor', label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',   icon: BarChart3 },
]

const userNav = [
  { to: '/user',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/user/scan',     label: 'Daily QR Code', icon: QrCode },
  { to: '/user/report',   label: 'Report Issue', icon: Camera },
  { to: '/user/feedback', label: 'Worker Feedback', icon: Star },
  { to: '/analytics',     label: 'Analytics',    icon: BarChart3 },
]

const workerNav = [
  { to: '/worker',     label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',   icon: BarChart3 },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  // Remove local state: const [collapsed, setCollapsed] = useState(false)
  const navItems = user?.role === 'worker' ? workerNav 
                 : user?.role === 'supervisor' ? supervisorNav 
                 : userNav

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className={clsx(
      'hidden md:flex flex-col h-screen sticky top-0 bg-white border-r border-gray-100 transition-all duration-300 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Spacer for Global Logo (Fixed in AppLayout) */}
      <div className="h-16 flex-shrink-0" />

      {/* User Info */}
      {!collapsed && user && (
        <div className="mx-4 my-2 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
              <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{user.employeeId}</p>
            </div>
          </div>
          <div className="mt-4">
            <RoleBadge role={user.role} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => clsx(
              'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm',
              isActive 
                ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            )}
            title={collapsed ? label : undefined}
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
              <Icon size={20} />
            </div>
            {!collapsed && <span className="animate-fade-in">{label}</span>}
            
            {/* Active Indicator Bar */}
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) => clsx(
                "absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full transition-all duration-300",
                isActive ? "opacity-100" : "opacity-0"
              )}
            />
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {!collapsed && (
          <div className="px-4 py-2 mb-2">
            <SecureBadge label="Session Secure" size="sm" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={clsx(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium",
            "text-gray-500 hover:bg-red-50 hover:text-red-600"
          )}
          title={collapsed ? 'Logout' : undefined}
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <LogOut size={20} />
          </div>
          {!collapsed && <span className="animate-fade-in">Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
