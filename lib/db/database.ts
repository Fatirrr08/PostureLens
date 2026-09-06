import Dexie, { Table } from "dexie";
import { CalibrationBaseline, PostureSample, SessionRecord } from "@/lib/vision/types";

export interface DBPostureSample {
  id?: number;
  sessionId: string;
  timestamp: number;
  status: string;
  score: number;
  neckAngle: number;
  shoulderSlope: number;
  distanceProxy: number;
}

export interface DBCalibration {
  id: string;
  baseline: CalibrationBaseline;
  updatedAt: number;
}

export class PostureLensDB extends Dexie {
  sessions!: Table<SessionRecord, string>;
  samples!: Table<DBPostureSample, number>;
  calibrations!: Table<DBCalibration, string>;

  constructor() {
    super("PostureLensDB");
    this.version(1).stores({
      sessions: "sessionId, startTime, endTime, score",
      samples: "++id, sessionId, timestamp, status",
      calibrations: "id, updatedAt",
    });
  }
}

export const db = new PostureLensDB();
