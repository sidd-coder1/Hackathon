import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, MapPin, Users, BarChart3, ArrowRight, CheckCircle2, Zap, Lock } from 'lucide-react'

const features = [
  { icon: MapPin,    title: 'GPS-Based Tracking',    desc: 'Real-time location tracking of every field worker with spoofing detection' },
  { icon: Shield,    title: 'Secure Attendance',      desc: 'Biometric + GPS verified attendance ensuring zero proxy marking' },
  { icon: Users,     title: 'Role-Based Access',      desc: 'Separate dashboards for Workers, Supervisors, and Area Watchmen' },
  { icon: BarChart3, title: 'Analytics & Reports',    desc: 'Comprehensive performance metrics, heatmaps, and automated reports' },
  { icon: Zap,       title: 'Real-Time Alerts',       desc: 'Instant notifications for anomalies, absences, and GPS irregularities' },
  { icon: Lock,      title: 'Enterprise Security',    desc: 'ISO 27001 compliant with end-to-end encryption and audit trails' },
]

const stats = [
  { value: '168+',  label: 'Active Workers'   },
  { value: '32',    label: 'Municipal Wards'  },
  { value: '98.1%', label: 'System Uptime'    },
  { value: '4.8/5', label: 'Civic Trust Score'},
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen text-gray-900 overflow-hidden">
      {/* Tricolor top bar */}
      <div className="h-1 bg-gradient-to-r from-saffron-500 via-white to-brand-green" />

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3 md:gap-4">
          <img 
            src="/emblem.svg" 
            alt="Government of India" 
            className="w-10 md:w-12 h-auto flex-shrink-0"
          />
          <div className="border-l-2 border-saffron-500 pl-3">
            <h1 className="text-base md:text-lg font-extrabold text-gray-900 leading-tight tracking-tight">SwachhDrishti</h1>
            <p className="text-[10px] md:text-xs text-saffron-600 font-bold uppercase tracking-wide leading-tight mt-0.5">Govt. of India Initiative</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary text-sm px-4 py-2"
        >
          <Lock size={14} /> Login <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 md:px-12 py-20">
        {/* Bg glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 right-20 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center animate-slide-up relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-saffron-50 border border-saffron-200 rounded-full text-sm text-saffron-600 font-medium mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
            Government of India · Digital India Initiative
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-gray-900">Empowering India's</span>
            <br />
            <span className="text-gradient">Municipal Workforce</span>
          </h1>

          <p className="text-xl md:text-2xl text-saffron-600 font-semibold mb-4 italic">
            "Every Worker Counts. Every Task Matters."
          </p>

          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            SwachhDrishti brings transparency, accountability, and real-time monitoring
            to municipal operations through GPS-verified attendance and AI-powered insights.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-3.5">
              Get Started <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-base px-8 py-3.5"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map(s => (
              <div key={s.label} className="glass-card p-4 md:p-5 hover:bg-gray-50 transition-all duration-300">
                <p className="text-2xl md:text-3xl font-extrabold text-gradient mb-1">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 md:px-12 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs text-saffron-600 uppercase tracking-widest font-semibold mb-3">Platform Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Built for Scale. Secured for Trust.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6 hover:bg-gray-50 hover:border-saffron-200 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center mb-4 group-hover:bg-saffron-100 transition-colors">
                  <Icon size={20} className="text-saffron-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-12 border-t border-gray-200 bg-transparent">
        <div className="max-w-3xl mx-auto glass-card p-10 text-center relative overflow-hidden bg-gradient-to-br from-saffron-50/50 to-green-50/50">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Modernise Municipal Management?
            </h2>
            <p className="text-gray-600 mb-8">Join India's leading municipal tracking platform.</p>
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-3.5">
              Access Dashboard <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 md:px-12 bg-transparent">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-saffron-50 flex items-center justify-center">
              <Shield size={14} className="text-saffron-500" />
            </div>
            <span className="text-sm text-gray-500">SwachhDrishti © 2026 · Govt. of India · All rights reserved</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <CheckCircle2 size={13} className="text-green-600" />
            ISO 27001 · GDPR Compliant · NICT Certified
          </div>
        </div>
      </footer>
    </div>
  )
}
