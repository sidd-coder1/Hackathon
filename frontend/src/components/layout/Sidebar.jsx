import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { RoleBadge, SecureBadge } from '../ui/UIComponents'
import {
  LayoutDashboard, Users, BarChart3, MapPin, Bell, LogOut,
  Shield, Menu, X, ChevronRight, Settings, FileText
} from 'lucide-react'
import clsx from 'clsx'

const supervisorNav = [
  { to: '/supervisor', label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',   icon: BarChart3 },
]

const userNav = [
  { to: '/user',       label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',   icon: BarChart3 },
]

const workerNav = [
  { to: '/worker',     label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',   icon: BarChart3 },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const navItems = user?.role === 'worker' ? workerNav 
                 : user?.role === 'supervisor' ? supervisorNav 
                 : userNav

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className={clsx(
      'hidden md:flex flex-col h-screen sticky top-0 bg-white/90 backdrop-blur-xl border-r border-gray-200 transition-all duration-300 z-40 shadow-sm',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 min-h-[64px]">
        <img 
          src="/emblem.svg" 
          alt="Government of India" 
          className="w-8 h-auto flex-shrink-0"
        />
        {!collapsed && (
          <div className="min-w-0 border-l-2 border-saffron-500 pl-3 ml-1">
            <h1 className="text-sm font-bold text-gray-900 truncate">SwachhDrishti</h1>
            <p className="text-xs text-gray-500 truncate font-medium">Municipal Tracking</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="ml-auto text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* User Info */}
      {!collapsed && user && (
        <div className="p-4 border-b border-gray-200">
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
            className={({ isActive }) => clsx('sidebar-item', isActive && 'active')}
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
    </aside>
  )
}
