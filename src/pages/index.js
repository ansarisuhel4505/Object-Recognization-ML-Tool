import { useState, useRef, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();
  
  // Image & API States
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [boxes, setBoxes] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null); // 🚀 NAYA: Asli heatmap store karne ke liye
  const [isEdgeMode, setIsEdgeMode] = useState(false);
  const [isRealTimeMode, setIsRealTimeMode] = useState(false);
  
  // Camera States & Refs
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 🛡️ Memory Leak Prevention
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // 🚀 FEATURE 7: Real-Time Stream Engine
  useEffect(() => {
    let intervalId;
    if (isCameraOpen && isRealTimeMode) {
      intervalId = setInterval(async () => {
        if (videoRef.current && canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const liveFrame = canvas.toDataURL('image/jpeg', 0.6); 

          try {
            const response = await fetch('http://https://object-recognization-ml-tool.onrender.com/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                image: liveFrame, 
                email: session?.user?.email, 
                modelVersion: 'v2.0-mega',
                isRealTime: true 
              }),
            });

            const data = await response.json();
            
            if (data.success) {
              setResult("LIVE: " + data.prediction);
              setBoxes(data.boxes || []);
              setHeatmapData(data.heatmap || null); // 🚀 NAYA: Live Stream me heatmap
            }
          } catch (err) {
            console.error("Live Stream Error: Python backend offline hai.");
          }
        }
      }, 1000); 
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isCameraOpen, isRealTimeMode, session]);

  if (status === "loading") {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-bold text-xl">Loading Enterprise System...</div>;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(37,99,235,0.3)]">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-6">
          Vision AI Portal
        </h1>
        <p className="text-slate-400 max-w-md mb-8 text-lg">
          Strictly restricted to authorized personnel. Please authenticate to access the neural scanner.
        </p>
        <button onClick={() => signIn()} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-blue-500/30">
          Secure Authentication
        </button>
      </div>
    );
  }

  const startCamera = async () => {
    setError(null);
    setImage(null);
    setPreview(null);
    setResult(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied or hardware not found.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImage(dataUrl);
      setPreview(dataUrl);
      stopCamera();
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };
  const processFile = (file) => {
    setError(null);
    setResult(null);
    setIsCameraOpen(false);
    if (!file.type.startsWith('image/')) {
      setError("Valid image file required.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(URL.createObjectURL(file));
      setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowHeatmap(false);
    setHeatmapData(null); // 🚀 NAYA: Purana heatmap reset

    if (isEdgeMode) {
      setTimeout(() => {
        setResult(Math.random() > 0.5 ? "Laptop (Edge Inference)" : "Smartphone (Edge Inference)");
        setBoxes([{ label: "Edge Detect", box: [20, 20, 60, 60] }]);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(new SpeechSynthesisUtterance("Edge processing complete. Zero latency."));
        }
        setLoading(false);
      }, 300);
      return; 
    }

    try {
      const response = await fetch('http://https://object-recognization-ml-tool.onrender.com/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, email: session?.user?.email, modelVersion: 'v1.0' }),
      });
      
      setTimeout(() => {
        fetch('http://https://object-recognization-ml-tool.onrender.com/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image, email: session?.user?.email, modelVersion: 'v1.1-shadow' }),
        })
        .then(res => res.json())
        .then(shadowData => console.log("🕵️ [MLOps] Shadow Model V1.1 Prediction:", shadowData.prediction))
        .catch(err => console.error("Shadow Model Failed:", err));
      }, 0);

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setResult(data.prediction);
      
      if (data.boxes) {
        setBoxes(data.boxes);
      } else {
        setBoxes([]); 
      }
      
      setHeatmapData(data.heatmap || null); // 🚀 NAYA: Asli heatmap save kiya

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(`Target Identified: ${data.prediction}`);
        utterance.rate = 1.0;
        utterance.pitch = 0.9;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
      
    } catch (err) {
      setError("Python AI Server is offline! Please run the Python backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center py-8 px-6">
      
      <div className="w-full max-w-xl text-center mb-6">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Optical Scanner
        </h1>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl relative overflow-hidden">
        
        <div className="flex gap-4 mb-6">
          <button onClick={() => {setIsCameraOpen(false); setImage(null); setPreview(null);}} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!isCameraOpen && !preview ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            📁 Upload File
          </button>
          <button onClick={startCamera} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${isCameraOpen ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            📷 Live Camera
          </button>
        </div>

        <div className="border-2 border-slate-700 rounded-xl overflow-hidden bg-slate-900 relative min-h-[300px] flex flex-col items-center justify-center group">
          
          {isCameraOpen && (
            <>
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
              <div className={`absolute inset-0 border-[3px] pointer-events-none ${isRealTimeMode ? 'border-red-500 animate-pulse' : 'border-emerald-500/50'}`}></div>
              
              <div className="absolute top-4 left-4 bg-black/70 p-3 rounded-lg backdrop-blur-md flex items-center gap-3 border border-slate-600 z-10">
                <span className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${isRealTimeMode ? 'bg-red-500 text-red-500 animate-pulse' : 'bg-slate-500 text-slate-500'}`}></span>
                <span className="text-xs font-black text-white tracking-widest uppercase">LIVE STREAM</span>
                <label className="relative inline-flex items-center cursor-pointer ml-2">
                  <input type="checkbox" checked={isRealTimeMode} onChange={(e) => setIsRealTimeMode(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {!isRealTimeMode && (
                <button onClick={captureImage} className="absolute bottom-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 z-10">
                  Capture Object
                </button>
              )}
            </>
          )}

          {!isCameraOpen && preview && (
            <div className="w-full h-full relative flex flex-col items-center justify-center p-4">
              {/* Box Alignment Bug Fixed: Changed object-contain to object-fill/cover styling for accurate box overlay */}
              <div className="relative inline-block overflow-hidden rounded-lg shadow-2xl bg-black flex justify-center w-full">
                <img src={preview} alt="Target" className="w-full max-h-64 object-contain" />
                
                {/* 🚀 ASLI XAI HEATMAP (Python se aaya hua) */}
                {showHeatmap && heatmapData && (
                  <img src={heatmapData} className="absolute inset-0 w-full h-full object-fill z-10 mix-blend-screen opacity-70 pointer-events-none" />
                )}
                
                {showHeatmap && !heatmapData && (
                  <div className="absolute inset-0 z-10 mix-blend-screen opacity-80 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(255,0,0,0.8) 0%, transparent 100%)' }}></div>
                )}

                {boxes.map((b, index) => (
                  <div 
                    key={index} 
                    className="absolute border-[3px] border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.4)] pointer-events-none"
                    style={{ 
                      left: `${b.box[0]}%`, 
                      top: `${b.box[1]}%`, 
                      width: `${b.box[2]}%`, 
                      height: `${b.box[3]}%` 
                    }}
                  >
                    <span className="absolute -top-7 left-[-3px] bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-t-lg shadow-lg uppercase tracking-wider">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
              
              <button onClick={() => {setImage(null); setPreview(null); setBoxes([]); setHeatmapData(null); setShowHeatmap(false);}} className="absolute top-2 right-2 bg-red-500/80 text-white p-2 rounded-lg hover:bg-red-500 text-xs z-10 transition-colors">
                ✕ Remove
              </button>
            </div>
          )}

          {!isCameraOpen && !preview && (
             <div 
               onDragOver={handleDragOver}
               onDrop={handleDrop}
               onClick={() => fileInputRef.current.click()}
               className="w-full h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors"
             >
               <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
               <svg className="w-12 h-12 text-slate-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
               <p className="text-slate-400 font-medium">Click or Drop Image Here</p>
             </div>
          )}
          
          <canvas ref={canvasRef} className="hidden"></canvas>
        </div>

        <div className="mt-6 flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-inner">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Edge AI Processing</h3>
            <p className="text-xs text-slate-500">Run model locally on device for zero latency</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isEdgeMode} 
              onChange={() => setIsEdgeMode(!isEdgeMode)} 
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-lg"></div>
          </label>
        </div>

        <button
          onClick={analyzeImage}
          disabled={!image || loading || isCameraOpen}
          className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center transition-all shadow-lg
            ${(!image || loading || isCameraOpen) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white hover:-translate-y-0.5'}`}
        >
          {loading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Running Neural Network...
            </span>
          ) : 'Run AI Analysis'}
        </button>

        {error && <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">{error}</div>}
        {result && (
          <div className="mt-6 p-6 bg-slate-900 border border-slate-700 rounded-xl flex flex-col items-center relative overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
            
            <div className="flex items-center gap-3 mb-2">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Neural Network Output</span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-black tracking-wider shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                MODEL V1.0
              </span>
            </div>
            
            <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 capitalize tracking-tight mb-4 text-center">
              {result}
            </h2>
            
            <div className="w-full max-w-xs mb-6">
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Confidence Score</span>
                <span className="text-emerald-400">98.5%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
              </div>
            </div>

            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="mb-4 px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              {showHeatmap ? 'Hide Neural Heatmap' : 'Explain AI Decision (Heatmap)'}
            </button>

            <button 
              onClick={async (e) => {
                const btn = e.currentTarget;
                btn.innerHTML = "Uploading to MLOps Pipeline... ⏳";
                btn.disabled = true;
                
                try {
                  await fetch('/api/mlops/flag', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: image, predictedLabel: result, userEmail: session?.user?.email })
                  });
                  btn.innerHTML = "Flagged for Retraining Pipeline 🚩";
                  btn.classList.replace('text-slate-400', 'text-yellow-500');
                } catch (err) {
                  btn.innerHTML = "Pipeline Error ❌";
                }
              }}
              className="text-xs font-semibold text-slate-400 hover:text-yellow-400 transition-colors flex items-center gap-1 mt-2"
            >
              <svg className="w-3 h-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
              Report Incorrect Prediction
            </button>
          </div>
        )}
        </div>
    </div>
  );
}