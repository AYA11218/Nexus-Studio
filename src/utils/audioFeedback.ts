/**
 * Web Audio API Sound Synthesizer for Smart Onboarding & SpotlightOverlay
 * Provides subtle, delightful, zero-asset audio feedback on tour interactions.
 */

const AUDIO_ENABLED_KEY = 'smart_onboarding_audio_enabled';

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private listeners: Set<(enabled: boolean) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(AUDIO_ENABLED_KEY);
      this.enabled = saved !== null ? saved === 'true' : true;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUDIO_ENABLED_KEY, val ? 'true' : 'false');
    }
    this.listeners.forEach((listener) => listener(val));
    if (val) {
      // Play a quick subtle confirmation blip
      this.playStepNext(0.04);
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  public subscribe(listener: (enabled: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return null;
        this.ctx = new AudioContextClass();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.12, this.ctx.currentTime); // Subtle master level
        this.masterGain.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {
          // Autoplay policy may suspend until user gesture
        });
      }

      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Subtle upward step navigation chime (moving forward)
   */
  public playStepNext(customGain?: number) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Gentle ascending glissando from 540Hz to 680Hz
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.08);

      const targetGain = customGain ?? 0.08;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(targetGain, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio failures fail silently
    }
  }

  /**
   * Subtle downward step navigation tone (moving back)
   */
  public playStepPrev() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Soft descending glissando from 600Hz down to 480Hz
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.09);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio failures fail silently
    }
  }

  /**
   * Satisfying, sparkling harmonic chime when completing a specific task/action
   */
  public playTaskComplete() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      // Cheerful major chord arpeggio (C5 -> E5 -> G5 -> C6)
      const frequencies = [523.25, 659.25, 783.99, 1046.5];
      const noteDelay = 0.045; // 45ms arpeggio stagger

      frequencies.forEach((freq, idx) => {
        const noteStart = now + idx * noteDelay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // High notes use triangle wave for softer sparkle
        osc.type = idx >= 2 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.09, noteStart + 0.012);
        // Slight sustain on higher register
        const duration = 0.18 + idx * 0.04;
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteStart);
        osc.stop(noteStart + duration + 0.02);
      });
    } catch {
      // Audio failures fail silently
    }
  }

  /**
   * Celebratory multi-tone fanfare chord for tour completion
   */
  public playTourComplete() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      // Harmonic progression: C5 -> E5 -> G5 -> B5 -> C6
      const chord = [523.25, 659.25, 783.99, 987.77, 1046.5];
      
      chord.forEach((freq, idx) => {
        const startTime = now + idx * 0.06;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // Audio failures fail silently
    }
  }

  /**
   * Soft sparkle for Pro-Tip generation/refresh
   */
  public playProTipChime() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08); // D6

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Audio failures fail silently
    }
  }
}

export const soundManager = new SoundManager();
