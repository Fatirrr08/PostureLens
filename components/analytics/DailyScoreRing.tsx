"use client";

import React from "react";
import { DailyErgonomicStats } from "@/lib/db/queries";
import { Award, TrendingUp, AlertOctagon } from "lucide-react";

interface DailyScoreRingProps {
  stats: DailyErgonomicStats;
}

export default function DailyScoreRing({ stats }: DailyScoreRingProps) {
  const score = stats.totalSessions > 0 ? stats.averageScore : 100;

  // Grade determination
  let gradeText = "Optimal Posture";
  let gradeDesc = "Minimal slouching detected today";
  let color = "#10b981"; // emerald
  let glowColor = "rgba(16, 185, 129, 0.35)";

  if (score < 65) {
    gradeText = "Needs Focus";
    gradeDesc = "High frequency of slouching detected";
    color = "#ef4444";
    glowColor = "rgba(239, 68, 68, 0.4)";
  } else if (score < 80) {
    gradeText = "Moderate";
    gradeDesc = "Periodic forward head tilt observed";
    color = "#f59e0b";
    glowColor = "rgba(245, 158, 11, 0.35)";
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden shadow-xl">
      {/* Ambient background glow */}
      <div
        className="absolute w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: color }}
      />

      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          <circle
            cx="88"
            cy="88"
            r={radius}
            stroke={color}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${glowColor})`,
            }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
            {stats.totalSessions > 0 ? `${score}%` : "--"}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-0.5">Daily Score</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-base font-bold text-white flex items-center justify-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>{stats.totalSessions > 0 ? gradeText : "No Sessions Yet"}</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          {stats.totalSessions > 0
            ? gradeDesc
            : "Complete a focus session on the monitor page to generate your ergonomic score."}
        </p>
      </div>
    </div>
  );
}
