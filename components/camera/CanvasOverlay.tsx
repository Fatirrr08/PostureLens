"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Point3D, PostureStatus } from "@/lib/vision/types";

export interface CanvasOverlayRef {
  getContext: () => CanvasRenderingContext2D | null;
  getCanvas: () => HTMLCanvasElement | null;
  clear: () => void;
  renderGuides: (width: number, height: number, status: PostureStatus) => void;
}

interface CanvasOverlayProps {
  width?: number;
  height?: number;
  className?: string;
  showGuides?: boolean;
  status?: PostureStatus;
  mirrored?: boolean;
}

export const CanvasOverlay = forwardRef<CanvasOverlayRef, CanvasOverlayProps>(
  ({ width = 640, height = 480, className = "", showGuides = true, status = "OPTIMAL", mirrored = true }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useImperativeHandle(ref, () => ({
      getContext: () => canvasRef.current?.getContext("2d") || null,
      getCanvas: () => canvasRef.current,
      clear: () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
      renderGuides: (w: number, h: number, currentStatus: PostureStatus) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw subtle ergonomic framing guides
        const color =
          currentStatus === "OPTIMAL"
            ? "rgba(16, 185, 129, 0.4)" // emerald
            : currentStatus === "WARNING"
            ? "rgba(245, 158, 11, 0.5)" // amber
            : currentStatus === "SLOUCHING"
            ? "rgba(239, 68, 68, 0.6)" // red
            : "rgba(100, 116, 139, 0.3)";

        // Corner brackets
        const bracketLen = 24;
        const pad = 20;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";

        // Top-left
        ctx.beginPath();
        ctx.moveTo(pad, pad + bracketLen);
        ctx.lineTo(pad, pad);
        ctx.lineTo(pad + bracketLen, pad);
        ctx.stroke();

        // Top-right
        ctx.beginPath();
        ctx.moveTo(w - pad - bracketLen, pad);
        ctx.lineTo(w - pad, pad);
        ctx.lineTo(w - pad, pad + bracketLen);
        ctx.stroke();

        // Bottom-left
        ctx.beginPath();
        ctx.moveTo(pad, h - pad - bracketLen);
        ctx.lineTo(pad, h - pad);
        ctx.lineTo(pad + bracketLen, h - pad);
        ctx.stroke();

        // Bottom-right
        ctx.beginPath();
        ctx.moveTo(w - pad - bracketLen, h - pad);
        ctx.lineTo(w - pad, h - pad);
        ctx.lineTo(w - pad, h - pad - bracketLen);
        ctx.stroke();

        // Horizon guide (eye-level reference line)
        ctx.setLineDash([4, 6]);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
        ctx.beginPath();
        ctx.moveTo(pad, h * 0.35);
        ctx.lineTo(w - pad, h * 0.35);
        ctx.stroke();
        ctx.setLineDash([]);
      },
    }));

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 pointer-events-none w-full h-full object-cover ${
          mirrored ? "-scale-x-100" : ""
        } ${className}`}
      />
    );
  }
);

CanvasOverlay.displayName = "CanvasOverlay";
