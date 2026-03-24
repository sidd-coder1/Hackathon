import React, { useState, useEffect } from 'react'
import { getUsers, getAttendance } from '../services/firebaseService'
import { Users, MapPin, Ban, Eye, RefreshCw } from 'lucide-react'
import { Badge, StatusDot, SecureBadge } from '../components/ui/UIComponents'
import { mockWorkers } from '../data/mockData'
import clsx from 'clsx'
import WorkerDetailsModal from '../components/worker/WorkerDetailsModal'

export default function WorkerInfoPage() {
  const [filter, setFilter] = useState('all')
  const [realWorkers, setRealWorkers] = useState([])
  const [realAttendance, setRealAttendance] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedWorkerId, setSelectedWorkerId] = useState(null)

  const loadData = async () => {
    try {
      const [users, attendance] = await Promise.all([getUsers(), getAttendance()])
      setRealWorkers(users.filter(item => item.role === 'worker'))
      setRealAttendance(attendance)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const generatedWorkers = realWorkers.length > 0 ? realWorkers.map(u => ({
    id: u.employeeId || u.id,
    name: u.name || 'Unknown',
    ward: u.ward || 'Unknown Ward',
    status: 'active',
    gps: 'Active',
    attendance: 100,
    trustScore: 90,
    lastSeen: 'Just now'
  })) : mockWorkers

  const filteredWorkers = filter === 'all'
    ? generatedWorkers
    : generatedWorkers.filter(w => w.status === filter)

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Worker Info</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ground Force Status · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SecureBadge label="Live Monitoring" size="sm" />
          <button
            onClick={handleRefresh}
            className="btn-secondary text-sm px-3 py-2"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Users size={16} className="text-saffron-500" /> Ground Force Status
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'active', 'absent', 'on-leave'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all',
                  filter === f ? 'bg-saffron-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Worker', 'Ward', 'Status', 'GPS', 'Attendance', 'Trust Score', 'Last Seen'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wide px-4 py-3 first:pl-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkers.map(w => (
                <tr key={w.id} className="table-row-hover">
                  <td className="px-4 py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-100 to-green-100 border border-saffron-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-700">{w.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p 
                          className="cursor-pointer hover:text-saffron-600 font-semibold transition text-xs"
                          onClick={() => setSelectedWorkerId(w.id)}
                        >
                          {w.name}
                        </p>
                        <p className="text-gray-600 text-xs">{w.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{w.ward}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusDot status={w.status} />
                      <Badge variant={w.status === 'active' ? 'success' : w.status === 'absent' ? 'danger' : 'warning'}>
                        {w.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-xs font-medium flex items-center gap-1', w.gps === 'Active' ? 'text-green-600' : 'text-red-500')}>
                      {w.gps === 'Active' ? <><MapPin size={12}/> Active</> : <><Ban size={12}/> Offline</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full', w.attendance >= 80 ? 'bg-green-500' : w.attendance >= 60 ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${w.attendance}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{w.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-sm font-bold', w.trustScore >= 80 ? 'text-green-600' : w.trustScore >= 60 ? 'text-amber-500' : 'text-red-600')}>
                      {w.trustScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{w.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {selectedWorkerId && (
      <WorkerDetailsModal workerId={selectedWorkerId} onClose={() => setSelectedWorkerId(null)} />
    )}
    </>
  )
}

// Force Vite cache invalidation
