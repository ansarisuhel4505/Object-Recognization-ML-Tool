import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="text-xl font-black text-white tracking-tight mb-2">
              Vision <span className="text-emerald-400">AI</span>
            </span>
            <p className="text-slate-500 text-sm max-w-sm">
              Enterprise-grade neural object recognition portal. Powered by Machine Learning and Next.js Architecture.
            </p>
          </div>

          <div className="flex gap-6 text-sm font-medium text-slate-400">
            <Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">Documentation</Link>
          </div>
          
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-500 text-xs">
          <p>© {new Date().getFullYear()} Vision AI Enterprise. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with 💙 by Suhel Ansari</p>
        </div>
      </div>
    </footer>
  );
}