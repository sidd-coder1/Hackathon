import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, BarChart3, MapPin, Bell, X, Scan, Camera, Star, QrCode } from 'lucide-react'
import clsx from 'clsx'

const supervisorNav = [
  { to: '/supervisor', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics', icon: BarChart3 },
]

const userNav = [
  { to: '/user',          label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/user/scan',     label: 'Daily QR Code', icon: QrCode },
  { to: '/user/report',   label: 'Report Issue', icon: Camera },
  { to: '/user/feedback', label: 'Worker Feedback', icon: Star },
  { to: '/analytics',     label: 'Analytics',    icon: BarChart3 },
]
const workerNav = [
  { to: '/worker',     label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics', icon: BarChart3 },
]

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useAuth()
  const navItems = user?.role === 'worker' ? workerNav 
                 : user?.role === 'supervisor' ? supervisorNav 
                 : userNav

  return (
    <div className="min-h-screen bg-[#FDFDFD]">
      {/* Global Logo Header - Fixed Top Left */}
      <div className={clsx(
        "fixed top-0 left-0 h-16 flex items-center px-4 z-[60] transition-all duration-300 pointer-events-none",
        sidebarCollapsed ? "w-16 justify-center" : "w-64"
      )}>
        <div className="flex items-center gap-3 pointer-events-auto">
          <img 
            src="/emblem.svg" 
            alt="Government of India" 
            className="w-8 h-auto flex-shrink-0"
          />
          {!sidebarCollapsed && (
            <div className="hidden md:block border-l-2 border-orange-500 pl-3 animate-fade-in whitespace-nowrap">
              <h1 className="text-sm font-bold text-gray-900 leading-tight">SwachhDrishti</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Department of Housing</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={clsx(
        "fixed top-0 left-0 h-full z-40 transition-all duration-300 hidden md:block",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] md:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className={clsx(
        'fixed top-0 left-0 h-full w-72 bg-white z-[80] transform transition-transform duration-300 ease-out md:hidden shadow-2xl',
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/emblem.svg" className="w-8 h-auto" alt="Logo" />
            <span className="font-bold text-gray-900">SwachhDrishti</span>
          </div>
          <button onClick={() => setMenuOpen(false)} className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        <nav className="p-4 space-y-1.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={clsx(
        "transition-all duration-300 min-h-screen flex flex-col",
        sidebarCollapsed ? "md:pl-16" : "md:pl-64"
      )}>
        <Navbar 
          onMenuToggle={() => setMenuOpen(v => !v)} 
          menuOpen={menuOpen}
          onSidebarToggle={() => setSidebarCollapsed(v => !v)}
          sidebarCollapsed={sidebarCollapsed}
        />
        <main className="flex-1 p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
