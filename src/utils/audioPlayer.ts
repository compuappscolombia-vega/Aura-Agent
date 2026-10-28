/**
 * Audio synthesis & playback engine for the model's voice
 */

class VoiceSynthesisEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Play base64 WAV audio from Gemini TTS, or fallback to browser speech synthesis
   */
  public async playVoiceNote(
    text: string,
    audioBase64?: string,
    onProgress?: (progress: number) => void,
    onEnd?: () => void
  ): Promise<void> {
    this.stop();

    if (audioBase64) {
      try {
        const audioSrc = `data:audio/wav;base64,${audioBase64}`;
        this.currentAudio = new Audio(audioSrc);

        this.currentAudio.ontimeupdate = () => {
          if (this.currentAudio && this.currentAudio.duration) {
            const progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
            onProgress?.(progress);
          }
        };

        this.currentAudio.onended = () => {
          onProgress?.(100);
          onEnd?.();
          this.currentAudio = null;
        };

        await this.currentAudio.play();
        return;
      } catch (err) {
        console.warn('Error playing base64 audio, using fallback speech synthesis:', err);
      }
    }

    // High quality Web Speech fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      // Select female Spanish voice if available
      const voices = window.speechSynthesis.getVoices();
      const spanishVoices = voices.filter((v) => v.lang.startsWith('es'));
      const femaleVoice =
        spanishVoices.find(
          (v) =>
            v.name.toLowerCase().includes('sabina') ||
            v.name.toLowerCase().includes('monica') ||
            v.name.toLowerCase().includes('paulina') ||
            v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('google')
        ) || spanishVoices[0];

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      utterance.pitch = 1.18; // Sweet, warm feminine pitch
      utterance.rate = 0.98; // Natural conversational cadence
      utterance.lang = 'es-CO';

      const estimatedDurationMs = Math.max(2500, text.length * 75);
      const startTime = Date.now();
      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(98, (elapsed / estimatedDurationMs) * 100);
        onProgress?.(progress);
      }, 100);

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
    } else {
      // Simulate playback
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        onProgress?.(progress);
        if (progress >= 100) {
          clearInterval(interval);
          onEnd?.();
        }
      }, 300);
    }
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
