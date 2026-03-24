import React, { useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { BarChart3, TrendingUp, Download, Calendar, Filter } from 'lucide-react'
import { Badge, StatCard } from '../components/ui/UIComponents'
import { attendanceData, weeklyPerformance, mockWorkers } from '../data/mockData'
import clsx from 'clsx'

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

const heatmapData = Array.from({ length: 7 }, (_, row) =>
  Array.from({ length: 12 }, (_, col) => ({
    row, col,
    value: Math.floor(Math.random() * 100),
    label: `Ward ${row * 12 + col + 1}`,
  }))
).flat()

function Heatmap() {
  const [hovered, setHovered] = useState(null)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const hours = ['6AM','7AM','8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM']

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[480px]">
        <div className="flex items-center mb-2 ml-10 gap-1">
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-xs text-gray-600">{h}</div>
          ))}
        </div>
        <div className="space-y-1.5">
          {days.map((day, row) => (
            <div key={day} className="flex items-center gap-1">
              <span className="w-9 text-right text-xs text-gray-600 pr-1.5 flex-shrink-0">{day}</span>
              {hours.map((_, col) => {
                const cell = heatmapData.find(d => d.row === row && d.col === col)
                const opacity = cell ? cell.value / 100 : 0
                const isHovered = hovered?.row === row && hovered?.col === col
                return (
                  <div
                    key={col}
                    onMouseEnter={() => setHovered({ row, col, value: cell?.value })}
                    onMouseLeave={() => setHovered(null)}
                    className={clsx(
                      'flex-1 h-7 rounded-md transition-all duration-150 cursor-pointer relative',
                      isHovered && 'ring-1 ring-saffron-400 scale-110'
                    )}
                    style={{ background: `rgba(255, 107, 0, ${opacity * 0.8 + 0.05})` }}
                    title={`${day} ${hours[col]}: ${cell?.value}%`}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <span>Low</span>
          <div className="flex gap-0.5">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
              <div key={o} className="w-6 h-3 rounded-sm" style={{ background: `rgba(255,107,0,${o})` }} />
            ))}
          </div>
          <span>High Attendance</span>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('week')

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="text-sm text-gray-500">Performance overview and workforce insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 shadow-sm rounded-xl p-1">
            {['week', 'month', 'quarter'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all',
                  period === p ? 'bg-saffron-500 text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button className="btn-secondary text-sm px-3 py-2">
            <Download size={15} /> Report
          </button>
        </div>
      </div>


      {/* Attendance Area Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-saffron-500" /> Attendance Trend
          </h2>
          <Badge variant="success">↑ 2.3% vs last period</Badge>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={attendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#FF6B00" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gLeave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
            <Area type="monotone" dataKey="present" name="Present" stroke="#FF6B00" fill="url(#gPresent)" strokeWidth={2.5} />
            <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="5 3" />
            <Area type="monotone" dataKey="leave"   name="Leave"   stroke="#3b82f6" fill="url(#gLeave)"   strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance + Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <TrendingUp size={16} className="text-green-600" /> Weekly Performance Score
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklyPerformance} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="score" name="Score"
                stroke="#138808" strokeWidth={2.5}
                dot={{ fill: '#138808', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <BarChart3 size={16} className="text-saffron-500" /> Daily Attendance Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Bar dataKey="present" name="Present" fill="#FF6B00" radius={[4,4,0,0]} />
              <Bar dataKey="absent"  name="Absent"  fill="#ef4444" radius={[4,4,0,0]} />
              <Bar dataKey="leave"   name="Leave"   fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Attendance Heatmap · Hour-wise</h2>
          <Badge variant="info">Simulated Data</Badge>
        </div>
        <Heatmap />
      </div>

      {/* Top workers table */}
      <div className="glass-card p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Performers This Week</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {['Rank', 'Worker', 'Ward', 'Attendance', 'Tasks Done', 'Trust Score'].map(h => (
                  <th key={h} className="text-left text-xs text-gray-500 font-semibold uppercase tracking-wide px-3 py-2.5 first:pl-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...mockWorkers]
                .sort((a, b) => b.trustScore - a.trustScore)
                .slice(0, 5)
                .map((w, i) => (
                  <tr key={w.id} className="table-row-hover">
                    <td className="px-3 py-3 pl-0">
                      <span className={clsx(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                        i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        i === 1 ? 'bg-gray-400/20 text-gray-300' :
                        i === 2 ? 'bg-amber-700/20 text-amber-600' : 'text-gray-500'
                      )}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div>
                        <p className="text-gray-900 text-xs font-medium">{w.name}</p>
                        <p className="text-gray-500 text-xs">{w.id}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{w.ward}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-saffron-500 rounded-full" style={{ width: `${w.attendance}%` }} />
                        </div>
                        <span className="text-xs text-gray-600">{w.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{Math.floor(w.attendance / 10)} tasks</td>
                    <td className="px-3 py-3">
                      <span className={clsx('text-sm font-bold', w.trustScore >= 80 ? 'text-green-600' : 'text-amber-600')}>
                        {w.trustScore}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
