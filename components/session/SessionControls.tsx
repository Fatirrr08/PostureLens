"use client";

import React from "react";
import {
  Play,
  Pause,
  Square,
  Sliders,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Compass,
  FlipHorizontal,
  Bell,
} from "lucide-react";
import { formatSeconds } from "@/lib/utils";

interface SessionControlsProps {
  sessionActive: boolean;
  sessionPaused: boolean;
  durationSeconds: number;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: () => void;
  onOpenCalibration: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showSkeleton: boolean;
  onToggleSkeleton: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  mirrored: boolean;
  onToggleMirror: () => void;
  sensitivity: import("@/lib/vision/types").SensitivityLevel;
  onChangeSensitivity: (level: import("@/lib/vision/types").SensitivityLevel) => void;
  onTestChime: () => void;
}

export default function SessionControls({
  sessionActive,
  sessionPaused,
  durationSeconds,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onEndSession,
  onOpenCalibration,
  isMuted,
  onToggleMute,
  showSkeleton,
  onToggleSkeleton,
  showGuides,
  onToggleGuides,
  mirrored,
  onToggleMirror,
  sensitivity,
  onChangeSensitivity,
  onTestChime,
}: SessionControlsProps) {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
      {/* Session Header & Timer */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-slate-400 block">
            Focus Session
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                sessionActive && !sessionPaused
                  ? "bg-emerald-400 animate-ping"
                  : sessionPaused
                  ? "bg-amber-400"
                  : "bg-slate-600"
              }`}
            />
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {formatSeconds(durationSeconds)}
            </span>
          </div>
        </div>

        {/* Calibration button */}
        <button
          onClick={onOpenCalibration}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Calibrate</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-700">C</kbd>
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="flex items-center gap-3">
        {!sessionActive ? (
          <button
            onClick={onStartSession}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-glowEmerald flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Focus Session</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-emerald-700/80 text-white rounded border border-emerald-500/40">Space</kbd>
          </button>
        ) : (
          <>
            {sessionPaused ? (
              <button
                onClick={onResumeSession}
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glowEmerald flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Resume</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-emerald-700/80 text-white rounded border border-emerald-500/40">Space</kbd>
              </button>
            ) : (
              <button
                onClick={onPauseSession}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-glowAmber flex items-center justify-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-amber-700/80 text-white rounded border border-amber-500/40">Space</kbd>
              </button>
            )}

            <button
              onClick={onEndSession}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-300 hover:text-rose-300 font-bold text-xs border border-slate-700 hover:border-rose-800 flex items-center justify-center gap-2 transition-all"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>End & Save</span>
            </button>
          </>
        )}
      </div>

      {/* Quick Toolbars & Toggles */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
        {/* Sensitivity preset cycle button */}
        <button
          onClick={() => {
            const next =
              sensitivity === "balanced"
                ? "strict"
                : sensitivity === "strict"
                ? "relaxed"
                : "balanced";
            onChangeSensitivity(next);
          }}
          title="Click to cycle sensitivity (Balanced -> Strict -> Relaxed)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[11px] font-mono transition-colors"
        >
          <span className="text-slate-500">Sens:</span>
          <span
            className={
              sensitivity === "strict"
                ? "text-rose-400 font-bold"
                : sensitivity === "relaxed"
                ? "text-cyan-400 font-bold"
                : "text-emerald-400 font-bold"
            }
          >
            {sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Camera Flip toggle */}
          <button
            onClick={onToggleMirror}
            title={mirrored ? "Disable Mirror Camera" : "Enable Mirror Camera"}
            className={`p-1.5 rounded-lg border transition-colors ${
              mirrored
                ? "bg-slate-800 text-cyan-400 border-cyan-500/30"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Skeleton toggle */}
          <button
            onClick={onToggleSkeleton}
            title={showSkeleton ? "Hide Skeleton Lines" : "Show Skeleton Lines"}
            className={`p-1.5 rounded-lg border transition-colors ${
              showSkeleton
                ? "bg-slate-800 text-cyan-400 border-cyan-500/30"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            {showSkeleton ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Framing Guides toggle */}
          <button
            onClick={onToggleGuides}
            title={showGuides ? "Hide Framing Guides" : "Show Framing Guides"}
            className={`p-1.5 rounded-lg border transition-colors ${
              showGuides
                ? "bg-slate-800 text-emerald-400 border-emerald-500/30"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Unmute Audio Chimes" : "Mute Audio Chimes"}
            className={`p-1.5 rounded-lg border transition-colors ${
              !isMuted
                ? "bg-slate-800 text-emerald-400 border-emerald-500/30"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Test chime preview button */}
          <button
            onClick={onTestChime}
            title="Test Posture Alert Chime"
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
