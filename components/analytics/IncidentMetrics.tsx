"use client";

import React from "react";
import { DailyErgonomicStats } from "@/lib/db/queries";
import { formatTimeHoursMins } from "@/lib/utils";
import { AlertTriangle, Clock, Eye, ShieldCheck } from "lucide-react";

interface IncidentMetricsProps {
  stats: DailyErgonomicStats;
}

export default function IncidentMetrics({ stats }: IncidentMetricsProps) {
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
    </div>
  );
}
