// ==========================================================================
// ☕ VELORA QSR - CAFE-FRIENDLY AUDIO ENGINE (WEB AUDIO API)
// 3s - 5s Non-Irritating, Soothing Harmonic Chimes & Service Bells
// ==========================================================================

export interface SoundOption {
  id: string;
  name: string;
  description: string;
  duration: string;
  tag: string;
}

export const CAFE_SOUND_OPTIONS: SoundOption[] = [
  {
    id: 'cafe-bell',
    name: 'Warm Harmonic Cafe Bell',
    description: 'Rich, soothing brass chime with warm acoustic harmonics (3.5s)',
    duration: '3.5s',
    tag: 'Recommended',
  },
  {
    id: 'marimba-chime',
    name: 'Artisan Marimba Chime',
    description: 'Three gentle ascending wooden notes with soft resonance (3.2s)',
    duration: '3.2s',
    tag: 'Mellow',
  },
  {
    id: 'crystal-ding',
    name: 'Crystal Service Ding',
    description: 'Crisp, delicate counter bell tone with smooth decay (2.8s)',
    duration: '2.8s',
    tag: 'Classic',
  },
  {
    id: 'melodic-harp',
    name: 'Melodic Cafe Harp',
    description: 'Four gentle ascending arpeggio notes with deep ambient warmth (4.2s)',
    duration: '4.2s',
    tag: 'Relaxing',
  },
];

class CafeAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  /**
   * Play the configured cafe-friendly chime sound
   * @param toneId 'cafe-bell' | 'marimba-chime' | 'crystal-ding' | 'melodic-harp'
   * @param volume 0 to 100
   */
  public async play(toneId: string = 'cafe-bell', volume: number = 80): Promise<void> {
    const ctx = this.getContext();
    if (!ctx) return;

    // Ensure context is running (browser user gesture requirement)
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return;
      }
    }

    const masterGain = ctx.createGain();
    // Soft limiter/compressor to prevent any harsh clicks or ear fatigue
    const normalizedVol = Math.max(0, Math.min(1, volume / 100)) * 0.28;
    masterGain.gain.setValueAtTime(normalizedVol, ctx.currentTime);
    masterGain.connect(ctx.destination);

    switch (toneId) {
      case 'marimba-chime':
        this.playMarimbaChime(ctx, masterGain);
        break;
      case 'crystal-ding':
        this.playCrystalDing(ctx, masterGain);
        break;
      case 'melodic-harp':
        this.playMelodicHarp(ctx, masterGain);
        break;
      case 'cafe-bell':
      default:
        this.playWarmCafeBell(ctx, masterGain);
        break;
    }
  }

  /**
   * Tone 1: Warm Harmonic Cafe Bell (~3.5 seconds)
   * Inspired by boutique espresso bar brass bells:
   * Fundamental A5 (880 Hz) + octave A6 (1760 Hz) + warm third C#6 (1108 Hz) + sub A4 (440 Hz)
   */
  private playWarmCafeBell(ctx: AudioContext, destination: GainNode): void {
    const t = ctx.currentTime;
    const notes = [
      { freq: 440, gain: 0.35, decay: 3.5, type: 'sine' as OscillatorType },
      { freq: 880, gain: 0.6, decay: 3.2, type: 'sine' as OscillatorType },
      { freq: 1108.73, gain: 0.35, decay: 2.8, type: 'triangle' as OscillatorType },
      { freq: 1760, gain: 0.2, decay: 2.2, type: 'sine' as OscillatorType },
      { freq: 2640, gain: 0.08, decay: 1.5, type: 'sine' as OscillatorType },
    ];

    notes.forEach(({ freq, gain, decay, type }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      // Smooth attack (15ms) to prevent clicks, followed by slow exponential acoustic decay
      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.exponentialRampToValueAtTime(gain, t + 0.018);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(noteGain);
      noteGain.connect(destination);

      osc.start(t);
      osc.stop(t + decay + 0.1);
    });
  }

  /**
   * Tone 2: Artisan Marimba Chime (~3.2 seconds)
   * Three ascending woody marimba notes: C5 (523.25 Hz) -> E5 (659.25 Hz) -> G5 (783.99 Hz)
   */
  private playMarimbaChime(ctx: AudioContext, destination: GainNode): void {
    const t = ctx.currentTime;
    const chords = [
      { freq: 523.25, timeOffset: 0.0, decay: 3.0 },
      { freq: 659.25, timeOffset: 0.13, decay: 3.0 },
      { freq: 783.99, timeOffset: 0.26, decay: 3.2 },
      { freq: 1046.5, timeOffset: 0.39, decay: 2.8 },
    ];

    chords.forEach(({ freq, timeOffset, decay }) => {
      const startTime = t + timeOffset;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Triangle wave creates warm organic wooden marimba character
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.5, startTime + 0.015);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

      osc.connect(noteGain);
      noteGain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + decay + 0.1);
    });
  }

  /**
   * Tone 3: Crystal Service Ding (~2.8 seconds)
   * Crisp, high-end cafe service bell: 1046.5 Hz (C6) with subtle shimmer
   */
  private playCrystalDing(ctx: AudioContext, destination: GainNode): void {
    const t = ctx.currentTime;
    const frequencies = [
      { freq: 1046.5, gain: 0.7, decay: 2.8, type: 'sine' as OscillatorType },
      { freq: 2093.0, gain: 0.25, decay: 2.0, type: 'sine' as OscillatorType },
      { freq: 3135.96, gain: 0.08, decay: 1.2, type: 'sine' as OscillatorType },
    ];

    frequencies.forEach(({ freq, gain, decay, type }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(noteGain);
      noteGain.connect(destination);

      osc.start(t);
      osc.stop(t + decay + 0.1);
    });
  }

  /**
   * Tone 4: Melodic Cafe Harp (~4.2 seconds)
   * 4 notes: G4 (392 Hz) -> C5 (523 Hz) -> E5 (659 Hz) -> G5 (784 Hz)
   */
  private playMelodicHarp(ctx: AudioContext, destination: GainNode): void {
    const t = ctx.currentTime;
    const notes = [
      { freq: 392.0, timeOffset: 0.0, decay: 4.0 },
      { freq: 523.25, timeOffset: 0.11, decay: 3.8 },
      { freq: 659.25, timeOffset: 0.22, decay: 3.8 },
      { freq: 783.99, timeOffset: 0.33, decay: 4.2 },
      { freq: 1174.66, timeOffset: 0.44, decay: 3.5 },
    ];

    notes.forEach(({ freq, timeOffset, decay }) => {
      const startTime = t + timeOffset;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.45, startTime + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

      osc.connect(noteGain);
      noteGain.connect(destination);

      osc.start(startTime);
      osc.stop(startTime + decay + 0.1);
    });
  }
}

export const cafeAudio = new CafeAudioEngine();
