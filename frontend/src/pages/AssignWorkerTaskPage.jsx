import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { Target, Search, Calendar as CalendarIcon, Save } from 'lucide-react'
import { Badge, StatusDot, Spinner } from '../components/ui/UIComponents'
import clsx from 'clsx'

export default function AssignWorkerTaskPage() {
  const { user } = useAuth()
  
  const [workers, setWorkers] = useState([])
  const [tasks, setTasks] = useState([])
  
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Form State
  const [selectedWorkerId, setSelectedWorkerId] = useState('')
  const [area, setArea] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [points, setPoints] = useState(10)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Fetch Workers 
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'worker'))
        const snap = await getDocs(q)
        setWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (err) {
        console.error("Failed to fetch workers", err)
      }
    }
    fetchWorkers()
  }, [])

  // Fetch Assigned Tasks Live
  useEffect(() => {
    const q = query(
      collection(db, 'tasks'),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          dateFrom: d.dateFrom?.toDate?.()?.toLocaleDateString('en-IN') || d.dateFrom,
          dateTo: d.dateTo?.toDate?.()?.toLocaleDateString('en-IN') || d.dateTo
        }
      }))
    }, (err) => {
      console.warn("Tasks listener failed (index may be required):", err.message)
      // Fallback if index fails
      getDocs(query(collection(db, 'tasks')))
        .then(snap => setTasks(snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            dateFrom: d.dateFrom?.toDate?.()?.toLocaleDateString('en-IN') || d.dateFrom,
            dateTo: d.dateTo?.toDate?.()?.toLocaleDateString('en-IN') || d.dateTo
          }
        })))
        .catch(console.error)
    })
    return () => unsub()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')

    if (!selectedWorkerId || !area || !title || !description || !points) {
      setFormError('Please fill out all fields.')
      return
    }

    // Date Validation
    const todayStr = new Date().toISOString().split('T')[0]
    if (dateFrom < todayStr) {
      setFormError('Please select valid future dates')
      return
    }
    if (dateTo < dateFrom) {
      setFormError('Date To cannot be earlier than Date From.')
      return
    }

    const workerObj = workers.find(w => w.id === selectedWorkerId)
    if (!workerObj) {
      setFormError('Selected worker is invalid.')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'tasks'), {
        assignedTo: workerObj.uid || workerObj.id,
        workerName: workerObj.name || 'Unknown',
        assignedBy: user?.name || 'Supervisor',
        assignedById: user?.uid || user?.id || 'unknown',
        ward: area,
        title: title,
        description: description,
        points: parseInt(points),
        status: "pending",
        dateFrom: dateFrom,
        dateTo: dateTo,
        createdAt: serverTimestamp()
      })
      
      setFormSuccess('Task assigned successfully!')
      // Reset
      setSelectedWorkerId('')
      setArea('')
      setTitle('')
      setDescription('')
      setPoints(10)
      setDateFrom('')
      setDateTo('')
    } catch (err) {
      console.error(err)
      setFormError('Failed to assign task. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-saffron-100 text-saffron-600 rounded-xl">
          <Target size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assign Worker Task</h1>
          <p className="text-sm text-gray-500">Dispatch workers to specific areas for future dates.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative overflow-hidden">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-saffron-500 rounded-full"></span> New Assignment
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 text-center">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 text-green-600 text-sm font-semibold rounded-xl border border-green-100 text-center">
                  {formSuccess}
                </div>
              )}

              {/* Worker Setup */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Worker</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors"
                >
                  <option value="">-- Select Worker --</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.employeeId || w.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned By */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Assigned By</label>
                <input
                  type="text"
                  readOnly
                  value={user?.name || 'Supervisor'}
                  className="w-full bg-gray-100 border border-gray-200 text-gray-500 font-semibold cursor-not-allowed text-sm rounded-xl block p-3 outline-none"
                />
              </div>

              {/* Task Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Garbage collection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors shadow-sm"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Description</label>
                <textarea
                  placeholder="Task details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors shadow-sm min-h-[80px]"
                />
              </div>

              {/* Points & Area */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ward / Area</label>
                  <input
                    type="text"
                    placeholder="Ward 4"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Task Points</label>
                  <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors shadow-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-saffron-500 focus:border-saffron-500 block p-3 outline-none transition-colors shadow-sm"
                  />
                </div>
              </div>


              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 text-white bg-saffron-500 hover:bg-saffron-600 focus:ring-4 focus:outline-none focus:ring-saffron-300 font-bold rounded-xl text-sm px-5 py-3.5 text-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                  {loading ? <Spinner size="sm" /> : <><Save size={18}/> Assign Task</>}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <CalendarIcon size={16} className="text-saffron-500" /> Assigned Worker Tasks
              </h2>
              <Badge variant="primary" className="text-[10px]">{tasks.length} Active</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-gray-400">
                  <Search size={32} className="opacity-20 mb-3" />
                  <p className="text-sm font-medium">No assigned tasks found.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-white sticky top-0 z-10 shadow-sm">
                    <tr className="border-b border-gray-100">
                      {['Worker', 'Task', 'Ward', 'Dates', 'Points', 'Status'].map(h => (
                        <th key={h} className="text-left text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 py-3 first:pl-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tasks.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 pl-6 font-semibold text-gray-900 text-xs">
                          {t.workerName}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600">{t.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{t.ward}</td>
                        <td className="px-4 py-3 text-[10px] text-gray-500 whitespace-nowrap">
                          {t.dateFrom} <br/> to {t.dateTo}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-saffron-600 font-bold">{t.points}</td>
                        <td className="px-4 py-3">
                          <Badge variant={t.status === 'pending' ? 'warning' : t.status === 'completed' ? 'primary' : 'success'} className="text-[9px] px-2 py-0.5">
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
