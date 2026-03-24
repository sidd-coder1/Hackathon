import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, BarChart3, MapPin, Bell, X } from 'lucide-react'
import clsx from 'clsx'

const supervisorNav = [
  { to: '/supervisor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics', icon: BarChart3 },
]

const userNav = [
  { to: '/user',       label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics', icon: BarChart3 },
]
const workerNav = [
  { to: '/worker',     label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics', icon: BarChart3 },
]

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()
  const navItems = user?.role === 'worker' ? workerNav 
                 : user?.role === 'supervisor' ? supervisorNav 
                 : userNav

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div className={clsx(
        'fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-white/8 z-50 transform transition-transform duration-300 md:hidden',
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-white/8">
          <span className="font-bold text-white">SwachhDrishti</span>
          <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => clsx('sidebar-item', isActive && 'active')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuToggle={() => setMenuOpen(v => !v)} menuOpen={menuOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 animate-fade-in bg-transparent">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
