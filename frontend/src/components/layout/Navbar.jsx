import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bell, Shield, Menu, X, LogOut } from 'lucide-react'
import { RoleBadge, SecureBadge } from '../ui/UIComponents'
import clsx from 'clsx'

export default function Navbar({ onMenuToggle, menuOpen, onSidebarToggle, sidebarCollapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className={clsx(
      "sticky top-0 z-50 h-16 flex items-center px-4 md:px-8 transition-all duration-300",
      "bg-white/80 backdrop-blur-xl border-b border-gray-100/50"
    )}>
      {/* Desktop Toggle Button */}
      <button
        onClick={onSidebarToggle}
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all active:scale-95"
        title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <Menu size={20} className={clsx("transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
      </button>

      {/* Mobile Toggle Button */}
      <button
        onClick={onMenuToggle}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex-1" />

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* SSL Badge - Desktop Only */}
        <div className="hidden lg:block">
          <SecureBadge label="SSL Secured" size="sm" />
        </div>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all group">
          <Bell size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white ring-2 ring-red-100 animate-pulse" />
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm shadow-orange-200">
              <span className="text-xs font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-gray-500 font-medium leading-tight uppercase tracking-tight">{user?.role}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-50 mb-1">
                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <div className="mt-2.5">
                  <RoleBadge role={user?.role} />
                </div>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
