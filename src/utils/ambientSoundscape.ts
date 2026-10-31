/**
 * Aura Acoustic Room Presence & Ambient Soundscape Engine (v2)
 * 
 * Solves the "digital vacuum / absolute silence" problem in synthetic speech:
 * In reality, voice notes on WhatsApp or phone calls are NEVER heard in sterile digital zero.
 * They have room tone, mic analog warmth, and environmental backgrounds (bedroom night, rain outside,
 * cafe morning, balcony breeze, car ride, fireplace, beach waves, or custom audio beds).
 * 
 * Features:
 * - 9 High-Realism Algorithmic Acoustic Environments
 * - Custom Ambient Audio Bed Uploader (MP3, WAV, M4A loop playback)
 * - Auto-Ducking: Softly dips ambient sound (-4dB) when the model's voice speaks
 * - Independent gain, filtering, and room resonance controls
 */

export type AmbiencePresetId =
  | 'room_intimate'
  | 'bedroom_night'
  | 'rain_window'
  | 'cafe_chill'
  | 'balcony_breeze'
  | 'studio_warm'
  | 'car_interior'
  | 'beach_waves'
  | 'fireplace_warm'
  | 'custom';

export interface AmbiencePreset {
  id: AmbiencePresetId;
  name: string;
  emoji: string;
  description: string;
  filterFreq: number;
  noiseType: 'brown' | 'pink' | 'room_air';
  defaultVolume: number; // 0.0 to 1.0
  reverbDecaySeconds: number;
}

export const AMBIENCE_PRESETS: Record<AmbiencePresetId, AmbiencePreset> = {
  room_intimate: {
    id: 'room_intimate',
    name: 'Habitación Íntima',
    emoji: '🛏️',
    description: 'Aire cálido de alcoba privada, sensación de cercanía e intimidad física real',
    filterFreq: 260,
    noiseType: 'room_air',
    defaultVolume: 0.14,
    reverbDecaySeconds: 0.8,
  },
  bedroom_night: {
    id: 'bedroom_night',
    name: 'Noche en Cama',
    emoji: '🌙',
    description: 'Silencio nocturno con calidez acústica de sábanas y respiración cercana',
    filterFreq: 190,
    noiseType: 'room_air',
    defaultVolume: 0.12,
    reverbDecaySeconds: 0.6,
  },
  rain_window: {
    id: 'rain_window',
    name: 'Lluvia Suave en Ventana',
    emoji: '🌧️',
    description: 'Gotas relajantes de lluvia cayendo suavemente contra el cristal exterior',
    filterFreq: 420,
    noiseType: 'pink',
    defaultVolume: 0.13,
    reverbDecaySeconds: 1.2,
  },
  cafe_chill: {
    id: 'cafe_chill',
    name: 'Cafetería de la Mañana',
    emoji: '☕',
    description: 'Ambiente acústico cálido y relajado con textura de fondo matutino',
    filterFreq: 340,
    noiseType: 'brown',
    defaultVolume: 0.11,
    reverbDecaySeconds: 1.4,
  },
  balcony_breeze: {
    id: 'balcony_breeze',
    name: 'Terraza / Balcón',
    emoji: '🍃',
    description: 'Brisa suave de aire libre, sensación de espacio abierto y naturalidad',
    filterFreq: 300,
    noiseType: 'pink',
    defaultVolume: 0.12,
    reverbDecaySeconds: 1.6,
  },
  studio_warm: {
    id: 'studio_warm',
    name: 'Micrófono Cálido de Estudio',
    emoji: '🎙️',
    description: 'Piso de ruido analógico de micrófono de condensador de alta fidelidad',
    filterFreq: 180,
    noiseType: 'room_air',
    defaultVolume: 0.10,
    reverbDecaySeconds: 0.5,
  },
  car_interior: {
    id: 'car_interior',
    name: 'Interior de Coche',
    emoji: '🚗',
    description: 'Cabina aislada en marcha suave con sutil rodamiento de carretera',
    filterFreq: 220,
    noiseType: 'brown',
    defaultVolume: 0.13,
    reverbDecaySeconds: 0.4,
  },
  beach_waves: {
    id: 'beach_waves',
    name: 'Olas Suaves de Playa',
    emoji: '🌊',
    description: 'Murmullo lejano de orilla marina y atardecer costero',
    filterFreq: 360,
    noiseType: 'pink',
    defaultVolume: 0.12,
    reverbDecaySeconds: 1.8,
  },
  fireplace_warm: {
    id: 'fireplace_warm',
    name: 'Chimenea Acogedora',
    emoji: '🔥',
    description: 'Crujido sutil y calor acústico envolvente de hogar',
    filterFreq: 280,
    noiseType: 'brown',
    defaultVolume: 0.12,
    reverbDecaySeconds: 0.9,
  },
  custom: {
    id: 'custom',
    name: 'Fondo Personalizado (Subido)',
    emoji: '🎧',
    description: 'Pista de ambientación personalizada cargada por el usuario',
    filterFreq: 400,
    noiseType: 'room_air',
    defaultVolume: 0.14,
    reverbDecaySeconds: 1.0,
  },
};

type StateListener = (isPlaying: boolean, preset: AmbiencePreset) => void;

class AmbientSoundscapeEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private customAudioElement: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private customAudioName: string | null = null;
  private currentPreset: AmbiencePreset = AMBIENCE_PRESETS.room_intimate;
  private isPlaying: boolean = false;
  private userVolumeMultiplier: number = 1.0; // 0.0 to 2.0
  private isEnabled: boolean = true;
  private isDuckingEnabled: boolean = true;
  private isDucked: boolean = false;
  private listeners: Set<StateListener> = new Set();

  private initAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isPlaying, this.currentPreset);
      } catch {}
    });
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying, this.currentPreset);
    return () => this.listeners.delete(listener);
  }

  /**
   * Generates organic room-tone noise buffer (filtered pink/brown noise)
   */
  private createRoomToneBuffer(ctx: AudioContext, type: 'brown' | 'pink' | 'room_air'): AudioBuffer {
    const bufferSize = ctx.sampleRate * 4; // 4 seconds looping buffer
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    let lastOutLeft = 0.0;
    let lastOutRight = 0.0;

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let rb0 = 0, rb1 = 0, rb2 = 0, rb3 = 0, rb4 = 0, rb5 = 0, rb6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;

      if (type === 'brown' || type === 'room_air') {
        // Brown noise / warm room air
        lastOutLeft = (lastOutLeft + 0.025 * whiteL) / 1.025;
        lastOutRight = (lastOutRight + 0.025 * whiteR) / 1.025;
        left[i] = lastOutLeft * 3.2;
        right[i] = lastOutRight * 3.2;
      } else {
        // Pink noise (natural rain / breeze)
        b0 = 0.99886 * b0 + whiteL * 0.0555179;
        b1 = 0.99332 * b1 + whiteL * 0.0750759;
        b2 = 0.96900 * b2 + whiteL * 0.1538520;
        b3 = 0.86650 * b3 + whiteL * 0.3104856;
        b4 = 0.55000 * b4 + whiteL * 0.5329522;
        b5 = -0.7616 * b5 - whiteL * 0.0168980;
        left[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + whiteL * 0.5362) * 0.11;
        b6 = whiteL * 0.115926;

        rb0 = 0.99886 * rb0 + whiteR * 0.0555179;
        rb1 = 0.99332 * rb1 + whiteR * 0.0750759;
        rb2 = 0.96900 * rb2 + whiteR * 0.1538520;
        rb3 = 0.86650 * rb3 + whiteR * 0.3104856;
        rb4 = 0.55000 * rb4 + whiteR * 0.5329522;
        rb5 = -0.7616 * rb5 - whiteR * 0.0168980;
        right[i] = (rb0 + rb1 + rb2 + rb3 + rb4 + rb5 + rb6 + whiteR * 0.5362) * 0.11;
        rb6 = whiteR * 0.115926;
      }
    }

    return buffer;
  }

  /**
   * Set custom uploaded ambient audio file
   */
  public setCustomAmbientAudio(audioUrl: string | null, name: string = 'Audio Personalizado') {
    this.customAudioUrl = audioUrl;
    this.customAudioName = name;
    if (audioUrl) {
      this.currentPreset = {
        ...AMBIENCE_PRESETS.custom,
        name: `Fondo: ${name}`,
      };
      if (this.isPlaying) {
        this.play('custom', 250);
      }
    }
    this.notify();
  }

  public getCustomAmbientAudio() {
    return {
      url: this.customAudioUrl,
      name: this.customAudioName,
    };
  }

  /**
   * Set active ambience atmosphere preset
   */
  public setPreset(presetId: AmbiencePresetId) {
    if (presetId === 'custom' && this.customAudioUrl) {
      this.currentPreset = {
        ...AMBIENCE_PRESETS.custom,
        name: this.customAudioName ? `Fondo: ${this.customAudioName}` : 'Fondo Personalizado',
      };
    } else if (AMBIENCE_PRESETS[presetId]) {
      this.currentPreset = AMBIENCE_PRESETS[presetId];
      if (this.filterNode && this.audioCtx) {
        this.filterNode.frequency.setTargetAtTime(this.currentPreset.filterFreq, this.audioCtx.currentTime, 0.2);
      }
    }
    this.notify();
  }

  public getActivePreset(): AmbiencePreset {
    return this.currentPreset;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled && this.isPlaying) {
      this.stop();
    }
    this.notify();
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolumeMultiplier(multiplier: number) {
    this.userVolumeMultiplier = Math.max(0, Math.min(2.0, multiplier));
    if (this.masterGain && this.audioCtx && this.isPlaying) {
      const targetGain = this.getTargetGain();
      this.masterGain.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.1);
    }
    if (this.customAudioElement && this.isPlaying) {
      this.customAudioElement.volume = Math.min(1.0, this.getTargetGain());
    }
  }

  public getVolumeMultiplier(): number {
    return this.userVolumeMultiplier;
  }

  public setDuckingEnabled(enabled: boolean) {
    this.isDuckingEnabled = enabled;
  }

  public getIsDuckingEnabled(): boolean {
    return this.isDuckingEnabled;
  }

  private getTargetGain(): number {
    const base = this.currentPreset.defaultVolume * this.userVolumeMultiplier;
    return this.isDucked && this.isDuckingEnabled ? base * 0.45 : base;
  }

  /**
   * Auto-ducking: softly dips ambient sound when voice speaks
   */
  public duck(fadeMs: number = 200) {
    if (!this.isDuckingEnabled || !this.isPlaying) return;
    this.isDucked = true;
    const ctx = this.audioCtx;
    if (this.masterGain && ctx) {
      const targetGain = Math.max(0.001, this.getTargetGain());
      this.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, fadeMs / 1000);
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = Math.min(1.0, this.getTargetGain());
    }
  }

  /**
   * Unducks ambient sound back to full calibrated room presence
   */
  public unduck(fadeMs: number = 350) {
    if (!this.isPlaying) return;
    this.isDucked = false;
    const ctx = this.audioCtx;
    if (this.masterGain && ctx) {
      const targetGain = Math.max(0.001, this.getTargetGain());
      this.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, fadeMs / 1000);
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = Math.min(1.0, this.getTargetGain());
    }
  }

  /**
   * Start playing the ambient room tone or custom audio bed
   */
  public play(presetId?: AmbiencePresetId, fadeInMs: number = 350): void {
    if (!this.isEnabled) return;

    if (presetId) {
      this.setPreset(presetId);
    }

    // If Custom Audio Track is active and available
    if (this.currentPreset.id === 'custom' && this.customAudioUrl) {
      this.stop();
      try {
        const audio = new Audio(this.customAudioUrl);
        audio.loop = true;
        audio.volume = Math.min(1.0, this.getTargetGain());
        this.customAudioElement = audio;
        audio.play().catch(() => {});
        this.isPlaying = true;
        this.notify();
        return;
      } catch (e) {
        console.warn('Custom ambient playback failed, using synthetic room:', e);
      }
    }

    const ctx = this.initAudioContext();
    if (!ctx) return;

    // If already playing, update gain smoothly
    if (this.isPlaying && this.masterGain) {
      const targetGain = this.getTargetGain();
      this.masterGain.gain.setTargetAtTime(targetGain, ctx.currentTime, fadeInMs / 1000);
      return;
    }

    try {
      this.stop();

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(this.currentPreset.filterFreq, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      const buffer = this.createRoomToneBuffer(ctx, this.currentPreset.noiseType);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      source.connect(filter);
      filter.connect(masterGain);
      masterGain.connect(ctx.destination);

      source.start();

      const targetGain = this.getTargetGain();
      masterGain.gain.exponentialRampToValueAtTime(
        Math.max(0.001, targetGain),
        ctx.currentTime + fadeInMs / 1000
      );

      this.masterGain = masterGain;
      this.filterNode = filter;
      this.noiseSource = source;
      this.isPlaying = true;
      this.notify();
    } catch (err) {
      console.warn('Could not start ambient room tone:', err);
    }
  }

  /**
   * Stop ambient room tone with smooth fade-out (WhatsApp voice note release effect)
   */
  public stop(fadeOutMs: number = 450): void {
    if (!this.isPlaying && !this.masterGain && !this.customAudioElement) return;

    if (this.customAudioElement) {
      try {
        this.customAudioElement.pause();
        this.customAudioElement.currentTime = 0;
        this.customAudioElement = null;
      } catch {}
    }

    if (this.masterGain && this.audioCtx) {
      try {
        const ctx = this.audioCtx;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fadeOutMs / 1000);

        const oldSource = this.noiseSource;
        const oldGain = this.masterGain;

        setTimeout(() => {
          try {
            oldSource?.stop();
            oldSource?.disconnect();
            oldGain?.disconnect();
          } catch {}
        }, fadeOutMs + 50);
      } catch {}
    }

    this.isPlaying = false;
    this.isDucked = false;
    this.noiseSource = null;
    this.masterGain = null;
    this.filterNode = null;
    this.notify();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSoundscape = new AmbientSoundscapeEngine();
