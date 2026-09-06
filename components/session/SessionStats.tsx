"use client";

import React from "react";
import { formatSeconds } from "@/lib/utils";
import { PostureStatus, ErgonomicMetrics } from "@/lib/vision/types";
import PostureStatusBadge from "@/components/posture/PostureStatusBadge";
import { AlertCircle, Eye, ShieldCheck, Activity } from "lucide-react";

interface SessionStatsProps {
  score: number;
  status: PostureStatus;
  userPresent: boolean;
  metrics: ErgonomicMetrics | null;
  slouchCount: number;
  proximityCount: number;
  goodPostureSeconds: number;
  badPostureSeconds: number;
}

export default function SessionStats({
  score,
  status,
  userPresent,
  metrics,
  slouchCount,
  proximityCount,
  goodPostureSeconds,
  badPostureSeconds,
}: SessionStatsProps) {
  const totalSeconds = goodPostureSeconds + badPostureSeconds;
  const goodRatio = totalSeconds > 0 ? Math.round((goodPostureSeconds / totalSeconds) * 100) : 100;
  const badRatio = totalSeconds > 0 ? 100 - goodRatio : 0;

  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Header with real-time status badge */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
            Posture Telemetry
          </span>
          <span className="text-sm font-bold text-white mt-0.5 block">Live Ergonomics</span>
        </div>
        <PostureStatusBadge status={status} userPresent={userPresent} score={score} />
      </div>

      {/* Upright vs Slouched Time Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Upright: {formatSeconds(goodPostureSeconds)} ({goodRatio}%)</span>
          </span>
          <span className="text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Slouched: {formatSeconds(badPostureSeconds)} ({badRatio}%)</span>
          </span>
        </div>

        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${goodRatio}%` }}
          />
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${badRatio}%` }}
          />
        </div>
      </div>

      {/* Incident Counter Badges */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Slouch Alerts</span>
            <span className="text-base font-bold font-mono text-white">{slouchCount}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Proximity Alerts</span>
            <span className="text-base font-bold font-mono text-white">{proximityCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
