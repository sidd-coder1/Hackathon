import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlerts } from '../../context/AlertContext'
import { Bell, Shield, Menu, X, LogOut, AlertTriangle } from 'lucide-react'
import { RoleBadge, SecureBadge, ConfirmModal } from '../ui/UIComponents'
import clsx from 'clsx'

export default function Navbar({ onMenuToggle, menuOpen }) {
  const { user, logout } = useAuth()
  const { alerts } = useAlerts()
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = () => {
    setProfileOpen(false)
    setIsLogoutModalOpen(true)
  }

  const confirmLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 h-16 flex items-center px-4 md:px-6 bg-white border-b border-gray-200 gap-2">
      
      {/* Menu toggle - visible on mobile, or on desktop when sidebar is closed */}
      <button
        onClick={onMenuToggle}
        className={clsx(
          "mr-3 flex flex-col items-center justify-center gap-[5px] w-9 h-9 rounded-xl hover:bg-gray-100 transition-all flex-shrink-0 group",
          menuOpen ? "md:hidden" : "flex"
        )}
        aria-label="Toggle menu"
      >
        <span className="block w-5 h-[2px] rounded-full bg-orange-500 group-hover:bg-orange-600 transition-colors" />
        <span className="block w-4 h-[2px] rounded-full bg-gray-500 group-hover:bg-gray-800 transition-colors" />
        <span className="block w-5 h-[2px] rounded-full bg-gray-500 group-hover:bg-gray-800 transition-colors" />
      </button>

      {/* Logo (Always Visible & Non-Toggleable) */}
      <div className="flex items-center gap-3 select-none">
        <img src="/emblem.svg" alt="logo" className="h-8 w-auto mix-blend-multiply" />
        <div className="flex flex-col leading-tight">
          <span className="text-base sm:text-lg font-extrabold text-orange-600 tracking-tight">SwachhDrishti</span>
          <span className="text-[10px] sm:text-xs text-green-700 font-bold tracking-wide">Empowering India's Municipal Workforce</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex items-center h-full">
          <div className="py-1 px-3 bg-green-50 border border-green-100 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-wider text-green-700 font-bold">SSL Secured</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-gray-200" />

        <div className="flex items-center gap-3 md:gap-4">
          {/* Notification bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsOpen(v => !v);
                if (profileOpen) setProfileOpen(false);
              }}
              className={clsx(
                "relative p-2 rounded-xl transition-all border border-transparent group",
                notificationsOpen ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Bell size={18} />
              {alerts?.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-white rounded-2xl p-0 shadow-2xl shadow-gray-200/80 border border-gray-100 z-50 overflow-hidden animate-fade-in origin-top-right">
                <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/80 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-gray-900 tracking-wide">Notifications</h3>
                  {alerts?.length > 0 && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-black tracking-widest uppercase">{alerts.length} New</span>}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {alerts?.length > 0 ? alerts.map((alert) => {
                    const sev = alert.severity || 'medium';
                    const styles = {
                      high: { bg: 'bg-red-50/50', border: 'bg-red-500', text: 'text-red-600' },
                      medium: { bg: 'bg-orange-50/40', border: 'bg-orange-500', text: 'text-orange-600' },
                      low: { bg: 'bg-yellow-50/40', border: 'bg-yellow-500', text: 'text-yellow-600' },
                    }[sev];

                    return (
                      <div key={alert.id} className={`p-4 border-b border-gray-50 transition-colors cursor-pointer relative hover:brightness-95 ${styles.bg}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-r-md ${styles.border}`} />
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-[13px] font-bold text-gray-900 capitalize">{alert.type} Alert</p>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest uppercase border ${styles.text} ${styles.border.replace('bg-', 'border-').replace('500', '200')}`}>
                            {sev}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">{alert.message}</p>
                        <p className={`text-[10px] mt-2 font-mono uppercase tracking-widest font-bold ${styles.text}`}>
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  }) : (
                    <div className="p-6 text-center text-sm text-gray-500 font-medium">No new notifications</div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-100 bg-gray-50/80 text-center cursor-pointer hover:bg-gray-100 transition-colors text-xs text-gray-600 hover:text-gray-900 font-bold uppercase tracking-widest">
                  Mark all as read
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(v => !v);
                if (notificationsOpen) setNotificationsOpen(false);
              }}
              className={clsx(
                "flex items-center gap-3 p-1.5 pr-3 rounded-full transition-all border border-transparent",
                profileOpen ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
                <span className="text-xs font-bold text-orange-600">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight mb-0.5">{user?.name}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-tight">{user?.role}</p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl p-2 shadow-xl shadow-gray-200/50 border border-gray-100 z-50 animate-fade-in origin-top-right">
                <div className="px-3 py-2 border-b border-gray-100 pb-3">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <div className="mt-2"><RoleBadge role={user?.role} /></div>
                </div>
                <div className="mt-1 flex flex-col gap-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium"
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

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Sign Out"
        message="Are you sure you want to sign out from the current session?"
        confirmText="Sign Out"
        cancelText="Cancel"
        icon={LogOut}
        isDestructive={true}
      />
    </header>
  )
}
