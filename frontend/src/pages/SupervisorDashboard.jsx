import React, { useState, useEffect, useRef } from 'react'
import { getUsers, getAttendance } from '../services/firebaseService'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const createCustomIcon = (status) => L.divIcon({
  html: `<div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-lg ${status === 'active' ? 'bg-green-500 animate-pulse-slow' : 'bg-red-500'}"></div>`,
  className: '',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
})
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Users, CheckCircle2, TrendingUp, AlertTriangle, MapPin,
  Shield, Bell, RefreshCw, ChevronRight, FileDown,
  Activity, AlertCircle, Clock, BarChart3, ShieldCheck
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  StatCard, Badge, SecureBadge
} from '../components/ui/UIComponents'
import clsx from 'clsx'

const CHART_COLORS = { saffron: '#FF6B00', green: '#138808', blue: '#3b82f6' }

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card px-3 py-2.5 text-xs shadow-xl border border-gray-100">
      <p className="text-gray-600 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

function RealTimeMap({ attendanceList }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current).setView([28.6448, 77.2167], 11);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const today = new Date().toISOString().split('T')[0];
    const activePins = attendanceList.filter(a => a.date === today && a.location);

    activePins.forEach(pin => {
      if (pin.location?.lat && pin.location?.lng) {
        const marker = L.marker([pin.location.lat, pin.location.lng], {
          icon: createCustomIcon('active')
        }).addTo(map);
        
        const timeStr = pin.timestamp ? new Date(pin.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
        marker.bindPopup(`
          <div class="p-1 -m-1 min-w-[140px] font-sans">
            <p class="font-bold text-gray-900 text-sm mb-0.5">${pin.userName || 'Unknown Worker'}</p>
            <div class="flex items-center gap-1.5 text-xs text-green-600 font-medium mb-1">
              <span class="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active Now
            </div>
            <p class="text-[10px] text-gray-500 mt-1">${pin.ward || 'Unknown Ward'}</p>
            <p class="text-[10px] text-gray-400">Verified: ${timeStr}</p>
          </div>
        `);
      }
    });
  }, [attendanceList]);

  const today = new Date().toISOString().split('T')[0];
  const activePinsCount = attendanceList.filter(a => a.date === today && a.location).length;

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200" style={{ isolation: 'isolate' }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      <div className="absolute top-3 left-3 px-3 py-1.5 text-xs flex items-center gap-2 z-[400] shadow-sm bg-white/95 backdrop-blur-md border border-gray-100/50 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-600 font-bold tracking-wide uppercase text-[10px] mt-0.5">Live Tracking</span>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] font-bold tracking-wide text-gray-600 z-[400] px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-lg shadow-sm border border-gray-100/50">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> ACTIVE ({activePinsCount})</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> OFFLINE</span>
      </div>
    </div>
  )
}

function CivicTrustScore({ score = 84.7 }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-500' : 'text-red-600'
  const ring = score >= 80 ? 'border-green-500/60' : score >= 60 ? 'border-amber-500/60' : 'border-red-500/60'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement'

  return (
    <div className="glass-card p-6 flex flex-col items-center text-center">
      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Civic Trust Score</p>
      <div className={clsx('w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mb-4 glow-green bg-white', ring)}>
        <span className={clsx('text-3xl font-extrabold', color)}>{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
      <Badge variant={score >= 80 ? 'success' : score >= 60 ? 'warning' : 'danger'}>{label}</Badge>
      <p className="text-xs text-gray-600 mt-3 max-w-[160px] leading-relaxed">
        Performance across your assigned Ward
      </p>
    </div>
  )
}

export default function SupervisorDashboard() {
  const [stats, setStats] = useState([
    { label: 'Total Workers', value: '0', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Syncing...' },
    { label: 'Active Now', value: '0', icon: Activity, color: 'text-green-600', bg: 'bg-green-50', trend: 'Live' },
    { label: 'Ward Alerts', value: '0', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'Active' },
    { label: 'Avg Trust Score', value: '0%', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Stable' },
  ])
  const [loading, setLoading] = useState(true)
  const [alerts, setAlerts] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [realAttendance, setRealAttendance] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [workersList, setWorkersList] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      const [users, attendance] = await Promise.all([getUsers(), getAttendance()])
      setRealAttendance(attendance)
      processDashboardData(users, attendance)
    } catch (err) {
      console.error('Data sync failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const processDashboardData = (users, attendance) => {
    const workers = users.filter(u => u.role === 'worker')
    setWorkersList(workers)
    const totalWorkers = workers.length
    const today = new Date().toISOString().split('T')[0]
    const activeToday = attendance.filter(a => a.date === today && a.status === 'present').length
    
    // Average score calculation
    const avgScore = workers.length ? Math.round(workers.reduce((acc, w) => acc + (w.trustScore || 85), 0) / workers.length) : 84

    setStats([
      { label: 'Total Workers', value: totalWorkers.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: `${totalWorkers} registered` },
      { label: 'Active Now', value: activeToday.toString(), icon: Activity, color: 'text-green-600', bg: 'bg-green-50', trend: 'Live updates' },
      { label: 'Ward Alerts', value: '0', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', trend: 'No issues' },
      { label: 'Avg Trust Score', value: `${avgScore}%`, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', trend: 'Stable' },
    ])
    setAlerts([])
    setRecentActivity([])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    await loadData()
  }

  const visibleAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id))

  const handleDownloadReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(255, 107, 0); // Saffron color
    doc.text('SwachhDrishti Report', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Supervisor Dashboard - Ward Monitoring Center`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 34);

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Dashboard Summary', 14, 45);
    
    const trustScoreStat = stats.find(s => s.label === 'Avg Trust Score')?.value || 'N/A'
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Field Workers', workersList.length.toString()],
        ['Active Today', stats.find(s => s.label === 'Active Now')?.value || '0'],
        ['Civic Trust Score', trustScoreStat],
        ['Pending Alerts', visibleAlerts.length.toString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 0] },
      margin: { left: 14 }
    });

    // Worker List
    let nextY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Worker List & Trust Scores', 14, nextY);
    
    const workerDataRows = workersList.map(w => [
      w.id || w.employeeId || 'N/A',
      w.name || 'Unknown',
      w.ward || 'General',
      (w.attendance || 80) + '%',
      w.trustScore || 85
    ]);

    autoTable(doc, {
      startY: nextY + 5,
      head: [['ID', 'Name', 'Ward', 'Attendance', 'Trust Score']],
      body: workerDataRows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue
    });

    // Recent Activity / Log
    nextY = doc.lastAutoTable.finalY + 15;
    if (nextY > 250) {
      doc.addPage();
      nextY = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Recent Activity & Log', 14, nextY);
    
    const activityData = recentActivity.map(a => [
      a.time,
      a.worker,
      a.action,
      a.ward
    ]);

    if (activityData.length > 0) {
        autoTable(doc, {
          startY: nextY + 5,
          head: [['Time', 'Worker', 'Action', 'Location']],
          body: activityData,
          theme: 'striped',
          headStyles: { fillColor: [19, 136, 8] }, // Green
        });
    } else {
        doc.setFontSize(10);
        doc.text('No recent activity records available.', 14, nextY + 10);
    }

    doc.save('SwachhDrishti_Supervisor_Report.pdf');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium tracking-tight">Monitoring municipal workforce performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <SecureBadge label="Live Monitoring" size="sm" />
          <button
            onClick={handleDownloadReport}
            className="btn-primary text-sm px-3 py-2 flex items-center gap-2 transition-all hover:-translate-y-0.5"
          >
            <FileDown size={15} />
            Download Report
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary text-sm px-3 py-2 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} loading={loading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={16} className="text-saffron-500" /> Ward Real-time Map
            </h2>
            <Badge variant="success">{realAttendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length} Active Pins</Badge>
          </div>
          <RealTimeMap attendanceList={realAttendance} />
        </div>
        <CivicTrustScore score={parseInt(stats.find(s => s.label === 'Avg Trust Score')?.value || '85', 10)} />
      </div>
    </div>
  )
}
