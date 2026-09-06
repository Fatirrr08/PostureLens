import React from "react";
import { DailyErgonomicStats } from "@/lib/db/queries";
import { formatTimeHoursMins } from "@/lib/utils";
import { AlertTriangle, Clock, Eye, ShieldCheck, Flame, Trophy } from "lucide-react";

interface IncidentMetricsProps {
  stats: DailyErgonomicStats;
  streak?: number;
}

export default function IncidentMetrics({ stats, streak = 1 }: IncidentMetricsProps) {
  const totalPostureSeconds = stats.goodPostureSeconds + stats.badPostureSeconds;
  const optimalRatio =
    totalPostureSeconds > 0
      ? Math.round((stats.goodPostureSeconds / totalPostureSeconds) * 100)
      : 100;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Focus Time */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Monitored Time</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-white mt-2">
          {formatTimeHoursMins(stats.totalDurationSeconds)}
        </p>
        <span className="text-[11px] text-slate-500 mt-1 block">
          {stats.totalSessions} session{stats.totalSessions === 1 ? "" : "s"} logged today
        </span>
      </div>

      {/* 2. Slouch Alerts */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Slouch Alerts</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-white mt-2">
          {stats.totalSlouchCount}
        </p>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Sustained forward head hunch
        </span>
      </div>

      {/* 3. Screen Proximity Warnings */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Proximity Warnings</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-white mt-2">
          {stats.totalProximityCount}
        </p>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Excessive screen nearness
        </span>
      </div>

      {/* 4. Optimal Posture Ratio */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Spine Alignment Ratio</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <p className="text-2xl font-bold font-mono text-white mt-2">
          {optimalRatio}%
        </p>
        <span className="text-[11px] text-slate-500 mt-1 block">
          Time spent upright
        </span>
      </div>

      {/* 5. Daily Streak Badge */}
      <div className="col-span-2 lg:col-span-4 p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-glowAmber">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                {streak > 0 ? `${streak} Day Ergonomics Streak` : "Start Your Daily Streak Today"}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                {streak >= 7 ? "Ergonomic Master 🏆" : streak >= 3 ? "Spine Champion ⚡" : "Consistency Builder 🌱"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Consistent good posture prevents tech neck, lumbar fatigue, and chronic tension.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
