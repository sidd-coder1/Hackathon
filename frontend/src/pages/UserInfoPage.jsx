import React, { useState, useEffect } from 'react'
import { getUsers } from '../services/firebaseService'
import { Users, Eye, RefreshCw } from 'lucide-react'
import { Badge, StatusDot, SecureBadge } from '../components/ui/UIComponents'
import WorkerDetailsModal from '../components/worker/WorkerDetailsModal'
import clsx from 'clsx'

export default function UserInfoPage() {
  const [filter, setFilter] = useState('all')
  const [realUsers, setRealUsers] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [selectedWorkerId, setSelectedWorkerId] = useState(null)

  const loadData = async () => {
    try {
      const users = await getUsers()
      setRealUsers(users.filter(u => u.role === 'user'))
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

  // Fallback to empty state natively if data is empty 
  const generatedUsers = realUsers.map(u => ({
    id: u.employeeId || u.id,
    employeeId: u.employeeId || u.id,
    name: u.name || 'Unknown',
    ward: u.ward || 'Unknown Ward',
    status: 'active',
    lastSeen: 'Just now'
  }))

  const filteredUsers = filter === 'all'
    ? generatedUsers
    : generatedUsers.filter(w => w.status === filter)

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">User Info</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              User Status · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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
              <Users size={16} className="text-saffron-500" /> User Status
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'active', 'inactive'].map(f => (
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
                  {['User', 'Ward', 'Status', 'Last Seen'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wide px-4 py-3 first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="table-row-hover">
                      <td className="px-4 py-3 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-saffron-100 to-green-100 border border-saffron-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-gray-700">{u.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p 
                              className="cursor-pointer hover:text-saffron-600 font-semibold transition text-xs"
                              onClick={() => setSelectedWorkerId(u.employeeId)}
                            >
                              {u.name}
                            </p>
                            <p className="text-gray-600 text-xs">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{u.ward}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <StatusDot status={u.status} />
                          <Badge variant={u.status === 'active' ? 'success' : 'warning'}>
                            {u.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{u.lastSeen}</td>
                    </tr>
                  ))
                )}
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
