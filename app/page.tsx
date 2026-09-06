import Link from "next/link";
import { Activity, Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>PostureLens Workspace</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live Monitor
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time on-device computer vision posture tracking & ergonomic health coach.
          </p>
        </div>
      </div>
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <p className="text-slate-400">Initializing PostureLens AI Engine...</p>
      </div>
    </div>
  );
}
