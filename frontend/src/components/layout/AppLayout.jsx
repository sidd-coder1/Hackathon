import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../../context/AuthContext'
import { QrCode, Camera, Star, BarChart3, X, LogOut, ShieldCheck, LayoutDashboard } from 'lucide-react'
import { SecureBadge, RoleBadge } from '../ui/UIComponents'
import clsx from 'clsx'

const supervisorNav = [
<<<<<<< HEAD
  { to: '/supervisor', label: 'Monitor Dashboard', icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Analytics',         icon: BarChart3 },
]

const workerNav = [
  { to: '/worker',     label: 'Daily Tasks',       icon: LayoutDashboard, end: true },
  { to: '/analytics',  label: 'Performance',       icon: BarChart3 },
=======
  { to: '/supervisor',         label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/supervisor/workers', label: 'Worker Info', icon: Users },
  { to: '/analytics',         label: 'Analytics',   icon: BarChart3 },
>>>>>>> d5bb634cdbf90078af48ac70fb6ce513e2e72346
]

const userNav = [
  { to: '/user/scan',     label: 'Daily QR Code',   icon: QrCode },
  { to: '/user/report',   label: 'Report Issue',    icon: Camera },
  { to: '/user/feedback', label: 'Worker Feedback', icon: Star },
  { to: '/analytics',     label: 'Analytics',       icon: BarChart3 },
]

export default function AppLayout() {
<<<<<<< HEAD
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

=======
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user } = useAuth()
>>>>>>> d5bb634cdbf90078af48ac70fb6ce513e2e72346
  const navItems = user?.role === 'worker' ? workerNav 
                 : user?.role === 'supervisor' ? supervisorNav 
                 : userNav

<<<<<<< HEAD
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      
      {/* Mobile-only Dark overlay (hidden on desktop to allow side-by-side view) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden pointer-events-auto"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Acts as sliding overlay on Mobile, and side-by-side push layout on Desktop */}
      <div className={clsx(
        'fixed md:relative top-0 left-0 h-full w-[280px] bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none flex-shrink-0',
        sidebarOpen ? 'translate-x-0 md:ml-0' : '-translate-x-full md:translate-x-0 md:-ml-[280px]'
      )}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2 text-saffron-600">
            <ShieldCheck size={20} />
            <span className="font-bold text-gray-900 tracking-widest uppercase text-xs">Quick Menu</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="text-gray-400 hover:text-gray-900 p-1.5 rounded-xl hover:bg-gray-100 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Profile Block */}
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

        {/* Specific Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
=======
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
>>>>>>> d5bb634cdbf90078af48ac70fb6ce513e2e72346
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
<<<<<<< HEAD
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-semibold text-sm',
                isActive 
                  ? 'bg-saffron-50 text-saffron-700 relative before:w-1 before:h-8 before:bg-saffron-500 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:rounded-r-md shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} className="flex-shrink-0" />
=======
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={20} />
>>>>>>> d5bb634cdbf90078af48ac70fb6ce513e2e72346
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* 4. Logout icon at the bottom (red) */}
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

<<<<<<< HEAD
      {/* 7. The main content area takes full width when sidebar is hidden */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden w-full relative z-0">
        <Navbar 
          onMenuToggle={() => setSidebarOpen(v => !v)}
          menuOpen={sidebarOpen} 
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6 animate-fade-in bg-transparent w-full">
          <Outlet />
=======
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
>>>>>>> d5bb634cdbf90078af48ac70fb6ce513e2e72346
        </main>
      </div>
    </div>
  )
}
