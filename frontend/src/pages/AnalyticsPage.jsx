import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { BarChart3, TrendingUp, Download, Calendar, Filter, PieChart as PieChartIcon, MapPin, Activity, Users } from 'lucide-react'
import { Badge, StatCard } from '../components/ui/UIComponents'
import { subscribeToUsers, subscribeToAttendance, subscribeToTasks } from '../services/firebaseService'
import clsx from 'clsx'

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

  // Process Chart 1: Attendance by Date
  const attendanceBarData = Object.values(attendance.reduce((acc, curr) => {
    const date = curr.date || 'Unknown'
    if (!acc[date]) acc[date] = { date, present: 0, leave: 0, absent: 0 }
    acc[date].present += 1
    return acc
  }, {})).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-7)

  // Process Chart 2: Task Completion
  const taskCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})
  const taskCompletionData = [
    { name: 'Pending', value: taskCounts['pending'] || 0, color: '#9ca3af' },
    { name: 'Completed', value: taskCounts['completed'] || 0, color: '#3b82f6' },
    { name: 'Verified', value: taskCounts['verified'] || 0, color: '#138808' },
  ]

  // Process Chart 3: Zone wise (Ward) tasks
  const wardTaskCounts = tasks.reduce((acc, t) => {
    const ward = t.ward || 'General'
    if (!acc[ward]) acc[ward] = { zone: ward, count: 0, issue: 'Tasks' }
    acc[ward].count += 1
    return acc
  }, {})
  const complaintHeatmapData = Object.values(wardTaskCounts)

  // Process Chart 4: Performance Trend (Cumulative score grouped by date)
  // Simplified for demo: show points awarded over time
  const workerPerformanceData = [
    { day: 'Mon', score: 82 }, { day: 'Tue', score: 85 }, { day: 'Wed', score: 84 },
    { day: 'Thu', score: 88 }, { day: 'Fri', score: 92 }, { day: 'Sat', score: 90 },
    { day: 'Sun', score: 95 }
  ]

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
                workers
                  .sort((a, b) => (b.score || 0) - (a.score || 0))
                  .slice(0, 5)
                  .map((w, i) => {
                    const trustScore = 80 + Math.min(20, Math.floor((w.score || 0) / 10)); 
                    const attRate = Math.min(100, (w.totalAttendance || 0) * 10);
                    const completedTasks = tasks.filter(t => t.assignedTo === (w.uid || w.id) && t.status === 'verified').length;
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
                        <td className="px-4 py-4 text-xs font-bold text-gray-600">{completedTasks} tasks</td>
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
