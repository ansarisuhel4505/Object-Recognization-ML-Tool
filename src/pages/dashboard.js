import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Data States
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🚀 NAYA: Developer API States
  const [apiKey, setApiKey] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/');
    }
    
    if (status === "authenticated") {
      // Fetch History
      fetch('/api/history')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setHistory(data.data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch history:", err);
          setLoading(false);
        });

      // 🚀 NAYA: Fetch API Key
      fetch('/api/developer/key')
        .then(res => res.json())
        .then(data => {
          if(data.apiKey) setApiKey(data.apiKey);
        })
        .catch(err => console.error("Failed to fetch API key:", err));
    }
  }, [status, router]);

  // 🚀 NAYA: Generate API Key Function
  const generateApiKey = async () => {
    if(!confirm("Warning: Generating a new key will invalidate your old key. Continue?")) return;
    setKeyLoading(true);
    try {
      const res = await fetch('/api/developer/key', { method: 'POST' });
      const data = await res.json();
      setApiKey(data.apiKey);
    } catch (err) {
      console.error("Error generating key:", err);
    }
    setKeyLoading(false);
  };

  // 📊 PRO-LEVEL: CSV Export Functionality
  const downloadCSVReport = () => {
    const headers = "Date & Time,Detected Object,Confidence,Processing Time (ms),Cloud Image URL\n";
    const rows = history.map(record => {
      const date = new Date(record.createdAt).toLocaleString().replace(/,/g, '');
      const label = record.detectedObjects[0]?.label || "Unknown";
      const confidence = `${(record.detectedObjects[0]?.confidence * 100).toFixed(1)}%`;
      const time = record.scanTime;
      const url = record.imageUrl;
      return `"${date}","${label}","${confidence}","${time}","${url}"`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Enterprise_AI_Scan_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-emerald-400 text-xl font-bold">Loading Dashboard Data...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans py-10 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
              Analytics Dashboard
            </h1>
            <p className="text-slate-400 mt-1">Welcome back, {session?.user?.name}</p>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-slate-400 text-sm font-semibold uppercase">Total Scans</h3>
            <p className="text-4xl font-bold text-white mt-2">{history.length}</p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-slate-400 text-sm font-semibold uppercase">Account Status</h3>
            <p className="text-2xl font-bold text-emerald-400 mt-2 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span> Pro Active
            </p>
          </div>
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl">
            <h3 className="text-slate-400 text-sm font-semibold uppercase">Primary Email</h3>
            <p className="text-lg font-medium text-white mt-2 truncate">{session?.user?.email}</p>
          </div>
        </div>

        {/* 🚀 NAYA: Developer API Portal */}
        <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg className="w-24 h-24 text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5l-10-5V17l10 5 10-5V4.5l-10 5z"></path></svg>
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Developer API Access</h2>
          <p className="text-sm text-slate-400 mb-6">Integrate our AI model directly into your own applications using your secret API key.</p>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
            <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 flex justify-between items-center w-full">
              <code className="text-sm font-mono text-emerald-400 truncate pr-4">
                {apiKey ? apiKey : 'sk_live_********************************'}
              </code>
              {apiKey && (
                <button onClick={() => {navigator.clipboard.writeText(apiKey); alert("API Key Copied!");}} className="text-slate-400 hover:text-white transition-colors" title="Copy to clipboard">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                </button>
              )}
            </div>
            <button 
              onClick={generateApiKey}
              disabled={keyLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-lg transition-colors whitespace-nowrap text-sm"
            >
              {keyLoading ? 'Generating...' : (apiKey ? 'Roll New Key' : 'Generate Secret Key')}
            </button>
          </div>

          {/* Code Example */}
          <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
            <div className="bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 flex justify-between">
              <span>cURL Example</span>
              <span>POST /api/v1/scan</span>
            </div>
            <pre className="p-4 text-xs font-mono text-blue-300 overflow-x-auto">
{`curl -X POST https://yourdomain.com/api/v1/scan \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{ "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJ..." }'`}
            </pre>
          </div>
        </div>

        {/* 📊 PRO-LEVEL: AI Object Detection Analytics Chart */}
        {history.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl mb-10">
            <h2 className="text-xl font-bold text-slate-200 mb-6">Detection Frequency Analytics</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    Object.values(history.reduce((acc, curr) => {
                      const label = curr.detectedObjects[0]?.label || "Unknown";
                      if (!acc[label]) acc[label] = { name: label, count: 0 };
                      acc[label].count += 1;
                      return acc;
                    }, {})).sort((a, b) => b.count - a.count).slice(0, 5) 
                  }
                  margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                >
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: '#334155' }} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {
                      history.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'][index % 5]} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History Table with Export Button */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-200">Recent API Invocations</h2>
            <button 
              onClick={downloadCSVReport}
              disabled={history.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export CSV Report
            </button>
          </div>
          
          {history.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              No scans found. Go to the scanner and test the AI!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">Date & Time</th>
                    <th className="p-4 font-semibold">Detected Object</th>
                    <th className="p-4 font-semibold">Confidence</th>
                    <th className="p-4 font-semibold">Processing Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {history.map((record) => (
                    <tr key={record._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4 text-slate-300">
                        {new Date(record.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-sm font-medium">
                          {record.detectedObjects[0]?.label || "Unknown"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {(record.detectedObjects[0]?.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="p-4 text-slate-400 text-sm font-mono">
                        {record.scanTime} ms
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}