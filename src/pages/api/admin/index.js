import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== 'admin')) {
      router.push('/'); // Agar admin nahi hai toh bahar phek do
    }
    
    if (status === "authenticated" && session.user.role === 'admin') {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (data.success) setUsers(data.data);
    setLoading(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("Creating user...");
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (data.success) {
      setMessage("User created successfully!");
      setName(''); setEmail(''); setPassword('');
      fetchUsers();
    } else {
      setMessage(`Error: ${data.error}`);
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if(!confirm("Are you sure you want to delete this user forever?")) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchUsers();
  };

  if (status === "loading" || loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-purple-400 font-bold">Verifying Admin Access...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans py-10 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Admin Control Center
          </h1>
          <p className="text-slate-400 mt-1">Manage system users, permissions, and access.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create User Form */}
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl shadow-xl h-fit">
            <h2 className="text-xl font-bold mb-4">Create Manual User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Temporary Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 mt-1 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors mt-2">
                Generate Account
              </button>
            </form>
            {message && <div className="mt-4 p-3 bg-slate-900 border border-slate-700 rounded-lg text-sm text-center text-emerald-400">{message}</div>}
          </div>

          {/* Users Table */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-700">
              <h2 className="text-xl font-bold">Registered Personnel</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold">User Info</th>
                    <th className="p-4 font-semibold">Role</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-white">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md font-bold uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-700 text-slate-300'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${u.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {u.status === 'active' ? '🟢 Active' : '🔴 Blocked'}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        {u.role !== 'admin' && (
                          <>
                            <button 
                              onClick={() => toggleStatus(u._id, u.status)} 
                              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
                            >
                              {u.status === 'active' ? 'Block' : 'Unblock'}
                            </button>
                            <button 
                              onClick={() => deleteUser(u._id)}
                              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}