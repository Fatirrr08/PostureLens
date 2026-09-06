"use client";

import React from "react";
import { Keyboard, X, Sparkles, Check, Monitor, Eye, Activity } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Space", desc: "Start / Pause / Resume Focus Session" },
    { key: "C", desc: "Open Ergonomic Baseline Calibration" },
    { key: "M", desc: "Mute / Unmute gentle audio chime" },
    { key: "S", desc: "Toggle glowing skeleton lines" },
    { key: "F", desc: "Flip / Mirror webcam view" },
    { key: "?", desc: "Open / Close this shortcuts cheat sheet" },
  ];

  const ergonomicTips = [
    {
      icon: <Monitor className="w-4 h-4 text-cyan-400" />,
      title: "Display Height",
      text: "Top 1/3 of your screen should align with your natural eye level.",
    },
    {
      icon: <Eye className="w-4 h-4 text-emerald-400" />,
      title: "Distance",
      text: "Keep roughly arm's length (50–70 cm) between your eyes and monitor.",
    },
    {
      icon: <Activity className="w-4 h-4 text-purple-400" />,
      title: "Spine & Shoulders",
      text: "Roll shoulders back, keep lower back supported, elbows at 90–100°.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Keyboard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Keyboard Shortcuts & Ergonomics</h3>
            <p className="text-xs text-slate-400">Quick controls for seamless developer productivity</p>
          </div>
        </div>

        {/* Shortcuts Table */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">
            Global Hotkeys
          </h4>
          <div className="divide-y divide-slate-800/60 rounded-xl bg-slate-950/70 border border-slate-800/80 overflow-hidden text-xs">
            {shortcuts.map((sc, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 px-3.5">
                <span className="text-slate-300">{sc.desc}</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 font-mono font-bold text-[11px] shadow-sm">
                  {sc.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>

        {/* Ergonomics Tips */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-slate-400">
            Desk Ergonomics Golden Rules
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {ergonomicTips.map((tip, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-left">
                <div className="mb-1.5">{tip.icon}</div>
                <h5 className="text-[11px] font-bold text-slate-200">{tip.title}</h5>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glowEmerald transition-all"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
