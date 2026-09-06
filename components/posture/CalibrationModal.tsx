"use client";

import React, { useState, useEffect, useRef } from "react";
import { CheckCircle2, Sliders, X, Sparkles, HelpCircle } from "lucide-react";
import { CalibrationBaseline, Point3D } from "@/lib/vision/types";
import { computeCalibrationBaseline } from "@/lib/vision/ergonomics";
import { soundEngine } from "@/lib/audio/sound";
import { saveCalibration } from "@/lib/db/queries";

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLandmarks: Point3D[] | null;
  onCalibrationComplete: (baseline: CalibrationBaseline) => void;
}

export default function CalibrationModal({
  isOpen,
  onClose,
  currentLandmarks,
  onCalibrationComplete,
}: CalibrationModalProps) {
  const [step, setStep] = useState<"idle" | "countdown" | "sampling" | "done">("idle");
  const [countdown, setCountdown] = useState<number>(3);
  const [progress, setProgress] = useState<number>(0);
  const samplesRef = useRef<Point3D[][]>([]);

  useEffect(() => {
    if (!isOpen) {
      setStep("idle");
      setCountdown(3);
      setProgress(0);
      samplesRef.current = [];
    }
  }, [isOpen]);

  // Handle countdown before sampling
  useEffect(() => {
    if (step !== "countdown") return;

    if (countdown > 1) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Transition to sampling
      setStep("sampling");
      samplesRef.current = [];
      setProgress(0);
    }
  }, [step, countdown]);

  // Sample landmarks for 3 seconds
  useEffect(() => {
    if (step !== "sampling") return;

    const sampleInterval = setInterval(() => {
      if (currentLandmarks && currentLandmarks.length >= 13) {
        samplesRef.current.push([...currentLandmarks]);
      }
      setProgress((p) => {
        const next = p + 5; // 20 steps * 150ms = 3000ms
        if (next >= 100) {
          clearInterval(sampleInterval);
          finishCalibration();
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(sampleInterval);
  }, [step, currentLandmarks]);

  const startCalibrationFlow = () => {
    setCountdown(3);
    setStep("countdown");
  };

  const finishCalibration = async () => {
    setStep("done");
    const baseline = computeCalibrationBaseline(samplesRef.current);
    await saveCalibration(baseline);
    soundEngine.playSuccessChime();
    onCalibrationComplete(baseline);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Ambient glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Ergonomic Baseline Calibration</h2>
            <p className="text-xs text-slate-400">Lock in your optimal upright posture</p>
          </div>
        </div>

        {/* Modal Content */}
        {step === "idle" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-2.5 text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <p>Sit back comfortably in your chair with back supported and shoulders relaxed.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <p>Align your gaze with the top third of your display screen.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <p>Click below and hold steady for 3 seconds while the AI computes your baseline.</p>
              </div>
            </div>

            <button
              onClick={startCalibrationFlow}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-glowEmerald transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Begin 3-Second Calibration</span>
            </button>
          </div>
        )}

        {step === "countdown" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div className="w-20 h-20 rounded-full border-4 border-emerald-500/40 flex items-center justify-center bg-slate-950">
              <span className="text-4xl font-extrabold text-emerald-400 animate-pulse font-mono">
                {countdown}
              </span>
            </div>
            <p className="text-sm font-medium text-white">Get ready: Assume your best posture!</p>
            <p className="text-xs text-slate-400">Sampling starts in a moment...</p>
          </div>
        )}

        {step === "sampling" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-5 text-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-emerald-400 transition-all duration-150"
                  strokeWidth="6"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - progress / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-xl font-bold font-mono text-white">{progress}%</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-400">Analyzing posture vectors...</p>
              <p className="text-xs text-slate-400 mt-1">Hold steady. Recording neck angle & screen distance.</p>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-glowEmerald">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <p className="text-base font-bold text-white">Baseline Calibrated Successfully!</p>
            <p className="text-xs text-slate-400">Your custom ergonomic baseline is now active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
