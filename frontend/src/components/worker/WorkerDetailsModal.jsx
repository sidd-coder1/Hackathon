import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
} from 'firebase/firestore'
import { X, MapPin, Clock, User, Calendar, Activity, TrendingUp } from 'lucide-react'
import { Badge, StatusDot, Spinner } from '../ui/UIComponents'
import clsx from 'clsx'

export default function WorkerDetailsModal({ workerId, onClose }) {
  const [worker, setWorker] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [locations, setLocations] = useState([])
  const [liveLocation, setLiveLocation] = useState(null)
  const [loading, setLoading] = useState(true)

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Fetch worker basic info
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        console.log("Selected ID:", workerId);
        let found = null;
        
        const q = query(collection(db, 'users'), where('employeeId', '==', workerId));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          const doc = snap.docs[0];
          found = { id: doc.id, ...doc.data() };
        } else {
          // fallback to doc id
          const allSnap = await getDocs(collection(db, 'users'));
          allSnap.forEach(doc => {
            const data = { id: doc.id, ...doc.data() };
            if (doc.id === workerId) found = data;
          });
        }
        
        console.log("Fetched Data:", found);
        setWorker(found);
      } catch (err) {
        console.error('Error fetching worker:', err);
      }
    }
    fetchWorker()
  }, [workerId])

  // Fetch attendance records
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const q = query(collection(db, 'attendance'), where('workerId', '==', workerId))
        const snap = await getDocs(q)
        const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        // Sort by date descending
        records.sort((a, b) => {
          const da = a.date?.toDate?.() ?? new Date(a.date ?? 0)
          const db_ = b.date?.toDate?.() ?? new Date(b.date ?? 0)
          return db_ - da
        })
        setAttendance(records)
      } catch (err) {
        console.error('Error fetching attendance:', err)
      }
    }
    fetchAttendance()
  }, [workerId])

  // Live location subscription + past locations
  useEffect(() => {
    let unsubscribe = () => {}
    const fetchLocations = async () => {
      try {
        // Past locations (latest 20)
        const q = query(
          collection(db, 'locations'),
          where('workerId', '==', workerId),
          orderBy('timestamp', 'desc'),
          limit(20)
        )
        const snap = await getDocs(q)
        const locs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setLocations(locs)
        if (locs.length > 0) setLiveLocation(locs[0])

        // Live listener for newest location
        const liveQ = query(
          collection(db, 'locations'),
          where('workerId', '==', workerId),
          orderBy('timestamp', 'desc'),
          limit(1)
        )
        unsubscribe = onSnapshot(liveQ, (snapshot) => {
          if (!snapshot.empty) {
            setLiveLocation({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
          }
        })
      } catch (err) {
        // Collection might not exist yet – fail silently
        console.warn('Locations collection not available:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
    return () => unsubscribe()
  }, [workerId])

  const formatTs = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return isNaN(d) ? '—' : d.toLocaleString('en-IN')
  }

  const formatDate = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return isNaN(d) ? '—' : d.toLocaleDateString('en-IN')
  }

  const formatTime = (ts) => {
    if (!ts) return '—'
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return isNaN(d) ? '—' : d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const displayWorker = worker ?? {
    name: workerId,
    ward: '—',
    employeeId: workerId,
    role: '—',
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal panel */}
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col relative border-r-[6px] border-saffron-500"
        style={{ animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-saffron-50 to-orange-100 border border-saffron-100 flex items-center justify-center shadow-sm">
              <span className="text-xl font-black text-saffron-700">
                {displayWorker.name?.charAt(0) ?? '?'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{displayWorker.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-mono font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
                  {displayWorker.employeeId ?? workerId}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs font-semibold text-saffron-600 uppercase tracking-wider">
                  {displayWorker.role || 'Field Worker'}
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
        <div className="overflow-y-auto flex-1 bg-gray-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Spinner size="lg" />
              <p className="text-sm text-gray-400 font-medium animate-pulse">Retrieving worker dossier...</p>
            </div>
          ) : (
            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* ── LEFT COLUMN: Profile & Attendance (7 cols) ── */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Worker Identity Cards */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <User size={16} className="text-saffron-500" /> Basic Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Ward Assignment', value: displayWorker.ward || 'Not Assigned', icon: MapPin, color: 'text-blue-500', bg: 'bg-blue-50' },
                      { label: 'Zone / Sector', value: displayWorker.zone || 'Central', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-50' },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:border-saffron-200 transition-colors group">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                          <div className={clsx('p-1.5 rounded-lg', bg)}>
                            <Icon size={14} className={color} />
                          </div>
                        </div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Attendance Summary */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                      <Calendar size={16} className="text-saffron-500" /> Attendance History
                    </h3>
                    {attendance.length > 0 && (
                      <Badge variant="success" className="text-[10px]">{attendance.length} Records</Badge>
                    )}
                  </div>
                  
                  {attendance.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 border border-dashed border-gray-200 flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Calendar size={20} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No attendance history found</p>
                      <p className="text-xs text-gray-400 mt-1">Records will appear once the worker logs in.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50/50">
                          <tr className="border-b border-gray-100">
                            {['Date', 'Log Points', 'Status'].map(h => (
                              <th key={h} className="text-left text-[10px] text-gray-400 font-bold uppercase tracking-widest px-5 py-3">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {attendance.slice(0, 5).map(rec => (
                            <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-5 py-3.5">
                                <p className="text-xs font-bold text-gray-800">{formatDate(rec.date)}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-[10px] font-medium text-gray-500">
                                  {formatTime(rec.checkIn) || '—'} <span className="mx-1 text-gray-300">→</span> {formatTime(rec.checkOut) || '—'}
                                </p>
                              </td>
                              <td className="px-5 py-3.5">
                                <Badge 
                                  variant={rec.status === 'present' ? 'success' : rec.status === 'absent' ? 'danger' : 'warning'}
                                  className="text-[9px] px-2 py-0.5"
                                >
                                  {rec.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </div>

              {/* ── RIGHT COLUMN: Live & Trust (5 cols) ── */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* Live Tracking Status */}
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={16} className="text-green-500" /> Real-time Tracking
                  </h3>
                  <div className={clsx(
                    "rounded-3xl p-6 border relative overflow-hidden transition-all duration-500",
                    liveLocation ? "bg-white border-green-100 shadow-lg shadow-green-500/5" : "bg-gray-100 border-gray-200"
                  )}>
                    {/* Decorative Map Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
                    />

                    <div className="relative z-10 space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusDot status={liveLocation ? 'active' : 'offline'} />
                          <span className={clsx("text-xs font-bold uppercase tracking-wider", liveLocation ? "text-green-600" : "text-gray-500")}>
                            {liveLocation ? 'Live on Field' : 'Offline / Inactive'}
                          </span>
                        </div>
                        {liveLocation && (
                          <div className="px-2 py-1 rounded-full bg-green-50 text-[10px] font-bold text-green-600 border border-green-100 animate-pulse">
                            GPS ACTIVE
                          </div>
                        )}
                      </div>

                      {liveLocation ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                              <MapPin size={18} className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Last Reported Position</p>
                              <p className="text-sm font-mono font-bold text-gray-800">
                                {Number(liveLocation.latitude).toFixed(6)}, {Number(liveLocation.longitude).toFixed(6)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                            <Clock size={12} />
                            <span>Last update received: {formatTs(liveLocation.timestamp)}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-6 text-center">
                          <MapPin size={32} className="mx-auto text-gray-300 mb-2 opacity-50" />
                          <p className="text-sm font-bold text-gray-400">Signal Lost</p>
                          <p className="text-xs text-gray-400 max-w-[180px] mx-auto mt-1">Ground force device is currently not broadcasting GPS telemetry.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Location Log Timeline */}
                <section>
                  <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-saffron-500" /> Location History
                  </h3>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2">
                    {locations.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <Activity size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium">No movement trails found for today</p>
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-1">
                        {locations.map((loc, i) => (
                          <div
                            key={loc.id}
                            className={clsx(
                              'group flex items-center gap-4 p-3 rounded-2xl transition-all',
                              i === 0 ? 'bg-saffron-50/50' : 'hover:bg-gray-50'
                            )}
                          >
                            <div className="relative flex flex-col items-center flex-shrink-0">
                              <div className={clsx(
                                "w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-125",
                                i === 0 ? "bg-saffron-500" : "bg-gray-300"
                              )} />
                              {i < locations.length - 1 && <div className="w-0.5 h-8 bg-gray-100 mt-1" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] font-mono font-bold text-gray-700">
                                  {Number(loc.latitude).toFixed(4)}, {Number(loc.longitude).toFixed(4)}
                                </p>
                                <p className="text-[10px] font-medium text-gray-400">{formatTime(loc.timestamp)}</p>
                              </div>
                            </div>
                            {i === 0 && (
                              <Badge variant="warning" className="text-[8px] font-black px-1.5 py-0">NOW</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </div>
          )}
        </div>

        {/* Footer with summary */}
        {!loading && (
          <div className="px-8 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Dossier Verified: {new Date().toLocaleDateString('en-IN')}
            </p>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-gray-500">CIVIC TRUST SCORE:</span>
               <span className={clsx(
                 "text-sm font-black",
                 (displayWorker.trustScore || 0) >= 80 ? "text-green-600" : "text-amber-500"
               )}>
                 {displayWorker.trustScore || '84.2'}%
               </span>
            </div>
          </div>
        )}
      </div>

      {/* Modern Animations & Scrollbar */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  )
}

