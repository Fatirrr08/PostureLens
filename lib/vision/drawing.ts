import { Point3D, PostureStatus } from "./types";

// Landmark indices in MediaPipe Pose
export const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
};

export interface DrawOptions {
  status: PostureStatus;
  showSkeleton?: boolean;
  showAngleArc?: boolean;
  neckAngle?: number;
}

export function drawPoseSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: Point3D[],
  width: number,
  height: number,
  options: DrawOptions
): void {
  const { status, showSkeleton = true, showAngleArc = true, neckAngle = 0 } = options;

  if (!landmarks || landmarks.length < 13 || !showSkeleton) return;

  // Colors based on posture state
  let primaryColor = "#10b981"; // emerald
  let glowColor = "rgba(16, 185, 129, 0.4)";
  let secondaryColor = "rgba(16, 185, 129, 0.2)";

  if (status === "WARNING") {
    primaryColor = "#f59e0b"; // amber
    glowColor = "rgba(245, 158, 11, 0.4)";
    secondaryColor = "rgba(245, 158, 11, 0.2)";
  } else if (status === "SLOUCHING") {
    primaryColor = "#ef4444"; // red
    glowColor = "rgba(239, 68, 68, 0.5)";
    secondaryColor = "rgba(239, 68, 68, 0.2)";
  }

  const toPx = (point: Point3D) => ({
    x: point.x * width,
    y: point.y * height,
  });

  const nose = toPx(landmarks[POSE_LANDMARKS.NOSE]);
  const leftEar = toPx(landmarks[POSE_LANDMARKS.LEFT_EAR]);
  const rightEar = toPx(landmarks[POSE_LANDMARKS.RIGHT_EAR]);
  const leftShoulder = toPx(landmarks[POSE_LANDMARKS.LEFT_SHOULDER]);
  const rightShoulder = toPx(landmarks[POSE_LANDMARKS.RIGHT_SHOULDER]);

  // Calculate midpoints
  const midShoulder = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
  };

  const midEar = {
    x: (leftEar.x + rightEar.x) / 2,
    y: (leftEar.y + rightEar.y) / 2,
  };

  ctx.save();

  // 1. Draw glowing connecting lines
  const drawLine = (p1: { x: number; y: number }, p2: { x: number; y: number }, lineWidth: number = 3, dashed: boolean = false) => {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 10;
    if (dashed) {
      ctx.setLineDash([4, 4]);
    } else {
      ctx.setLineDash([]);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // Shoulder clavicle axis
  drawLine(leftShoulder, rightShoulder, 4);

  // Ergonomic spine/neck vector
  drawLine(midShoulder, midEar, 3);

  // Subtle ear-to-shoulder posture support lines
  ctx.strokeStyle = secondaryColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftEar.x, leftEar.y);
  ctx.lineTo(leftShoulder.x, leftShoulder.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rightEar.x, rightEar.y);
  ctx.lineTo(rightShoulder.x, rightShoulder.y);
  ctx.stroke();

  // 2. Draw Key Points (cyber glowing joints)
  const drawJoint = (p: { x: number; y: number }, radius: number = 6, label?: string) => {
    // Outer ring
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius + 3, 0, Math.PI * 2);
    ctx.fillStyle = secondaryColor;
    ctx.fill();

    // Core point
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = primaryColor;
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center white dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    if (label) {
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "10px monospace";
      ctx.fillText(label, p.x + 10, p.y + 3);
    }
  };

  drawJoint(leftShoulder, 6);
  drawJoint(rightShoulder, 6);
  drawJoint(midShoulder, 5);
  drawJoint(midEar, 5);
  drawJoint(nose, 4);

  // 3. Draw Angle Display & Vertical Reference Line
  if (showAngleArc) {
    // Vertical plumb line from mid-shoulder upwards
    const verticalPoint = { x: midShoulder.x, y: midShoulder.y - 70 };
    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1.5;
    ctx.moveTo(midShoulder.x, midShoulder.y);
    ctx.lineTo(verticalPoint.x, verticalPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Badge showing neck angle
    const angleText = `${Math.round(neckAngle)}°`;
    ctx.font = "bold 12px monospace";
    const textWidth = ctx.measureText(angleText).width;

    const badgeX = midShoulder.x + 16;
    const badgeY = midShoulder.y - 40;

    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX - 4, badgeY - 14, textWidth + 8, 20, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = primaryColor;
    ctx.fillText(angleText, badgeX, badgeY);
  }

  ctx.restore();
}
