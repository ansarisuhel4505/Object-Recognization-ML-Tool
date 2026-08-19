import { useState } from 'react';
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  const [apiKey, setApiKey] = useState('sk_live_eed1bfc44f699061766bcfc...');
  const [showKey, setShowKey] = useState(false);

  const generateNewKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 24) + Math.random().toString(36).substr(2, 24);
    setApiKey(newKey);
    alert('New Enterprise API Key Generated! Keep it secure.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-100 mb-8">Account & Security</h1>
        
        {/* User Details */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-6 text-emerald-400 border-b border-slate-700 pb-3">User Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</p>
              <p className="text-lg font-medium">{session?.user?.name || "Student User"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Email</p>
              <p className="text-lg font-medium">{session?.user?.email || "student@institute.com"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Account Tier</p>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                PRO ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Developer API Section */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-400">Developer API Access</h2>
              <p className="text-slate-400 text-sm mt-1">Integrate Vision AI engine directly into your custom applications.</p>
            </div>
          </div>
          
          <div className="mt-6 mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Secret API Key</p>
            <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-700">
              <code className={`flex-1 font-mono tracking-wider ${showKey ? 'text-emerald-400' : 'text-slate-500 blur-sm select-none'}`}>
                {apiKey}
              </code>
              <button onClick={() => setShowKey(!showKey)} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                {showKey ? 'Hide' : 'Reveal'}
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(apiKey)} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg"
              >
                Copy Key
              </button>
            </div>
          </div>
          
          <button onClick={generateNewKey} className="text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Roll New Key
          </button>
        </div>
      </div>
    </div>
  );
}