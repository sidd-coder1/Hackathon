import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { MapPin, Camera, CheckCircle2, Clock, AlertCircle, ChevronRight, Battery, Wifi } from 'lucide-react'
import { StatCard, Badge, StatusDot, Spinner } from '../components/ui/UIComponents'
import { workerTasks } from '../data/mockData'
import clsx from 'clsx'
import { useRewards } from '../hooks/useRewards'
import PointsCard from '../components/worker/PointsCard'
import TaskList from '../components/worker/TaskList'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const [gpsStatus, setGpsStatus] = useState('acquiring') // acquiring | active | error
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [markingLoading, setMarkingLoading] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [coords, setCoords] = useState(null)
  const { points, tasks: dailyTasks, completeTask, level } = useRewards()

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    setTimeout(() => {
      setGpsStatus('active')
      setCoords({ lat: '28.6448° N', lng: '77.2167° E', acc: '±4m' })
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  const handleMarkAttendance = async () => {
    if (gpsStatus !== 'active') return
    setMarkingLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    setAttendanceMarked(true)
    setMarkingLoading(false)
  }

  const taskStatusMap = {
    'in-progress': { label: 'In Progress', variant: 'saffron' },
    'pending': { label: 'Pending', variant: 'default' },
    'completed': { label: 'Completed', variant: 'success' },
  }

  const priorityColor = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
  }

  return (
    <div className="max-w-lg mx-auto space-y-5 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good Morning,</h1>
          <p className="text-saffron-600 font-semibold">{user?.name} 👋</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold text-gray-800 tabular-nums">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-xs text-gray-500">
            {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* GPS Status Card */}
      <div className={clsx(
        'glass-card p-5 border-l-4 transition-all duration-500',
        gpsStatus === 'active' ? 'border-l-green-500' : gpsStatus === 'error' ? 'border-l-red-500' : 'border-l-amber-500'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              gpsStatus === 'active' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            )}>
              <MapPin size={18} className={gpsStatus === 'active' ? 'text-green-500' : 'text-amber-500'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">GPS Status</p>
              <p className="text-xs text-gray-500">{user?.ward}</p>
            </div>
          </div>
          <div className={clsx(
            'w-3 h-3 rounded-full',
            gpsStatus === 'active' ? 'bg-green-500 animate-pulse-gps' : 'bg-amber-500 animate-pulse'
          )} />
        </div>

        {gpsStatus === 'acquiring' ? (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Spinner size="sm" className="border-t-amber-500" />
            Acquiring GPS signal...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ['Latitude', coords?.lat],
              ['Longitude', coords?.lng],
              ['Accuracy', coords?.acc],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-100 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">{k}</p>
                <p className="text-green-600 font-mono font-medium">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards System Section */}
      <div className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <PointsCard points={points} level={level} />
        
        <div className="glass-card p-5">
          <TaskList tasks={dailyTasks} onCompleteTask={completeTask} />
        </div>
      </div>

      {/* Mark Attendance */}
      <div className="glass-card p-6 text-center">
        {attendanceMarked ? (
          <div className="animate-slide-up space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <p className="text-base font-bold text-green-600">Attendance Marked!</p>
            <p className="text-xs text-gray-500">
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · GPS Verified · Ward 14
            </p>
            <Badge variant="success">✓ Verified &amp; Recorded</Badge>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Tap to mark your attendance</p>
            <button
              onClick={handleMarkAttendance}
              disabled={gpsStatus !== 'active' || markingLoading}
              className={clsx(
                'w-32 h-32 mx-auto rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg',
                gpsStatus === 'active' && !markingLoading
                  ? 'border-saffron-500 bg-saffron-50 hover:bg-saffron-100 cursor-pointer glow-saffron'
                  : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
              )}
            >
              {markingLoading ? (
                <Spinner size="md" />
              ) : (
                <>
                  <MapPin size={28} className="text-saffron-500" />
                  <span className="text-xs font-bold text-saffron-600 tracking-wide">MARK<br />ATTENDANCE</span>
                </>
              )}
            </button>
            {gpsStatus !== 'active' && (
              <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
                <AlertCircle size={12} /> Waiting for GPS signal...
              </p>
            )}
          </div>
        )}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Attendance', value: '96%', color: 'text-green-600' },
          { label: 'Tasks Done', value: '3/4', color: 'text-saffron-600' },
          { label: 'Trust Score', value: '92', color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Photo Upload */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Camera size={18} className="text-saffron-500" />
            <p className="text-sm font-semibold text-gray-900">Work Photo Submission</p>
          </div>
          {photoUploaded && <Badge variant="success">Submitted</Badge>}
        </div>

        {photoUploaded ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle2 size={18} className="text-green-600" />
            <div>
              <p className="text-sm text-green-700 font-medium">Photo submitted successfully</p>
              <p className="text-xs text-gray-500">10:42 AM · Verified</p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setPhotoUploaded(true)}
            className="w-full border-2 border-dashed border-gray-300 hover:border-saffron-400 rounded-xl p-6 transition-all duration-200 group bg-gray-50"
          >
            <Camera size={24} className="text-gray-400 group-hover:text-saffron-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">Tap to upload work photo</p>
            <p className="text-xs text-gray-500 mt-1">Required before 5:30 PM</p>
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={16} className="text-saffron-500" /> Today's Tasks
          </h2>
          <Badge variant="saffron">{workerTasks.filter(t => t.status === 'in-progress').length} Active</Badge>
        </div>
        <div className="space-y-3">
          {workerTasks.map(task => (
            <div
              key={task.id}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 transition-all duration-200 hover:bg-gray-100 hover:shadow-sm border-l-4 pl-3',
                priorityColor[task.priority]
              )}
            >
              <div className="mt-0.5">
                {task.status === 'completed'
                  ? <CheckCircle2 size={16} className="text-green-500" />
                  : task.status === 'in-progress'
                    ? <div className="w-4 h-4 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin" />
                    : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  'text-sm font-medium',
                  task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                )}>{task.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{task.time}</p>
              </div>
              <Badge variant={taskStatusMap[task.status].variant} className="text-xs flex-shrink-0">
                {taskStatusMap[task.status].label}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
