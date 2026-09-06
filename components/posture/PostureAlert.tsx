"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Eye, Check, Volume2, VolumeX, Sparkles } from "lucide-react";
import { ErgonomicMetrics, PostureStatus } from "@/lib/vision/types";
import { soundEngine } from "@/lib/audio/sound";

interface PostureAlertProps {
  status: PostureStatus;
  metrics: ErgonomicMetrics | null;
  onSlouchIncident?: () => void;
  onProximityIncident?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export default function PostureAlert({
  status,
  metrics,
  onSlouchIncident,
  onProximityIncident,
  isMuted = false,
  onToggleMute,
}: PostureAlertProps) {
  const [slouchDuration, setSlouchDuration] = useState<number>(0);
  const [proximityDuration, setProximityDuration] = useState<number>(0);
  const [showSlouchAlert, setShowSlouchAlert] = useState<boolean>(false);
  const [showProximityAlert, setShowProximityAlert] = useState<boolean>(false);
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  const slouchStartRef = useRef<number | null>(null);
  const proximityStartRef = useRef<number | null>(null);
  const lastStateRef = useRef<PostureStatus>("OPTIMAL");

  useEffect(() => {
    const now = Date.now();

    // 1. Check Slouching (>5s trigger)
    if (status === "SLOUCHING") {
      if (!slouchStartRef.current) {
        slouchStartRef.current = now;
      }
      const durationSec = Math.floor((now - slouchStartRef.current) / 1000);
      setSlouchDuration(durationSec);

      if (durationSec >= 5) {
        if (!showSlouchAlert) {
          setShowSlouchAlert(true);
          soundEngine.playGentleNudge();
          if (onSlouchIncident) onSlouchIncident();
        }
      }
    } else {
      if (slouchStartRef.current && showSlouchAlert) {
        // Just returned from sustained slouch to good posture!
        setShowRestoredNotice(true);
        setTimeout(() => setShowRestoredNotice(false), 3000);
      }
      slouchStartRef.current = null;
      setSlouchDuration(0);
      setShowSlouchAlert(false);
    }

    // 2. Check Screen Proximity (>5s trigger)
    if (metrics?.isProximityAlert) {
      if (!proximityStartRef.current) {
        proximityStartRef.current = now;
      }
      const proxSec = Math.floor((now - proximityStartRef.current) / 1000);
      setProximityDuration(proxSec);

      if (proxSec >= 5) {
        if (!showProximityAlert) {
          setShowProximityAlert(true);
          soundEngine.playGentleNudge();
          if (onProximityIncident) onProximityIncident();
        }
      }
    } else {
      proximityStartRef.current = null;
      setProximityDuration(0);
      setShowProximityAlert(false);
    }

    lastStateRef.current = status;
  }, [status, metrics, showSlouchAlert, showProximityAlert, onSlouchIncident, onProximityIncident]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {/* Slouch Alert Toast */}
        {showSlouchAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto p-4 rounded-2xl bg-gradient-to-r from-rose-950/95 to-slate-900/95 border border-rose-500/50 shadow-glowDanger backdrop-blur-md text-white"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 animate-bounce">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-rose-300">
                    Sustained Slouch Detected
                  </h4>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {slouchDuration}s
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Your head has dropped forward. Gently draw your shoulders back and align your ears over your collarbone.
                </p>
                {onToggleMute && (
                  <button
                    onClick={onToggleMute}
                    className="mt-2 text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? "Unmute chimes" : "Mute audio chimes"}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Proximity Alert Toast */}
        {showProximityAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="pointer-events-auto p-4 rounded-2xl bg-gradient-to-r from-amber-950/95 to-slate-900/95 border border-amber-500/50 shadow-glowAmber backdrop-blur-md text-white"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <Eye className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-amber-300">
                    Screen Proximity Warning
                  </h4>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {proximityDuration}s
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  You are sitting too close to the screen, which strains your eyes and neck. Push back about an arm’s length.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Posture Restored Notice */}
        {showRestoredNotice && !showSlouchAlert && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="pointer-events-auto p-3.5 rounded-2xl bg-emerald-950/95 border border-emerald-500/40 shadow-glowEmerald backdrop-blur-md text-white flex items-center gap-3"
          >
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-300">Posture Restored!</p>
              <p className="text-[11px] text-slate-300">Great job resetting your spine alignment.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
