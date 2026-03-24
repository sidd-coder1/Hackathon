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
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  Users, CheckCircle2, TrendingUp, AlertTriangle, MapPin,
  Shield, Bell, RefreshCw, ChevronRight, FileDown
} from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  StatCard, Badge, StatusDot, AlertBanner, Spinner, Skeleton, SecureBadge, RoleBadge
} from '../components/ui/UIComponents'
import {
  mockWorkers, attendanceData, taskDistribution, alerts, recentActivity, stats
} from '../data/mockData'
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
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [realAttendance, setRealAttendance] = useState([])

  const loadData = async () => {
    try {
      const [users, attendance] = await Promise.all([getUsers(), getAttendance()])
      setRealAttendance(attendance)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
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
    
    autoTable(doc, {
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Field Workers', stats.totalWorkers.toString()],
        ['Active Today', stats.activeToday.toString()],
        ['Tasks Completed', stats.tasksCompleted.toString()],
        ['Civic Trust Score', stats.civicTrustScore.toString() + ' / 100'],
        ['Pending Alerts', visibleAlerts.length.toString()]
      ],
      theme: 'grid',
      headStyles: { fillColor: [255, 107, 0] },
      margin: { left: 14 }
    });

    // Worker List & Trust Scores
    let nextY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Worker List & Trust Scores', 14, nextY);
    
    const workerData = mockWorkers.map(w => [
      w.id,
      w.name,
      w.ward,
      w.attendance + '%',
      w.task,
      w.trustScore
    ]);

    autoTable(doc, {
      startY: nextY + 5,
      head: [['ID', 'Name', 'Ward', 'Attendance', 'Current Task', 'Trust Score']],
      body: workerData,
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

    autoTable(doc, {
      startY: nextY + 5,
      head: [['Time', 'Worker', 'Action', 'Location']],
      body: activityData,
      theme: 'striped',
      headStyles: { fillColor: [19, 136, 8] }, // Green
    });

    doc.save('SwachhDrishti_Supervisor_Report.pdf');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Ward Monitoring Center · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 sm:mt-0">
          <SecureBadge label="Live Monitoring" size="sm" />
          <button
            onClick={handleDownloadReport}
            className="btn-primary text-sm px-3 py-2 flex items-center gap-2"
          >
            <FileDown size={15} />
            Download Report
          </button>
          <button
            onClick={handleRefresh}
            className="btn-secondary text-sm px-3 py-2 flex items-center gap-2"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Field Workers" value={stats.totalWorkers}              icon={Users}         color="saffron" trend={3.2} />
        <StatCard label="Active Now"          value={stats.activeToday}               icon={Users}         color="green"  trend={1.8} />
        <StatCard label="Tasks Completed"     value={stats.tasksCompleted}            icon={CheckCircle2}  color="blue"   trend={5.1} />
        <StatCard label="Critical Alerts"     value={stats.alertsOpen}                icon={Bell}          color="red"    />
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
        <CivicTrustScore score={stats.civicTrustScore} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Weekly Ward Attendance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF6B00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
              <Area type="monotone" dataKey="present" name="Present" stroke="#FF6B00" fill="url(#gradPresent)" strokeWidth={2} />
              <Area type="monotone" dataKey="absent"  name="Absent"  stroke="#ef4444" fill="url(#gradAbsent)"  strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-5">Task Allocation</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {taskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {taskDistribution.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600 truncate">{d.name}</span>
                </div>
                <span className="text-gray-800 font-medium ml-2">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={16} className="text-red-500" /> Active Ward Alerts
            </h2>
            <Badge variant="danger">{visibleAlerts.length} Alerts</Badge>
          </div>
          <div className="space-y-3">
            {visibleAlerts.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-green-500" />
                No pending alerts.
              </div>
            ) : (
              visibleAlerts.map(alert => (
                <AlertBanner
                  key={alert.id}
                  type={alert.type}
                  title={alert.title}
                  message={`${alert.message} · ${alert.time}`}
                  onClose={() => setDismissedAlerts(p => [...p, alert.id])}
                />
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-saffron-500" /> Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-saffron-600">{item.worker.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{item.worker}</p>
                  <p className="text-xs text-gray-500">{item.action} · {item.ward}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
