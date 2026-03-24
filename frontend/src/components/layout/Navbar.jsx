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
    <header className="sticky top-0 z-50 h-16 flex items-center px-4 md:px-6 bg-gradient-to-r from-gray-900 via-gray-900/95 to-black/90 backdrop-blur-md border-b border-saffron-500/50 shadow-[0_4px_20px_-4px_rgba(255,153,51,0.15)] gap-2">
      
      {/* Universal menu toggle */}
      <button
        onClick={onMenuToggle}
        className="mr-3 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <Menu size={22} />
      </button>

      {/* Logo (Always Visible & Non-Toggleable) */}
      <div className="flex items-center gap-3 select-none">
        <div 
          className="w-7 h-7 bg-[#FF9933] flex-shrink-0"
          style={{
            WebkitMaskImage: 'url(/emblem.svg)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/emblem.svg)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center'
          }}
        />
        <div className="flex flex-col">
          <span className="text-sm font-bold text-[#FF9933] leading-tight tracking-tight">SwachhDrishti</span>
          <span className="text-[10px] text-[#138808] font-black tracking-widest leading-tight">MUNICIPAL TRACKING</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center h-full">
          <div className="py-1 px-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold">SSL Secured</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-white/10" />

        <div className="flex items-center gap-3 md:gap-4">
          {/* Notification bell */}
          <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10 group">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_6px_rgba(239,68,68,0.8)] animate-pulse" />
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(v => !v)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 shadow-md flex items-center justify-center border border-saffron-400">
                <span className="text-xs font-bold text-white shadow-sm">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-tight mb-0.5">{user?.name}</p>
                <p className="text-[10px] text-saffron-400 uppercase tracking-widest font-bold leading-tight">{user?.role}</p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 glass-card p-2 shadow-2xl shadow-black/50 border border-white/10 z-50">
                <div className="px-3 py-2 mb-1 border-b border-white/8 pb-2">
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                  <div className="mt-2"><RoleBadge role={user?.role} /></div>
                </div>
                <div className="mt-1 pt-1">
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
      </div>
    </header>
  )
}
