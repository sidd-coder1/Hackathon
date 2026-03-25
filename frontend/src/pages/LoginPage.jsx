import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Fingerprint, Building2, HardHat } from 'lucide-react'
import { SecureBadge, Spinner } from '../components/ui/UIComponents'

const DEMO_CREDS = {
  user:       { email: 'user@swacchdrishti.gov.in',      password: 'User@123'     },
  supervisor: { email: 'supervisor@swacchdrishti.gov.in', password: 'Super@456'   },
  worker:     { email: 'worker@swacchdrishti.gov.in',     password: 'Worker@789'  },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [role, setRole] = useState('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1=role, 2=credentials

  const fillDemo = () => {
    const c = DEMO_CREDS[role]
    setEmail(c.email)
    setPassword(c.password)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your credentials.'); return }
    const expected = DEMO_CREDS[role]
    if (email !== expected.email || password !== expected.password) {
      setError('Invalid credentials. Access denied.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    await login(role, { email })
    setLoading(false)
    navigate(role === 'worker' ? '/worker' : role === 'user' ? '/user' : '/supervisor')
  }

  const roles = [
    { id: 'user',       label: 'User',           desc: 'Watchman / Secretary',    icon: Shield, color: 'text-saffron-500' },
    { id: 'supervisor', label: 'Supervisor',      desc: 'Ward monitoring access',  icon: Building2, color: 'text-blue-500' },
    { id: 'worker',     label: 'Field Worker',    desc: 'Attendance & task access', icon: HardHat, color: 'text-green-600' },
  ]

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
          <p className="text-sm text-saffron-600 font-medium">Municipal Workforce Tracking System</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <SecureBadge label="Government Secured Portal" size="sm" />
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6 md:p-8 shadow-2xl shadow-gray-200/50">
          {step === 1 ? (
            <>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Select Your Role</h2>
              <p className="text-xs text-gray-500 mb-5">Choose your access level to continue</p>
              <div className="space-y-3 mb-6">
                {roles.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left group ${
                      role === r.id
                        ? 'border-saffron-500/60 bg-saffron-50 shadow-md shadow-saffron-100'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg border transition-transform duration-300 group-hover:scale-110 shadow-sm ${
                      role === r.id ? 'bg-white border-saffron-200 ' + r.color : 'bg-white border-gray-200 text-gray-400 group-hover:' + r.color
                    }`}>
                      <r.icon size={22} className={role === r.id ? 'drop-shadow-sm' : ''} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{r.label}</p>
                      <p className="text-xs text-gray-500">{r.desc}</p>
                    </div>
                    {role === r.id && <CheckCircle2 size={18} className="text-saffron-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(2)}
                className="btn-primary w-full justify-center"
              >
                Continue <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-900 transition-colors text-lg leading-none"
                >←</button>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Secure Login</h2>
                  <p className="text-xs text-gray-500">
                    Role: <span className="text-saffron-600 font-medium capitalize">{role}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      autoComplete="current-password"
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

                {/* Demo hint */}
                <button
                  type="button"
                  onClick={fillDemo}
                  className="text-xs text-saffron-600 hover:text-saffron-700 transition-colors underline underline-offset-2"
                >
                  Fill demo credentials for {role}
                </button>

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        Login
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Sign Up
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-gray-400" /> 256-bit SSL Encrypted · ISO 27001 Compliant · Govt. of India
          </p>
          <p className="text-xs text-gray-500">SwachhDrishti v2.1.0 · NICT Certified</p>
        </div>
      </div>
    </div>
  )
}
