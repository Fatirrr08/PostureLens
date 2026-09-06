"use client";

import React, { useState, useEffect } from "react";
import { Eye, X, CheckCircle, Sparkles } from "lucide-react";
import { soundEngine } from "@/lib/audio/sound";

interface EyeBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EyeBreakModal({ isOpen, onClose }: EyeBreakModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(20);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(20);
      setIsCompleted(false);
      return;
    }

    soundEngine.playSuccessChime();

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          soundEngine.playSuccessChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = ((20 - secondsRemaining) / 20) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-center">
        {/* Ambient glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-glowCyan mb-3">
          <Eye className="w-6 h-6 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-white">20-20-20 Eye Strain Break</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Look away from your screen at an object at least 20 feet (6 meters) away for 20 seconds.
        </p>

        {/* Circular Countdown Timer */}
        <div className="relative w-32 h-32 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="52"
              className="stroke-cyan-400 transition-all duration-1000"
              strokeWidth="8"
              strokeDasharray={326.7}
              strokeDashoffset={326.7 * (1 - progress / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center">
            {isCompleted ? (
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            ) : (
              <span className="text-3xl font-extrabold font-mono text-white">
                {secondsRemaining}s
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-medium">
              {isCompleted ? "Complete!" : "Remaining"}
            </span>
          </div>
        </div>

        {/* Action button */}
        {isCompleted ? (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-glowEmerald transition-all"
          >
            Done! Resume Coding
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
          >
            Skip Break
          </button>
        )}
      </div>
    </div>
  );
}
