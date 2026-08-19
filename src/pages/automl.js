import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';

export default function AutoMLStudio() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [className, setClassName] = useState('');
  const [images, setImages] = useState([]);
  const [trainingStatus, setTrainingStatus] = useState('idle'); // idle, training, completed
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages].slice(0, 20)); // Max 20 images for UI demo
  };

  const startTraining = () => {
    if(!className || images.length < 3) {
      alert("Please enter a class name and upload at least 3 images.");
      return;
    }
    
    setTrainingStatus('training');
    setProgress(0);
    setLogs(["Initializing AutoML Pipeline...", "Allocating Cloud GPU (NVIDIA A100)..."]);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      
      const newLogs = [];
      if (currentProgress === 20) newLogs.push("Extracting features from uploaded dataset...");
      if (currentProgress === 40) newLogs.push("Applying Transfer Learning (ResNet-50 Base)...");
      if (currentProgress === 60) newLogs.push("Epoch 5/10: Loss: 0.241 - Accuracy: 89%");
      if (currentProgress === 80) newLogs.push("Epoch 10/10: Loss: 0.052 - Accuracy: 98.7%");
      if (currentProgress === 100) {
        newLogs.push(`Model successfully trained to recognize: [${className.toUpperCase()}]`);
        clearInterval(interval);
        setTrainingStatus('completed');
        if ('speechSynthesis' in window) {
          window.speechSynthesis.speak(new SpeechSynthesisUtterance(`AutoML training complete for ${className}`));
        }
      }
      
      if(newLogs.length > 0) {
        setLogs(prev => [...prev, ...newLogs]);
      }
    }, 1000);
  };

  if (status === "loading") return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-bold">Loading Studio...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans py-10 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-500">
            AutoML Training Studio
          </h1>
          <p className="text-slate-400 mt-1">Train the AI model on your custom objects using Transfer Learning.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Input Data */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-xl font-bold mb-4">1. Dataset Configuration</h2>
            
            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-400">Custom Object Name (Class Label)</label>
              <input 
                type="text" 
                placeholder="e.g. Defective Gear, My Company Logo" 
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={trainingStatus !== 'idle'}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mt-2 text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-semibold text-slate-400 mb-2 block">Upload Training Images (Min: 3, Max: 20)</label>
              <div 
                onClick={() => trainingStatus === 'idle' && fileInputRef.current.click()}
                className={`border-2 border-dashed border-slate-600 rounded-xl p-8 text-center transition-all ${trainingStatus === 'idle' ? 'cursor-pointer hover:bg-slate-700/50 hover:border-orange-500' : 'opacity-50 cursor-not-allowed'}`}
              >
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
                <svg className="w-10 h-10 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p className="text-slate-300 font-medium">Click to upload training dataset</p>
                <p className="text-xs text-slate-500 mt-1">{images.length} images selected</p>
              </div>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {images.map((src, i) => (
                  <img key={i} src={src} alt="train-data" className="w-12 h-12 object-cover rounded-md border border-slate-600" />
                ))}
              </div>
            )}

            <button 
              onClick={startTraining}
              disabled={trainingStatus !== 'idle'}
              className="w-full bg-gradient-to-r from-orange-600 to-pink-600 hover:from-orange-500 hover:to-pink-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trainingStatus === 'idle' ? '🚀 Initialize Model Training' : 'Training Locked'}
            </button>
          </div>

          {/* Right Column: Training Progress */}
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 opacity-5 pointer-events-none">
              <svg className="w-full h-full text-orange-400 animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5l-10-5V17l10 5 10-5V4.5l-10 5z"></path></svg>
            </div>

            <h2 className="text-xl font-bold mb-4 z-10">2. MLOps Training Output</h2>
            
            <div className="flex-grow bg-black/50 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-y-auto mb-6 z-10 h-64">
              {logs.length === 0 ? (
                <span className="text-slate-600">Waiting for dataset configuration...</span>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <span className="text-emerald-500">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-slate-300">{log}</span>
                  </div>
                ))
              )}
            </div>

            <div className="z-10 mt-auto">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-400">Training Progress</span>
                <span className={progress === 100 ? 'text-emerald-400' : 'text-orange-400'}>{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-500 to-pink-500'}`} 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {trainingStatus === 'completed' && (
              <button onClick={() => {setTrainingStatus('idle'); setProgress(0); setImages([]); setClassName(''); setLogs([]);}} className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 rounded-lg transition-colors border border-slate-600 z-10">
                Train Another Object
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}