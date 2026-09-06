"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, RefreshCw, FlipHorizontal, AlertCircle, ShieldAlert } from "lucide-react";

interface WebcamFeedProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
  onStreamStop?: () => void;
  isStreaming?: boolean;
  mirrored?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "unsupported" | "error";

export default function WebcamFeed({
  onVideoReady,
  onStreamStop,
  isStreaming = true,
  mirrored = true,
  className = "",
  children,
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  // Enumerate video devices
  const updateDeviceList = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevs);
      if (videoDevs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch {
      // Ignore device enumeration error
    }
  }, [selectedDeviceId]);

  // Stop active camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (onStreamStop) {
      onStreamStop();
    }
  }, [onStreamStop]);

  // Start camera stream
  const startStream = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      setErrorMessage("Camera access is not supported by your browser environment.");
      return;
    }

    stopStream();
    setStatus("requesting");
    setErrorMessage("");

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 30 },
          facingMode: selectedDeviceId ? undefined : "user",
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
            setStatus("ready");
            if (onVideoReady) {
              onVideoReady(videoRef.current);
            }
          }
        };
      }

      await updateDeviceList();
    } catch (err: unknown) {
      stopStream();
      const error = err as Error;
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setStatus("denied");
        setErrorMessage("Camera permission was denied. Please allow camera access in your browser settings to run posture monitoring.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setStatus("error");
        setErrorMessage("No webcam detected. Please plug in or enable a camera.");
      } else {
        setStatus("error");
        setErrorMessage(error.message || "Unable to access video stream.");
      }
    }
  }, [selectedDeviceId, stopStream, onVideoReady, updateDeviceList]);

  useEffect(() => {
    if (isStreaming) {
      startStream();
    } else {
      stopStream();
      setStatus("idle");
    }

    return () => {
      stopStream();
    };
  }, [isStreaming, selectedDeviceId]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className={`w-full h-full object-cover rounded-2xl ${
          mirrored ? "-scale-x-100" : ""
        } ${status !== "ready" ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      />

      {/* Children layers (e.g. CanvasOverlay) */}
      {status === "ready" && children}

      {/* Camera Status Overlay */}
      {status !== "ready" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-sm z-20">
          {status === "requesting" && (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm font-medium text-slate-300">Requesting camera access...</p>
              <p className="text-xs text-slate-500">Video stays 100% on your device</p>
            </div>
          )}

          {status === "idle" && (
            <div className="flex flex-col items-center gap-3">
              <CameraOff className="w-10 h-10 text-slate-500" />
              <p className="text-sm font-medium text-slate-300">Camera is paused</p>
              <button
                onClick={startStream}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-glowEmerald transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Turn On Camera</span>
              </button>
            </div>
          )}

          {status === "denied" && (
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <ShieldAlert className="w-10 h-10 text-rose-500" />
              <p className="text-sm font-semibold text-white">Camera Access Denied</p>
              <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
              <button
                onClick={startStream}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <AlertCircle className="w-10 h-10 text-amber-500" />
              <p className="text-sm font-semibold text-white">Camera Error</p>
              <p className="text-xs text-slate-400 leading-relaxed">{errorMessage}</p>
              <button
                onClick={startStream}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {status === "unsupported" && (
            <div className="flex flex-col items-center gap-3 max-w-xs">
              <AlertCircle className="w-10 h-10 text-rose-500" />
              <p className="text-sm font-semibold text-white">Browser Not Supported</p>
              <p className="text-xs text-slate-400">{errorMessage}</p>
            </div>
          )}
        </div>
      )}

      {/* Cyberpunk ambient scanline effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent opacity-50" />
    </div>
  );
}
