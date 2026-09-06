export type PostureStatus = 'OPTIMAL' | 'WARNING' | 'SLOUCHING' | 'AWAY';
export type SensitivityLevel = 'strict' | 'balanced' | 'relaxed';

export interface Point3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface ErgonomicMetrics {
  neckAngle: number;           // Angle between vertical and mid-shoulder to ear/nose vector (degrees)
  headTilt: number;            // Head forward tilt/pitch (degrees)
  shoulderSlope: number;       // Shoulder tilt/imbalance (degrees)
  shoulderWidth: number;       // Distance between shoulders in 2D frame (proxy for screen distance)
  eyeEarDistance: number;      // Facial landmark size proxy
  distanceProxy: number;       // Relative distance factor compared to calibration
  isSlouching: boolean;        // Whether current frame exceeds slouching threshold
  isProximityAlert: boolean;   // Whether user is too close or too far
  confidence: number;          // Average visibility of key landmarks
  timestamp: number;
}

export interface CalibrationBaseline {
  neckAngle: number;
  shoulderWidth: number;
  noseShoulderY: number;
  eyeEarDistance: number;
  calibratedAt: number;
}

export interface PostureSample {
  id?: number;
  sessionId: string;
  timestamp: number;
  status: PostureStatus;
  score: number;
  metrics: {
    neckAngle: number;
    shoulderSlope: number;
    distanceProxy: number;
  };
}

export interface SessionRecord {
  id?: string;
  sessionId: string;
  startTime: number;
  endTime?: number;
  durationSeconds: number;
  score: number; // 0 - 100
  slouchCount: number;
  proximityCount: number;
  goodPostureSeconds: number;
  badPostureSeconds: number;
  notes?: string;
}

export interface VisionDetectionResult {
  landmarks: Point3D[] | null;
  metrics: ErgonomicMetrics | null;
  status: PostureStatus;
  userPresent: boolean;
}
