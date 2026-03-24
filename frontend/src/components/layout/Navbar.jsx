import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Bell, Shield, Menu, X, LogOut } from 'lucide-react'
import { RoleBadge, SecureBadge } from '../ui/UIComponents'
import clsx from 'clsx'

export default function Navbar({ onMenuToggle, menuOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center px-4 md:px-6 bg-gray-900/90 backdrop-blur-xl border-b border-white/8">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="md:hidden mr-3 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-colors"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Logo (mobile only) */}
      <div className="flex items-center gap-3 md:hidden">
        <img 
          src="/emblem.svg" 
          alt="Government of India" 
          className="w-7 h-auto filter brightness-0 invert"
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-tight">SwachhDrishti</span>
          <span className="text-[10px] text-gray-300 leading-tight">Government Dashboard</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <SecureBadge label="SSL Secured" size="sm" />
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(v => !v)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/8 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-500/40 to-brand-green/40 border border-white/15 flex items-center justify-center">
              <span className="text-xs font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-gray-500 leading-tight">{user?.employeeId}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 shadow-2xl shadow-black/50 border border-white/10 z-50">
              <div className="px-3 py-2 mb-1">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <div className="mt-2"><RoleBadge role={user?.role} /></div>
              </div>
              <div className="border-t border-white/8 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
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
