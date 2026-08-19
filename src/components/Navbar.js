import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <Link href="/" className="text-2xl font-black tracking-tight text-white hover:opacity-80 transition-opacity">
              Vision <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">AI</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <>
                <Link href="/" className={`font-semibold transition-colors ${router.pathname === '/' ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}>Scanner</Link>
                <Link href="/batch" className={`font-semibold transition-colors ${router.pathname === '/batch' ? 'text-blue-400' : 'text-slate-300 hover:text-white'}`}>Batch Scan</Link>
                <Link href="/dashboard" className={`font-semibold transition-colors ${router.pathname === '/dashboard' ? 'text-emerald-400' : 'text-slate-300 hover:text-white'}`}>Dashboard</Link>
                <Link href="/automl" className={`font-semibold transition-colors ${router.pathname === '/automl' ? 'text-orange-400' : 'text-slate-300 hover:text-white'}`}>AutoML Studio</Link>
                {/* Agar user admin hai, toh Admin Panel ka link dikhega */}
                {session?.user?.role === 'admin' && (
                   <Link href="/admin" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">Admin Panel</Link>
                )}
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-white leading-tight">{session.user.name || "Pro User"}</p>
                    <p className="text-xs text-slate-400">{session.user.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
                  </div>
                  <button onClick={() => signOut()} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-red-500/20">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button onClick={() => signIn()} className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/25">
                Secure Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {session ? (
              <>
                <div className="pb-4 mb-4 border-b border-slate-700 flex items-center gap-3 pt-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                    {session.user.name ? session.user.name[0] : "U"}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{session.user.name}</p>
                    <p className="text-sm text-slate-400">{session.user.email}</p>
                  </div>
                </div>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Scanner</Link>
                <Link href="/batch" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Batch Scan</Link>
                <Link href="/automl" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-orange-400 hover:text-orange-300 hover:bg-slate-700">AutoML Studio</Link>
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Dashboard</Link>
                {session?.user?.role === 'admin' && (
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-md text-base font-medium text-purple-400 hover:text-purple-300 hover:bg-slate-700">Admin Panel</Link>
                )}
                <button onClick={() => signOut()} className="w-full text-left mt-4 px-3 py-3 rounded-md text-base font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20">
                  Logout System
                </button>
              </>
            ) : (
              <button onClick={() => signIn()} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white px-3 py-3 rounded-md text-base font-bold text-center">
                Secure Login
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}