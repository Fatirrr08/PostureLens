"use client";

import React from "react";
import { ErgonomicMetrics, PostureStatus } from "@/lib/vision/types";

interface PostureGaugeProps {
  score: number;
  status: PostureStatus;
  metrics: ErgonomicMetrics | null;
}

export default function PostureGauge({ score, status, metrics }: PostureGaugeProps) {
  // Color configuration
  let strokeColor = "#10b981"; // emerald
  let glowColor = "rgba(16, 185, 129, 0.3)";
  let statusText = "Optimal";

  if (status === "WARNING") {
    strokeColor = "#f59e0b"; // amber
    glowColor = "rgba(245, 158, 11, 0.3)";
    statusText = "Attention";
  } else if (status === "SLOUCHING") {
    strokeColor = "#ef4444"; // red
    glowColor = "rgba(239, 68, 68, 0.4)";
    statusText = "Slouching";
  } else if (status === "AWAY") {
    strokeColor = "#64748b";
    glowColor = "transparent";
    statusText = "Away";
  }

  // Circular gauge geometry
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
      {/* Radial score ring */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-300 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${glowColor})`,
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {status === "AWAY" ? "--" : `${score}%`}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
            {statusText}
          </span>
        </div>
      </div>

      {/* Real-time telemetry metrics */}
      <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-slate-800/80 text-center">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Neck Angle</span>
          <span className="text-sm font-mono font-bold text-slate-200">
            {metrics ? `${metrics.neckAngle}°` : "--"}
          </span>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
          <span className="text-[10px] text-slate-400 uppercase font-mono block">Screen Dist</span>
          <span className="text-sm font-mono font-bold text-slate-200">
            {metrics ? `${Math.round(metrics.distanceProxy * 100)}%` : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
