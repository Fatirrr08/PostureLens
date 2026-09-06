import Link from "next/link";
import { BarChart3, ArrowLeft } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Ergonomics Analytics & History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your daily posture consistency, slouch trends, and focus metrics.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Monitor</span>
        </Link>
      </div>
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
        <p className="text-slate-400">Loading Analytics...</p>
      </div>
    </div>
  );
}
