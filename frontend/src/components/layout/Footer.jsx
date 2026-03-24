import React from 'react'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 pt-6 pb-2 w-full flex-shrink-0">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Scope */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <span className="font-extrabold text-gray-900 text-sm tracking-tight">SwachhDrishti</span>
          <span className="text-[10px] font-bold text-gray-500">Empowering India's Municipal Workforce</span>
          <span className="text-[10px] font-black text-[#FF9933] uppercase tracking-wider mt-1">Government of India Initiative</span>
        </div>
        
        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold text-gray-500">
          <a href="#" className="hover:text-gray-900 transition-colors">Dashboard</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Analytics</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 text-center text-[10px] font-bold text-gray-400">
        © 2026 SwachhDrishti. All rights reserved.
      </div>
    </footer>
  )
}
