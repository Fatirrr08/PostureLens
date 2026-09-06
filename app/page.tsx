"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import WebcamFeed from "@/components/camera/WebcamFeed";
import { CanvasOverlay, CanvasOverlayRef } from "@/components/camera/CanvasOverlay";
import PostureStatusBadge from "@/components/posture/PostureStatusBadge";
import PostureAlert from "@/components/posture/PostureAlert";
import PostureGauge from "@/components/posture/PostureGauge";
import CalibrationModal from "@/components/posture/CalibrationModal";
import SessionControls from "@/components/session/SessionControls";
import SessionStats from "@/components/session/SessionStats";
import { visionDetector } from "@/lib/vision/detector";
import { drawPoseSkeleton } from "@/lib/vision/drawing";
import {
  calculateErgonomicMetrics,
  evaluatePostureStatus,
  DEFAULT_BASELINE,
} from "@/lib/vision/ergonomics";
import {
  CalibrationBaseline,
  ErgonomicMetrics,
  Point3D,
  PostureStatus,
  SessionRecord,
} from "@/lib/vision/types";
import { soundEngine } from "@/lib/audio/sound";
import { saveSession, logPostureSample, loadCalibration } from "@/lib/db/queries";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  Activity,
  Sliders,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  // Vision & Camera state
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [detectorReady, setDetectorReady] = useState<boolean>(false);
  const [currentLandmarks, setCurrentLandmarks] = useState<Point3D[] | null>(null);
  const [userPresent, setUserPresent] = useState<boolean>(false);
  const [baseline, setBaseline] = useState<CalibrationBaseline>(DEFAULT_BASELINE);

  // Ergonomic telemetry
  const [metrics, setMetrics] = useState<ErgonomicMetrics | null>(null);
  const [status, setStatus] = useState<PostureStatus>("AWAY");
  const [score, setScore] = useState<number>(100);

  // Overlay settings
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);

  // Focus Session state
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [sessionPaused, setSessionPaused] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [slouchCount, setSlouchCount] = useState<number>(0);
  const [proximityCount, setProximityCount] = useState<number>(0);
  const [goodPostureSeconds, setGoodPostureSeconds] = useState<number>(0);
  const [badPostureSeconds, setBadPostureSeconds] = useState<number>(0);

  // Refs for loops and mutable data
  const overlayRef = useRef<CanvasOverlayRef | null>(null);
  const animFrameId = useRef<number | null>(null);
  const lastSampleLogTime = useRef<number>(0);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initialize vision detector and load stored baseline
  useEffect(() => {
    let mounted = true;

    async function init() {
      // Load saved calibration from IndexedDB
      const savedBaseline = await loadCalibration();
      if (savedBaseline && mounted) {
        setBaseline(savedBaseline);
      }

      // Initialize MediaPipe PoseLandmarker
      const ready = await visionDetector.initialize();
      if (mounted) {
        setDetectorReady(ready);
      }
    }

    init();

    return () => {
      mounted = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      visionDetector.close();
    };
  }, []);

  // 2. High-performance Vision Detection & Render Loop
  const runDetectionLoop = useCallback(() => {
    if (!videoElement || videoElement.readyState < 2) {
      animFrameId.current = requestAnimationFrame(runDetectionLoop);
      return;
    }

    const now = performance.now();
    const lms = visionDetector.detect(videoElement, now);

    const canvasOverlay = overlayRef.current;
    if (canvasOverlay) {
      canvasOverlay.clear();
      const ctx = canvasOverlay.getContext();
      const canvas = canvasOverlay.getCanvas();

      if (ctx && canvas) {
        const w = canvas.width;
        const h = canvas.height;

        if (showGuides) {
          canvasOverlay.renderGuides(w, h, status);
        }

        if (lms && lms.length >= 13) {
          setUserPresent(true);
          setCurrentLandmarks(lms);

          const ergMetrics = calculateErgonomicMetrics(lms, baseline);
          setMetrics(ergMetrics);

          const evalResult = evaluatePostureStatus(ergMetrics, baseline);
          setStatus(evalResult.status);
          setScore(evalResult.score);

          if (showSkeleton) {
            drawPoseSkeleton(ctx, lms, w, h, {
              status: evalResult.status,
              showSkeleton: true,
              showAngleArc: true,
              neckAngle: ergMetrics?.neckAngle ?? 0,
            });
          }
        } else {
          setUserPresent(false);
          setCurrentLandmarks(null);
          setMetrics(null);
          setStatus("AWAY");
        }
      }
    }

    animFrameId.current = requestAnimationFrame(runDetectionLoop);
  }, [videoElement, baseline, showSkeleton, showGuides, status]);

  // Dynamic document title for background tabs
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!sessionActive) {
      document.title = "PostureLens — AI Ergonomics Monitor";
      return;
    }

    if (sessionPaused) {
      document.title = "⏸️ [Paused] PostureLens";
      return;
    }

    if (status === "SLOUCHING") {
      document.title = "🔴 Slouching Detected! — PostureLens";
    } else if (status === "WARNING") {
      document.title = "🟡 Posture Warning — PostureLens";
    } else if (status === "OPTIMAL") {
      document.title = `🟢 [${score}%] PostureLens`;
    } else {
      document.title = "⚪ Waiting... — PostureLens";
    }
  }, [status, score, sessionActive, sessionPaused]);

  useEffect(() => {
    if (detectorReady && videoElement) {
      animFrameId.current = requestAnimationFrame(runDetectionLoop);
    }
    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [detectorReady, videoElement, runDetectionLoop]);

  // 3. Focus Session Timer & Periodic Logging
  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      sessionTimerRef.current = setInterval(() => {
        setDurationSeconds((s) => s + 1);

        // Track posture quality intervals
        if (status === "OPTIMAL") {
          setGoodPostureSeconds((s) => s + 1);
        } else if (status === "SLOUCHING" || status === "WARNING") {
          setBadPostureSeconds((s) => s + 1);
        }

        // Periodic sample logging to IndexedDB every 5 seconds
        const now = Date.now();
        if (now - lastSampleLogTime.current >= 5000 && currentSessionId && metrics) {
          lastSampleLogTime.current = now;
          logPostureSample({
            sessionId: currentSessionId,
            timestamp: now,
            status,
            score,
            metrics: {
              neckAngle: metrics.neckAngle,
              shoulderSlope: metrics.shoulderSlope,
              distanceProxy: metrics.distanceProxy,
            },
          }).catch(() => {});
        }
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    }

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [sessionActive, sessionPaused, currentSessionId, status, score, metrics]);

  // Session Action Handlers
  const handleStartSession = () => {
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setSessionActive(true);
    setSessionPaused(false);
    setDurationSeconds(0);
    setSlouchCount(0);
    setProximityCount(0);
    setGoodPostureSeconds(0);
    setBadPostureSeconds(0);
    soundEngine.playSuccessChime();
  };

  const handlePauseSession = () => {
    setSessionPaused(true);
  };

  const handleResumeSession = () => {
    setSessionPaused(false);
  };

  const handleEndSession = async () => {
    if (!sessionActive) return;

    setSessionActive(false);
    setSessionPaused(false);

    const finalRecord: SessionRecord = {
      sessionId: currentSessionId,
      startTime: Date.now() - durationSeconds * 1000,
      endTime: Date.now(),
      durationSeconds,
      score: Math.max(0, Math.min(100, score)),
      slouchCount,
      proximityCount,
      goodPostureSeconds,
      badPostureSeconds,
    };

    await saveSession(finalRecord);

    // Confetti celebration for high ergonomic score
    if (finalRecord.score >= 80) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#06b6d4", "#8b5cf6"],
      });
    }

    soundEngine.playSuccessChime();
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleCalibrationComplete = (newBaseline: CalibrationBaseline) => {
    setBaseline(newBaseline);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>PostureLens Workspace</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Live Monitor
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time on-device computer vision posture tracking & ergonomic health coach.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <PostureStatusBadge status={status} userPresent={userPresent} score={score} />
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Camera & Vision Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl bg-slate-950 border border-slate-800/80 shadow-2xl overflow-hidden group">
            <WebcamFeed
              onVideoReady={(video) => setVideoElement(video)}
              className="w-full h-full"
            >
              <CanvasOverlay
                ref={overlayRef}
                showGuides={showGuides}
                status={status}
              />
            </WebcamFeed>

            {/* Model Loading State overlay */}
            {!detectorReady && (
              <div className="absolute top-4 left-4 z-30 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs text-cyan-400 flex items-center gap-2 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Loading MediaPipe Pose WASM...</span>
              </div>
            )}

            {/* Live FPS / Engine Watermark */}
            <div className="absolute bottom-3 left-3 z-30 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center gap-2 backdrop-blur-sm">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>WASM • 30 FPS • Local</span>
            </div>

            {/* Baseline Calibrated Badge */}
            {baseline.calibratedAt > 0 && (
              <div className="absolute bottom-3 right-3 z-30 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>Calibrated</span>
              </div>
            )}
          </div>

          {/* Ergonomic Quick Tips Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Keep your monitor at eye level. Sit approximately 20–28 inches away. Click{" "}
              <strong className="text-emerald-400">Calibrate Baseline</strong> while sitting upright to establish your ideal posture parameters.
            </p>
          </div>
        </div>

        {/* Right Column: Controls, Gauge & Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Circular Score Gauge */}
          <PostureGauge score={score} status={status} metrics={metrics} />

          {/* Session Controller */}
          <SessionControls
            sessionActive={sessionActive}
            sessionPaused={sessionPaused}
            durationSeconds={durationSeconds}
            onStartSession={handleStartSession}
            onPauseSession={handlePauseSession}
            onResumeSession={handleResumeSession}
            onEndSession={handleEndSession}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            showSkeleton={showSkeleton}
            onToggleSkeleton={() => setShowSkeleton(!showSkeleton)}
            showGuides={showGuides}
            onToggleGuides={() => setShowGuides(!showGuides)}
          />

          {/* Real-time Session Stats */}
          <SessionStats
            score={score}
            status={status}
            userPresent={userPresent}
            metrics={metrics}
            slouchCount={slouchCount}
            proximityCount={proximityCount}
            goodPostureSeconds={goodPostureSeconds}
            badPostureSeconds={badPostureSeconds}
          />
        </div>
      </div>

      {/* Floating Sustained Slouch / Proximity Alert */}
      <PostureAlert
        status={status}
        metrics={metrics}
        onSlouchIncident={() => setSlouchCount((c) => c + 1)}
        onProximityIncident={() => setProximityCount((c) => c + 1)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Baseline Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        currentLandmarks={currentLandmarks}
        onCalibrationComplete={handleCalibrationComplete}
      />
    </div>
  );
}
