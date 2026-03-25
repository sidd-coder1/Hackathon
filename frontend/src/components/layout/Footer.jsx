import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Footer() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleDashboardClick = () => {
    if (!user) {
      navigate('/login')
    } else if (user.role === 'worker') {
      navigate('/worker')
    } else if (user.role === 'user') {
      navigate('/user/scan')
    } else {
      navigate('/supervisor')
    }
  }

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
        
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
            SwachhDrishti is a digital governance platform enabling transparency, accountability, and real-time monitoring of municipal workforce operations using GPS and AI-driven insights.
          </p>
        </div>

        {/* Initiatives */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-2">Government Initiatives</h3>
          <div className="flex flex-wrap gap-3 mt-2">
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
            <li><span onClick={handleDashboardClick} className="cursor-pointer hover:text-gray-900 transition">Dashboard</span></li>
            <li><span onClick={() => navigate('/supervisor/workers')} className="cursor-pointer hover:text-gray-900 transition">Worker Info</span></li>
            <li><span onClick={() => navigate('/user-info')} className="cursor-pointer hover:text-gray-900 transition">User Info</span></li>
            <li><span onClick={() => navigate('/analytics')} className="cursor-pointer hover:text-gray-900 transition">Analytics</span></li>
          </ul>
          
          <h3 className="font-semibold text-gray-800 mt-4 mb-2">Contact</h3>
          <ul className="space-y-1.5 text-gray-500 text-xs">
            <li>Email: <a href="mailto:support@swachhdrishti.gov.in" className="hover:text-gray-900 transition">support@swachhdrishti.gov.in</a></li>
            <li>Helpline: <a href="tel:1800000000" className="hover:text-gray-900 transition">1800-000-000</a></li>
          </ul>
        </div>
      </div>

      {/* Legal & Bottom bar */}
      <div className="text-center text-xs text-gray-400 py-4 border-t border-gray-200">
        <p className="mb-1">Content owned and maintained by SwachhDrishti Team | Designed under Digital India Programme</p>
        <p>© 2026 SwachhDrishti | Government of India Initiative</p>
      </div>
    </footer>
  )
}
