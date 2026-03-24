import React from 'react'

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        
        {/* Branding */}
        <div>
          <h2 className="font-bold text-gray-900">SwachhDrishti</h2>
          <p className="text-xs text-gray-500 mt-1">
            Empowering India's Municipal Workforce
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Government of India Initiative
          </p>
        </div>

        {/* About */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">About</h3>
          <p className="text-gray-500 text-xs leading-relaxed">
            Citizen-centric platform for transparent and efficient municipal workforce monitoring.
          </p>
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 leading-tight">Content owned and maintained by SwachhDrishti Team</p>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Designed under Digital India Programme</p>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Government of India</p>
          </div>
        </div>

        {/* Initiatives */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Government Initiatives</h3>
          <div className="flex flex-wrap gap-3 items-center mt-6 pt-4 border-t border-gray-200">
            <img src="/logos/digital-india.png" alt="Digital India" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/logos/swachh-bharat.png" alt="Swachh Bharat" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/logos/mygov.png" alt="MyGov" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/logos/umang.png" alt="UMANG" className="h-6 opacity-70 hover:opacity-100 transition" />
            <img src="/logos/digilocker.png" alt="DigiLocker" className="h-6 opacity-70 hover:opacity-100 transition" />
          </div>
        </div>

        {/* Links & Contact */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Quick Links</h3>
          <ul className="space-y-1.5 text-gray-500 text-xs">
            <li className="hover:text-gray-900 cursor-pointer transition-colors">Dashboard</li>
            <li className="hover:text-gray-900 cursor-pointer transition-colors">Worker Info</li>
            <li className="hover:text-gray-900 cursor-pointer transition-colors">User Info</li>
            <li className="hover:text-gray-900 cursor-pointer transition-colors">Analytics</li>
          </ul>
          
          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Contact / Support</h3>
          <ul className="space-y-1.5 text-gray-500 text-xs">
            <li>Email: <a href="mailto:support@swachhdrishti.gov.in" className="hover:text-gray-900 transition-colors">support@swachhdrishti.gov.in</a></li>
            <li>Helpline: <a href="tel:1800000000" className="hover:text-gray-900 transition-colors">1800-000-000</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        © 2026 SwachhDrishti | Government of India Initiative
      </div>
    </footer>
  )
}
