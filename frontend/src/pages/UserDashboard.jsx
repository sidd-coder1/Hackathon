import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  MapPin, 
  Camera, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send,
  ThumbsUp,
  LayoutDashboard,
  Scan,
  History,
  ChevronRight,
  ShieldCheck,
  QrCode,
  Trash2
} from 'lucide-react'
import { Badge, Spinner } from '../components/ui/UIComponents'
import clsx from 'clsx'

// --- Sub-components ---

function DashboardHome({ user, activityLog }) {
  const areaStatus = 'Good'
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Namaste,</h2>
          <p className="text-saffron-600 font-bold text-lg">{user?.name} 🙏</p>


        </div>
        <div className="glass-card px-4 py-3 flex items-center gap-3 border-saffron-200">
          <div className="p-2 bg-saffron-50 text-saffron-600 rounded-xl">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assigned Ward</p>
            <p className="text-sm font-bold text-gray-900">{user?.ward || 'Sector 7 – Green Park'}</p>
          </div>
        </div>
      </div>

      <div className={clsx(
        "glass-card p-6 border-l-4 transition-all duration-500",
        areaStatus === 'Good' ? "border-l-green-500 bg-gradient-to-br from-white to-green-50" : "border-l-amber-500 bg-gradient-to-br from-white to-amber-50"
      )}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
              areaStatus === 'Good' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
            )}>
              {areaStatus === 'Good' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Cleanliness</p>
              <h2 className={clsx(
                "text-2xl font-black uppercase tracking-tight",
                areaStatus === 'Good' ? "text-green-700" : "text-amber-700"
              )}>{areaStatus === 'Good' ? 'Satisfactory' : 'Needs Attention'}</h2>
            </div>
          </div>
          <Badge variant={areaStatus === 'Good' ? 'success' : 'warning'} className="px-6 py-2 rounded-full text-xs font-bold shadow-sm">
            {areaStatus === 'Good' ? '✓ Standard Maintained' : '! Action Required'}
          </Badge>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-saffron-500" />
            Last swept: <span className="text-gray-900">2 hours ago</span>
          </div>
          <div className="flex items-center gap-2">
            <ThumbsUp size={14} className="text-green-600" />
            Reliability Score: <span className="text-gray-900 font-bold">98%</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-xs font-black text-gray-900 mb-5 flex items-center gap-2 tracking-widest uppercase">
          <History size={14} className="text-saffron-600" /> Recent Ward Activity
        </h3>
        <div className="space-y-4">
          {activityLog.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                <Clock size={24} />
              </div>
              <p className="text-sm text-gray-400 font-medium">No recent activity found.</p>
            </div>
          ) : (
            activityLog.map((item, i) => (
              <div key={i} className="flex gap-4 items-start relative pb-4 last:pb-0">
                {i !== activityLog.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gray-100" />
                )}
                <div className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-white shadow-sm",
                  item.type === 'report' ? "bg-red-100 text-red-600" : 
                  item.type === 'scan' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                )}>
                  {item.type === 'report' ? <Camera size={14} /> : 
                   item.type === 'scan' ? <QrCode size={14} /> : <ThumbsUp size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-gray-900">
                      {item.type === 'scan' ? 'Daily QR Verified' : 
                       item.type === 'report' ? 'Cleanliness Issue Reported' : 'Feedback Submitted'}
                    </p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{item.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed truncate-2 truncate">
                    {item.msg || item.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function ReportIssue({ onAddLog }) {
  const [reportText, setReportText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const removePhoto = (e) => {
    e.stopPropagation()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onAddLog({
        type: 'report',
        msg: reportText,
        time: 'Just now'
      })
      setSubmitting(false)
      setReportText('')
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-card p-6 border-t-4 border-t-red-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
            <Camera size={20} />
          </div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Report Cleanliness Issue</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={clsx(
              "w-full aspect-[2/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 relative group overflow-hidden",
              previewUrl ? "border-green-200 bg-green-50/30" : "bg-gray-50 border-gray-200 hover:border-saffron-300 hover:bg-saffron-50 hover:scale-[1.01]"
            )}
          >
            {previewUrl ? (
              <div className="w-full h-full relative">
                <img 
                  src={previewUrl} 
                  alt="Issue Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                   <button 
                     type="button"
                     onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                     className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all border border-white/30"
                   >
                     <Camera size={20} />
                   </button>
                   <button 
                     type="button"
                     onClick={removePhoto}
                     className="p-3 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-all border border-red-400/30"
                   >
                     <Trash2 size={20} />
                   </button>
                </div>
                <div className="absolute top-4 left-4">
                  <Badge variant="success" className="shadow-lg backdrop-blur-md bg-green-500/80">✓ Image Captured</Badge>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-white rounded-full shadow-sm text-gray-400 group-hover:text-saffron-500 transition-colors">
                  <Camera size={32} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-900 font-bold">Tap to capture site photo</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">AI will automatically verify the issue</p>
                </div>
              </>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Description</label>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="e.g., Unclaimed debris near the main electrical transit point..."
              className="input-secure min-h-[120px] text-sm bg-white/50 backdrop-blur-sm pt-4"
            />
          </div>

          <button
            type="submit"
            disabled={!reportText || submitting}
            className="btn-primary w-full h-14 justify-center gap-3 text-base shadow-xl shadow-saffron-100 hover:shadow-saffron-200 transition-all font-black uppercase tracking-widest"
          >
            {submitting ? <Spinner size="sm" /> : <><Send size={18} /> Submit Issue Report</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function DailyQR({ onAddLog, user }) {
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  const dailyCode = `SWDR-${today}`
  const qrData = JSON.stringify({
    userId: user?.id || 'unknown',
    date: today,
    token: dailyCode
  })
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=200x200&bgcolor=ffffff&color=2563eb&margin=10`

  const handleVerify = () => {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
      onAddLog({
        type: 'scan',
        msg: `Daily QR Verification completed (#${dailyCode})`,
        time: 'Just now'
      })
    }, 2000)
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto">
      <div className="glass-card p-8 border-t-4 border-t-blue-600 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <QrCode size={120} />
        </div>
        
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full mb-6">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Verification</span>
        </div>
        
        <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Daily Verification QR</h3>
        <p className="text-xs text-gray-500 mb-8 font-medium">Unique code generated for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <div className="relative group mx-auto w-52 h-52 mb-8">
           <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-[40px] blur-xl group-hover:blur-2xl transition-all duration-500" />
           <div className="relative bg-white p-4 rounded-3xl shadow-xl border border-blue-100">
             <img 
               src={qrUrl} 
               alt="Daily QR Code" 
               className="w-full h-auto rounded-lg"
             />
           </div>
           {verified && (
             <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center animate-scale-up">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-lg shadow-green-100">
                  <CheckCircle2 size={32} />
                </div>
                <p className="text-green-700 font-bold text-sm">Verified!</p>
             </div>
           )}
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Session Token</p>
          <p className="text-sm font-mono font-bold text-gray-700">{dailyCode}</p>
        </div>

        {!verified ? (
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="btn-primary w-full h-14 justify-center gap-3 text-base shadow-xl shadow-blue-100 hover:shadow-blue-200 transition-all font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-700 border-none"
          >
            {verifying ? <Spinner size="sm" /> : <><ShieldCheck size={18} /> Complete Verification</>}
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-green-600 font-bold italic text-sm">
            <CheckCircle2 size={16} />
            Verified at {new Date().toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-4 text-xs text-gray-400 font-medium px-4">
        <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />
        <p>This QR code expires in 24 hours. Please complete verification before end of shift.</p>
      </div>
    </div>
  )
}

function WorkerFeedback({ onAddLog }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [worker, setWorker] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const mockWorkers = [
    { id: 'WRK-1087', name: 'Ramesh Patel' },
    { id: 'WRK-1002', name: 'Sunita Devi' },
    { id: 'WRK-1003', name: 'Amit Kumar' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      onAddLog({
        type: 'feedback',
        msg: `Rated ${worker || 'Assigned Team'} · ${rating} Stars`,
        description: comment || 'No additional comments provided.',
        time: 'Just now'
      })
      setSubmitting(false)
      setSuccess(true)
      setComment('')
      setRating(0)
      setWorker('')
      setTimeout(() => setSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card p-6 border-t-4 border-t-amber-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
            <Star size={20} />
          </div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">Field Worker Performance</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Field Professional</label>
            <select
              value={worker}
              onChange={(e) => setWorker(e.target.value)}
              className="input-secure h-14 bg-white/50 backdrop-blur-sm text-sm border-gray-100"
            >
              <option value="">Assigned Team (Default)</option>
              {mockWorkers.map(w => (
                <option key={w.id} value={w.name}>{w.name} ({w.id})</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-center block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate Performance Quality</label>
            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={clsx(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                    rating >= s 
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-100 scale-110" 
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:scale-105"
                  )}
                >
                  <Star size={24} fill={rating >= s ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Detailed Feedback</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the cleaning quality, behavior, or timing..."
              className="input-secure min-h-[120px] text-sm bg-white/50 backdrop-blur-sm pt-4"
            />
          </div>

          <button
            type="submit"
            disabled={!rating || submitting}
            className="btn-secondary w-full h-14 justify-center gap-3 text-base bg-gray-900 border-none text-white shadow-xl hover:bg-black transition-all font-black uppercase tracking-widest"
          >
            {submitting ? <Spinner size="sm" /> : 'Submit Professional Rating'}
          </button>
        </form>
      </div>

      {success && (
        <div className="bg-green-600 text-white p-4 rounded-2xl text-center font-bold tracking-tight animate-slide-up flex items-center justify-center gap-2">
          <CheckCircle2 size={20} />
          Feedback processed successfully!
        </div>
      )}
    </div>
  )
}

// --- Main Layout ---

export default function UserDashboard({ view = 'dashboard' }) {
  const { user } = useAuth()
  const [activityLog, setActivityLog] = useState([])

  // Load activity from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('swacchdrishti_user_activity')
    if (saved) {
      try {
        setActivityLog(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse activity log')
      }
    } else {
      const initial = [
        { type: 'report', msg: 'Security verified perimeter gate.', time: '2 hrs ago', description: 'Routine check' },
        { type: 'feedback', msg: 'Rated Sunita Devi · 5 Stars', time: '5 hrs ago', description: 'Excellent cleanup' }
      ]
      setActivityLog(initial)
      localStorage.setItem('swacchdrishti_user_activity', JSON.stringify(initial))
    }
  }, [])

  const addLogEntry = (entry) => {
    const newList = [entry, ...activityLog].slice(0, 10)
    setActivityLog(newList)
    localStorage.setItem('swacchdrishti_user_activity', JSON.stringify(newList))
  }

  return (
    <div className="min-h-[calc(100vh-120px)] w-full animate-fade-in pb-10">
      <main className="flex-1 min-w-0 pt-2">
        {view === 'dashboard' && <DashboardHome user={user} activityLog={activityLog} />}
        {view === 'scan' && <DailyQR onAddLog={addLogEntry} user={user} />}
        {view === 'report' && <ReportIssue onAddLog={addLogEntry} />}
        {view === 'feedback' && <WorkerFeedback onAddLog={addLogEntry} />}
      </main>
    </div>
  )
}
