import React, { useState } from 'react';
import { Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { voiceEngine } from '../utils/audioPlayer';

interface VoiceNoteBubbleProps {
  text: string;
  audioBase64?: string;
  audioUrl?: string;
  durationSeconds?: number;
  sender: 'user' | 'model';
  modelName?: string;
  voiceStyle?: string;
  voiceProfile?: {
    pitch?: number;
    rate?: number;
    accent?: string;
    voiceName?: string;
  };
  isEncrypted?: boolean;
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({
  text,
  audioBase64,
  audioUrl,
  durationSeconds = 8,
  sender,
  modelName = 'Valeria',
  voiceStyle = 'Tono natural, cálido y fluido',
  voiceProfile,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePlayToggle = async () => {
    if (isPlaying) {
      voiceEngine.stop();
      setIsPlaying(false);
      setProgress(0);
      return;
    }

    setIsPlaying(true);
    setProgress(0);

    const audioSource = audioUrl || audioBase64;

    await voiceEngine.playVoiceNote(
      text,
      audioSource,
      (p) => setProgress(p),
      () => {
        setIsPlaying(false);
        setProgress(0);
      },
      voiceProfile
    );
  };

  // Fixed bars pattern for visual waveform
  const waveformBars = [
    25, 45, 60, 30, 80, 95, 50, 70, 85, 40, 65, 90, 75, 55, 35, 70, 90, 60, 45, 30,
    65, 80, 50, 75, 40, 60, 85, 95, 70, 40,
  ];

  const currentSeconds = Math.round((progress / 100) * durationSeconds);
  const formatTime = (sec: number) => {
    const s = sec % 60;
    return `0:${s < 10 ? '0' : ''}${s}`;
  };

  const isModel = sender === 'model';

  return (
    <div
      className={`rounded-2xl p-3 border transition-all ${
        isModel
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/40 border-indigo-800/40 text-slate-100 shadow-md'
          : 'bg-slate-800/90 border-slate-700/60 text-slate-100'
      }`}
    >
      {/* Voice Info Tag */}
      {isModel && (
        <div className="flex items-center justify-between text-[11px] text-indigo-300 font-medium mb-2 pb-1.5 border-b border-indigo-500/20">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Nota de voz de {modelName}</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-indigo-400/80">
            <Sparkles className="w-3 h-3 text-amber-400" />
            TTS Hiperrealista
          </span>
        </div>
      )}

      {/* Audio Player Controls & Waveform */}
      <div className="flex items-center gap-3">
        {/* Play Button */}
        <button
          onClick={handlePlayToggle}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg cursor-pointer transition-transform active:scale-95 ${
            isModel
              ? 'bg-gradient-to-tr from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white'
              : 'bg-slate-700 hover:bg-slate-600 text-white'
          }`}
          title={isPlaying ? 'Pausar nota de voz' : 'Escuchar nota de voz'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Bars */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-0.5 h-7">
            {waveformBars.map((height, idx) => {
              const barPercent = (idx / waveformBars.length) * 100;
              const hasPlayed = barPercent <= progress;

              return (
                <div
                  key={idx}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    hasPlayed
                      ? isModel
                        ? 'bg-rose-400'
                        : 'bg-emerald-400'
                      : 'bg-slate-700'
                  } ${isPlaying && hasPlayed ? 'scale-y-110' : ''}`}
                  style={{
                    height: `${Math.max(15, (height / 100) * 26)}px`,
                  }}
                />
              );
            })}
          </div>

          {/* Time & status */}
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>{isPlaying ? formatTime(currentSeconds) : formatTime(durationSeconds)}</span>
            <span className="text-[10px] italic text-slate-500">
              {isPlaying ? 'Reproduciendo...' : voiceStyle}
            </span>
          </div>
        </div>
      </div>

      {/* Transcription snippet */}
      <p className="mt-2 text-xs text-slate-300/90 italic bg-black/20 rounded-lg p-2 border border-white/5">
        "{text}"
      </p>
    </div>
  );
};
