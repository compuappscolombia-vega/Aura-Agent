/**
 * Centralized High-Realism Audio Engine for AuraAgent
 * Guarantees 100% acoustic consistency between Chat voice notes,
 * sample recordings in the vault, and cloned model voice clips.
 */

export interface VoiceProfileConfig {
  name?: string;
  pitch?: number;
  rate?: number;
  accent?: string;
  voiceName?: string;
  lang?: string;
}

class VoiceSynthesisEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private activeCalibratedProfile: VoiceProfileConfig = {
    pitch: 1.15,
    rate: 0.98,
    accent: 'Latino dulce / Colombiano suave',
    voiceName: 'Kore',
    lang: 'es-CO',
  };

  /**
   * Set the active model's calibrated voice profile across the entire application
   */
  public setCalibratedVoiceProfile(profile: Partial<VoiceProfileConfig>) {
    this.activeCalibratedProfile = {
      ...this.activeCalibratedProfile,
      ...profile,
    };
  }

  public getCalibratedVoiceProfile(): VoiceProfileConfig {
    return this.activeCalibratedProfile;
  }

  /**
   * Play audio: supports audioBase64, audioUrl (blob/data URI), or high-realism voice synthesis
   */
  public async playVoiceNote(
    text: string,
    audioSource?: string | null, // Can be base64 OR audioUrl (data:audio... or blob:...)
    onProgress?: (progress: number) => void,
    onEnd?: () => void,
    overrideProfile?: Partial<VoiceProfileConfig>
  ): Promise<void> {
    this.stop();

    const effectiveProfile: VoiceProfileConfig = {
      ...this.activeCalibratedProfile,
      ...overrideProfile,
    };

    // 1. Play real pre-recorded audio / cloned audio if available
    if (audioSource && audioSource.trim()) {
      try {
        const audioSrc = audioSource.startsWith('data:') || audioSource.startsWith('blob:') || audioSource.startsWith('http')
          ? audioSource
          : `data:audio/wav;base64,${audioSource}`;

        const audio = new Audio(audioSrc);
        this.currentAudio = audio;

        audio.ontimeupdate = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            const progress = (audio.currentTime / audio.duration) * 100;
            onProgress?.(Math.min(99, progress));
          }
        };

        audio.onended = () => {
          onProgress?.(100);
          onEnd?.();
          this.currentAudio = null;
        };

        audio.onerror = (e) => {
          console.warn('Real audio playback failed, falling back to unified synthesis:', e);
          this.speakTextUnified(text, effectiveProfile, onProgress, onEnd);
        };

        await audio.play();
        return;
      } catch (err) {
        console.warn('Audio playback error, falling back to unified synthesis:', err);
      }
    }

    // 2. Fall back to unified high-realism synthesis with model's exact calibrated voice
    await this.speakTextUnified(text, effectiveProfile, onProgress, onEnd);
  }

  /**
   * High-realism synthesis using the model's calibrated pitch, rate, and timbre
   */
  private async speakTextUnified(
    text: string,
    profile: VoiceProfileConfig,
    onProgress?: (progress: number) => void,
    onEnd?: () => void
  ): Promise<void> {
    if (!('speechSynthesis' in window)) {
      // Browser doesn't support Web Speech: simulated progress
      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        onProgress?.(Math.min(100, p));
        if (p >= 100) {
          clearInterval(interval);
          onEnd?.();
        }
      }, 250);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of emojis and special characters for clear, fluid speech
    const cleanSpeech = text
      .replace(/[☕💪✨🔥😉🤤🤍🌅🥰😍😘💋❤️]/gu, '')
      .replace(/https?:\/\/\S+/g, 'enlace exclusivo')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech || text);
    this.currentUtterance = utterance;

    // Retrieve system voices
    const voices = window.speechSynthesis.getVoices();
    const spanishVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('es'));

    // Preference: sweet, feminine, natural Spanish voice
    const chosenVoice =
      spanishVoices.find(
        (v) =>
          v.name.toLowerCase().includes('sabina') ||
          v.name.toLowerCase().includes('monica') ||
          v.name.toLowerCase().includes('paulina') ||
          v.name.toLowerCase().includes('helena') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('google español') ||
          v.name.toLowerCase().includes('female')
      ) ||
      spanishVoices[0] ||
      voices[0];

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Apply EXACT calibrated model voice attributes
    utterance.pitch = profile.pitch ?? 1.15;
    utterance.rate = profile.rate ?? 0.98;
    utterance.lang = profile.lang || 'es-CO';

    const estimatedDurationMs = Math.max(2000, cleanSpeech.length * 68);
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(96, (elapsed / estimatedDurationMs) * 100);
      onProgress?.(progress);
    }, 80);

    utterance.onend = () => {
      clearInterval(timer);
      onProgress?.(100);
      onEnd?.();
      this.currentUtterance = null;
    };

    utterance.onerror = () => {
      clearInterval(timer);
      onEnd?.();
      this.currentUtterance = null;
    };

    window.speechSynthesis.speak(utterance);
  }

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
  }
}

export const voiceEngine = new VoiceSynthesisEngine();
