import { FilesetResolver, PoseLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { Point3D } from "./types";

const LOCAL_MODEL_PATH = "/models/pose_landmarker_lite.task";
const CDN_MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task";
const WASM_CDN_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

export class VisionDetector {
  private landmarker: PoseLandmarker | null = null;
  private isInitializing: boolean = false;
  private lastVideoTime: number = -1;

  public async initialize(): Promise<boolean> {
    if (this.landmarker) return true;
    if (this.isInitializing) return false;
    if (typeof window === "undefined") return false;

    this.isInitializing = true;

    try {
      // 1. Resolve vision tasks WASM files
      const vision = await FilesetResolver.forVisionTasks(WASM_CDN_PATH);

      // 2. Try initializing with GPU delegate first
      try {
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: LOCAL_MODEL_PATH,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuError) {
        console.warn("GPU delegate failed, falling back to CPU or CDN:", gpuError);

        // Fallback: Try CPU delegate with local model or CDN
        try {
          this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: LOCAL_MODEL_PATH,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch (cpuError) {
          console.warn("Local model failed, attempting CDN fallback:", cpuError);
          this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: CDN_MODEL_PATH,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
            minPoseDetectionConfidence: 0.5,
            minPosePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }
      }

      this.isInitializing = false;
      return true;
    } catch (err) {
      console.error("Failed to initialize MediaPipe PoseLandmarker:", err);
      this.isInitializing = false;
      return false;
    }
  }

  public isReady(): boolean {
    return this.landmarker !== null;
  }

  /**
   * Run detection on video frame
   */
  public detect(video: HTMLVideoElement, timestampMs: number): Point3D[] | null {
    if (!this.landmarker) return null;
    if (video.readyState < 2) return null; // HAVE_CURRENT_DATA

    // MediaPipe requires strictly increasing timestamps
    if (timestampMs <= this.lastVideoTime) {
      timestampMs = this.lastVideoTime + 1;
    }
    this.lastVideoTime = timestampMs;

    try {
      const result = this.landmarker.detectForVideo(video, timestampMs);

      if (result && result.landmarks && result.landmarks.length > 0) {
        const rawLandmarks: NormalizedLandmark[] = result.landmarks[0];
        return rawLandmarks.map((lm) => ({
          x: lm.x,
          y: lm.y,
          z: lm.z,
          visibility: lm.visibility ?? 1.0,
        }));
      }

      return null;
    } catch (err) {
      console.warn("Pose detection frame error:", err);
      return null;
    }
  }

  public close(): void {
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {
        // Ignore close error
      }
      this.landmarker = null;
    }
    this.lastVideoTime = -1;
  }
}

export const visionDetector = new VisionDetector();
