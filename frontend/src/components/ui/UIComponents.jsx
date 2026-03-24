import React from 'react'
import clsx from 'clsx'
import { AlertOctagon, AlertTriangle, CheckCircle2, Info, Lock } from 'lucide-react'

// Badge component
export function Badge({ variant = 'default', children, className }) {
  const variants = {
    default:  'bg-gray-100 text-gray-700 border border-gray-200',
    success:  'bg-green-50 text-green-700 border border-green-200',
    warning:  'bg-amber-50 text-amber-700 border border-amber-200',
    danger:   'bg-red-50 text-red-700 border border-red-200',
    info:     'bg-blue-50 text-blue-700 border border-blue-200',
    saffron:  'bg-saffron-50 text-saffron-700 border border-saffron-200',
  }
  return (
    <span className={clsx('secure-badge text-xs font-semibold tracking-wide uppercase', variants[variant], className)}>
      {children}
    </span>
  )
}

// StatusDot component
export function StatusDot({ status }) {
  const colors = {
    active:    'bg-green-500 shadow-green-500/30',
    absent:    'bg-red-500 shadow-red-500/30',
    'on-leave':'bg-amber-500 shadow-amber-500/30',
    online:    'bg-green-500',
    offline:   'bg-gray-400',
    pending:   'bg-amber-400',
  }
  return (
    <span className={clsx('status-dot shadow-md animate-pulse-slow', colors[status] || 'bg-gray-400')} />
  )
}

// StatCard component
export function StatCard({ label, value, icon: Icon, trend, color = 'saffron', children }) {
  const colorMap = {
    saffron: 'text-saffron-600 bg-saffron-50 border-saffron-100',
    green:   'text-green-600    bg-green-50   border-green-100',
    blue:    'text-blue-600     bg-blue-50    border-blue-100',
    red:     'text-red-600      bg-red-50     border-red-100',
    purple:  'text-purple-600   bg-purple-50  border-purple-100',
  }
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={clsx('text-xs mt-1 font-medium', trend > 0 ? 'text-green-600' : 'text-red-600')}>
              {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl border', colorMap[color])}>
            <Icon size={22} />
          </div>
        )}
      </div>
      {children}
    </div>
  )
}

// LoadingSpinner
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }
  return (
    <div className={clsx('rounded-full border-gray-200 border-t-saffron-500 animate-spin', sizes[size], className)} />
  )
}

// Skeleton loader
export function Skeleton({ className }) {
  return <div className={clsx('bg-gray-200 rounded-xl animate-pulse', className)} />
}

// Alert/Toast component for UI
export function AlertBanner({ type = 'info', title, message, onClose }) {
  const config = {
    critical: { bg: 'bg-red-50 border-red-200',   icon: AlertOctagon, text: 'text-red-800'    },
    warning:  { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, text: 'text-amber-800'  },
    success:  { bg: 'bg-green-50 border-green-200', icon: CheckCircle2, text: 'text-green-800'  },
    info:     { bg: 'bg-blue-50 border-blue-200',   icon: Info, text: 'text-blue-800'   },
  }
  const c = config[type] || config.info
  return (
    <div className={clsx('flex items-start gap-3 p-4 rounded-xl border animate-slide-up', c.bg)}>
      <div className="flex-shrink-0 mt-0.5">
        <c.icon size={18} className={c.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={clsx('text-sm font-semibold', c.text)}>{title}</p>
        {message && <p className="text-xs text-gray-600 mt-0.5">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none flex-shrink-0">×</button>
      )}
    </div>
  )
}

// SecureBadge – visual trust indicator
export function SecureBadge({ label = 'Secured', size = 'sm' }) {
  const isSm = size === 'sm';
  return (
    <div className={clsx(
      'group inline-flex items-center gap-2 font-semibold text-green-700 bg-white border border-green-200 rounded-full shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-300 cursor-default',
      isSm ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
    )}>
      <div className="relative flex items-center justify-center p-1.5 rounded bg-gradient-to-br from-green-50 to-green-100 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] border border-green-300/50 transition-all duration-300">
        <Lock size={isSm ? 12 : 14} className="text-green-600 relative z-10" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
        {label}
      </div>
    </div>
  )
}

// RoleBadge
export function RoleBadge({ role }) {
  const map = {
    user:       { label: 'Area Watchman', variant: 'saffron' },
    supervisor: { label: 'Supervisor',    variant: 'info'    },
    worker:     { label: 'Field Worker',  variant: 'success' },
  }
  const r = map[role] || { label: role, variant: 'default' }
  return <Badge variant={r.variant}>{r.label}</Badge>
}
