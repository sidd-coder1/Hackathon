import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUsers, getAttendance } from '../services/firebaseService'

const AlertContext = createContext(null)

export const useAlerts = () => useContext(AlertContext)

// Hardcoded approximate geofences for wards (center lat, lng and radius in km)
const WARD_GEOFENCES = {
  'Ward 14 – Karol Bagh': { lat: 28.6538, lng: 77.1994, radius: 0.5 }, // Tighter 500m radius
  'Sector 7 – Green Park': { lat: 28.5562, lng: 77.2065, radius: 0.5 },
  'Municipal HQ': { lat: 28.6448, lng: 77.2167, radius: 1.0 },
}

// Haversine formula to calculate distance between two lat/lng points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const Math_c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * Math_c; // Distance in km
}

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const checkAnomalies = async () => {
    try {
      const [users, attendanceList] = await Promise.all([getUsers(), getAttendance()])
      
      const workers = users.filter(u => u.role === 'worker')
      const today = new Date().toISOString().split('T')[0]
      const newAlerts = []
      
      workers.forEach(worker => {
        // Find today's attendance records for this worker
        const workerRecords = attendanceList.filter(a => a.userId === worker.id && a.date === today)
        const latestRecord = workerRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        
        // 2. Attendance Check
        if (!latestRecord) {
          // If no record exists for today by midday, flag it. For hackathon purposes, flag immediately if empty.
          newAlerts.push({
            id: `att-${worker.id}-${Date.now()}`,
            type: 'attendance',
            severity: 'high',
            workerId: worker.id,
            workerName: worker.name || 'Unknown Worker',
            ward: worker.ward || 'Unassigned',
            message: `${worker.name} has not checked in for their shift today.`,
            timestamp: new Date().toISOString()
          })
          return; // Skip location/idle checks if absent
        }

        // 1. Location Mismatch Detection
        if (latestRecord.location && worker.ward) {
          const wardFence = WARD_GEOFENCES[worker.ward] || WARD_GEOFENCES['Municipal HQ']
          const dist = calculateDistance(
            latestRecord.location.lat, latestRecord.location.lng,
            wardFence.lat, wardFence.lng
          )
          
          if (dist > wardFence.radius) {
            newAlerts.push({
              id: `loc-${worker.id}-${Date.now()}`,
              type: 'location',
              severity: 'high',
              workerId: worker.id,
              workerName: worker.name,
              ward: worker.ward,
              message: `${worker.name} is ${dist.toFixed(2)}km outside assigned geofence (${worker.ward}).`,
              timestamp: latestRecord.timestamp
            })
          }
        }

        // 3. Idle Detection
        // If the latest record is older than 20 mins
        const recordTime = new Date(latestRecord.timestamp).getTime()
        const now = new Date().getTime()
        const diffMins = (now - recordTime) / (1000 * 60)
        
        if (diffMins > 20) {
          newAlerts.push({
            id: `idle-${worker.id}-${Date.now()}`,
            type: 'idle',
            severity: 'medium',
            workerId: worker.id,
            workerName: worker.name,
            ward: worker.ward,
            message: `${worker.name} has been idle/offline for over ${Math.round(diffMins)} minutes.`,
            timestamp: latestRecord.timestamp
          })
        }
      })

      // Sort alerts by newest first
      setAlerts(newAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
    } catch (err) {
      console.error("Failed to run anomaly engine:", err)
    } finally {
      setLoading(false)
    }
  }

  // Run anomaly engine on mount and every 30 seconds
  useEffect(() => {
    checkAnomalies()
    const interval = setInterval(checkAnomalies, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AlertContext.Provider value={{ alerts, refreshAlerts: checkAnomalies, loading }}>
      {children}
    </AlertContext.Provider>
  )
}
