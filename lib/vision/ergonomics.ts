import { Point3D, ErgonomicMetrics, CalibrationBaseline, PostureStatus } from "./types";
import { POSE_LANDMARKS } from "./drawing";

// Default ergonomic baseline values (used before explicit user calibration)
export const DEFAULT_BASELINE: CalibrationBaseline = {
  neckAngle: 12.0,       // Optimal neck inclination ~10-15 degrees from vertical
  shoulderWidth: 0.38,   // Average normalized width between shoulders
  noseShoulderY: 0.22,   // Vertical distance between nose and shoulder midpoint
  eyeEarDistance: 0.12,  // Face scale factor
  calibratedAt: 0,
};

// Threshold tolerances
export const ERGONOMIC_THRESHOLDS = {
  SLOUCH_ANGLE_DELTA: 14.0,       // More than +14° neck tilt beyond baseline indicates slouch
  SLOUCH_HEIGHT_DROP_RATIO: 0.18, // 18% vertical head drop indicates forward hunch
  PROXIMITY_MAX_RATIO: 1.35,      // >35% larger shoulder width indicates too close to screen
  PROXIMITY_MIN_RATIO: 0.65,      // <65% shoulder width indicates sitting too far
  SHOULDER_TILT_MAX: 8.0,         // >8° shoulder unevenness indicates asymmetric lean
};

/**
 * Calculates real-time ergonomic vectors and posture metrics from 3D pose landmarks
 */
export function calculateErgonomicMetrics(
  landmarks: Point3D[],
  baseline: CalibrationBaseline = DEFAULT_BASELINE
): ErgonomicMetrics | null {
  if (!landmarks || landmarks.length < 13) return null;

  const nose = landmarks[POSE_LANDMARKS.NOSE];
  const leftEar = landmarks[POSE_LANDMARKS.LEFT_EAR];
  const rightEar = landmarks[POSE_LANDMARKS.RIGHT_EAR];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

  // Check landmark visibility/confidence
  const keyPoints = [nose, leftEar, rightEar, leftShoulder, rightShoulder];
  const avgConfidence =
    keyPoints.reduce((acc, pt) => acc + (pt.visibility ?? 1.0), 0) / keyPoints.length;

  if (avgConfidence < 0.4) {
    return null; // Landmark confidence too low to compute reliable metrics
  }

  // 1. Mid-Shoulder and Mid-Ear positions
  const midShoulder: Point3D = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2,
    z: (leftShoulder.z + rightShoulder.z) / 2,
  };

  const midEar: Point3D = {
    x: (leftEar.x + rightEar.x) / 2,
    y: (leftEar.y + rightEar.y) / 2,
    z: (leftEar.z + rightEar.z) / 2,
  };

  // 2. Shoulder Width (in 2D normalized frame space)
  const dxShoulder = rightShoulder.x - leftShoulder.x;
  const dyShoulder = rightShoulder.y - leftShoulder.y;
  const shoulderWidth = Math.sqrt(dxShoulder * dxShoulder + dyShoulder * dyShoulder);

  // 3. Shoulder Slope / Imbalance (degrees from horizontal)
  const shoulderSlope = Math.abs(Math.atan2(dyShoulder, dxShoulder) * (180 / Math.PI));

  // 4. Neck Inclination Angle (degrees from vertical)
  // Mid-shoulder to Mid-ear vector
  const neckDx = midEar.x - midShoulder.x;
  const neckDy = midShoulder.y - midEar.y; // Positive upwards
  const neckAngleRad = Math.atan2(Math.abs(neckDx), Math.max(0.01, neckDy));
  const neckAngle = neckAngleRad * (180 / Math.PI);

  // 5. Head Forward Tilt & Vertical Drop
  const noseShoulderY = midShoulder.y - nose.y; // Positive when nose is above shoulders
  const earShoulderZ = midShoulder.z - midEar.z; // Relative forward projection in Z
  const headTilt = Math.max(0, neckAngle + earShoulderZ * 20);

  // 6. Eye-Ear Distance (Face depth proxy)
  const eyeDx = rightEar.x - leftEar.x;
  const eyeDy = rightEar.y - leftEar.y;
  const eyeEarDistance = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy);

  // 7. Distance Proxy relative to baseline
  const activeBaseline = baseline.calibratedAt > 0 ? baseline : DEFAULT_BASELINE;
  const distanceRatio = shoulderWidth / Math.max(0.01, activeBaseline.shoulderWidth);

  // 8. Slouch & Proximity Checks
  const neckAngleDelta = neckAngle - activeBaseline.neckAngle;
  const heightDropRatio = (activeBaseline.noseShoulderY - noseShoulderY) / Math.max(0.01, activeBaseline.noseShoulderY);

  const isSlouching =
    neckAngleDelta > ERGONOMIC_THRESHOLDS.SLOUCH_ANGLE_DELTA ||
    heightDropRatio > ERGONOMIC_THRESHOLDS.SLOUCH_HEIGHT_DROP_RATIO;

  const isProximityAlert =
    distanceRatio > ERGONOMIC_THRESHOLDS.PROXIMITY_MAX_RATIO ||
    distanceRatio < ERGONOMIC_THRESHOLDS.PROXIMITY_MIN_RATIO;

  return {
    neckAngle: Math.round(neckAngle * 10) / 10,
    headTilt: Math.round(headTilt * 10) / 10,
    shoulderSlope: Math.round(shoulderSlope * 10) / 10,
    shoulderWidth: Math.round(shoulderWidth * 1000) / 1000,
    eyeEarDistance: Math.round(eyeEarDistance * 1000) / 1000,
    distanceProxy: Math.round(distanceRatio * 100) / 100,
    isSlouching,
    isProximityAlert,
    confidence: Math.round(avgConfidence * 100) / 100,
    timestamp: Date.now(),
  };
}

/**
 * Computes calibrated baseline from a collection of captured good posture samples
 */
export function computeCalibrationBaseline(samples: Point3D[][]): CalibrationBaseline {
  if (!samples || samples.length === 0) {
    return DEFAULT_BASELINE;
  }

  let totalNeckAngle = 0;
  let totalShoulderWidth = 0;
  let totalNoseShoulderY = 0;
  let totalEyeEarDist = 0;
  let validCount = 0;

  for (const lms of samples) {
    if (lms.length < 13) continue;

    const nose = lms[POSE_LANDMARKS.NOSE];
    const leftEar = lms[POSE_LANDMARKS.LEFT_EAR];
    const rightEar = lms[POSE_LANDMARKS.RIGHT_EAR];
    const leftShoulder = lms[POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = lms[POSE_LANDMARKS.RIGHT_SHOULDER];

    const midShoulder = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    const midEar = {
      x: (leftEar.x + rightEar.x) / 2,
      y: (leftEar.y + rightEar.y) / 2,
    };

    const dxShoulder = rightShoulder.x - leftShoulder.x;
    const dyShoulder = rightShoulder.y - leftShoulder.y;
    const sWidth = Math.sqrt(dxShoulder * dxShoulder + dyShoulder * dyShoulder);

    const neckDx = midEar.x - midShoulder.x;
    const neckDy = midShoulder.y - midEar.y;
    const nAngle = Math.atan2(Math.abs(neckDx), Math.max(0.01, neckDy)) * (180 / Math.PI);

    const eyeDx = rightEar.x - leftEar.x;
    const eyeDy = rightEar.y - leftEar.y;
    const eyeDist = Math.sqrt(eyeDx * eyeDx + eyeDy * eyeDy);

    const noseShoulderY = midShoulder.y - nose.y;

    totalNeckAngle += nAngle;
    totalShoulderWidth += sWidth;
    totalNoseShoulderY += noseShoulderY;
    totalEyeEarDist += eyeDist;
    validCount++;
  }

  if (validCount === 0) return DEFAULT_BASELINE;

  return {
    neckAngle: Math.round((totalNeckAngle / validCount) * 10) / 10,
    shoulderWidth: Math.round((totalShoulderWidth / validCount) * 1000) / 1000,
    noseShoulderY: Math.round((totalNoseShoulderY / validCount) * 1000) / 1000,
    eyeEarDistance: Math.round((totalEyeEarDist / validCount) * 1000) / 1000,
    calibratedAt: Date.now(),
  };
}

/**
 * Evaluates real-time posture status and instantaneous score (0-100)
 */
export function evaluatePostureStatus(
  metrics: ErgonomicMetrics | null,
  baseline: CalibrationBaseline = DEFAULT_BASELINE
): { status: PostureStatus; score: number } {
  if (!metrics) {
    return { status: "AWAY", score: 0 };
  }

  let penalty = 0;
  const activeBaseline = baseline.calibratedAt > 0 ? baseline : DEFAULT_BASELINE;

  // Neck angle penalty
  const neckDelta = metrics.neckAngle - activeBaseline.neckAngle;
  if (neckDelta > 0) {
    penalty += Math.min(45, neckDelta * 2.2);
  }

  // Shoulder slope penalty
  if (metrics.shoulderSlope > ERGONOMIC_THRESHOLDS.SHOULDER_TILT_MAX) {
    penalty += Math.min(20, (metrics.shoulderSlope - ERGONOMIC_THRESHOLDS.SHOULDER_TILT_MAX) * 2.5);
  }

  // Proximity penalty
  if (metrics.isProximityAlert) {
    penalty += 25;
  }

  // Slouching penalty
  if (metrics.isSlouching) {
    penalty += 35;
  }

  const score = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  let status: PostureStatus = "OPTIMAL";
  if (metrics.isSlouching || score < 60) {
    status = "SLOUCHING";
  } else if (metrics.isProximityAlert || score < 80) {
    status = "WARNING";
  }

  return { status, score };
}
