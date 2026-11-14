/**
 * Axiom Scientific Calculator - Audio Feedback System
 * Copyright (c) 2026 Mohammad Abuzar Alam. All rights reserved.
 * Author: Mohammad Abuzar Alam (abuzaraalam34@gmail.com)
 *
 * Generates procedural tones via the Web Audio API without external audio files.
 * Designed specifically for non-intrusive auditory confirmation and accessibility feedback.
 */

class AudioFeedbackManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.buttonFeedback = true;
    this.volume = 0.4; // Default volume: 40% (comfortable and non-fatiguing)
    this.isInitialized = false;

    // Load persisted audio settings if available
    this.loadSettings();

    // Auto-resume audio context on first user interaction
    this.setupUnlockListeners();
  }

  /**
   * Loads audio preferences from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('calc_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.enabled === 'boolean') this.enabled = parsed.enabled;
        if (typeof parsed.buttonFeedback === 'boolean') this.buttonFeedback = parsed.buttonFeedback;
        if (typeof parsed.volume === 'number' && !isNaN(parsed.volume)) {
          this.volume = Math.max(0, Math.min(1, parsed.volume));
        }
      }
    } catch (e) {
      console.warn('Unable to load audio preferences from localStorage:', e);
    }
  }

  /**
   * Persists audio preferences to localStorage
   */
  saveSettings() {
    try {
      const settings = {
        enabled: this.enabled,
        buttonFeedback: this.buttonFeedback,
        volume: this.volume
      };
      localStorage.setItem('calc_audio_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Unable to save audio preferences to localStorage:', e);
    }
  }

  /**
   * Registers one-time user gesture listeners to unlock Web Audio API
   */
  setupUnlockListeners() {
    const unlock = () => {
      this.initContext();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
  }

  /**
   * Initializes AudioContext and master gain node lazily
   */
  initContext() {
    if (this.ctx) return true;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('Web Audio API not supported in this browser.');
        return false;
      }
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
      return true;
    } catch (err) {
      console.warn('Failed to initialize AudioContext:', err);
      return false;
    }
  }

  /**
   * Sets master volume (0.0 to 1.0)
   * @param {number} vol 
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, Number(vol)));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  /**
   * Enables or disables all sound output
   * @param {boolean} enabled 
   */
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.saveSettings();
  }

  /**
   * Enables or disables button-level click beeps
   * @param {boolean} enabled 
   */
  setButtonFeedback(enabled) {
    this.buttonFeedback = Boolean(enabled);
    this.saveSettings();
  }

  /**
   * Helper to ensure context is active before synthesis
   */
  ensureReady() {
    if (!this.enabled) return false;
    if (!this.initContext()) return false;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return true;
  }

  /**
   * Creates an oscillator with envelope and connects to master gain
   */
  createTone(type, freq, startTime, duration, peakGain = 1.0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Smooth envelope to avoid audio clicks/pops
    const attackTime = 0.005; // 5ms attack
    const releaseTime = duration - attackTime;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peakGain, startTime + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + attackTime + releaseTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);

    // Garbage collection cleanup
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * 1. Number entered: Short, soft beep (480 Hz sine, 45ms)
   */
  playNumber() {
    if (!this.buttonFeedback || !this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('sine', 480, now, 0.045, 0.4);
  }

  /**
   * 2. Operator activated: Slightly different beep (587 Hz triangle, 55ms)
   */
  playOperator() {
    if (!this.buttonFeedback || !this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('triangle', 587.33, now, 0.055, 0.45);
  }

  /**
   * 3. Scientific function activated: Distinct confirmation beep (660 Hz + 1320 Hz octave harmonic, 70ms)
   */
  playScientific() {
    if (!this.buttonFeedback || !this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('sine', 659.25, now, 0.07, 0.4);
    this.createTone('sine', 1318.5, now + 0.01, 0.05, 0.2);
  }

  /**
   * 4. Calculation completed: Uplifting confirmation chord (C5 -> E5 -> G5 rapid harmonic chime)
   */
  playCalculationComplete() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    // C5 (523.25 Hz) followed by G5 (783.99 Hz)
    this.createTone('sine', 523.25, now, 0.08, 0.5);
    this.createTone('triangle', 783.99, now + 0.06, 0.12, 0.5);
  }

  /**
   * 5. Error: Distinct warning tone (descending buzzer with dual low frequencies)
   */
  playError() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    
    // Frequency sweep down for a clear warning buzzer without being painfully harsh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.21);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * 6. Clear operation: Short downward sweep tone (800 Hz down to 250 Hz, 60ms)
   */
  playClear() {
    if (!this.buttonFeedback || !this.ensureReady()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.07);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.075);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  /**
   * 7. Memory operation: Melodic chime (high G5 bell tone, 80ms)
   */
  playMemory() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('triangle', 783.99, now, 0.08, 0.45);
    this.createTone('sine', 1567.98, now + 0.015, 0.065, 0.25);
  }

  /**
   * Mode change tone (e.g. DEG -> RAD -> GRAD)
   */
  playModeChange() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('sine', 620, now, 0.05, 0.35);
    this.createTone('sine', 880, now + 0.03, 0.06, 0.35);
  }

  /**
   * Backspace deletion tone: Crisp, subtle percussive click (340 Hz, 35ms)
   */
  playBackspace() {
    if (!this.buttonFeedback || !this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('triangle', 340, now, 0.035, 0.35);
  }

  /**
   * Read / Inspect display tone: Gentle two-tone ping (520 Hz -> 780 Hz)
   */
  playInspect() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('sine', 520, now, 0.04, 0.3);
    this.createTone('sine', 780, now + 0.03, 0.05, 0.3);
  }

  /**
   * Conversion / Fraction toggle tone: Quick ascending blip (600 Hz -> 900 Hz)
   */
  playConvert() {
    if (!this.ensureReady()) return;
    const now = this.ctx.currentTime;
    this.createTone('sine', 600, now, 0.04, 0.35);
    this.createTone('triangle', 900, now + 0.025, 0.05, 0.35);
  }
}

// Global instance for calculator application
window.audioFeedback = new AudioFeedbackManager();
