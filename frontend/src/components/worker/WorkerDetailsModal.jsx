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
            const user = { id: doc.id, ...doc.data() };
            const idToUse = user.employeeId || user.id;
            if (idToUse === workerId) found = user;
          });
        }
        
        const data = found;
        console.log("Fetched Data:", data);
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
        // Past locations
        const q = query(
          collection(db, 'locations'),
          where('workerId', '==', workerId),
          orderBy('timestamp', 'desc')
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
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner size="lg" />
          </div>
        ) : !displayWorker ? (
          <div className="text-center py-10 text-gray-500 font-semibold">No data available</div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{displayWorker.name}</h2>
            
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              <section>
                <h3 className="font-bold text-gray-800 mb-2">Worker/User Info</h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                  <p><span className="text-gray-500">Name:</span> <span className="font-semibold">{displayWorker.name}</span></p>
                  <p><span className="text-gray-500">ID:</span> <span className="font-semibold">{displayWorker.employeeId ?? workerId}</span></p>
                  <p><span className="text-gray-500">Role:</span> <span className="font-semibold capitalize">{displayWorker.role || '—'}</span></p>
                </div>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-2">Live Status</h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm">
                  {liveLocation ? (
                    <>
                      <p><span className="text-gray-500">Status:</span> <span className="font-semibold text-green-600">Active</span></p>
                      <p><span className="text-gray-500">GPS:</span> <span className="font-mono">{Number(liveLocation.latitude).toFixed(6)}, {Number(liveLocation.longitude).toFixed(6)}</span></p>
                      <p><span className="text-gray-500">Last Seen:</span> <span className="font-semibold">{formatTs(liveLocation.timestamp)}</span></p>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No live data available</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-2">Attendance History</h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm max-h-48 overflow-y-auto custom-scrollbar">
                  {attendance.length === 0 ? (
                    <p className="text-gray-500 italic">No attendance records available</p>
                  ) : (
                    attendance.map(rec => (
                      <div key={rec.id} className="grid grid-cols-4 gap-2 border-b border-gray-100 last:border-0 pb-2 text-xs items-center">
                        <span className="font-medium text-gray-800">{formatDate(rec.date)}</span>
                        <span className="text-gray-500">In: {formatTime(rec.checkIn)}</span>
                        <span className="text-gray-500">Out: {formatTime(rec.checkOut)}</span>
                        <span className="font-semibold capitalize text-right">{rec.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 className="font-bold text-gray-800 mb-2">Location History</h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-2 text-sm max-h-48 overflow-y-auto custom-scrollbar">
                  {locations.length === 0 ? (
                    <p className="text-gray-500 italic">No location history available</p>
                  ) : (
                    locations.map(loc => (
                      <div key={loc.id} className="flex justify-between border-b border-gray-100 last:border-0 pb-1">
                        <span className="font-mono text-xs">{Number(loc.latitude).toFixed(6)}, {Number(loc.longitude).toFixed(6)}</span>
                        <span className="text-gray-500">{formatTime(loc.timestamp)}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      <style>{`
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

