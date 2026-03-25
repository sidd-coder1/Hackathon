import React from 'react'
import { Shield, Sparkles } from 'lucide-react'

export default function FrontpageFooter() {
  return (
    <footer className="relative bg-slate-800 text-slate-300 pt-16 pb-8 px-6 mt-auto overflow-hidden border-t border-slate-700">
      
      {/* Decorative Tricolor Top Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600" />
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 text-center z-10">
        
        {/* Top: Project name + tagline */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center">
              <Shield size={20} className="text-orange-400" />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              SwachhDrishti
            </h2>
          </div>
          <p className="text-sm text-slate-400 font-medium italic flex items-center gap-1.5">
            <Sparkles size={14} className="text-orange-400" /> 
            "Every Worker Counts. Every Task Matters."
          </p>
        </div>

        {/* Middle: Links */}
        <div className="flex items-center gap-8 text-sm font-semibold tracking-wide">
          <a href="#about" className="text-slate-400 hover:text-orange-400 transition-colors">About System</a>
          <a href="#contact" className="text-slate-400 hover:text-orange-400 transition-colors">Contact Support</a>
          <a href="#privacy" className="text-slate-400 hover:text-orange-400 transition-colors">Privacy Policy</a>
        </div>

        {/* Bottom: Copyright */}
        <div className="w-full max-w-sm border-t border-slate-700/60 pt-6 mt-2">
          <p className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">
            © 2026 SwachhDrishti · Govt. of India Platform
          </p>
        </div>

      </div>
    </footer>
  )
}
