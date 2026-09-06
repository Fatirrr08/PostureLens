"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  Download,
  Trash2,
  RefreshCw,
  Activity,
  Calendar,
  Sparkles,
} from "lucide-react";
import DailyScoreRing from "@/components/analytics/DailyScoreRing";
import IncidentMetrics from "@/components/analytics/IncidentMetrics";
import SessionHistoryTable from "@/components/analytics/SessionHistoryTable";
import SessionTimelineChart from "@/components/analytics/SessionTimelineChart";
import {
  getTodayStats,
  getRecentSessions,
  getSessionSamples,
  deleteSession,
  clearAllHistory,
  exportAllDataAsJSON,
  DailyErgonomicStats,
} from "@/lib/db/queries";
import { DBPostureSample } from "@/lib/db/database";
import { SessionRecord } from "@/lib/vision/types";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DailyErgonomicStats | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSamples, setSelectedSamples] = useState<DBPostureSample[]>([]);
  const [selectedSessionDuration, setSelectedSessionDuration] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const todayStats = await getTodayStats();
      const recentSessions = await getRecentSessions(30);
      setStats(todayStats);
      setSessions(recentSessions);

      if (recentSessions.length > 0) {
        // Auto-select most recent session
        const latest = recentSessions[0];
        setSelectedSessionId(latest.sessionId);
        setSelectedSessionDuration(latest.durationSeconds);
        const samples = await getSessionSamples(latest.sessionId);
        setSelectedSamples(samples);
      } else {
        setSelectedSessionId(null);
        setSelectedSamples([]);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const session = sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      setSelectedSessionDuration(session.durationSeconds);
    }
    const samples = await getSessionSamples(sessionId);
    setSelectedSamples(samples);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Are you sure you want to delete this session record?")) {
      await deleteSession(sessionId);
      await loadData();
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all ergonomic history? This action cannot be undone.")) {
      await clearAllHistory();
      await loadData();
    }
  };

  const handleExportJSON = async () => {
    try {
      const jsonStr = await exportAllDataAsJSON();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `posturelens-analytics-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export JSON data.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Ergonomics Analytics Dashboard</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
              IndexedDB
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Historical trends, spine alignment consistency, and sustained slouch intervals.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            title="Export Data as JSON"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={handleClearAll}
            title="Clear All History"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-xs font-medium text-slate-300 hover:text-rose-400 border border-slate-700 hover:border-rose-800/50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-glowEmerald transition-all"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Monitor</span>
          </Link>
        </div>
      </div>

      {loading && !stats ? (
        <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm">Loading ergonomic records from browser database...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Overview */}
          {stats && <IncidentMetrics stats={stats} />}

          {/* Daily Score & Session Timeline Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {stats && (
              <div className="lg:col-span-1">
                <DailyScoreRing stats={stats} />
              </div>
            )}

            <div className="lg:col-span-2 space-y-4">
              <SessionTimelineChart
                samples={selectedSamples}
                durationSeconds={selectedSessionDuration}
              />
            </div>
          </div>

          {/* Session History Table */}
          <SessionHistoryTable
            sessions={sessions}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            selectedSessionId={selectedSessionId}
          />
        </>
      )}
    </div>
  );
}
