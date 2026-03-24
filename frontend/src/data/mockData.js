// Mock data for SwachhDrishti application

export const mockWorkers = [
  { id: 'WRK-1001', name: 'Ramesh Patel',     ward: 'Ward 14',  zone: 'North',  status: 'active',   attendance: 96, task: 'Street Cleaning',    gps: 'Active',   lastSeen: '2 min ago',  trustScore: 92 },
  { id: 'WRK-1002', name: 'Sunita Devi',      ward: 'Ward 7',   zone: 'South',  status: 'active',   attendance: 89, task: 'Waste Collection',   gps: 'Active',   lastSeen: '5 min ago',  trustScore: 87 },
  { id: 'WRK-1003', name: 'Mohan Singh',      ward: 'Ward 22',  zone: 'East',   status: 'absent',   attendance: 72, task: 'Drain Maintenance',  gps: 'Inactive', lastSeen: '3 hrs ago',  trustScore: 65 },
  { id: 'WRK-1004', name: 'Kavita Sharma',    ward: 'Ward 3',   zone: 'West',   status: 'active',   attendance: 94, task: 'Park Maintenance',   gps: 'Active',   lastSeen: 'Just now',   trustScore: 95 },
  { id: 'WRK-1005', name: 'Arjun Yadav',      ward: 'Ward 18',  zone: 'Central',status: 'on-leave', attendance: 81, task: 'Road Sweeping',      gps: 'Inactive', lastSeen: '1 day ago',  trustScore: 78 },
  { id: 'WRK-1006', name: 'Priya Kumari',     ward: 'Ward 9',   zone: 'North',  status: 'active',   attendance: 98, task: 'Waste Collection',   gps: 'Active',   lastSeen: '1 min ago',  trustScore: 99 },
  { id: 'WRK-1007', name: 'Deepak Gupta',     ward: 'Ward 11',  zone: 'South',  status: 'active',   attendance: 85, task: 'Road Sweeping',      gps: 'Active',   lastSeen: '8 min ago',  trustScore: 83 },
  { id: 'WRK-1008', name: 'Meena Verma',      ward: 'Ward 5',   zone: 'East',   status: 'absent',   attendance: 61, task: 'Street Cleaning',    gps: 'Inactive', lastSeen: '6 hrs ago',  trustScore: 55 },
]

export const attendanceData = [
  { day: 'Mon', present: 142, absent: 18, leave: 8 },
  { day: 'Tue', present: 138, absent: 22, leave: 8 },
  { day: 'Wed', present: 150, absent: 12, leave: 6 },
  { day: 'Thu', present: 145, absent: 15, leave: 8 },
  { day: 'Fri', present: 139, absent: 21, leave: 8 },
  { day: 'Sat', present: 120, absent: 30, leave: 18 },
  { day: 'Sun', present: 88,  absent: 50, leave: 30 },
]

export const weeklyPerformance = [
  { week: 'Week 1', score: 74 },
  { week: 'Week 2', score: 78 },
  { week: 'Week 3', score: 82 },
  { week: 'Week 4', score: 79 },
  { week: 'Week 5', score: 85 },
  { week: 'Week 6', score: 88 },
  { week: 'Week 7', score: 91 },
  { week: 'Week 8', score: 89 },
]

export const taskDistribution = [
  { name: 'Waste Collection',  value: 38, color: '#FF6B00' },
  { name: 'Street Cleaning',   value: 28, color: '#138808' },
  { name: 'Drain Maintenance', value: 16, color: '#3b82f6' },
  { name: 'Park Maintenance',  value: 11, color: '#8b5cf6' },
  { name: 'Road Sweeping',     value: 7,  color: '#f59e0b' },
]

export const alerts = [
  { id: 1, type: 'critical', title: 'GPS Spoofing Detected',        message: 'Worker WRK-1003 GPS signal anomaly in Ward 22',  time: '10 min ago', icon: 'shield-alert' },
  { id: 2, type: 'warning',  title: 'Low Attendance Alert',         message: 'Ward 5 attendance dropped below 70% threshold',   time: '25 min ago', icon: 'users' },
  { id: 3, type: 'info',     title: 'Photo Verification Pending',   message: '14 workers have not submitted today\'s photos',  time: '1 hr ago',   icon: 'camera' },
  { id: 4, type: 'success',  title: 'Task Completion Milestone',    message: 'Ward 14 achieved 100% task completion this week', time: '2 hrs ago',  icon: 'check-circle' },
]

export const recentActivity = [
  { id: 1, worker: 'Kavita Sharma',  action: 'Marked Attendance',    ward: 'Ward 3',  time: '9:02 AM',  status: 'verified'  },
  { id: 2, worker: 'Priya Kumari',   action: 'Photo Submitted',      ward: 'Ward 9',  time: '9:05 AM',  status: 'verified'  },
  { id: 3, worker: 'Deepak Gupta',   action: 'Task Completed',       ward: 'Ward 11', time: '9:15 AM',  status: 'verified'  },
  { id: 4, worker: 'Arjun Yadav',    action: 'Leave Applied',        ward: 'Ward 18', time: '8:45 AM',  status: 'pending'   },
  { id: 5, worker: 'Mohan Singh',    action: 'GPS Signal Lost',      ward: 'Ward 22', time: '6:02 AM',  status: 'flagged'   },
]

export const workerTasks = [
  { id: 1, title: 'Morning Street Sweep – Sector 4A',   status: 'in-progress', priority: 'high',   time: '7:00 AM – 10:00 AM' },
  { id: 2, title: 'Waste Bin Collection – Route 12',    status: 'pending',     priority: 'high',   time: '10:30 AM – 1:00 PM' },
  { id: 3, title: 'Drain Clearance – Block B',          status: 'pending',     priority: 'medium', time: '2:00 PM – 4:00 PM'  },
  { id: 4, title: 'End-of-Day Photo Submission',        status: 'pending',     priority: 'low',    time: 'Before 5:30 PM'     },
]

export const stats = {
  totalWorkers: 168,
  activeToday: 145,
  tasksCompleted: 312,
  avgAttendance: 88.4,
  civicTrustScore: 84.7,
  alertsOpen: 3,
}
