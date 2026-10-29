import React, { useState, useEffect, useRef } from 'react';
import {
  ModelProfile,
  ModelVoiceClip,
  ModelMediaItem,
} from '../types';
import { voiceEngine } from '../utils/audioPlayer';
import {
  Volume2,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Plus,
  Image as ImageIcon,
  Sparkles,
  Check,
  UploadCloud,
  Flame,
  Radio,
  Sliders,
  Tag,
  Shield,
  Send,
  ExternalLink,
  RefreshCw,
  CheckCheck,
  AlertCircle,
  FileAudio,
  Eye,
} from 'lucide-react';

interface ModelVoiceAndMediaVaultProps {
  activeModel: ModelProfile;
  onUpdateModel?: (updated: ModelProfile) => void;
  onTestWebhook?: (sampleText: string) => void;
}

export const ModelVoiceAndMediaVault: React.FC<ModelVoiceAndMediaVaultProps> = ({
  activeModel,
  onUpdateModel,
  onTestWebhook,
}) => {
  // Voice clips & Media state
  const [voiceClips, setVoiceClips] = useState<ModelVoiceClip[]>(activeModel.voiceClips || []);
  const [mediaVault, setMediaVault] = useState<ModelMediaItem[]>(activeModel.mediaVault || []);
  const [activeTab, setActiveTab] = useState<'voice' | 'photos' | 'synthesis'>('voice');

  // Audio Playback State
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);

  // In-Browser Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);

  // New Voice Clip Form
  const [newClipTitle, setNewClipTitle] = useState('');
  const [newClipCategory, setNewClipCategory] = useState<ModelVoiceClip['category']>('saludo');
  const [newClipTranscription, setNewClipTranscription] = useState('');
  const [newClipKeywords, setNewClipKeywords] = useState('');
  const [isSavingClip, setIsSavingClip] = useState(false);

  // New Photo Form
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<ModelMediaItem['category']>('cafe');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoExclusive, setNewPhotoExclusive] = useState(false);
  const [newPhotoUnlockPrice, setNewPhotoUnlockPrice] = useState('$19.99');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Voice Synthesis Sliders State
  const [voicePitch, setVoicePitch] = useState(activeModel.voice.pitch || 1.15);
  const [voiceRate, setVoiceRate] = useState(activeModel.voice.rate || 0.98);
  const [isTestingVoiceSample, setIsTestingVoiceSample] = useState(false);

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with activeModel
  useEffect(() => {
    if (activeModel.voiceClips && activeModel.voiceClips.length > 0) {
      setVoiceClips(activeModel.voiceClips);
    }
    if (activeModel.mediaVault && activeModel.mediaVault.length > 0) {
      setMediaVault(activeModel.mediaVault);
    }
    setVoicePitch(activeModel.voice.pitch || 1.15);
    setVoiceRate(activeModel.voice.rate || 0.98);
  }, [activeModel.id]);

  // Clean up timer and audio on unmount
  useEffect(() => {
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      voiceEngine.stop();
    };
  }, []);

  // Play / Pause a specific voice clip
  const handleTogglePlayClip = async (clip: ModelVoiceClip) => {
    if (playingClipId === clip.id) {
      voiceEngine.stop();
      setPlayingClipId(null);
      setPlaybackProgress(0);
      return;
    }

    voiceEngine.stop();
    setPlayingClipId(clip.id);
    setPlaybackProgress(0);

    await voiceEngine.playVoiceNote(
      clip.transcription || clip.title,
      clip.audioBase64,
      (prog) => setPlaybackProgress(prog),
      () => {
        setPlayingClipId(null);
        setPlaybackProgress(0);
      }
    );
  };

  // Start browser mic recording
  const handleStartRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudioBlob(fullBlob);
        const objUrl = URL.createObjectURL(fullBlob);
        setRecordedAudioUrl(objUrl);

        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = (reader.result as string).split(',')[1];
          setRecordedBase64(b64);
        };
        reader.readAsDataURL(fullBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordSeconds(0);

      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Mic permission error, using simulation mode:', err);
      setIsRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop browser mic recording
  const handleStopRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Handle local audio file upload (MP3/WAV)
  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      const b64 = dataUri.split(',')[1];
      setRecordedBase64(b64);
      setRecordedAudioUrl(dataUri);
      setRecordSeconds(7);
      if (!newClipTitle) {
        setNewClipTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle local photo file upload
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setNewPhotoUrl(dataUri);
      if (!newPhotoTitle) {
        setNewPhotoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save new voice clip to model vault
  const handleSaveRecordedClip = async () => {
    if (!newClipTitle.trim()) return;
    setIsSavingClip(true);

    const keywords = newClipKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const newClip: ModelVoiceClip = {
      id: `vc-${Date.now()}`,
      modelId: activeModel.id,
      title: newClipTitle.trim(),
      category: newClipCategory,
      audioBase64: recordedBase64 || undefined,
      audioUrl: recordedAudioUrl || undefined,
      durationSeconds: Math.max(3, recordSeconds),
      transcription:
        newClipTranscription.trim() ||
        `Nota de voz grabada para ${activeModel.name}: "${newClipTitle}"`,
      triggerKeywords:
        keywords.length > 0 ? keywords : [newClipCategory, activeModel.name.split(' ')[0].toLowerCase()],
      createdAt: new Date().toISOString(),
      isCustomUploaded: true,
    };

    try {
      // Persist to backend server
      await fetch(`/api/model/${activeModel.id}/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClip),
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    const updatedClips = [newClip, ...voiceClips];
    setVoiceClips(updatedClips);

    if (onUpdateModel) {
      onUpdateModel({
        ...activeModel,
        voiceClips: updatedClips,
      });
    }

    // Reset recorder form
    setNewClipTitle('');
    setNewClipTranscription('');
    setNewClipKeywords('');
    setRecordedAudioBlob(null);
    setRecordedAudioUrl(null);
    setRecordedBase64(null);
    setRecordSeconds(0);
    setIsSavingClip(false);
  };

  // Save new photo to model vault
  const handleSavePhoto = async () => {
    if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) return;
    setIsSavingPhoto(true);

    const newPhoto: ModelMediaItem = {
      id: `med-${Date.now()}`,
      modelId: activeModel.id,
      title: newPhotoTitle.trim(),
      category: newPhotoCategory,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || newPhotoTitle.trim(),
      isExclusive: newPhotoExclusive,
      unlockPrice: newPhotoExclusive ? newPhotoUnlockPrice : undefined,
      watermark: `${activeModel.handle} / AURA_VERIFIED`,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch(`/api/model/${activeModel.id}/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPhoto),
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    const updatedVault = [newPhoto, ...mediaVault];
    setMediaVault(updatedVault);

    if (onUpdateModel) {
      onUpdateModel({
        ...activeModel,
        mediaVault: updatedVault,
      });
    }

    setNewPhotoTitle('');
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setIsPhotoModalOpen(false);
    setIsSavingPhoto(false);
  };

  // Delete clip
  const handleDeleteClip = async (clipId: string) => {
    try {
      await fetch(`/api/model/${activeModel.id}/vault/voice/${clipId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete warning:', e);
    }
    const filtered = voiceClips.filter((c) => c.id !== clipId);
    setVoiceClips(filtered);
    if (onUpdateModel) {
      onUpdateModel({
        ...activeModel,
        voiceClips: filtered,
      });
    }
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    try {
      await fetch(`/api/model/${activeModel.id}/vault/photo/${photoId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Delete warning:', e);
    }
    const filtered = mediaVault.filter((p) => p.id !== photoId);
    setMediaVault(filtered);
    if (onUpdateModel) {
      onUpdateModel({
        ...activeModel,
        mediaVault: filtered,
      });
    }
  };

  // Test live speech sample
  const handleTestVoiceSample = async () => {
    if (isTestingVoiceSample) {
      voiceEngine.stop();
      setIsTestingVoiceSample(false);
      return;
    }

    setIsTestingVoiceSample(true);
    const sampleText = `Hola cariño, soy ${activeModel.name}. Me alegra mucho que estés aquí en mi espacio. Te mando un besito enorme desde ${activeModel.location.split('/')[0].trim()} 😉`;

    await voiceEngine.playVoiceNote(
      sampleText,
      undefined,
      undefined,
      () => setIsTestingVoiceSample(false)
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner: Model Persona & Vault Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activeModel.avatarUrl}
                alt={activeModel.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-500/50 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] shadow">
                <Volume2 className="w-3 h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{activeModel.name}</h2>
                <span className="text-xs font-mono text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-800/40">
                  {activeModel.handle}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  Voz & Bóveda Exclusiva
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Aquí administras las <b>grabaciones de voz reales</b> y las <b>fotografías auténticas</b> que AuraAgent utilizará al responder a los seguidores por los DMs de X (Twitter).
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Notas de Voz
              </div>
              <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
                {voiceClips.length} clips
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Fotos en Bóveda
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {mediaVault.length} fotos
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl px-4 py-2.5 text-center">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Tono de Voz
              </div>
              <div className="text-xs font-bold text-indigo-300 font-mono mt-1 truncate max-w-[120px]">
                {activeModel.voice.accent.split('/')[0].trim()}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher inside Vault */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('voice')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Volume2 className="w-4 h-4 text-rose-300" />
            <span>Audios & Grabadora de Voz ({voiceClips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-emerald-300" />
            <span>Bóveda de Fotografías ({mediaVault.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('synthesis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'synthesis'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-300" />
            <span>Ajustes de Síntesis & Cadencia</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: VOICE RECORDINGS & CLIPS
          ======================================================== */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Audio Recorder & File Uploader (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Recorder Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  Grabar Nota de Voz de Mi Modelo
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  Micrófono HD
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Pídele a tu modelo que grabe sus audios o grábalos directamente desde tu dispositivo. AuraAgent los enviará automáticamente en X cuando el fan pida un audio o cuando el lead alcance alta confianza.
              </p>

              {/* Recording Action Area */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-4 text-center">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-rose-600/30 animate-ping absolute inset-0" />
                      <button
                        onClick={handleStopRecording}
                        className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/50 cursor-pointer relative z-10"
                        title="Detener grabación"
                      >
                        <Square className="w-6 h-6 fill-current" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      Grabando: {recordSeconds}s
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Habla con naturalidad y tono cercano...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={handleStartRecording}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 cursor-pointer transition-transform active:scale-95"
                      title="Comenzar a grabar audio"
                    >
                      <Mic className="w-7 h-7" />
                    </button>
                    <div className="text-xs font-bold text-white">
                      Presiona para Iniciar Grabación
                    </div>
                    <span className="text-[11px] text-slate-400 max-w-xs">
                      O sube un archivo <code className="text-rose-300 font-mono">.mp3</code> / <code className="text-rose-300 font-mono">.wav</code> proporcionado por la modelo.
                    </span>
                  </div>
                )}

                {/* File Uploader Alternative */}
                <input
                  type="file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Subir Archivo de Audio (.mp3/.wav)</span>
                </button>
              </div>

              {/* Form to Save Recorded / Uploaded Audio */}
              {(recordedAudioUrl || recordSeconds > 0) && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/40 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs font-bold text-rose-300 border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <FileAudio className="w-4 h-4 text-rose-400" />
                      Audio Listo ({recordSeconds}s)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Capturado ✓</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Nombre o Título del Audio:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Saludo coqueto matutino"
                      value={newClipTitle}
                      onChange={(e) => setNewClipTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                        Categoría:
                      </label>
                      <select
                        value={newClipCategory}
                        onChange={(e) => setNewClipCategory(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        <option value="saludo">Saludo Inicial ☕</option>
                        <option value="coqueto">Respuesta Coqueta 😉</option>
                        <option value="gym">Gym & Fitness 💪</option>
                        <option value="cierre_vip">Invitación OnlyFans VIP 🔥</option>
                        <option value="susurro">Susurro Íntimo 🤍</option>
                        <option value="personalizado">Personalizado ✨</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                        Palabras Clave (Separadas por coma):
                      </label>
                      <input
                        type="text"
                        placeholder="hola, audio, gym, only"
                        value={newClipKeywords}
                        onChange={(e) => setNewClipKeywords(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Transcripción del Audio (Texto que dice la modelo):
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ej: Hola amor, qué lindo saludarte por aquí..."
                      value={newClipTranscription}
                      onChange={(e) => setNewClipTranscription(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500 resize-none font-sans"
                    />
                  </div>

                  <button
                    disabled={!newClipTitle.trim() || isSavingClip}
                    onClick={handleSaveRecordedClip}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSavingClip ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando en la Bóveda...</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Guardar Audio en la Bóveda de {activeModel.name}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Library of Voice Clips (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-rose-400" />
                    Librería de Audios de {activeModel.name} ({voiceClips.length})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Audios disponibles para ser enviados por el Webhook de X automáticamente.
                  </p>
                </div>

                <button
                  onClick={handleTestVoiceSample}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isTestingVoiceSample ? 'Detener Prueba' : 'Escuchar Voz en Vivo'}</span>
                </button>
              </div>

              {voiceClips.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center gap-2">
                  <Volume2 className="w-8 h-8 text-slate-600" />
                  <span>No hay audios registrados para esta modelo aún.</span>
                  <span>Usa el panel de la izquierda para grabar su primer audio.</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {voiceClips.map((clip) => {
                    const isPlayingThis = playingClipId === clip.id;
                    return (
                      <div
                        key={clip.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPlayingThis
                            ? 'bg-gradient-to-r from-slate-950 via-indigo-950/60 to-purple-950/40 border-rose-500/60 shadow-lg shadow-rose-950/20'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">{clip.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 uppercase">
                              {clip.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ⏱ {clip.durationSeconds}s
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {onTestWebhook && (
                              <button
                                onClick={() =>
                                  onTestWebhook(
                                    `Hola ${activeModel.name.split(' ')[0]}, ¿me mandas un audio?`
                                  )
                                }
                                className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Probar cómo responde el Webhook de X con este audio"
                              >
                                Probar en Webhook
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteClip(clip.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                              title="Eliminar este clip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Player Controls & Waveform */}
                        <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <button
                            onClick={() => handleTogglePlayClip(clip)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-md transition-transform active:scale-95 ${
                              isPlayingThis
                                ? 'bg-rose-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-white'
                            }`}
                            title={isPlayingThis ? 'Pausar' : 'Reproducir audio'}
                          >
                            {isPlayingThis ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* Animated Waveform Visualizer */}
                          <div className="flex-1 flex items-center gap-1 h-7">
                            {[30, 60, 90, 45, 80, 100, 50, 75, 40, 65, 85, 95, 70, 50, 35, 70, 90, 60, 40, 75, 85, 60, 45].map(
                              (height, i) => {
                                const barActive =
                                  isPlayingThis &&
                                  i <= (playbackProgress / 100) * 23;
                                return (
                                  <div
                                    key={i}
                                    style={{ height: `${height}%` }}
                                    className={`w-1 rounded-full transition-all duration-150 ${
                                      barActive
                                        ? 'bg-rose-400 scale-y-110'
                                        : isPlayingThis
                                        ? 'bg-indigo-400/40'
                                        : 'bg-slate-700'
                                    }`}
                                  />
                                );
                              }
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-slate-400 shrink-0">
                            {isPlayingThis
                              ? `0:${Math.round(
                                  (playbackProgress / 100) * clip.durationSeconds
                                )
                                  .toString()
                                  .padStart(2, '0')}`
                              : `0:${clip.durationSeconds.toString().padStart(2, '0')}`}
                          </div>
                        </div>

                        {/* Transcription & Keywords */}
                        <p className="text-xs text-slate-300 italic mt-2.5 leading-relaxed bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                          "{clip.transcription}"
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap mt-2 text-[10px] text-slate-400">
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span>Se activa con:</span>
                          {clip.triggerKeywords.map((k) => (
                            <span
                              key={k}
                              className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                            >
                              #{k}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PHOTOS & MEDIA VAULT
          ======================================================== */}
      {activeTab === 'photos' && (
        <div className="flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Bóveda Fotográfica de {activeModel.name} ({mediaVault.length} fotos)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Fotografías auténticas de la modelo que AuraAgent adjunta automáticamente en los DMs de X.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={photoInputRef}
                  onChange={handlePhotoFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Subir Foto Local</span>
                </button>

                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Foto por URL</span>
                </button>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mediaVault.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col group hover:border-slate-700 transition-all shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-900">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Category & Status Badges */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-slate-700 uppercase">
                        {photo.category}
                      </span>
                      {photo.isExclusive && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-600/90 backdrop-blur-md text-[10px] font-bold text-white shadow">
                          PPV {photo.unlockPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-slate-400 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Eliminar de la bóveda"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Watermark overlay */}
                    <div className="absolute bottom-1 right-1.5 text-[9px] font-mono text-white/60 bg-black/60 px-1.5 py-0.5 rounded">
                      {photo.watermark || '@valeriag_official'}
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col gap-1.5 flex-1">
                    <div className="text-xs font-bold text-white truncate">{photo.title}</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                      "{photo.caption}"
                    </p>

                    <div className="mt-auto pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Aura X Webhook: Activa ✓</span>
                      <span className="text-emerald-400">Entrega Automática</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Photo Modal */}
          {isPhotoModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-400" />
                    Registrar Fotografía en la Bóveda
                  </h3>
                  <button
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Título de la Foto:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Selfie en el café de la mañana"
                    value={newPhotoTitle}
                    onChange={(e) => setNewPhotoTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    URL de la Imagen (o base64 data URI):
                  </label>
                  <input
                    type="text"
                    placeholder="https://... o sube una imagen"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                      Categoría:
                    </label>
                    <select
                      value={newPhotoCategory}
                      onChange={(e) => setNewPhotoCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="cafe">Café & Mañana ☕</option>
                      <option value="gym">Gym & Fitness 💪</option>
                      <option value="cozy">En Casa / Sofá 🤍</option>
                      <option value="beach">Playa / Salidas 🌅</option>
                      <option value="teaser">Teaser VIP OnlyFans 🔥</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                      ¿Es Contenido Exclusivo PPV?
                    </label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={newPhotoExclusive}
                        onChange={(e) => setNewPhotoExclusive(e.target.checked)}
                        className="w-4 h-4 text-emerald-500 accent-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300">Exclusiva</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 block">
                    Pie de Foto (Caption enviado por DM):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej: Tomándome un café pensando en ti ☕ ¿Tú ya tomaste café?"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setIsPhotoModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    disabled={!newPhotoTitle.trim() || !newPhotoUrl.trim() || isSavingPhoto}
                    onClick={handleSavePhoto}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isSavingPhoto ? 'Guardando...' : 'Guardar en la Bóveda'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: VOICE SYNTHESIS SETTINGS & CADENCE
          ======================================================== */}
      {activeTab === 'synthesis' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Parámetros de Voz Sintetizada & Clonación (TTS)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibra el tono, el timbre y la velocidad para que la voz sintetizada de {activeModel.name} sea indistinguible de una nota de voz real de WhatsApp o Twitter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Tono / Pitch ({voicePitch.toFixed(2)}x):</span>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    {voicePitch > 1.15 ? 'Agudo / Femenino Dulce' : 'Medio / Maduro'}
                  </span>
                </label>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.02"
                  value={voicePitch}
                  onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.8x Grave</span>
                  <span>1.15x Óptimo Femenino</span>
                  <span>1.4x Muy Agudo</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Velocidad de Cadencia ({voiceRate.toFixed(2)}x):</span>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    {voiceRate < 1 ? 'Pausado e Íntimo' : 'Espontáneo y Rápido'}
                  </span>
                </label>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.02"
                  value={voiceRate}
                  onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>0.75x Lento</span>
                  <span>0.98x Conversación Real</span>
                  <span>1.25x Rápido</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <span className="text-xs font-bold text-white">Acento y Modismos de la Modelo:</span>
                <span className="text-xs font-mono text-emerald-400">{activeModel.voice.accent}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  "{activeModel.voice.description}"
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/30 flex flex-col gap-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Prueba de Voz en Tiempo Real:
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Presiona el botón para escuchar cómo suena el saludo de {activeModel.name} con los ajustes actuales.
                </p>

                <button
                  onClick={handleTestVoiceSample}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isTestingVoiceSample ? 'Detener Prueba de Audio' : 'Escuchar Voz Sintetizada'}</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col gap-1.5">
                <span className="font-bold text-slate-200">ℹ️ Regla de Envío Automático:</span>
                <p className="text-[11px] leading-relaxed">
                  Si la modelo tiene una grabación de voz real en la bóveda que coincide con el tema de la conversación (ej: café, gym, coqueteo o OnlyFans), <b>AuraAgent siempre priorizará la grabación de voz real</b> de la modelo sobre el audio sintetizado para garantizar un realismo absoluto.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
