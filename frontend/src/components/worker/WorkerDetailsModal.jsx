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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal panel */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{ animation: 'slideUp 0.22s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-green-100 border border-orange-200 flex items-center justify-center">
              <span className="text-base font-bold text-gray-700">
                {displayWorker.name?.charAt(0) ?? '?'}
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{displayWorker.name}</h2>
              <p className="text-xs text-gray-500">{displayWorker.employeeId ?? workerId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* ── Section 1: Worker Info ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User size={13} /> Worker Info
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Name', value: displayWorker.name },
                    { label: 'Employee ID', value: displayWorker.employeeId ?? workerId },
                    { label: 'Ward', value: displayWorker.ward || '—' },
                    { label: 'Zone', value: displayWorker.zone || '—' },
                    { label: 'Role', value: displayWorker.role || 'Field Worker' },
                    { label: 'Trust Score', value: displayWorker.trustScore != null ? `${displayWorker.trustScore}` : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Section 2: Live Status ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Activity size={13} /> Live Status
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 border border-green-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <StatusDot status={liveLocation ? 'active' : 'offline'} />
                    <Badge variant={liveLocation ? 'success' : 'default'}>
                      {liveLocation ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {liveLocation ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">GPS Coordinates</p>
                          <p className="text-sm font-mono font-medium text-gray-800">
                            {liveLocation.latitude != null
                              ? `${Number(liveLocation.latitude).toFixed(6)}, ${Number(liveLocation.longitude).toFixed(6)}`
                              : liveLocation.coords ?? '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500">Last Seen</p>
                          <p className="text-sm font-medium text-gray-800">{formatTs(liveLocation.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No live location data available.</p>
                  )}
                </div>
              </section>

              {/* ── Section 3: Attendance History ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Calendar size={13} /> Attendance History
                </h3>
                {attendance.length === 0 ? (
                  <p className="text-sm text-gray-500 italic bg-gray-50 rounded-xl p-4 border border-gray-100">
                    No attendance records found.
                  </p>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          {['Date', 'Check-In', 'Check-Out', 'Status'].map(h => (
                            <th key={h} className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wide px-4 py-2.5">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {attendance.map(rec => (
                          <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2.5 text-xs text-gray-700">{formatDate(rec.date)}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-700">{formatTime(rec.checkIn) || rec.checkInTime || '—'}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-700">{formatTime(rec.checkOut) || rec.checkOutTime || '—'}</td>
                            <td className="px-4 py-2.5">
                              <Badge
                                variant={
                                  rec.status === 'present' ? 'success'
                                  : rec.status === 'absent' ? 'danger'
                                  : rec.status === 'on-leave' ? 'warning'
                                  : 'default'
                                }
                              >
                                {rec.status ?? '—'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* ── Section 4: Location History ── */}
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <TrendingUp size={13} /> Location History
                </h3>
                {locations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic bg-gray-50 rounded-xl p-4 border border-gray-100">
                    No location history available.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {locations.map((loc, i) => (
                      <div
                        key={loc.id}
                        className={clsx(
                          'flex items-start gap-3 p-3 rounded-xl border',
                          i === 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                        )}
                      >
                        <div className={clsx('mt-1 w-2 h-2 rounded-full flex-shrink-0', i === 0 ? 'bg-green-500' : 'bg-gray-300')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono text-gray-800">
                            {loc.latitude != null
                              ? `${Number(loc.latitude).toFixed(6)}, ${Number(loc.longitude).toFixed(6)}`
                              : loc.coords ?? '—'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{formatTs(loc.timestamp)}</p>
                        </div>
                        {i === 0 && (
                          <span className="text-xs text-green-600 font-semibold flex-shrink-0">Latest</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* slide-up keyframe (inline so no CSS file changes needed) */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
