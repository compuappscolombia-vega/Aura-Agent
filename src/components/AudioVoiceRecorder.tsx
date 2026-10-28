import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash2, Radio } from 'lucide-react';

interface AudioVoiceRecorderProps {
  onSendAudio: (audioBase64: string, durationSeconds: number, simulatedTranscription?: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const AudioVoiceRecorder: React.FC<AudioVoiceRecorderProps> = ({
  onSendAudio,
  onCancel,
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(fullBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      setHasMicPermission(false);
      // Still allow simulated recording
      setIsRecording(true);
      setRecordTime(0);
      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleSend = async () => {
    if (recordTime < 1) {
      onCancel();
      return;
    }

    if (audioBlob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = (reader.result as string).split(',')[1];
        onSendAudio(base64data, Math.max(1, recordTime));
      };
      reader.readAsDataURL(audioBlob);
    } else {
      // Fallback simulated voice recording
      onSendAudio(
        'simulated_voice_note_payload',
        Math.max(1, recordTime),
        'Hola linda, qué gusto saludarte en audio. Te ves preciosa en tus fotos.'
      );
    }
  };

  const handleQuickSimulation = (sampleText: string, duration: number) => {
    onSendAudio('simulated_voice_note_payload', duration, sampleText);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-3 shadow-xl flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-semibold text-rose-400">
                Grabando audio ({formatSeconds(recordTime)})
              </span>
            </div>
          ) : audioBlob || recordTime > 0 ? (
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Nota de voz lista ({formatSeconds(recordTime)})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">
                Graba una nota de voz para la modelo
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              Detener
            </button>
          ) : !audioBlob && recordTime === 0 ? (
            <button
              onClick={startRecording}
              disabled={disabled}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              Iniciar
            </button>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Descartar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar audio
              </button>
            </>
          )}
        </div>
      </div>

      {/* Live Waveform Indicator */}
      {isRecording && (
        <div className="flex items-center justify-center gap-1 h-8 bg-slate-950/60 rounded-xl px-4 py-1">
          {[16, 28, 12, 34, 20, 38, 14, 30, 24, 18, 36, 12, 28, 22].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-rose-500 to-indigo-400 rounded-full animate-pulse"
              style={{
                height: `${h}px`,
                animationDelay: `${(i % 5) * 120}ms`,
                animationDuration: '600ms',
              }}
            />
          ))}
        </div>
      )}

      {/* Quick Test Voice Prompts */}
      {!isRecording && recordTime === 0 && (
        <div className="border-t border-slate-800 pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">
            O enviar nota de audio rápida:
          </span>
          <button
            onClick={() =>
              handleQuickSimulation('¡Hola Valeria! Me encantó tu foto del café, te ves increíble 😊', 4)
            }
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
          >
            "Me encantó tu foto del café..."
          </button>
          <button
            onClick={() =>
              handleQuickSimulation('Oye, ¿y no tienes fotos más privadas o algún sitio exclusivo?', 5)
            }
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
          >
            "¿Tienes fotos más privadas...?"
          </button>
        </div>
      )}
    </div>
  );
};
