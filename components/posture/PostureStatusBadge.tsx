"use client";

import React from "react";
import { PostureStatus } from "@/lib/vision/types";
import { CheckCircle2, AlertTriangle, XCircle, UserX } from "lucide-react";

interface PostureStatusBadgeProps {
  status: PostureStatus;
  userPresent: boolean;
  score: number;
  className?: string;
}

export default function PostureStatusBadge({
  status,
  userPresent,
  score,
  className = "",
}: PostureStatusBadgeProps) {
  if (!userPresent || status === "AWAY") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-medium backdrop-blur-md ${className}`}
      >
        <UserX className="w-3.5 h-3.5 text-slate-400" />
        <span>Waiting for user...</span>
      </div>
    );
  }

  if (status === "OPTIMAL") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-glowEmerald backdrop-blur-md transition-all ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Optimal Posture ({score}%)</span>
      </div>
    );
  }

  if (status === "WARNING") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold shadow-glowAmber backdrop-blur-md transition-all ${className}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>Slight Slouch / Distance Warning ({score}%)</span>
      </div>
    );
  }

  // SLOUCHING
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs font-semibold shadow-glowDanger backdrop-blur-md animate-pulse transition-all ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
      </span>
      <XCircle className="w-3.5 h-3.5" />
      <span>Poor Posture Detected ({score}%)</span>
    </div>
  );
}
