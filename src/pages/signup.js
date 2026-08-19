import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Signup() {
  const router = useRouter();
  const [step, setStep] = useState(1); // Step 1: Details, Step 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setMsg(null);
    
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setMsg(data.message);
      setStep(2); // Move to OTP screen
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setMsg(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setMsg(data.message);
      setTimeout(() => router.push('/'), 2000); // Redirect to login
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.3)]">
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Create your account</h2>
        <p className="mt-2 text-sm text-slate-400">
          Already have an account? <Link href="/" className="font-bold text-blue-400 hover:text-blue-300">Sign in securely</Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-8 px-4 shadow-2xl border border-slate-700 sm:rounded-2xl sm:px-10">
          
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 text-sm rounded-lg text-center">{error}</div>}
          {msg && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm rounded-lg text-center">{msg}</div>}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Full Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg shadow-sm py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors" placeholder="John Doe" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Work Email <span className="text-red-500">*</span></label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg shadow-sm py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors" placeholder="you@company.com" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">Password <span className="text-red-500">*</span></label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full bg-slate-900 border border-slate-700 rounded-lg shadow-sm py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-colors" placeholder="••••••••" minLength="6" />
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors">
                {loading ? 'Verifying Intelligence...' : 'Continue with Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-400">We sent a verification code to</p>
                <p className="text-sm font-bold text-white">{formData.email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide text-center">Enter 6-Digit OTP</label>
                <input required type="text" maxLength="6" value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} className="mt-2 block w-full bg-slate-900 border border-slate-700 rounded-lg shadow-sm py-3 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-[0.5em] font-mono transition-colors" placeholder="------" />
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors">
                {loading ? 'Creating Account...' : 'Verify & Register'}
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-slate-400 hover:text-white mt-4 text-center block">
                ← Back to edit details
              </button>
            </form>
          )}
          
        </div>
      </div>
    </div>
  );
}