import React from 'react'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-6 px-4 flex justify-center items-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-orange-50/50 border border-orange-100/50 flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-orange-500" />
        </div>
        <span className="text-sm font-medium text-gray-500">
          SwachhDrishti © 2026 · Govt. of India · All rights reserved
        </span>
      </div>
    </footer>
  )
}
