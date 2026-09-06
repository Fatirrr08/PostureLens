import { Shield, Cpu, Lock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-[#090d16]/90 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Video Upload</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>WebAssembly & WebGL</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>IndexedDB Storage</span>
          </div>
        </div>
        <p>© {new Date().getFullYear()} PostureLens. Privacy-Preserving Ergonomics for Developers.</p>
      </div>
    </footer>
  );
}
