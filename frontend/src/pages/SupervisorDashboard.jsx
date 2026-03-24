import React, { useState, useEffect } from 'react'
import { getUsers, getAttendance } from '../services/firebaseService'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Users, CheckCircle2, TrendingUp, AlertTriangle, MapPin,
  Shield, Bell, Filter, Download, RefreshCw, Eye, Ban, ChevronRight
} from 'lucide-react'
import {
  StatCard, Badge, StatusDot, AlertBanner, Spinner, Skeleton, SecureBadge, RoleBadge
} from '../components/ui/UIComponents'
import {
  mockWorkers, attendanceData, taskDistribution, alerts, recentActivity, stats
} from '../data/mockData'
import clsx from 'clsx'

const CHART_COLORS = { saffron: '#FF6B00', green: '#138808', blue: '#3b82f6' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2.5 text-xs shadow-xl border border-gray-100">
      <p className="text-gray-600 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

function MapPlaceholder() {
  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
      <div className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-200" />

      {[
        { top: '20%', left: '30%', color: 'bg-green-500', name: 'WRK-1001' },
        { top: '45%', left: '55%', color: 'bg-green-500', name: 'WRK-1004' },
        { top: '30%', left: '70%', color: 'bg-green-500', name: 'WRK-1006' },
        { top: '60%', left: '25%', color: 'bg-red-500',   name: 'WRK-1003' },
        { top: '70%', left: '65%', color: 'bg-amber-500', name: 'WRK-1005' },
        { top: '55%', left: '42%', color: 'bg-green-500', name: 'WRK-1007' },
      ].map((pin, i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
          style={{ top: pin.top, left: pin.left }}
        >
          <div className={clsx('w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg', pin.color, 'animate-pulse-slow')} />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-white rounded-lg text-xs text-gray-800 shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200">
            {pin.name}
          </div>
        </div>
      ))}

      <div className="absolute top-3 left-3 glass-card px-3 py-1.5 text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-600 font-medium">Live Tracking</span>
      </div>
      <div className="absolute top-3 right-3 glass-card px-3 py-1.5 text-xs text-gray-600">
        New Delhi Region
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-xs text-gray-700">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Active</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Offline</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> On Leave</span>
      </div>
    </div>
  )
}

function CivicTrustScore({ score = 84.7 }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-500' : 'text-red-600'
  const ring = score >= 80 ? 'border-green-500/60' : score >= 60 ? 'border-amber-500/60' : 'border-red-500/60'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Civic Trust Score</p>
      <div className={clsx('w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-4 glow-green bg-white', ring)}>
        <span className={clsx('text-3xl font-extrabold', color)}>{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
      <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}>{label}</Badge>
      <p className="text-xs text-gray-600 mt-3 max-w-[160px] leading-relaxed">
        Performance across your assigned Ward
      </p>
    </div>
  )
}

export default function SupervisorDashboard() {
  const [filter, setFilter] = useState('all')
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [realWorkers, setRealWorkers] = useState([])
  const [realAttendance, setRealAttendance] = useState([])

  const loadData = async () => {
    try {
      const [users, attendance] = await Promise.all([getUsers(), getAttendance()])
      setRealWorkers(users)
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

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ward Monitoring Center · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Field Workers" value={stats.totalWorkers}              icon={Users}         color="saffron" trend={3.2} />
        <StatCard label="Active Now"          value={stats.activeToday}               icon={Users}         color="green"  trend={1.8} />
        <StatCard label="Tasks Completed"     value={stats.tasksCompleted}            icon={CheckCircle2}  color="blue"   trend={5.1} />
        <StatCard label="Critical Alerts"     value={stats.alertsOpen}                icon={Bell}          color="red"    />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={16} className="text-saffron-500" /> Ward Real-time Map
            </h2>
            <Badge variant="success">6 Active Pins</Badge>
          </div>
          <MapPlaceholder />
        </div>
        <CivicTrustScore score={stats.civicTrustScore} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Weekly Ward Attendance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#FF6B00" fill="url(#gradPresent)" strokeWidth={2} />
              <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#ef4444" fill="url(#gradAbsent)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Task Allocation</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {taskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {taskDistribution.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600 truncate">{d.name}</span>
                </div>
                <span className="text-gray-800 font-medium ml-2">{d.value}%</span>
              </div>
            ))}
          </div>
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
                {['Worker', 'Ward', 'Status', 'GPS', 'Attendance', 'Trust Score', 'Last Seen', 'Action'].map(h => (
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
                        <p className="text-gray-900 font-medium text-xs">{w.name}</p>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-500 transition-colors" title="View">
                        <Eye size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={16} className="text-red-500" /> Active Ward Alerts
            </h2>
            <Badge variant="danger">{visibleAlerts.length} Alerts</Badge>
          </div>
          <div className="space-y-3">
            {visibleAlerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
                No pending alerts.
              </div>
            ) : (
              visibleAlerts.map(alert => (
                <AlertBanner
                  key={alert.id}
                  type={alert.type}
                  title={alert.title}
                  message={`${alert.message} · ${alert.time}`}
                  onClose={() => setDismissedAlerts(p => [...p, alert.id])}
                />
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-saffron-500" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-saffron-600">{item.worker.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{item.worker}</p>
                  <p className="text-xs text-gray-500">{item.action} · {item.ward}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
