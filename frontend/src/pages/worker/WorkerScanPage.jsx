import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Camera, Flashlight, RefreshCw, CheckCircle2, AlertTriangle, SwitchCamera, X, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WorkerScanPage() {
  const { user } = useAuth();
  const [scanResult, setScanResult] = useState(null);
  const [errorLine, setErrorLine] = useState('');
  const [successLine, setSuccessLine] = useState('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [submitting, setSubmitting] = useState(false);
  
  const scannerRef = useRef(null);

  const SAFFRON = '#FF9933';
  const GREEN = '#138808';

  useEffect(() => {
    if (!scanResult) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [scanResult, facingMode]);

  const startScanner = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await stopScanner();
        }
      }
      
      const html5Qrcode = new Html5Qrcode('worker-qr-reader');
      scannerRef.current = html5Qrcode;
      
      await html5Qrcode.start(
        { facingMode: facingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // ignore continuous scanning errors
        }
      );
      setErrorLine('');
    } catch (err) {
      console.error(err);
      setErrorLine('Camera access denied or device not capable. Please grant permissions.');
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  const handleScanSuccess = async (decodedText) => {
    await stopScanner();
    setSuccessLine('QR Code correctly scanned!');
    setTimeout(() => setSuccessLine(''), 3000);
    
    let parsedData = { checkpoint: 'Unknown Checkpoint', raw: decodedText };
    if (decodedText.includes(',')) {
      const parts = decodedText.split(',');
      parsedData = { checkpoint: parts[0]?.trim(), raw: decodedText };
    } else {
      parsedData.checkpoint = decodedText; 
    }
    setScanResult(parsedData);
  };

  const resetScanner = () => {
    setScanResult(null);
    setSuccessLine('');
    setErrorLine('');
  };

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const stream = scannerRef.current.getRunningTrackCameraCapabilities();
        if (stream.torchFeature().isSupported()) {
          const newTorchState = !isTorchOn;
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: newTorchState }]
          });
          setIsTorchOn(newTorchState);
        } else {
          setErrorLine('Torch not supported on this device/browser');
          setTimeout(() => setErrorLine(''), 3000);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const submitLog = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'worker_checkpoints'), {
        workerId: user?.id || 'unknown',
        workerName: user?.name || 'Unknown Worker',
        checkpoint: scanResult.checkpoint,
        raw_data: scanResult.raw,
        timestamp: serverTimestamp()
      });
      setSuccessLine('Checkpoint verified successfully!');
      setTimeout(() => resetScanner(), 2000);
    } catch (err) {
      console.error(err);
      setErrorLine('Failed to submit log to Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-transparent min-h-[calc(100vh-100px)] animate-fade-in relative">
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest" style={{ color: SAFFRON }}>
           Checkpoint Scan
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Verify location via QR Code</p>
      </div>

      <div className="w-full max-w-sm px-2">
        {errorLine && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl shadow-sm flex items-center gap-3 animate-slide-down border-l-4 border-red-500">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <span className="text-sm font-bold tracking-wide">{errorLine}</span>
          </div>
        )}

        {successLine && (
          <div className="mb-4 bg-green-100 p-3 rounded-xl shadow-sm flex items-center gap-3 animate-slide-down border-l-4" style={{ borderColor: GREEN, color: GREEN }}>
            <CheckCircle2 size={20} className="flex-shrink-0" />
            <span className="text-sm font-bold tracking-wide">{successLine}</span>
          </div>
        )}
      </div>

      {!scanResult ? (
        <div className="w-full max-w-sm glass-card p-4 flex flex-col items-center border-none">
          
          <div id="worker-qr-reader" className="w-full bg-black rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-inner" />
          
          <div className="flex justify-center gap-4 w-full mt-6 mb-2">
            <button 
              onClick={toggleTorch}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-bold text-sm tracking-wide flex items-center gap-2"
            >
              <Flashlight size={18} /> Torch
            </button>
            <button 
              onClick={toggleCamera}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-bold text-sm tracking-wide flex items-center gap-2"
            >
              <SwitchCamera size={18} /> Flip
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-sm glass-card p-6 border-t-[6px] animate-scale-up" style={{ borderColor: SAFFRON }}>
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 text-gray-900">
               <CheckCircle2 size={24} style={{ color: GREEN }} />
               <h2 className="text-lg font-black">Location Verified</h2>
            </div>
            <button onClick={resetScanner} className="text-gray-400 hover:text-gray-900 transition-colors p-2 bg-gray-50 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 shadow-inner">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Checkpoint Status</p>
            <p className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
               <MapPin size={20} className="text-saffron-500" />
               {scanResult.checkpoint}
            </p>
          </div>

          <button
            onClick={submitLog}
            disabled={submitting}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-white transition-all shadow-md disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            {submitting ? <RefreshCw size={20} className="animate-spin" /> : 'Confirm Checkpoint'}
          </button>
          
          <button
            onClick={resetScanner}
            disabled={submitting}
            className="w-full mt-4 h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-gray-500 hover:bg-gray-100 transition-colors uppercase tracking-wider text-xs"
          >
            Cancel & Scan Again
          </button>
        </div>
      )}
    </div>
  );
}
