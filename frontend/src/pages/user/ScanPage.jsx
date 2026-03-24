import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Camera, Flashlight, RefreshCw, Star, CheckCircle2, AlertTriangle, SwitchCamera, X } from 'lucide-react';

export default function ScanPage({ onAddLog }) {
  const [scanResult, setScanResult] = useState(null);
  const [errorLine, setErrorLine] = useState('');
  const [successLine, setSuccessLine] = useState('');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  
  // Rating form
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const scannerRef = useRef(null);

  // Colors based on instruction
  const SAFFRON = '#FF9933';
  const GREEN = '#138808';

  // Initialize Scanner
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
      
      const html5Qrcode = new Html5Qrcode('qr-reader');
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
    
    // Parse result: Expected format JSON or Comma separated "Ward X, Worker Name"
    let parsedData = { ward: 'Unknown Area', worker: 'Unknown Worker', raw: decodedText };
    if (decodedText.includes(',')) {
      const parts = decodedText.split(',');
      parsedData = { ward: parts[0]?.trim(), worker: parts[1]?.trim() || 'Unknown', raw: decodedText };
    } else if (decodedText.startsWith('{')) {
      try {
        parsedData = { ...parsedData, ...JSON.parse(decodedText) };
      } catch (e) {}
    } else {
      parsedData.ward = decodedText; 
    }
    setScanResult(parsedData);
  };

  const resetScanner = () => {
    setScanResult(null);
    setRating(0);
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

  const submitRating = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        ward: scanResult.ward,
        worker: scanResult.worker,
        raw_data: scanResult.raw,
        rating: rating,
        timestamp: serverTimestamp()
      });
      if (onAddLog) {
        onAddLog({
          type: 'feedback',
          msg: `Rated Ward: ${scanResult.ward} · ${rating} Stars`,
          description: `Worker: ${scanResult.worker}`,
          time: 'Just now'
        });
      }
      setSuccessLine('Rating submitted successfully!');
      setTimeout(() => resetScanner(), 2000);
    } catch (err) {
      console.error(err);
      setErrorLine('Failed to submit rating to Firebase.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-gray-50 min-h-[calc(100vh-100px)] animate-fade-in relative">
      
      <div className="text-center mb-6">
        <h1 className="text-2xl font-black uppercase tracking-widest" style={{ color: SAFFRON }}>
          Daily Scan
        </h1>
        <p className="text-gray-500 text-sm font-medium mt-1">Scan QR Code to rate cleanliness</p>
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
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-4 border border-gray-100 flex flex-col items-center">
          
          {/* Scanner Viewport */}
          <div id="qr-reader" className="w-full bg-black rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-inner" />
          
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
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 border-t-[6px] animate-scale-up" style={{ borderColor: SAFFRON }}>
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3 text-gray-900">
               <CheckCircle2 size={24} style={{ color: GREEN }} />
               <h2 className="text-lg font-black">Scan Detected</h2>
            </div>
            <button onClick={resetScanner} className="text-gray-400 hover:text-gray-900 transition-colors p-2 bg-gray-50 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100 shadow-inner">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Location Details</p>
            <p className="text-lg font-black text-gray-900 mb-4">{scanResult.ward}</p>
            
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Zone Representative</p>
            <p className="text-base font-bold text-gray-800 flex items-center gap-2">
               {scanResult.worker}
            </p>
          </div>

          <div className="mb-6 p-4 bg-white border-2 rounded-2xl border-gray-50 text-center shadow-sm">
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Rate Site Cleanliness</label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setRating(s)}
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 transform"
                  style={{ 
                    backgroundColor: rating >= s ? SAFFRON : '#f9fafb',
                    color: rating >= s ? '#fff' : '#d1d5db',
                    transform: rating >= s ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  <Star size={24} fill={rating >= s ? "currentColor" : "none"} strokeWidth={rating >= s ? 0 : 2} />
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={submitRating}
            disabled={rating === 0 || submitting}
            className="w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: rating > 0 ? GREEN : '#9ca3af' }}
          >
            {submitting ? <RefreshCw size={20} className="animate-spin" /> : 'Submit Feedback'}
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
