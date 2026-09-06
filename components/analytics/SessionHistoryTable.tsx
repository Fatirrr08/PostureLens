"use client";

import React from "react";
import { SessionRecord } from "@/lib/vision/types";
import { formatSeconds, formatTimeHoursMins } from "@/lib/utils";
import { Trash2, ExternalLink, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

interface SessionHistoryTableProps {
  sessions: SessionRecord[];
  onSelectSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
  selectedSessionId?: string | null;
}

export default function SessionHistoryTable({
  sessions,
  onSelectSession,
  onDeleteSession,
  selectedSessionId,
}: SessionHistoryTableProps) {
  if (sessions.length === 0) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-400">
        <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-semibold text-white">No Monitored Sessions Found</p>
        <p className="text-xs text-slate-500 mt-1">
          Start a focus session from the Monitor page to see your history logged here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Session History Log</h3>
          <p className="text-xs text-slate-400">Chronological desk sessions and ergonomic performance</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
          {sessions.length} recorded
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-mono">
              <th className="py-3 px-4 font-semibold">Date & Time</th>
              <th className="py-3 px-4 font-semibold">Duration</th>
              <th className="py-3 px-4 font-semibold">Score</th>
              <th className="py-3 px-4 font-semibold">Slouch Alerts</th>
              <th className="py-3 px-4 font-semibold">Proximity</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session.sessionId;
              const dateStr = new Date(session.startTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              let badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
              if (session.score < 65) {
                badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
              } else if (session.score < 80) {
                badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
              }

              return (
                <tr
                  key={session.sessionId}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    isSelected ? "bg-slate-800/70 border-l-2 border-l-cyan-400" : ""
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono text-slate-200">
                    {dateStr}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {formatSeconds(session.durationSeconds)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold border text-[11px] ${badgeColor}`}
                    >
                      {session.score}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    <span className={session.slouchCount > 0 ? "text-rose-400 font-semibold" : "text-slate-500"}>
                      {session.slouchCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">
                    <span className={session.proximityCount > 0 ? "text-amber-400 font-semibold" : "text-slate-500"}>
                      {session.proximityCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {onSelectSession && (
                      <button
                        onClick={() => onSelectSession(session.sessionId)}
                        title="View timeline"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteSession && (
                      <button
                        onClick={() => onDeleteSession(session.sessionId)}
                        title="Delete session"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
