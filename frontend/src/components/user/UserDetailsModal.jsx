import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { X, User, MapPin, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react'
import { Spinner } from '../ui/UIComponents'
import clsx from 'clsx'

export default function UserDetailsModal({ userId, onClose }) {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Fetch user basic info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let found = null;
        
        const q = query(collection(db, 'users'), where('employeeId', '==', userId));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const doc = snap.docs[0];
          found = { id: doc.id, ...doc.data() };
        } else {
          // fallback to doc id
          const allSnap = await getDocs(collection(db, 'users'));
          allSnap.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (doc.id === userId) found = data;
          });
        }
        
        setUserData(found);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser()
  }, [userId])

  const displayUser = userData ?? {
    name: userId,
    ward: '—',
    employeeId: userId,
    role: '—',
    email: '—',
    phone: '—',
    createdAt: null
  }

  const formatDate = (ts) => {
    if (!ts) return 'Not available'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return isNaN(d) ? 'Not available' : d.toLocaleDateString('en-IN')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col relative border-b-[6px] border-blue-500"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center shadow-sm">
              <span className="text-xl font-black text-blue-700">
                {displayUser.name?.charAt(0) ?? '?'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{displayUser.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                  ID: {displayUser.employeeId ?? userId}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {displayUser.role === 'user' ? 'Citizen / User' : (displayUser.role || 'User')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all active:scale-95"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 bg-gray-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Spinner size="lg" />
              <p className="text-sm text-gray-400 font-medium animate-pulse">Loading user profile...</p>
            </div>
          ) : (
            <div className="p-8 space-y-8">
              {/* Basic Information */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <User size={16} className="text-blue-500" /> Profile Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Ward Assignment', value: displayUser.ward || 'Not Assigned', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Role / Access', value: displayUser.role || 'user', icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Email Address', value: displayUser.email || 'N/A', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Phone Number', value: displayUser.phone || 'N/A', icon: Phone, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Registration Date', value: formatDate(displayUser.createdAt), icon: Calendar, color: 'text-teal-500', bg: 'bg-teal-50' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-blue-200 transition-colors group">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                        <div className={clsx('p-1.5 rounded-lg', bg)}>
                          <Icon size={14} className={color} />
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900 leading-tight truncate" title={value}>{value}</p>
                    </div>
                  ))}
                </div>
              </section>
              
              <section>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center py-10">
                  <ShieldCheck size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500 mb-1">User Account is Active</p>
                  <p className="text-xs text-gray-400">All permissions are currently granted for this user to scan and report issues.</p>
                </div>
              </section>

            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
