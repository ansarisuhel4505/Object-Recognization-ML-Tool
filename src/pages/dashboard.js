import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, api, admin
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKey] = useState(null);
  
  // Admin States
  const [allUsers, setAllUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
    if (status === "authenticated") {
      fetch('/api/history').then(res => res.json()).then(data => data.success && setHistory(data.data));
      fetch('/api/developer/key').then(res => res.json()).then(data => data.apiKey && setApiKey(data.apiKey));
      
      if (session?.user?.role === 'admin') {
        fetchAdminUsers();
      }
    }
  }, [status, router, session]);

  const fetchAdminUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if(data.success) setAllUsers(data.data);
  };

  const handleBlockToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: newStatus })
    });
    fetchAdminUsers(); // Refresh list
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if(data.success) {
      alert("User Created Successfully!");
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchAdminUsers();
    } else {
      alert(data.error);
    }
  };

  if (status === "loading") return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-blue-500">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header & Tabs */}
        <div className="mb-8 border-b border-white/10 pb-4">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-6">Workspace Console</h1>
          <div className="flex gap-6 overflow-x-auto custom-scrollbar">
            <button onClick={() => setActiveTab('analytics')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'analytics' ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Overview & Analytics
            </button>
            <button onClick={() => setActiveTab('api')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'api' ? 'border-purple-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
              Developer API
            </button>
            {session?.user?.role === 'admin' && (
              <button onClick={() => setActiveTab('admin')} className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'admin' ? 'border-red-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                User Management (Admin)
              </button>
            )}
          </div>
        </div>

        {/* 📊 TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#111111] border border-white/5 p-6 rounded-xl shadow-lg">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Invocations</p>
                <p className="text-4xl font-black text-white">{history.length}</p>
              </div>
              <div className="bg-[#111111] border border-white/5 p-6 rounded-xl shadow-lg">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Workspace Tier</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-xl font-bold text-emerald-400 uppercase tracking-wide">Enterprise</p>
                </div>
              </div>
              <div className="bg-[#111111] border border-white/5 p-6 rounded-xl shadow-lg">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Active Session</p>
                <p className="text-sm font-medium text-slate-300 truncate">{session?.user?.email}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">Role: {session?.user?.role}</p>
              </div>
            </div>

            {/* Chart */}
            {history.length > 0 && (
              <div className="bg-[#111111] border border-white/5 p-6 rounded-xl shadow-lg">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Object Detection Frequency</h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.values(history.reduce((acc, curr) => {
                        const label = curr.detectedObjects[0]?.label || "Unknown";
                        if (!acc[label]) acc[label] = { name: label, count: 0 };
                        acc[label].count += 1;
                        return acc;
                      }, {})).sort((a, b) => b.count - a.count).slice(0, 5)}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {history.map((_, i) => <Cell key={`cell-${i}`} fill="#3b82f6" />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 🔑 TAB 2: DEVELOPER API */}
        {activeTab === 'api' && (
          <div className="bg-[#111111] border border-purple-500/20 p-8 rounded-xl shadow-lg animate-fade-in border-l-4 border-l-purple-500">
            <h2 className="text-xl font-bold text-white mb-2">Production API Keys</h2>
            <p className="text-sm text-slate-400 mb-8">Do not share your API key in publicly accessible areas such as GitHub, client-side code, etc.</p>
            
            <div className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Secret Key</div>
            <div className="flex gap-3 mb-8">
              <div className="flex-1 bg-[#050505] border border-white/10 rounded-lg p-3 font-mono text-sm text-purple-400 tracking-wider">
                {apiKey || 'sk_live_********************************'}
              </div>
              <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                Copy
              </button>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-lg overflow-hidden">
              <div className="bg-[#1a1a1a] px-4 py-2 text-xs font-mono text-slate-500 flex justify-between border-b border-white/5">
                <span>cURL Request</span>
                <span>POST /api/v1/scan</span>
              </div>
              <pre className="p-4 text-xs font-mono text-blue-400 overflow-x-auto">
{`curl -X POST https://api.visionai.com/v1/scan \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{ "image": "base64_string" }'`}
              </pre>
            </div>
          </div>
        )}

        {/* 🛡️ TAB 3: ADMIN MANAGEMENT (Only for Admins) */}
        {activeTab === 'admin' && session?.user?.role === 'admin' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Create User Form */}
            <div className="bg-[#111111] border border-red-500/20 p-6 rounded-xl shadow-lg border-t-4 border-t-red-500">
              <h2 className="text-lg font-bold text-white mb-4">Provision New Account</h2>
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                  <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-red-500 focus:outline-none" placeholder="Student Name" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Email (Official)</label>
                  <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-red-500 focus:outline-none" placeholder="student@college.edu" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                  <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-red-500 focus:outline-none" placeholder="••••••••" />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-red-500 focus:outline-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg text-sm transition-colors">
                    Create User
                  </button>
                </div>
              </form>
            </div>

            {/* Users List Table */}
            <div className="bg-[#111111] border border-white/5 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-[#1a1a1a]">
                <h2 className="text-sm font-bold text-white uppercase tracking-widest">Active & Suspended Accounts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0a0a0a] text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="p-4 font-semibold">User Details</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <p className="text-sm font-bold text-white">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${u.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {u.status}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          {u.email !== session?.user?.email && (
                            <button 
                              onClick={() => handleBlockToggle(u._id, u.status)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${u.status === 'active' ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                            >
                              {u.status === 'active' ? 'Block Access' : 'Unblock User'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}