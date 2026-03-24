import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  MapPin, 
  Camera, 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send,
  ThumbsUp
} from 'lucide-react'
import { Badge, Spinner } from '../components/ui/UIComponents'
import clsx from 'clsx'

export default function UserDashboard() {
  const { user } = useAuth()
  const [reportText, setReportText] = useState('')
  const [feedbackText, setFeedbackText] = useState('')
  const [rating, setRating] = useState(0)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleReportSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setReportText('')
      setPhotoUploaded(false)
      setTimeout(() => setSubmitted(false), 3000)
    }, 1500)
  }

  const areaStatus = 'Good' // mock status

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good Morning,</h1>
          <p className="text-saffron-600 font-bold">{user?.name}</p>
          <p className="text-xs text-gray-500 mt-1">Area Secretary / Watchman</p>
        </div>
        <div className="text-right bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Area</p>
          <div className="flex items-center gap-1.5 text-saffron-600">
            <MapPin size={14} />
            <span className="text-sm font-bold">{user?.ward || 'Green Park Sector 7'}</span>
          </div>
        </div>
      </div>

      {/* Area Status Card */}
      <div className={clsx(
        "glass-card p-6 border-l-4 transition-all duration-500",
        areaStatus === 'Good' ? "border-l-green-500 bg-gradient-to-br from-white to-green-50" : "border-l-amber-500 bg-gradient-to-br from-white to-amber-50"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={clsx(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
              areaStatus === 'Good' ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
            )}>
              {areaStatus === 'Good' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cleanliness Status</p>
              <h2 className={clsx(
                "text-2xl font-black uppercase tracking-tight",
                areaStatus === 'Good' ? "text-green-700" : "text-amber-700"
              )}>{areaStatus === 'Good' ? 'Satisfactory' : 'Needs Attention'}</h2>
            </div>
          </div>
          <Badge variant={areaStatus === 'Good' ? 'success' : 'warning'} className="px-4 py-1.5 rounded-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Issue Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-red-50 text-red-500 rounded-lg">
              <AlertTriangle size={18} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Report Cleanliness Issue</h3>
          </div>

          <form onSubmit={handleReportSubmit} className="space-y-4">
            <div 
              onClick={() => setPhotoUploaded(true)}
              className={clsx(
                "w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                photoUploaded ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200 hover:border-saffron-300 hover:bg-saffron-50"
              )}
            >
              {photoUploaded ? (
                <>
                  <CheckCircle2 size={32} className="text-green-500" />
                  <p className="text-xs text-green-700 font-bold">Photo Captured Successfully</p>
                </>
              ) : (
                <>
                  <Camera size={32} className="text-gray-400" />
                  <p className="text-xs text-gray-500 font-medium text-center px-4">
                    Tap to capture & verify local issue
                  </p>
                </>
              )}
            </div>

            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue (e.g., Uncollected garbage at the main gate)..."
              className="input-secure h-24 text-sm bg-white"
            />

            <button
              type="submit"
              disabled={!reportText || submitting}
              className="btn-primary w-full justify-center gap-2 shadow-lg shadow-saffron-100"
            >
              {submitting ? <Spinner size="sm" /> : <><Send size={16} /> Submit Daily Report</>}
            </button>
          </form>
        </div>

        {/* Worker Feedback Card */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
              <Star size={18} />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Worker Feedback</h3>
          </div>

          <p className="text-xs text-gray-500 mb-4 font-medium leading-loose">
            Rate the performance of the assigned worker team in your area today.
          </p>

          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  rating >= s ? "bg-saffron-500 text-white shadow-lg shadow-saffron-200 scale-110" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                <Star size={20} fill={rating >= s ? "currentColor" : "none"} />
              </button>
            ))}
          </div>

          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Any specific praise or suggestions?"
            className="input-secure h-24 text-sm bg-white"
          />

          <button
            onClick={() => {
               setSubmitting(true)
               setTimeout(() => {
                 setSubmitting(false)
                 setFeedbackText('')
                 setRating(0)
                 setSubmitted(true)
                 setTimeout(() => setSubmitted(false), 3000)
               }, 1000)
            }}
            disabled={!rating || submitting}
            className="w-full h-11 bg-gray-900 text-white rounded-xl font-bold text-sm mt-4 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? <Spinner size="sm" /> : 'Submit Feedback'}
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {submitted && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up z-50 border border-gray-700">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <p className="text-sm font-bold pr-2">Report Submitted Successfully!</p>
        </div>
      )}

      {/* Community Activity */}
      <div className="glass-card p-5">
        <h3 className="text-xs font-bold text-gray-900 mb-4 flex items-center gap-2 tracking-wider uppercase">
          <MessageSquare size={14} className="text-saffron-600" /> Recent Community Activity
        </h3>
        <div className="space-y-4">
          {[
            { user: 'Security Guard', msg: 'Main gate perimeter cleared by worker Ramesh.', time: '1 hr ago', type: 'info' },
            { user: 'Block A Secretary', msg: 'Drainage clearing pending near tower 3.', time: '4 hrs ago', type: 'warn' }
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start border-l-2 border-gray-200 pl-4 py-1">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900">{item.user}</p>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed italic">"{item.msg}"</p>
                <p className="text-[10px] text-gray-400 mt-1.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
