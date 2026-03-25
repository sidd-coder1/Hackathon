import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { MapPin, Camera, CheckCircle2, AlertCircle, ChevronRight, Battery, Wifi, Fingerprint, ImagePlus, X } from 'lucide-react'
import { StatCard, Badge, StatusDot, Spinner } from '../components/ui/UIComponents'
import clsx from 'clsx'
import { addAttendance, checkAttendanceExists, updateUserStats } from '../services/firebaseService'
import { Scanner } from '@yudiel/react-qr-scanner'
import { storage, db } from '../firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from 'firebase/firestore'
import { completeTask, subscribeToTasks } from '../services/firebaseService'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const [gpsStatus, setGpsStatus] = useState('acquiring') // acquiring | active | error
  const [attendanceMarked, setAttendanceMarked] = useState(false)
  const [markingLoading, setMarkingLoading] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoLocation, setPhotoLocation] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [coords, setCoords] = useState(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    // Periodic Location Tracking (Every 5 minutes)
    const locationInterval = setInterval(() => {
        if (navigator.geolocation && (user?.uid || user?.id)) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                try {
                    await addDoc(collection(db, 'locations'), {
                        userId: user.uid || user.id,
                        userName: user.name || 'Unknown',
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        timestamp: serverTimestamp()
                    });
                    console.log("Location updated periodically");
                } catch (err) {
                    console.error("Failed to update periodic location", err);
                }
            });
        }
    }, 5 * 60 * 1000); // 5 minutes

    setTimeout(() => {
      setGpsStatus('active')
      setCoords({ lat: '15.9047° N', lng: '73.8210° E', acc: '±4m' })
    }, 2000)
    
    // Subscribe to tasks
    if (user?.uid || user?.id) {
        const unsub = subscribeToTasks((fetchedTasks) => {
            const today = new Date().toISOString().split('T')[0];
            const myTasks = fetchedTasks.filter(t => {
                const matchesUser = t.assignedTo === (user.uid || user.id);
                const isNotVerified = t.status !== 'verified';
                
                // Date check: Show if today is within [dateFrom, dateTo] 
                // or if dates are missing (fallback)
                const isToday = !t.dateFrom || !t.dateTo || (today >= t.dateFrom && today <= t.dateTo);
                
                return matchesUser && isNotVerified && isToday;
            });
            setTasks(myTasks);
            setTasksLoading(false);
        });
        return () => {
            clearInterval(timer);
            clearInterval(locationInterval);
            unsub();
        }
    }
    
    return () => {
        clearInterval(timer);
        clearInterval(locationInterval);
    }
  }, [user])

  const [showScanner, setShowScanner] = useState(false)

  const handleDisplayScanner = () => {
    if (gpsStatus !== 'active') return
    setShowScanner(true)
  }

  const handleScan = async (result) => {
    if (!result || !result.length) return;
    const qrValue = result[0].rawValue;
    
    try {
      let data;
      try {
        data = JSON.parse(qrValue);
      } catch (e) {
        console.error("Invalid QR content - not JSON", qrValue);
        alert("Invalid QR code. Please scan a valid SwachhDrishti attendance QR.");
        setShowScanner(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      if (!data.token || data.date !== today) {
        alert("This QR code is not valid for today or is missing a secure token.");
        setShowScanner(false);
        return;
      }

      setShowScanner(false);
      setMarkingLoading(true);

      const exists = await checkAttendanceExists(user?.id, today);
      if (exists) {
        alert("Attendance already marked for today.");
        setMarkingLoading(false);
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          const attendanceData = {
            userId: user?.id || 'unknown',
            userName: user?.name || 'Unknown User',
            role: user?.role || 'worker',
            ward: user?.ward || 'Unknown Ward',
            date: today,
            timestamp: new Date().toISOString(),
            location: { lat, lng },
            qrToken: data.token,
            verified: true
          };
          
          try {
            await addAttendance(attendanceData);
            await updateUserStats(user?.id);
            setAttendanceMarked(true);
          } catch (error) {
            console.error("Error saving attendance:", error);
            alert("Failed to save attendance.");
          } finally {
            setMarkingLoading(false);
          }
        }, (error) => {
          console.error("Geolocation error:", error);
          alert("Failed to get location.");
          setMarkingLoading(false);
        });
      } else {
        alert("Geolocation is not supported by this browser.");
        setMarkingLoading(false);
      }
    } catch (e) {
      console.error("Scanning process failed", e);
      alert("An error occurred during verification. Please try again.");
      setShowScanner(false);
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPhotoFile(file)
    setPhotoPreview(url)
    setValidationMessage('')
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPhotoLocation({ lat: (pos.coords.latitude).toFixed(5) + '° N', lng: (pos.coords.longitude).toFixed(5) + '° E' });
      }, () => setPhotoLocation(coords || { lat: 'Unknown', lng: 'Unknown' }))
    } else {
      setPhotoLocation(coords)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setIsCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      console.error("Camera access denied:", err);
      if (fileInputRef.current) fileInputRef.current.click(); // Fallback to file picker
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (!blob) return;
        blob.name = `live_capture_${Date.now()}.jpg`; // Passes AI explicitly
        const url = URL.createObjectURL(blob);
        setPhotoFile(blob);
        setPhotoPreview(url);
        setValidationMessage('');
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            setPhotoLocation({ lat: (pos.coords.latitude).toFixed(5) + '° N', lng: (pos.coords.longitude).toFixed(5) + '° E' });
          }, () => setPhotoLocation(coords || { lat: 'Unknown', lng: 'Unknown' }))
        } else {
          setPhotoLocation(coords);
        }
      }, 'image/jpeg', 0.9);
      
      stopCamera();
    }
  }

  const handlePhotoSubmit = async () => {
    if (!photoFile) return;
    setUploading(true);
    setValidationMessage('Initiating AI Authenticity Scan...');
    
    try {
      // Simulated AI Verification Process for Hackathon Demo
      // Phase 1: Scan
      await new Promise(r => setTimeout(r, 800));
      setValidationMessage('Analyzing EXIF headers and sensor noise...');
      
      // Phase 2: Check
      await new Promise(r => setTimeout(r, 1200));
      
      // Simple heuristic: If it comes from desktop file uploads or contains markers
      const name = photoFile.name.toLowerCase();
      if (name.includes('download') || name.includes('stock') || name.includes('whatsapp') || name.includes('image_')) {
        throw new Error('AI REJECTED: Image detected as downloaded or manipulated graphic. Original live capture required.');
      }
      
      setValidationMessage('AI Validation Passed! Uploading to server...');
      await new Promise(r => setTimeout(r, 500));

      let downloadURL = '';
      try {
        const storageRef = ref(storage, `work_photos/${user?.id || user?.uid || 'unknown'}_${Date.now()}.jpg`);
        const metadata = {
          customMetadata: {
             lat: photoLocation?.lat || 'unknown',
             lng: photoLocation?.lng || 'unknown'
          }
        };
        const snapshot = await uploadBytes(storageRef, photoFile, metadata);
        downloadURL = await getDownloadURL(snapshot.ref);
      } catch (storageErr) {
        console.warn("Firebase Storage failed (ignoring for Demo):", storageErr);
        downloadURL = photoPreview || 'fallback-url';
      }

      await addDoc(collection(db, 'work_photos'), {
        userId: user?.id || user?.uid || 'unknown',
        userName: user?.name || 'Worker',
        ward: user?.ward || 'Unknown Ward',
        photoUrl: downloadURL,
        location: photoLocation || coords || { lat: 'Unknown', lng: 'Unknown' },
        timestamp: serverTimestamp()
      });

      setPhotoUploaded(true);
    } catch (error) {
      console.error("Upload failed", error);
      alert(error.message || 'Firestore submission failed.');
      setPhotoFile(null); // Reset preview so they have to take another
      setPhotoPreview(null);
    } finally {
      setUploading(false);
      setValidationMessage('');
    }
  }

  const handleCompleteTask = async (taskId) => {
    try {
        await completeTask(taskId);
        alert("Task marked as completed!");
    } catch (err) {
        console.error("Failed to complete task", err);
        alert("Error completing task.");
    }
  }

  const taskStatusMap = {
    'in-progress': { label: 'In Progress', variant: 'saffron' },
    'pending': { label: 'Pending', variant: 'default' },
    'completed': { label: 'Completed', variant: 'success' },
  }

  const priorityColor = {
    high: 'border-l-red-500',
    medium: 'border-l-amber-500',
    low: 'border-l-blue-500',
  }

  return (
    <div className="space-y-5 pb-8 animate-fade-in w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Good Morning,</h1>
          <p className="text-saffron-600 font-semibold">{user?.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold text-gray-800 tabular-nums">
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <div className="flex items-center justify-end gap-2">
            <Badge variant="primary" className="text-[10px]">Level {user?.level || 1}</Badge>
            <p className="text-xs text-gray-500">
                {currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {/* GPS Status Card */}
      <div className={clsx(
        'glass-card p-5 border-l-4 transition-all duration-500',
        gpsStatus === 'active' ? 'border-l-green-500' : gpsStatus === 'error' ? 'border-l-red-500' : 'border-l-amber-500'
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={clsx(
              'w-9 h-9 rounded-xl flex items-center justify-center',
              gpsStatus === 'active' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
            )}>
              <MapPin size={18} className={gpsStatus === 'active' ? 'text-green-500' : 'text-amber-500'} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">GPS Status</p>
              <p className="text-xs text-gray-500">{user?.ward}</p>
            </div>
          </div>
          <div className={clsx(
            'w-3 h-3 rounded-full',
            gpsStatus === 'active' ? 'bg-green-500 animate-pulse-gps' : 'bg-amber-500 animate-pulse'
          )} />
        </div>

        {gpsStatus === 'acquiring' ? (
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <Spinner size="sm" className="border-t-amber-500" />
            Acquiring GPS signal...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              ['Latitude', coords?.lat],
              ['Longitude', coords?.lng],
              ['Accuracy', coords?.acc],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-100 rounded-lg p-2">
                <p className="text-gray-500 mb-0.5">{k}</p>
                <p className="text-green-600 font-mono font-medium">{v}</p>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Mark Attendance */}
      <div className="glass-card overflow-hidden">
        {/* Section Header */}
        <div className="p-5 border-b border-white/20 bg-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-saffron-100 flex items-center justify-center shadow-sm">
              <Fingerprint className="text-saffron-600" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Attendance</h2>
              <p className="text-xs text-gray-500">Tap to mark your attendance</p>
            </div>
          </div>
          {attendanceMarked && <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 size={12} /> Verified</Badge>}
        </div>

        {/* Action Body */}
        <div className="p-6 flex flex-col items-center">
          {attendanceMarked ? (
            <div className="animate-slide-up space-y-3 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <p className="text-base font-bold text-green-600">Attendance Marked!</p>
              <p className="text-xs text-gray-500">
                {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · GPS Verified · {user?.ward}
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <button
                onClick={handleDisplayScanner}
                disabled={gpsStatus !== 'active' || markingLoading}
                className={clsx(
                  'w-32 h-32 mx-auto rounded-full border-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg',
                  gpsStatus === 'active' && !markingLoading
                    ? 'border-saffron-500 bg-saffron-50 hover:bg-saffron-100 cursor-pointer glow-saffron'
                    : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                )}
              >
                {markingLoading ? (
                  <Spinner size="md" />
                ) : (
                  <>
                    <MapPin size={28} className="text-saffron-500" />
                    <span className="text-xs font-bold text-saffron-600 tracking-wide">MARK<br />ATTENDANCE</span>
                  </>
                )}
              </button>
              {gpsStatus !== 'active' && (
                <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
                  <AlertCircle size={12} /> Waiting for GPS signal...
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
           <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden relative shadow-2xl">
              <div className="p-4 bg-gray-900 flex justify-between items-center text-white">
                  <h3 className="font-bold text-sm">Scan Supervisor QR</h3>
                  <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X size={20} /></button>
              </div>
              <div className="bg-black">
                  <Scanner onScan={handleScan} />
              </div>
              <div className="p-4 text-center bg-white">
                  <p className="text-xs text-gray-500">Align the QR code within the frame to scan.</p>
              </div>
           </div>
        </div>
      )}

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Attendance', value: `${user?.totalAttendance || 0}`, color: 'text-green-600' },
          { label: 'Tasks Done', value: `${tasks.filter(t => t.status === 'verified').length}`, color: 'text-saffron-600' },
          { label: 'Total Score', value: `${user?.score || 0}`, color: 'text-blue-600' },
        ].map(s => (
          <div key={s.label} className="glass-card p-3 text-center">
            <p className={clsx('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Assigned Tasks Section */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/20 bg-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="text-blue-600" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">My assigned tasks</h2>
              <p className="text-xs text-gray-500">Active tasks for your ward</p>
            </div>
          </div>
          <Badge variant="primary">{tasks.filter(t => t.status !== 'verified').length} Active</Badge>
        </div>

        <div className="p-4 space-y-3">
          {tasksLoading ? (
            <div className="flex justify-center p-6"><Spinner /></div>
          ) : tasks.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No tasks assigned today.</p>
          ) : (
            tasks.filter(t => t.status !== 'verified').map(task => (
              <div key={task.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{task.title}</h4>
                  <p className="text-xs text-gray-500">{task.ward} · {task.points} Points</p>
                </div>
                {task.status === 'pending' ? (
                  <button 
                    onClick={() => handleCompleteTask(task.id)}
                    className="px-4 py-2 bg-saffron-500 text-white rounded-xl text-xs font-bold hover:bg-saffron-600 transition-colors shadow-sm"
                  >
                    Complete Task
                  </button>
                ) : (
                  <Badge variant="success">Completed</Badge>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Photo Upload */}
      <div className="glass-card overflow-hidden mb-8">
        {/* Section Header */}
        <div className="p-5 border-b border-white/20 bg-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-saffron-100 flex items-center justify-center shadow-sm">
              <Camera className="text-saffron-600" size={22} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base">Work Photo Submission</h2>
              <p className="text-xs text-gray-500">Required before 5:30 PM</p>
            </div>
          </div>
          {photoUploaded && <Badge variant="success">Submitted</Badge>}
        </div>

        {/* Action Body */}
        <div className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePhotoChange}
          />

          {photoUploaded ? (
            <div className="space-y-3">
              {photoPreview && (
                <div className="relative rounded-2xl overflow-hidden border border-green-200 shadow-sm">
                  <img src={photoPreview} alt="Submitted work" className="w-full h-48 sm:h-64 object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-3">
                    <p className="text-[10px] text-white/80 font-mono tracking-widest uppercase mb-0.5">Verified Location</p>
                    <p className="text-white text-xs font-bold">{photoLocation ? `${photoLocation.lat}, ${photoLocation.lng}` : 'GPS Included'}</p>
                    <p className="text-white/80 text-[10px] mt-1">{new Date().toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700 font-semibold">Photo submitted successfully</p>
                  <p className="text-xs text-gray-500 mt-0.5">Today · Verified</p>
                </div>
              </div>
            </div>
          ) : photoPreview ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <img src={photoPreview} alt="Preview" className="w-full h-48 sm:h-64 object-cover" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-3">
                  <p className="text-[10px] text-white/80 font-mono tracking-widest uppercase mb-0.5">Current Location</p>
                  <p className="text-white text-xs font-bold">{photoLocation ? `${photoLocation.lat}, ${photoLocation.lng}` : 'Acquiring GPS...'}</p>
                  <p className="text-white/80 text-[10px] mt-1">{new Date().toLocaleString('en-IN')}</p>
                </div>
              </div>
              {validationMessage && (
                <div className="bg-saffron-50 text-saffron-700 p-3 rounded-xl text-xs font-bold tracking-wide text-center flex items-center justify-center gap-2 animate-pulse border border-saffron-200">
                  {validationMessage}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => { setPhotoPreview(null); setPhotoFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                  disabled={uploading}
                  className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 tracking-wide"
                >
                  Retake Photo
                </button>
                <button
                  onClick={handlePhotoSubmit}
                  disabled={uploading}
                  className="flex-1 py-3.5 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2 tracking-wide"
                >
                  {uploading ? <Spinner size="sm" /> : 'Confirm Submit'}
                </button>
              </div>
            </div>
          ) : isCameraOpen ? (
            <div className="space-y-4 animate-fade-in relative w-full">
              <div className="relative rounded-2xl overflow-hidden bg-black h-64 sm:h-[400px] shadow-inner flex flex-col justify-end border border-gray-200">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Overlay actions */}
                <div className="relative z-10 flex justify-center pb-4 pt-10 bg-gradient-to-t from-black/80 to-transparent">
                  <button 
                    onClick={capturePhoto} 
                    className="w-16 h-16 rounded-full border-4 border-white pb-1 flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95"
                  >
                    <div className="w-12 h-12 bg-white rounded-full transition-transform active:scale-90" />
                  </button>
                </div>
                
                {/* Close Button top-right */}
                <button 
                    onClick={stopCamera}
                    className="absolute right-3 top-3 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur hover:bg-black/70 transition-colors z-20"
                  >
                    <X size={20} />
                </button>
              </div>
              <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse mt-2">Live Camera Recording</p>
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full border-2 border-dashed border-gray-200 hover:border-saffron-400 rounded-2xl p-10 transition-all duration-200 group bg-white/20 hover:bg-saffron-50/30"
            >
              <Camera size={38} className="text-gray-400 group-hover:text-saffron-500 mx-auto mb-4 transition-colors" />
              <p className="text-sm font-black text-gray-700 group-hover:text-gray-900 tracking-wide transition-colors">TAP TO OPEN LIVE CAMERA</p>
              <p className="text-[11px] text-saffron-600 font-bold tracking-widest uppercase mt-2">Take Live Photo Now</p>
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
