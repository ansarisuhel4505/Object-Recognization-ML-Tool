import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar'; // Agar tera Navbar component hai toh

export default function AutoMLStudio() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [datasetName, setDatasetName] = useState('');
  const [modelType, setModelType] = useState('yolov8n');
  const [gpuInstance, setGpuInstance] = useState('t4-shared');
  const [images, setImages] = useState([]);
  const [jobStatus, setJobStatus] = useState('idle'); // idle, uploading, queued, failed
  const [logs, setLogs] = useState([]);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newImages].slice(0, 50)); 
  };

  const startTrainingPipeline = () => {
    if (!datasetName || images.length < 5) {
      alert("Enterprise Policy: Please provide a dataset name and at least 5 images for validation.");
      return;
    }
    
    setJobStatus('uploading');
    setLogs(["[AUTH] Verifying developer credentials...", "[STORAGE] Initializing secure S3 bucket connection..."]);

    // Simulating Enterprise MLOps Pipeline
    setTimeout(() => {
      setLogs(prev => [...prev, `[STORAGE] Uploading ${images.length} assets to cloud storage...`]);
    }, 1500);

    setTimeout(() => {
      setLogs(prev => [...prev, "[COMPUTE] Requesting GPU allocation from cluster...", `[COMPUTE] Target Instance: ${gpuInstance.toUpperCase()}`]);
      setJobStatus('queued');
    }, 3500);

    setTimeout(() => {
      setLogs(prev => [...prev, "⚠️ [CLUSTER BUSY] No spot instances currently available.", "[QUEUE] Added to pending training queue. Position: #42"]);
      setJobStatus('failed'); // We deliberately fail it gracefully to show it's a real system waiting for GPUs
    }, 7000);
  };

  if (status === "loading") return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-500 font-mono">Connecting to MLOps Core...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans selection:bg-blue-500/30">
      {/* <Navbar /> Agar navbar lagana ho toh uncomment kar lena */}
      
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-10 border-b border-white/10 pb-6 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">AutoML Pipeline</h1>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide">ENTERPRISE BETA</span>
            </div>
            <p className="text-sm text-slate-500">Configure, train, and deploy custom neural networks to the edge.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-mono text-slate-500">CLUSTER STATUS</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-medium text-emerald-400">US-East (Virginia) Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Dataset Config */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">1</span>
                Dataset Configuration
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Project Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Defective_Gears_V1" 
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    disabled={jobStatus !== 'idle'}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Base Architecture</label>
                  <select 
                    value={modelType}
                    onChange={(e) => setModelType(e.target.value)}
                    disabled={jobStatus !== 'idle'}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="yolov8n">YOLOv8 Nano (Fastest, Edge-optimized)</option>
                    <option value="yolov8s">YOLOv8 Small (Balanced)</option>
                    <option value="yolov8m" disabled>YOLOv8 Medium (Pro Plan Required)</option>
                  </select>
                </div>
              </div>

              {/* Upload Zone */}
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Training Data</span>
                  <span>{images.length} / 50 limits</span>
                </label>
                <div 
                  onClick={() => jobStatus === 'idle' && fileInputRef.current.click()}
                  className={`border border-dashed rounded-xl p-8 text-center transition-all ${jobStatus === 'idle' ? 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer' : 'border-white/5 opacity-50 cursor-not-allowed'}`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
                  <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  <p className="text-sm text-slate-300 font-medium">Click to browse or drag and drop</p>
                  <p className="text-xs text-slate-600 mt-1">JPEG, PNG up to 10MB each</p>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {images.map((src, i) => (
                      <img key={i} src={src} alt="dataset" className="w-10 h-10 object-cover rounded border border-white/10" />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Compute Config */}
            <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">2</span>
                Compute Environment
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className={`relative border rounded-xl p-4 cursor-pointer transition-all ${gpuInstance === 't4-shared' ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-white/30'}`}>
                  <input type="radio" name="gpu" value="t4-shared" checked={gpuInstance === 't4-shared'} onChange={() => setGpuInstance('t4-shared')} className="sr-only" disabled={jobStatus !== 'idle'} />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white text-sm">Shared GPU (T4)</span>
                    <span className="text-xs font-mono text-slate-500">Free</span>
                  </div>
                  <p className="text-xs text-slate-400">Suitable for small datasets. Jobs may be queued during peak hours.</p>
                </label>

                <label className={`relative border rounded-xl p-4 cursor-not-allowed opacity-60 border-white/5 bg-[#0a0a0a]`}>
                  <input type="radio" name="gpu" value="a100-dedi" disabled className="sr-only" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-300 text-sm flex items-center gap-2">
                      <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                      Dedicated A100 (80GB)
                    </span>
                    <span className="text-xs font-mono text-purple-400">$3.50/hr</span>
                  </div>
                  <p className="text-xs text-slate-500">Lightning fast training. Requires Enterprise Billing setup.</p>
                </label>
              </div>
            </div>

          </div>

          {/* Right Column: Terminal & Action */}
          <div className="space-y-6">
            <div className="bg-[#111111] border border-white/5 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
              <div className="bg-[#1a1a1a] border-b border-white/5 px-4 py-3 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-400">DEPLOYMENT LOGS</span>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
              </div>
              
              <div className="flex-1 p-4 font-mono text-[11px] leading-relaxed overflow-y-auto bg-[#050505]">
                {logs.length === 0 ? (
                  <p className="text-slate-600">System ready. Waiting for configuration...</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="mb-1.5">
                      <span className="text-slate-500 mr-2">{new Date().toISOString().split('T')[1].slice(0,-1)}</span>
                      <span className={log.includes('ERROR') || log.includes('BUSY') ? 'text-red-400' : log.includes('QUEUE') ? 'text-yellow-400' : 'text-emerald-400'}>{log}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              onClick={startTrainingPipeline}
              disabled={jobStatus !== 'idle'}
              className="w-full bg-white text-black hover:bg-slate-200 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {jobStatus === 'idle' && 'Initialize Training Cluster'}
              {jobStatus === 'uploading' && <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Provisioning Resources...</>}
              {jobStatus === 'queued' && 'Adding to Queue...'}
              {jobStatus === 'failed' && 'Job Queued (Pending GPUs)'}
            </button>

            {jobStatus === 'failed' && (
              <p className="text-xs text-center text-slate-500">
                You are using the free shared tier. Your job will execute when resources are available.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}