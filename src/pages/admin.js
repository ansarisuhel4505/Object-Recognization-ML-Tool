import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminConsole() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Security States
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data States
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
    if (isUnlocked) fetchUsers();
  }, [status, router, isUnlocked]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: masterPassword })
    });
    const data = await res.json();
    if (data.success) {
      setIsUnlocked(true);
    } else {
      setAuthError(data.error);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (data.success) setUsers(data.data);
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'SUSPEND' : 'ACTIVATE'} this user?`)) return;
    
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, status: newStatus })
    });
    fetchUsers();
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("CRITICAL WARNING: This will permanently delete the user. Continue?")) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    fetchUsers();
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    const data = await res.json();
    if (data.success) {
      alert("User provisioned securely.");
      setNewUser({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } else {
      alert(data.error);
    }
  };

  // 🔒 LOCK SCREEN UI
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center font-sans px-4">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-red-500/30 p-8 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <h2 className="text-2xl font-black text-white tracking-widest uppercase mb-2">Restricted Area</h2>
          <p className="text-slate-500 text-sm mb-8">Enter Master Environment Key to access Admin Console.</p>
          
          <form onSubmit={handleUnlock}>
            <input 
              type="password" 
              value={masterPassword} 
              onChange={e => setMasterPassword(e.target.value)}
              className="w-full bg-black border border-slate-800 rounded-lg py-3 px-4 text-center text-white tracking-[0.5em] focus:border-red-500 focus:outline-none mb-4 transition-colors"
              placeholder="••••••••"
              required
            />
            {authError && <p className="text-red-500 text-xs font-bold mb-4">{authError}</p>}
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg uppercase tracking-widest text-sm transition-all shadow-lg shadow-red-500/20">
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtering for Search
  const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // 🔓 UNLOCKED ADMIN CONSOLE UI
  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              Central Command
            </h1>
            <p className="text-sm text-slate-500 mt-1">Superuser Access Granted. Handle with care.</p>
          </div>
          <button onClick={() => setIsUnlocked(false)} className="border border-slate-700 text-slate-400 hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Lock Session
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Accounts</p>
            <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase">Active Users</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase">Suspended</p>
            <p className="text-3xl font-bold text-red-500 mt-1">{users.filter(u => u.status === 'blocked').length}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase">System Status</p>
            <p className="text-lg font-bold text-blue-400 mt-2 flex items-center gap-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> Fully Operational</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* User Creation Form */}
          <div className="bg-[#0a0a0a] border border-blue-500/20 p-6 rounded-xl h-fit border-t-4 border-t-blue-500">
            <h2 className="text-lg font-bold text-white mb-4">Provision Account</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-[#111] border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="Student Name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-[#111] border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="user@domain.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Temporary Password</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-[#111] border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Privilege Level</label>
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-[#111] border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 focus:outline-none">
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg text-sm transition-colors mt-2">
                Deploy User
              </button>
            </form>
          </div>

          {/* User Management Table */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#111]">
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Network Identities</h2>
              <input 
                type="text" 
                placeholder="Search email or name..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-black border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-slate-500"
              />
            </div>
            
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#111] z-10">
                  <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="p-4 font-semibold">Identity</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Joined</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          {u.name} 
                          {u.role === 'admin' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase">Admin</span>}
                        </p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-500 font-mono">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right opacity-50 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                        {u.email !== session?.user?.email && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(u._id, u.status)}
                              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${u.status === 'active' ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                            >
                              {u.status === 'active' ? 'Suspend' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="px-3 py-1.5 rounded text-xs font-bold bg-red-600/10 text-red-500 hover:bg-red-600/20 transition-colors"
                              title="Delete Permanently"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500 text-sm">No identities found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}