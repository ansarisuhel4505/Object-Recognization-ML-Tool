import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AutoMLStudio() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push('/');
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col items-center justify-center py-10 px-6">
      <div className="max-w-2xl text-center">
        <div className="w-24 h-24 bg-blue-900/40 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.3)]">
          <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        </div>
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-4">
          AutoML Studio <span className="text-blue-500 text-lg align-top font-bold uppercase tracking-widest border border-blue-500/30 px-2 py-1 rounded bg-blue-500/10 ml-2">Beta</span>
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
          Custom Neural Network training is currently offloaded to our secure high-performance GPU clusters. The web interface for dataset management and hyperparameter tuning is undergoing an enterprise upgrade.
        </p>
        <button className="bg-slate-800 border border-slate-700 text-slate-300 px-8 py-4 rounded-xl font-bold cursor-not-allowed flex items-center gap-3 mx-auto shadow-inner">
          <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          System Upgrading for V2.0...
        </button>
      </div>
    </div>
  );
}