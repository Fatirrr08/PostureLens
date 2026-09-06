import { db, DBPostureSample, DBCalibration } from "./database";
import { CalibrationBaseline, PostureSample, SessionRecord } from "@/lib/vision/types";

// Save a completed or updated session
export async function saveSession(session: SessionRecord): Promise<string> {
  await db.sessions.put(session);
  return session.sessionId;
}

// Delete a session and its samples
export async function deleteSession(sessionId: string): Promise<void> {
  await db.sessions.where("sessionId").equals(sessionId).delete();
  await db.samples.where("sessionId").equals(sessionId).delete();
}

// Get recent sessions ordered by start time desc
export async function getRecentSessions(limit: number = 30): Promise<SessionRecord[]> {
  return await db.sessions
    .orderBy("startTime")
    .reverse()
    .limit(limit)
    .toArray();
}

// Log a periodic sample for timeline visualization
export async function logPostureSample(sample: PostureSample): Promise<number> {
  const dbSample: DBPostureSample = {
    sessionId: sample.sessionId,
    timestamp: sample.timestamp,
    status: sample.status,
    score: sample.score,
    neckAngle: sample.metrics.neckAngle,
    shoulderSlope: sample.metrics.shoulderSlope,
    distanceProxy: sample.metrics.distanceProxy,
  };
  return await db.samples.add(dbSample);
}

// Get samples for a specific session
export async function getSessionSamples(sessionId: string): Promise<DBPostureSample[]> {
  return await db.samples
    .where("sessionId")
    .equals(sessionId)
    .sortBy("timestamp");
}

// Save calibration baseline
export async function saveCalibration(baseline: CalibrationBaseline): Promise<void> {
  await db.calibrations.put({
    id: "default_user",
    baseline,
    updatedAt: Date.now(),
  });
}

// Load calibration baseline
export async function loadCalibration(): Promise<CalibrationBaseline | null> {
  const record = await db.calibrations.get("default_user");
  return record ? record.baseline : null;
}

export interface DailyErgonomicStats {
  date: string;
  totalSessions: number;
  totalDurationSeconds: number;
  averageScore: number;
  totalSlouchCount: number;
  totalProximityCount: number;
  goodPostureSeconds: number;
  badPostureSeconds: number;
}

// Aggregate stats for today
export async function getTodayStats(): Promise<DailyErgonomicStats> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  const todaySessions = await db.sessions
    .where("startTime")
    .between(startOfDay, endOfDay, true, true)
    .toArray();

  if (todaySessions.length === 0) {
    return {
      date: now.toISOString().split("T")[0],
      totalSessions: 0,
      totalDurationSeconds: 0,
      averageScore: 100,
      totalSlouchCount: 0,
      totalProximityCount: 0,
      goodPostureSeconds: 0,
      badPostureSeconds: 0,
    };
  }

  let totalDuration = 0;
  let scoreSum = 0;
  let totalSlouch = 0;
  let totalProximity = 0;
  let goodSecs = 0;
  let badSecs = 0;

  for (const s of todaySessions) {
    totalDuration += s.durationSeconds;
    scoreSum += s.score * (s.durationSeconds || 1);
    totalSlouch += s.slouchCount;
    totalProximity += s.proximityCount;
    goodSecs += s.goodPostureSeconds;
    badSecs += s.badPostureSeconds;
  }

  const weightedAvgScore = totalDuration > 0 ? Math.round(scoreSum / totalDuration) : 100;

  return {
    date: now.toISOString().split("T")[0],
    totalSessions: todaySessions.length,
    totalDurationSeconds: totalDuration,
    averageScore: Math.min(100, Math.max(0, weightedAvgScore)),
    totalSlouchCount: totalSlouch,
    totalProximityCount: totalProximity,
    goodPostureSeconds: goodSecs,
    badPostureSeconds: badSecs,
  };
}

// Export all records as a JSON backup
export async function exportAllDataAsJSON(): Promise<string> {
  const sessions = await db.sessions.toArray();
  const samples = await db.samples.toArray();
  const calibrations = await db.calibrations.toArray();

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      sessions,
      samples,
      calibrations,
    },
    null,
    2
  );
}

// Clear all database history
export async function clearAllHistory(): Promise<void> {
  await db.sessions.clear();
  await db.samples.clear();
}
