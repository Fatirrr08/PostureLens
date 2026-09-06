// Web Audio API Gentle Synthesized Chime Engine
// 100% client-side, zero external assets required

class SoundEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private lastAlertTime: number = 0;
  private minIntervalMs: number = 8000; // minimum 8s between audible alerts to avoid fatigue

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Gentle, harmonic two-tone chime for posture nudge.
   * Uses sine waves with exponential decay for a soothing, zen bell effect.
   */
  public playGentleNudge(force: boolean = false): void {
    if (this.isMuted) return;

    const now = Date.now();
    if (!force && now - this.lastAlertTime < this.minIntervalMs) {
      return;
    }
    this.lastAlertTime = now;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime;
      const duration = 1.2;

      // Master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, startTime);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      masterGain.connect(ctx.destination);

      // Tone 1: E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(659.25, startTime);
      osc1.connect(masterGain);

      // Tone 2: B5 (987.77 Hz) - harmonic fifth above
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(987.77, startTime + 0.08); // slight arpeggio delay
      
      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.12, startTime + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(startTime);
      osc1.stop(startTime + duration);

      osc2.start(startTime + 0.08);
      osc2.stop(startTime + duration);
    } catch {
      // Audio playback might be blocked if user has not interacted with page yet
    }
  }

  /**
   * Positive celebration chime when starting or finishing calibration or session.
   */
  public playSuccessChime(): void {
    if (this.isMuted) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const startTime = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.1);

        gain.gain.setValueAtTime(0.15, startTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + idx * 0.1 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * 0.1);
        osc.stop(startTime + idx * 0.1 + 0.6);
      });
    } catch {
      // Ignore audio failure
    }
  }
}

export const soundEngine = new SoundEngine();
