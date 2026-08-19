import { useState, useRef, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';

// 🚀 FIX: Upar se pdf.js ka import hata diya taaki Vercel server crash na ho!

export default function BatchScanner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [items, setItems] = useState([]); 
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  // ==== PDF & Image Extraction Logic ====
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let newItems = [];

    for (let file of files) {
      if (file.type.startsWith('image/')) {
        // Handle Direct Images
        const base64 = await convertToBase64(file);
        newItems.push({ id: Math.random().toString(), name: file.name, image: base64, status: 'pending', result: null });
      } 
      else if (file.type === 'application/pdf') {
        // 🚀 DYNAMIC IMPORT: Vercel Error Fix
        // Ab library sirf tabhi load hogi jab user PDF upload karega (Client-side only)
        const pdfjsLib = await import('pdfjs-dist/build/pdf');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        // Handle PDF Pages
        const pdfBytes = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: ctx, viewport: viewport }).promise;
          const base64 = canvas.toDataURL('image/jpeg', 0.8);
          
          newItems.push({ id: Math.random().toString(), name: `${file.name} (Page ${i})`, image: base64, status: 'pending', result: null });
        }
      }
    }
    setItems(prev => [...prev, ...newItems]);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  // ==== Batch AI Processing Logic ====
  const runBatchScan = async () => {
    setIsProcessing(true);
    
    // Create a copy to update state progressively
    let currentItems = [...items];

    for (let i = 0; i < currentItems.length; i++) {
      if (currentItems[i].status === 'success') continue; 

      // Set to loading
      currentItems[i].status = 'loading';
      setItems([...currentItems]);

      try {
        const response = await fetch('/api/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: currentItems[i].image, email: session.user.email }),
        });
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        currentItems[i].status = 'success';
        currentItems[i].result = data.prediction;
      } catch (err) {
        currentItems[i].status = 'error';
        currentItems[i].result = 'Failed';
      }
      
      // Update UI after each image
      setItems([...currentItems]);
    }
    
    setIsProcessing(false);
    
    // Voice Feedback when batch is done
    if ('speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Batch processing complete."));
    }
  };

  const clearList = () => {
    if(isProcessing) return;
    setItems([]);
  };

  if (status === "loading") return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans py-10 px-6">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Batch & Document Scanner
          </h1>
          <p className="text-slate-400 mt-1">Upload multiple images or a PDF file to process bulk data.</p>
        </div>

        {/* Upload Area */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl mb-8">
          <div 
            onClick={() => !isProcessing && fileInputRef.current.click()}
            className={`border-2 border-dashed border-slate-600 rounded-xl p-10 text-center cursor-pointer transition-all hover:bg-slate-700/50 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*, application/pdf" multiple className="hidden" />
            <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <h3 className="text-lg font-bold text-slate-300">Click to upload PDF or Multiple Images</h3>
            <p className="text-sm text-slate-500 mt-1">Extracts pages automatically</p>
          </div>

          <div className="flex gap-4 mt-6">
            <button 
              onClick={runBatchScan}
              disabled={items.length === 0 || isProcessing}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? '⚙️ Processing Batch...' : '▶️ Start Batch Scan'}
            </button>
            <button 
              onClick={clearList}
              disabled={isProcessing || items.length === 0}
              className="px-6 bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-400 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Results Table */}
        {items.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-200">Processing Queue ({items.length} items)</h2>
            </div>
            
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-700">
                  <tr className="text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Thumbnail</th>
                    <th className="p-4 font-semibold">Document / Page Name</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">AI Detection Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4">
                        <img src={item.image} alt="thumb" className="w-16 h-16 object-cover rounded-lg border border-slate-600" />
                      </td>
                      <td className="p-4 font-medium text-slate-200">{item.name}</td>
                      <td className="p-4">
                        {item.status === 'pending' && <span className="text-slate-500 text-sm font-bold">⏳ Pending</span>}
                        {item.status === 'loading' && <span className="text-blue-400 text-sm font-bold animate-pulse">⚙️ Scanning...</span>}
                        {item.status === 'success' && <span className="text-emerald-400 text-sm font-bold">✅ Complete</span>}
                        {item.status === 'error' && <span className="text-red-400 text-sm font-bold">❌ Error</span>}
                      </td>
                      <td className="p-4">
                        {item.result ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-sm font-bold">
                            {item.result}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}