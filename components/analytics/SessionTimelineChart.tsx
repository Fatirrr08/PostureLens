"use client";

import React from "react";
import { DBPostureSample } from "@/lib/db/database";
import { formatSeconds } from "@/lib/utils";
import { Clock, Activity } from "lucide-react";

interface SessionTimelineChartProps {
  samples: DBPostureSample[];
  durationSeconds: number;
}

export default function SessionTimelineChart({ samples, durationSeconds }: SessionTimelineChartProps) {
  if (samples.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-slate-500 text-xs">
        <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p>No timeline intervals recorded yet for this session.</p>
      </div>
    );
  }

  // Count distribution
  const optimalCount = samples.filter((s) => s.status === "OPTIMAL").length;
  const warningCount = samples.filter((s) => s.status === "WARNING").length;
  const slouchCount = samples.filter((s) => s.status === "SLOUCHING").length;
  const total = samples.length;

  const optimalPct = Math.round((optimalCount / total) * 100);
  const warningPct = Math.round((warningCount / total) * 100);
  const slouchPct = Math.round((slouchCount / total) * 100);

  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Posture Interval Timeline</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time status progression across {samples.length} logged intervals
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Good ({optimalPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Warning ({warningPct}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Slouch ({slouchPct}%)</span>
          </div>
        </div>
      </div>

      {/* Discrete interval block timeline */}
      <div className="h-9 w-full rounded-xl bg-slate-950 p-1 flex gap-0.5 overflow-hidden border border-slate-800/80">
        {samples.map((sample, idx) => {
          let bg = "bg-emerald-500/80 hover:bg-emerald-400";
          if (sample.status === "WARNING") {
            bg = "bg-amber-500/80 hover:bg-amber-400";
          } else if (sample.status === "SLOUCHING") {
            bg = "bg-rose-500/80 hover:bg-rose-400";
          }

          const timeStr = new Date(sample.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });

          return (
            <div
              key={idx}
              title={`Time: ${timeStr} | Status: ${sample.status} | Score: ${sample.score}% | Neck Angle: ${sample.neckAngle}°`}
              className={`flex-1 h-full rounded-sm transition-all cursor-pointer ${bg}`}
            />
          );
        })}
      </div>

      {/* Timestamp labels */}
      <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
        <span>00:00</span>
        <span>{formatSeconds(Math.floor(durationSeconds / 2))}</span>
        <span>{formatSeconds(durationSeconds)}</span>
      </div>
    </div>
  );
}
