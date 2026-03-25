import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Eye, EyeOff, AlertCircle, ArrowRight, UserPlus } from 'lucide-react'
import { SecureBadge, Spinner } from '../components/ui/UIComponents'

export default function SignupPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Please fill all fields.'); return }
    setLoading(true)
    // Simulate signup request
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md animate-slide-up relative z-10 glass-card p-8 text-center shadow-2xl shadow-gray-200/50">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Successful</h2>
          <p className="text-gray-600 text-sm mb-6">Your account has been created successfully. Welcome to SwachhDrishti!</p>
          <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center">
            Proceed to Login <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">

      {/* Tricolor accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-saffron-500 via-white to-brand-green" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img 
            src="/emblem.svg" 
            alt="Government of India" 
            className="w-16 h-auto mb-4 drop-shadow-sm"
          />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1 tracking-tight">SwachhDrishti</h1>
          <p className="text-sm text-saffron-600 font-medium">Create your account</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <SecureBadge label="Government Secured Portal" size="sm" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6 md:p-8 shadow-2xl shadow-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-500 hover:text-gray-900 transition-colors text-lg leading-none"
            >←</button>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Sign Up</h2>
              <p className="text-xs text-gray-500">
                Register as a new user
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                className="input-secure"
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1.5 block">Government Email ID</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@swacchdrishti.gov.in"
                className="input-secure"
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-600 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="input-secure pr-11"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Sign Up
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-secondary flex-1 justify-center"
              >
                Login
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <Shield size={12} className="text-gray-400" /> 256-bit SSL Encrypted · ISO 27001 Compliant · Govt. of India
          </p>
          <p className="text-xs text-gray-500">SwachhDrishti v2.1.0 · NICT Certified</p>
        </div>
      </div>
    </div>
  )
}
