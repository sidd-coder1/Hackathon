import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { MapPin, Camera, CheckCircle2, AlertCircle, ChevronRight, Battery, Wifi, Fingerprint, ImagePlus } from 'lucide-react'
import { StatCard, Badge, StatusDot, Spinner } from '../components/ui/UIComponents'
import clsx from 'clsx'
import { addAttendance } from '../services/firebaseService'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const [gpsStatus, setGpsStatus] = useState('acquiring') // acquiring | active | error
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [markingLoading, setMarkingLoading] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [coords, setCoords] = useState(null)
  const fileInputRef = useRef(null)

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const attendanceData = {
          userId: user?.id || 'unknown',
          userName: user?.name || 'Unknown User',
          role: user?.role || 'worker',
          ward: user?.ward || 'Unknown Ward',
          timestamp: new Date().toISOString(),
          location: { lat, lng }
        };
        
        try {
          await addAttendance(attendanceData);
          setAttendanceMarked(true);
        } catch (error) {
          console.error("Error marking attendance:", error);
        } finally {
          setMarkingLoading(false);
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        setMarkingLoading(false);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      setMarkingLoading(false);
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  const handlePhotoSubmit = () => {
    setPhotoUploaded(true)
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
    <div className="space-y-5 pb-8 animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good Morning,</h1>
          <p className="text-saffron-600 font-semibold">{user?.name}</p>
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


      {/* Mark Attendance */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-gray-50 bg-gray-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-saffron-100 flex items-center justify-center shadow-sm">
              <Fingerprint className="text-saffron-600" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Attendance</h2>
              <p className="text-xs text-gray-500">Tap to mark your attendance</p>
            </div>
          </div>
          {attendanceMarked && <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 size={12} /> Verified</Badge>}
        </div>

        {/* Action Body */}
        <div className="p-6 flex flex-col items-center">
          {attendanceMarked ? (
            <div className="animate-slide-up space-y-3 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <p className="text-base font-bold text-green-600">Attendance Marked!</p>
              <p className="text-xs text-gray-500">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · GPS Verified · {user?.ward}
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
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
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-gray-50 bg-gray-50/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
              <ImagePlus className="text-blue-600" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Work Photo Submission</h2>
              <p className="text-xs text-gray-500">Required before 5:30 PM</p>
            </div>
          </div>
          {photoUploaded && <Badge variant="success">Submitted</Badge>}
        </div>

        {/* Action Body */}
        <div className="p-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {photoUploaded ? (
            <div className="space-y-3">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Submitted work"
                  className="w-full h-48 object-cover rounded-2xl border border-green-200"
                />
              )}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 font-semibold">Photo submitted successfully</p>
                  <p className="text-xs text-gray-500 mt-0.5">Today · Verified</p>
                </div>
              </div>
            </div>
          ) : photoPreview ? (
            <div className="space-y-4">
              <img
                src={photoPreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl border border-gray-200"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setPhotoPreview(null); fileInputRef.current.value = '' }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={handlePhotoSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Submit Photo
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-8 transition-all duration-200 group bg-gray-50 hover:bg-blue-50/30"
            >
              <Camera size={28} className="text-gray-400 group-hover:text-blue-500 mx-auto mb-3 transition-colors" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">Tap to upload work photo</p>
              <p className="text-xs text-gray-400 mt-1">Choose from device · JPG, PNG supported</p>
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
