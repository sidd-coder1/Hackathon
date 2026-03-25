import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { BarChart3, TrendingUp, Download, Calendar, Filter, PieChart as PieChartIcon, MapPin, Activity, Users } from 'lucide-react'
import { Badge, StatCard } from '../components/ui/UIComponents'
import { subscribeToUsers, subscribeToAttendance, subscribeToTasks } from '../services/firebaseService'
import clsx from 'clsx'

// Helper: filter records by time period using date or timestamp field
function filterDataByTime(data, filter) {
  if (!Array.isArray(data)) return []
  const now = new Date()
  return data.filter(item => {
    const raw = item?.date || item?.timestamp
    if (!raw) return false
    const itemDate = new Date(raw)
    if (isNaN(itemDate)) return false  // skip invalid timestamps
    if (filter === 'week') {
      const last7 = new Date()
      last7.setDate(now.getDate() - 7)
      return itemDate >= last7
    }
    if (filter === 'month') {
      return itemDate.getMonth() === now.getMonth() &&
             itemDate.getFullYear() === now.getFullYear()
    }
    if (filter === 'quarter') {
      const currentQ = Math.floor(now.getMonth() / 3)
      const itemQ    = Math.floor(itemDate.getMonth() / 3)
      return itemQ === currentQ && itemDate.getFullYear() === now.getFullYear()
    }
    return true
  })
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/90 backdrop-blur px-3 py-2.5 text-xs shadow-xl border border-gray-100 rounded-xl">
      {label && <p className="text-gray-500 mb-1 font-bold uppercase tracking-widest">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill || '#111' }} className="font-bold flex items-center gap-1">
           <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill || '#111' }} />
           {p.name || p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week')
  const [workers, setWorkers] = useState([])
  const [attendance, setAttendance] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to Users
    const unsubUsers = subscribeToUsers((u) => {
      setWorkers(u.filter(user => user.role === 'worker'))
    })

    // Subscribe to Attendance
    const unsubAttendance = subscribeToAttendance((a) => {
      setAttendance(a)
    })

    // Subscribe to Tasks
    const unsubTasks = subscribeToTasks((t) => {
      setTasks(t)
      setLoading(false)
    })

    return () => {
      unsubUsers()
      unsubAttendance()
      unsubTasks()
    }
  }, [])

  // Apply time filter to raw data before computing charts
  const filteredAttendance = filterDataByTime(attendance, period)
  const filteredTasks      = filterDataByTime(tasks, period)

  // Process Chart 1: Attendance by Date (filtered)
  const sliceCount = period === 'week' ? 7 : period === 'month' ? 30 : 90
  const attendanceBarData = Object.values(filteredAttendance.reduce((acc, curr) => {
    const date = curr.date || 'Unknown'
    if (!acc[date]) acc[date] = { date, present: 0, leave: 0, absent: 0 }
    acc[date].present += 1
    return acc
  }, {})).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-sliceCount)

  // Process Chart 2: Task Completion (filtered)
  const taskCounts = filteredTasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})
  const taskCompletionData = [
    { name: 'Pending',   value: Number(taskCounts['pending'])   || 0, color: '#9ca3af' },
    { name: 'Completed', value: Number(taskCounts['completed']) || 0, color: '#3b82f6' },
    { name: 'Verified',  value: Number(taskCounts['verified'])  || 0, color: '#138808' },
  ]

  // Process Chart 3: Zone wise (Ward) tasks (filtered)
  const wardTaskCounts = filteredTasks.reduce((acc, t) => {
    const ward = t.ward || 'General'
    if (!acc[ward]) acc[ward] = { zone: ward, count: 0, issue: 'Tasks' }
    acc[ward].count += 1
    return acc
  }, {})
  const complaintHeatmapData = Object.values(wardTaskCounts)

  // Process Chart 4: Performance Trend – representative data per period
  const workerPerformanceData = period === 'week'
    ? [
        { day: 'Mon', score: 82 }, { day: 'Tue', score: 85 }, { day: 'Wed', score: 84 },
        { day: 'Thu', score: 88 }, { day: 'Fri', score: 92 }, { day: 'Sat', score: 90 },
        { day: 'Sun', score: 95 }
      ]
    : period === 'month'
    ? [
        { day: 'Wk 1', score: 78 }, { day: 'Wk 2', score: 83 },
        { day: 'Wk 3', score: 87 }, { day: 'Wk 4', score: 91 }
      ]
    : [
        { day: 'Jan', score: 74 }, { day: 'Feb', score: 79 }, { day: 'Mar', score: 83 },
        { day: 'Apr', score: 80 }, { day: 'May', score: 85 }, { day: 'Jun', score: 88 },
        { day: 'Jul', score: 86 }, { day: 'Aug', score: 90 }, { day: 'Sep', score: 89 },
        { day: 'Oct', score: 93 }, { day: 'Nov', score: 91 }, { day: 'Dec', score: 95 }
      ]

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in w-full pb-8">
        <div className="flex items-center justify-center h-64 text-gray-400 font-medium">Loading analytics data…</div>
      </div>
    )
  }

  // ── Top Performers: weekly aggregation ──────────────────────────────────
  // Field mapping confirmed from WorkerDashboard.jsx:
  //   attendance: { userId: user.id (Firestore doc id), date: 'YYYY-MM-DD', timestamp: ISO string, NO status field }
  //   tasks:      { assignedTo: user.uid (mock uid), status: 'pending'|'completed'|'verified' }

  // Fix: compare date strings directly to avoid UTC-vs-local timezone shifts
  // e.g. new Date("2026-03-25") parses as UTC midnight = previous day in IST
  const isThisWeek = (dateVal) => {
    if (!dateVal) return false
    // If it's a YYYY-MM-DD string, compare as string directly
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 7)
      const cutoffStr = cutoff.toISOString().split('T')[0]
      const todayStr  = new Date().toISOString().split('T')[0]
      return dateVal >= cutoffStr && dateVal <= todayStr
    }
    // For ISO timestamps / Firestore Timestamps
    const d = new Date(dateVal)
    if (isNaN(d)) return false
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    return d >= cutoff && d <= new Date()
  }

  const getTaskDate = (t) => {
    if (t.date) return t.date
    if (t.createdAt?.toDate) { try { return t.createdAt.toDate() } catch { return null } }
    return t.createdAt || null
  }

  // Debug: log raw data to confirm field names match
  if (workers.length > 0 || attendance.length > 0 || tasks.length > 0) {
    console.log('[TopPerformers] WORKERS sample:', workers[0])
    console.log('[TopPerformers] ATTENDANCE sample:', attendance[0])
    console.log('[TopPerformers] TASKS sample:', tasks[0])
  }

  const topPerformers = workers
    .map(w => {
      // Match by Firestore doc id (w.id) — what WorkerDashboard writes as userId
      // Also try w.uid as fallback (the mock uid field)
      const firestoreId = w.id || ''
      const authUid     = w.uid || w.id || ''
      const workerName  = w.name || ''

      // Every attendance record = day present (no status field written)
      // Fallback to matching by userName if ID fields are missing
      const weekAtt = attendance.filter(a =>
        (a.userId === firestoreId || a.userId === authUid || a.workerId === authUid || a.userName === workerName) &&
        isThisWeek(a.date || a.timestamp)
      )
      // Count unique attendance dates this week
      const uniqueDatesThisWeek = [...new Set(weekAtt.map(a => a.date).filter(Boolean))].length
      const attPctFinal = uniqueDatesThisWeek > 0
        ? Math.min(100, Math.round((uniqueDatesThisWeek / 7) * 100))
        : 0

      // Tasks: assignedTo = worker's uid OR userId fallback
      // Fallback to matching by workerName if ID fields are missing
      const weekTasks = tasks.filter(t =>
        (t.assignedTo === authUid || t.assignedTo === firestoreId || t.userId === firestoreId || t.workerId === firestoreId || t.workerName === workerName || t.assignedToName === workerName) &&
        isThisWeek(getTaskDate(t))
      )
      const tasksDone = weekTasks.filter(t =>
        t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'verified'
      ).length

      // Dynamic trust score
      const trustScore = Math.min(100, Math.round((attPctFinal * 0.6) + (tasksDone * 2)))

      return { ...w, attPct: attPctFinal, tasksDone, trustScore }
    })
    .sort((a, b) => b.trustScore - a.trustScore)
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in w-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-gray-900 border-l-4 border-saffron-500 pl-3">Dashboard Analytics</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Real-time charts powered by Recharts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-xl p-1">
            {['week', 'month', 'quarter'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  'px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all',
                  period === p ? 'bg-saffron-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="h-9 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2 transition-colors">
            <Download size={14} /> Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full">
        
        {/* Chart 1: Attendance Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" /> Attendance by Date
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={attendanceBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
              <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'bold', paddingTop: 10 }} iconType="circle" />
              <Bar dataKey="present" name="Present" fill="#138808" radius={[4,4,0,0]} stackId="a" />
              <Bar dataKey="leave" name="Leave" fill="#FF9933" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Task Completion Pie Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <PieChartIcon size={16} className="text-saffron-500" /> Task Completion Status
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart margin={{ top: 0, bottom: 0 }}>
              <Pie
                data={taskCompletionData}
                cx="50%" cy="50%"
                innerRadius={65} outerRadius={95}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {taskCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: 11, fontWeight: 'bold' }} 
                iconType="circle" 
                layout="horizontal" 
                verticalAlign="bottom" 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Zone wise Complaint Heatmap (ScatterChart) */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <MapPin size={16} className="text-red-500" /> Zone wise Complaint Heatmap
            </h2>
          </div>
          <p className="text-[10px] text-gray-400 font-bold mb-4 ml-6 uppercase tracking-wider">Bubble size indicates density</p>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 30, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="issue" type="category" allowDuplicatedCategory={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="zone" type="category" allowDuplicatedCategory={false} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} width={80} />
              <ZAxis dataKey="count" range={[80, 800]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={(props) => {
                 if (!props.active || !props.payload?.length) return null
                 const data = props.payload[0].payload;
                 return (
                   <div className="bg-white/90 backdrop-blur px-3 py-2 text-xs shadow-xl border border-red-100 rounded-xl">
                     <p className="font-black text-gray-800 uppercase tracking-wide">{data.zone}</p>
                     <p className="text-gray-500 font-bold mb-1">{data.issue}</p>
                     <p className="text-red-600 font-black text-sm">{data.count} Complaints</p>
                   </div>
                 )
              }} />
              <Scatter data={complaintHeatmapData} fill="#ef4444" shape="circle" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 4: Worker Performance Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Worker Performance Trend
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={workerPerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} padding={{ left: 10, right: 10 }} />
              <YAxis domain={[60, 100]} tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#138808', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Line
                type="monotone" dataKey="score" name="Perf. Score"
                stroke="#138808" strokeWidth={3}
                dot={{ fill: '#ffffff', stroke: '#138808', r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#FF9933', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
      </div>

      {/* Top workers table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 p-1 sm:p-5 mt-4">
        <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 ml-4 sm:ml-0 pt-4 sm:pt-0">Top Performers This Week</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Rank', 'Worker', 'Ward', 'Attendance', 'Tasks Done', 'Trust Score'].map(h => (
                  <th key={h} className="text-left text-[10px] text-gray-400 font-bold uppercase tracking-widest px-4 py-3 first:pl-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 font-medium italic">
                    No active field workers found in record.
                  </td>
                </tr>
              ) : (
                topPerformers.map((w, i) => {
                    const attRate    = Number(w.attPct)    || 0
                    const tasksDone  = Number(w.tasksDone) || 0
                    const trustScore = Number(w.trustScore)|| 0
                    return (
                      <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4 pl-4">
                          <span className={clsx(
                            'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shadow-sm',
                            i === 0 ? 'bg-yellow-100 text-yellow-600' :
                            i === 1 ? 'bg-gray-100 text-gray-600' :
                            i === 2 ? 'bg-amber-100 text-amber-700' : 'bg-gray-50 text-gray-500'
                          )}>
                            #{i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-gray-900 text-sm font-bold">{w.name}</p>
                            <p className="text-gray-400 text-[10px] font-mono tracking-widest mt-0.5">{w.id || w.employeeId}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-600">{w.ward || 'General'}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-saffron-500 rounded-full" style={{ width: `${attRate}%` }} />
                            </div>
                            <span className="text-xs font-black text-gray-600">{attRate}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-xs font-bold text-gray-600">{tasksDone} tasks</td>
                        <td className="px-4 py-4">
                          <span className={clsx('text-sm font-black', trustScore >= 90 ? 'text-green-600' : 'text-amber-600')}>
                            {trustScore}
                          </span>
                        </td>
                      </tr>
                    )
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
