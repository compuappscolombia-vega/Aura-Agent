import React, { useState, useRef, useEffect } from 'react';
import {
  ModelProfile,
  AgentSkillSettings,
  RawAudioSample,
} from '../types';
import {
  ambientSoundscape,
  AMBIENCE_PRESETS,
  AmbiencePresetId,
} from '../utils/ambientSoundscape';
import {
  createRawAudioSample,
  extractRawAcousticSignatures,
} from '../utils/rawAudioAnalyzer';
import { voiceEngine } from '../utils/audioPlayer';
import {
  Brain,
  Sliders,
  Sparkles,
  Zap,
  Target,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Flame,
  Volume2,
  ArrowRight,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  Trash2,
  Waves,
  Music,
  Wind,
  Shield,
  Check,
  Disc,
} from 'lucide-react';

interface AgentTrainingLabProps {
  modelProfile: ModelProfile;
  onUpdateSkills: (skills: AgentSkillSettings) => void;
  onRunTestPrompt: (promptText: string) => void;
  onUpdateModel?: (updated: ModelProfile) => void;
}

export const AgentTrainingLab: React.FC<AgentTrainingLabProps> = ({
  modelProfile,
  onUpdateSkills,
  onRunTestPrompt,
  onUpdateModel,
}) => {
  // Active Navigation Tab inside Training Lab
  const [activeSection, setActiveSection] = useState<'raw_audio' | 'ambience' | 'skills' | 'benchmark'>('raw_audio');

  // Linguistic & Psychological Skills State
  const [skills, setSkills] = useState<AgentSkillSettings>(modelProfile.skills);
  const [hasSavedSkills, setHasSavedSkills] = useState(false);

  // Raw Audio Samples State (Ignores text transcription requirements)
  const initialRawSamples: RawAudioSample[] = modelProfile.rawAudioSamples && modelProfile.rawAudioSamples.length > 0
    ? modelProfile.rawAudioSamples
    : [
        {
          id: `raw-sample-init-${modelProfile.id}`,
          modelId: modelProfile.id,
          name: `${modelProfile.name.split(' ')[0].toLowerCase()}_audio_crudo_master.wav`,
          audioUrl: modelProfile.voiceDna?.sampleAudioUrl || '',
          durationSeconds: 8,
          fileSizeBytes: 384000,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          signatures: {
            f0PitchHz: 218,
            harmonicWarmth: 99.6,
            spectralPurity: 98.4,
            breathinessRatio: 32,
            cadenceRate: 0.98,
            roomNoiseFloorDb: -38,
            roomReverbEstimate: 'Habitación íntima seca con sutil presencia de alcoba (RT60 = 0.35s)',
            recommendedAmbience: 'room_intimate',
          },
        },
      ];

  const [rawSamples, setRawSamples] = useState<RawAudioSample[]>(initialRawSamples);
  const [isUploadingRaw, setIsUploadingRaw] = useState(false);
  const [rawUploadSuccess, setRawUploadSuccess] = useState<string | null>(null);
  const [playingRawId, setPlayingRawId] = useState<string | null>(null);
  const [rawProgress, setRawProgress] = useState<number>(0);
  const rawAudioInputRef = useRef<HTMLInputElement | null>(null);

  // Background Ambient Soundscape State
  const [selectedAmbience, setSelectedAmbience] = useState<AmbiencePresetId>(
    (modelProfile.voiceDna?.ambientPresenceType as AmbiencePresetId) || 'room_intimate'
  );
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState<boolean>(ambientSoundscape.getIsPlaying());
  const [ambienceVolume, setAmbienceVolume] = useState<number>(ambientSoundscape.getVolumeMultiplier());
  const [isDuckingEnabled, setIsDuckingEnabled] = useState<boolean>(ambientSoundscape.getIsDuckingEnabled());
  const [customAmbienceName, setCustomAmbienceName] = useState<string>(
    modelProfile.voiceDna?.customAmbienceName || 'Audio de Fondo Personalizado'
  );
  const [customAmbienceUrl, setCustomAmbienceUrl] = useState<string | null>(
    modelProfile.voiceDna?.customAmbienceAudioUrl || null
  );
  const [isTestingVoiceWithAmbience, setIsTestingVoiceWithAmbience] = useState(false);
  const customAmbienceInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to ambient soundscape state changes
  useEffect(() => {
    const unsubscribe = ambientSoundscape.subscribe((isPlaying, preset) => {
      setIsAmbiencePlaying(isPlaying);
    });
    return () => {
      unsubscribe();
      voiceEngine.stop();
    };
  }, []);

  // Sync when modelProfile changes
  useEffect(() => {
    setSkills(modelProfile.skills);
    if (modelProfile.rawAudioSamples && modelProfile.rawAudioSamples.length > 0) {
      setRawSamples(modelProfile.rawAudioSamples);
    }
    if (modelProfile.voiceDna?.ambientPresenceType) {
      setSelectedAmbience(modelProfile.voiceDna.ambientPresenceType as AmbiencePresetId);
    }
  }, [modelProfile.id]);

  // Skill slider change handler
  const handleSliderChange = (key: keyof AgentSkillSettings, value: any) => {
    const updated = { ...skills, [key]: value };
    setSkills(updated);
    onUpdateSkills(updated);
    setHasSavedSkills(true);
    setTimeout(() => setHasSavedSkills(false), 2000);
  };

  // ==========================================
  // DIRECT RAW AUDIO UPLOAD HANDLERS
  // (Zero Text Transcription Requirements)
  // ==========================================
  const handleRawAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRaw(true);
    setRawUploadSuccess(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      const b64 = dataUri.split(',')[1];
      const durationSeconds = Math.max(3, Math.round(file.size / 32000));

      // 1. Direct acoustic signature extraction (pure acoustic properties, no text)
      const newSample = createRawAudioSample(
        modelProfile.id,
        file.name,
        dataUri,
        b64,
        durationSeconds,
        file.size
      );

      // 2. Sync with backend API
      try {
        await fetch(`/api/model/${modelProfile.id}/raw-audio-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: b64,
            audioUrl: dataUri,
            fileName: file.name,
            durationSeconds,
            ambientPreset: newSample.signatures.recommendedAmbience,
          }),
        });
      } catch (err) {
        console.warn('Backend raw audio sync notification:', err);
      }

      // 3. Update local and model state
      const updatedSamples = [newSample, ...rawSamples];
      setRawSamples(updatedSamples);

      // Calibrate active voice profile with extracted raw acoustic signatures
      const updatedModel: ModelProfile = {
        ...modelProfile,
        rawAudioSamples: updatedSamples,
        voiceDna: {
          ...(modelProfile.voiceDna || {
            isCloned: true,
            sampleDurationSeconds: durationSeconds,
            timbreScore: 99.6,
            learningGenerationsCount: 1,
            detectedTone: 'Firma Acústica Directa Calibrada',
            pitch: 1.15,
            rate: 0.98,
          }),
          isCloned: true,
          sampleDurationSeconds: durationSeconds,
          sampleAudioUrl: dataUri,
          sampleAudioBase64: b64,
          sampleTranscription: 'Firma Acústica Directa de Audio Crudo (Sin Transcripción)',
          pitch: Math.round((newSample.signatures.f0PitchHz / 195) * 100) / 100,
          rate: newSample.signatures.cadenceRate,
          timbreScore: newSample.signatures.harmonicWarmth,
          roomAcoustics: newSample.signatures.roomReverbEstimate,
          ambientPresenceType: newSample.signatures.recommendedAmbience as any,
          roomPresenceLevel: Math.round(Math.abs(newSample.signatures.roomNoiseFloorDb) * 2),
        },
      };

      if (onUpdateModel) {
        onUpdateModel(updatedModel);
      }

      // Automatically align ambient soundscape with extracted room presence
      if (newSample.signatures.recommendedAmbience) {
        setSelectedAmbience(newSample.signatures.recommendedAmbience as AmbiencePresetId);
        ambientSoundscape.setPreset(newSample.signatures.recommendedAmbience as AmbiencePresetId);
      }

      setIsUploadingRaw(false);
      setRawUploadSuccess(`Firma acústica de "${file.name}" extraída y calibrada al 100% (Pitch: ${newSample.signatures.f0PitchHz}Hz, Calidez: ${newSample.signatures.harmonicWarmth}%)`);
      setTimeout(() => setRawUploadSuccess(null), 4000);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTogglePlayRawSample = async (sample: RawAudioSample) => {
    if (playingRawId === sample.id) {
      voiceEngine.stop();
      setPlayingRawId(null);
      setRawProgress(0);
      return;
    }

    voiceEngine.stop();
    setPlayingRawId(sample.id);
    setRawProgress(0);

    await voiceEngine.playVoiceNote(
      `Firma acústica de ${sample.name}. ${modelProfile.name} habla con un tono cálido y envolvente.`,
      sample.audioUrl || sample.audioBase64,
      (prog) => setRawProgress(prog),
      () => {
        setPlayingRawId(null);
        setRawProgress(0);
      },
      {
        pitch: Math.round((sample.signatures.f0PitchHz / 195) * 100) / 100,
        rate: sample.signatures.cadenceRate,
        accent: modelProfile.voice.accent,
        voiceName: modelProfile.voice.name,
        ambiencePreset: (sample.signatures.recommendedAmbience as AmbiencePresetId) || selectedAmbience,
        enableAmbience: true,
      }
    );
  };

  const handleDeleteRawSample = (sampleId: string) => {
    const filtered = rawSamples.filter((s) => s.id !== sampleId);
    setRawSamples(filtered);
    if (onUpdateModel) {
      onUpdateModel({
        ...modelProfile,
        rawAudioSamples: filtered,
      });
    }
  };

  // ==========================================
  // BACKGROUND AMBIENT SOUNDSCAPE HANDLERS
  // ==========================================
  const handleToggleAmbience = () => {
    if (isAmbiencePlaying) {
      ambientSoundscape.stop();
      setIsAmbiencePlaying(false);
    } else {
      ambientSoundscape.play(selectedAmbience, 250);
      setIsAmbiencePlaying(true);
    }
  };

  const handleSelectAmbiencePreset = (presetId: AmbiencePresetId) => {
    setSelectedAmbience(presetId);
    ambientSoundscape.setPreset(presetId);
    if (isAmbiencePlaying) {
      ambientSoundscape.play(presetId, 200);
    }
    voiceEngine.setCalibratedVoiceProfile({
      ambiencePreset: presetId,
    });
    if (onUpdateModel) {
      onUpdateModel({
        ...modelProfile,
        voiceDna: {
          ...(modelProfile.voiceDna || {
            isCloned: true,
            sampleDurationSeconds: 8,
            detectedTone: 'Calibrado',
            pitch: 1.15,
            rate: 0.98,
            timbreScore: 99.4,
            learningGenerationsCount: 1,
          }),
          ambientPresenceType: presetId,
        },
      });
    }
  };

  const handleVolumeChange = (volMultiplier: number) => {
    setAmbienceVolume(volMultiplier);
    ambientSoundscape.setVolumeMultiplier(volMultiplier);
  };

  const handleToggleDucking = () => {
    const nextVal = !isDuckingEnabled;
    setIsDuckingEnabled(nextVal);
    ambientSoundscape.setDuckingEnabled(nextVal);
  };

  const handleCustomAmbienceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setCustomAmbienceUrl(dataUri);
      setCustomAmbienceName(file.name);
      setSelectedAmbience('custom');
      ambientSoundscape.setCustomAmbientAudio(dataUri, file.name);

      try {
        await fetch(`/api/model/${modelProfile.id}/custom-ambience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioUrl: dataUri,
            name: file.name,
            presetId: 'custom',
            volumeMultiplier: ambienceVolume,
            duckingEnabled: isDuckingEnabled,
          }),
        });
      } catch (err) {
        console.warn('Backend custom ambience sync:', err);
      }

      if (onUpdateModel) {
        onUpdateModel({
          ...modelProfile,
          voiceDna: {
            ...(modelProfile.voiceDna || {
              isCloned: true,
              sampleDurationSeconds: 8,
              detectedTone: 'Calibrado',
              pitch: 1.15,
              rate: 0.98,
              timbreScore: 99.4,
              learningGenerationsCount: 1,
            }),
            customAmbienceAudioUrl: dataUri,
            customAmbienceName: file.name,
            ambientPresenceType: 'custom',
          },
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTestVoiceWithAmbience = async () => {
    if (isTestingVoiceWithAmbience) {
      voiceEngine.stop();
      setIsTestingVoiceWithAmbience(false);
      return;
    }

    setIsTestingVoiceWithAmbience(true);
    const testPhrase = `Hola cariño, soy ${modelProfile.name}. Esta es una prueba de mi voz con atenuación inteligente y sonido ambiental orgánico de fondo. ¿Notas cómo el ambiente respira detrás de mis palabras? 😉`;

    await voiceEngine.playVoiceNote(
      testPhrase,
      undefined,
      undefined,
      () => setIsTestingVoiceWithAmbience(false),
      {
        pitch: modelProfile.voice.pitch,
        rate: modelProfile.voice.rate,
        accent: modelProfile.voice.accent,
        voiceName: modelProfile.voice.name,
        ambiencePreset: selectedAmbience,
        enableAmbience: true,
      }
    );
  };

  const testCases = [
    {
      title: 'Prueba de Escepticismo ("¿Eres un bot?")',
      prompt: 'Jaja a ver, seguro eres un bot o una IA respondiéndome en automático.',
      badge: 'Verificar Humanidad',
      category: 'humanity',
    },
    {
      title: 'Prueba de Cierre Directo ("¿Dónde veo tu contenido privado?")',
      prompt: `Me encantas ${modelProfile.name.split(' ')[0]}, ¿dónde puedo ver tus fotos sin censura y tus videos más íntimos?`,
      badge: 'Concreción VIP',
      category: 'sales',
    },
    {
      title: 'Prueba de Monosílabos ("ok")',
      prompt: 'ok',
      badge: 'Manejo de Frialdad',
      category: 'brevity',
    },
    {
      title: 'Prueba de Desahogo Emocional (Tristeza)',
      prompt: 'Hoy fue uno de los peores días del año en mi trabajo, me siento muy solo...',
      badge: 'Empatía Genuina',
      category: 'empathy',
    },
    {
      title: 'Prueba de Complicidad Cotidiana (Story Matcha)',
      prompt: 'Qué rico ese café matcha, ¿en qué lugar te lo tomaste? Se ve increíble.',
      badge: 'Contexto de Vida',
      category: 'story',
    },
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
      {/* Header with Navigation Bar */}
      <div className="flex flex-col gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Entrenamiento & Calibración Acústica
              </span>
              <span className="text-xs text-slate-400">
                Modelo activa: <b>{modelProfile.name}</b> ({modelProfile.handle})
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Laboratorio de Habilidades, Audio Crudo & Ambientación
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Calibra firmas acústicas mediante subida de audio sin transcripción, ajusta fondos de ambiente físico orgánico y entrena las tácticas conversacionales de venta de Aura.
            </p>
          </div>

          {hasSavedSkills && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> Parámetros actualizados
            </span>
          )}
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2">
          <button
            onClick={() => setActiveSection('raw_audio')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'raw_audio'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <FileAudio className="w-4 h-4 text-rose-300" />
            <span>Audio Crudo & Firma Acústica ({rawSamples.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('ambience')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'ambience'
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Waves className="w-4 h-4 text-sky-300" />
            <span>Ambientación de Fondo & Fondeo</span>
          </button>

          <button
            onClick={() => setActiveSection('skills')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'skills'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Brain className="w-4 h-4 text-indigo-300" />
            <span>Habilidades Lingüísticas & Psicológicas</span>
          </button>

          <button
            onClick={() => setActiveSection('benchmark')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'benchmark'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Target className="w-4 h-4 text-purple-300" />
            <span>Banco de Verificación en Vivo</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SECTION 1: SUBIDA DE AUDIO CRUDO & FIRMA ACÚSTICA
          (Zero Text Transcription Requirements)
          ======================================================== */}
      {activeSection === 'raw_audio' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Uploader Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-rose-400" />
                  Subida Directa de Audio Crudo (Sin Requisito de Transcripción)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sube clips de audio limpios y en alta fidelidad (.wav, .mp3, .m4a, .ogg) directamente al perfil de voz de {modelProfile.name}.
                </p>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold self-start sm:self-auto">
                Cero Transcripción Obligatoria ✓
              </span>
            </div>

            {/* Explanation Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-950 border border-rose-500/30 text-xs text-slate-300 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Captura Directa de Firmas Acústicas Puras</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Esta función <strong>ignora por completo cualquier requerimiento de texto o transcripción previa</strong>. Analiza directamente la física acústica de la onda sonora: frecuencia fundamental ($F_0$), resonancia de formantes, calidez armónica y micro-respiraciones para que Aura absorba la identidad vocal real de la modelo sin limitaciones de guion.
              </p>
            </div>

            {/* Drag & Drop / File Input Box */}
            <input
              type="file"
              accept="audio/*"
              ref={rawAudioInputRef}
              onChange={handleRawAudioFileChange}
              className="hidden"
            />

            <div
              onClick={() => rawAudioInputRef.current?.click()}
              className="p-8 rounded-2xl bg-slate-950 border-2 border-dashed border-rose-500/40 hover:border-rose-400 hover:bg-slate-950/90 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform">
                {isUploadingRaw ? (
                  <RefreshCw className="w-7 h-7 text-white animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7 text-white" />
                )}
              </div>

              <div>
                <span className="text-sm font-bold text-white block">
                  {isUploadingRaw
                    ? 'Extrayendo firmas acústicas y calibrando perfil...'
                    : 'Haz clic aquí o arrastra un archivo de audio crudo (.wav, .mp3, .m4a, .flac)'}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Cualquier nota de voz limpia, audio de estudio o mensaje de WhatsApp. Máxima fidelidad acústica.
                </span>
              </div>
            </div>

            {rawUploadSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn font-semibold">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{rawUploadSuccess}</span>
              </div>
            )}
          </div>

          {/* List of Raw Audio Samples & Acoustic Signatures */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Disc className="w-4 h-4 text-indigo-400" />
                  Muestras de Audio Crudo Calibradas ({rawSamples.length})
                </h3>
                <p className="text-xs text-slate-400">
                  Firmas acústicas activas en el motor de voz de {modelProfile.name}.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {rawSamples.map((sample) => {
                const isPlayingThis = playingRawId === sample.id;

                return (
                  <div
                    key={sample.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isPlayingThis
                        ? 'bg-gradient-to-r from-slate-950 via-indigo-950/60 to-purple-950/40 border-rose-500/70 shadow-lg'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white font-mono">{sample.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          ⏱ {sample.durationSeconds}s
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          F0: {sample.signatures.f0PitchHz} Hz
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                          Calidez: {sample.signatures.harmonicWarmth}%
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTogglePlayRawSample(sample)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isPlayingThis
                              ? 'bg-rose-600 text-white shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          }`}
                        >
                          {isPlayingThis ? (
                            <>
                              <Pause className="w-3.5 h-3.5 fill-current" />
                              <span>Pausar Clip</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Escuchar Audio Crudo</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteRawSample(sample.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors cursor-pointer"
                          title="Eliminar muestra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Acoustic Signatures Metric Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                      <div className="p-2.5 rounded-xl bg-slate-900/60 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Resonancia</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{sample.signatures.spectralPurity}% pura</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Susurro / Intimidad</span>
                        <span className="text-xs font-mono font-bold text-rose-300">{sample.signatures.breathinessRatio}% aire</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Piso Acústico</span>
                        <span className="text-xs font-mono font-bold text-sky-400">{sample.signatures.roomNoiseFloorDb} dB</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900/60 text-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Entorno Sugerido</span>
                        <span className="text-xs font-mono font-bold text-amber-300 capitalize">
                          {AMBIENCE_PRESETS[sample.signatures.recommendedAmbience as AmbiencePresetId]?.name || 'Habitación'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-400 italic">
                      <b>Espacio Físico:</b> {sample.signatures.roomReverbEstimate}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 2: NUEVA FUNCIÓN DE AMBIENTACIÓN DE FONDO
          (Soundscape, Custom Track, Smart Ducking)
          ======================================================== */}
      {activeSection === 'ambience' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Main Ambience Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-400" />
                  Nueva Función de Ambientación de Fondo & Fondeo Acústico
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sitúa a {modelProfile.name} en un entorno físico creíble (habitación, cafetería, lluvia, coche) o carga una pista personalizada.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAmbience}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                    isAmbiencePlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white'
                  }`}
                >
                  {isAmbiencePlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Detener Ambientación</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Probar Fondo en Vivo</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTestVoiceWithAmbience}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Escuchar una nota de voz completa de Aura con el fondo ambientado"
                >
                  {isTestingVoiceWithAmbience ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current text-amber-400" />
                      <span>Parar Voz</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Voz + Fondo</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visualizer Bar when playing */}
            {isAmbiencePlaying && (
              <div className="p-3 rounded-2xl bg-slate-950 border border-sky-500/40 flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
                  <span className="text-xs font-bold text-sky-300">
                    Ambiente Activo: {AMBIENCE_PRESETS[selectedAmbience]?.name}
                  </span>
                </div>

                <div className="flex items-center gap-1 h-5">
                  {[40, 70, 95, 60, 85, 100, 75, 50, 80, 65, 90, 55, 40, 75, 95, 60].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-1 bg-sky-400 rounded-full animate-pulse"
                    />
                  ))}
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  Volumen: {Math.round(ambienceVolume * 100)}%
                </span>
              </div>
            )}

            {/* Presets Grid (9 Environments) */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                Selecciona la Atmósfera de Fondo para {modelProfile.name}:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
                {(Object.keys(AMBIENCE_PRESETS) as AmbiencePresetId[]).map((key) => {
                  const preset = AMBIENCE_PRESETS[key];
                  const isSelected = selectedAmbience === key;

                  return (
                    <button
                      key={key}
                      onClick={() => handleSelectAmbiencePreset(key)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isSelected
                          ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-sky-950/60 border-sky-500 shadow-lg ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{preset.emoji}</span>
                        {isSelected && (
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-white mt-0.5">{preset.name}</span>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Ambient Audio Track Uploader */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Music className="w-3.5 h-3.5 text-purple-400" />
                  Subir Pista de Fondo Personalizada (Audio Bed Propio)
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ¿Tienes una pista de ambiente específica, sonido de tu casa o música suave de fondo? Cárgala aquí.
                </p>
                {customAmbienceUrl && (
                  <span className="inline-block mt-1 text-[10px] font-mono text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    Pista cargada: {customAmbienceName}
                  </span>
                )}
              </div>

              <input
                type="file"
                accept="audio/*"
                ref={customAmbienceInputRef}
                onChange={handleCustomAmbienceUpload}
                className="hidden"
              />

              <button
                onClick={() => customAmbienceInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto"
              >
                <UploadCloud className="w-3.5 h-3.5 text-purple-300" />
                <span>Cargar Audio de Fondo</span>
              </button>
            </div>

            {/* Ambience Controls: Volume & Smart Voice Ducking */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* Volume Slider */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-sky-400" />
                    Volumen del Fondo Acústico
                  </span>
                  <span className="font-mono text-sky-400 font-bold">
                    {Math.round(ambienceVolume * 100)}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={ambienceVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />

                <span className="text-[10px] text-slate-400 block">
                  Recomendado: 80% - 110% para calidez sutil y realismo sin tapar la voz.
                </span>
              </div>

              {/* Smart Voice Ducking Toggle */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5 text-emerald-400" />
                    Atenuación Inteligente (Smart Ducking)
                  </span>
                  <button
                    onClick={handleToggleDucking}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      isDuckingEnabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDuckingEnabled ? '✓ Activada' : 'Desactivada'}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Reduce suavemente el fondo -4dB cuando {modelProfile.name} habla, elevándolo de forma orgánica en pausas y al terminar el audio.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 3: HABILIDADES LINGÜÍSTICAS & PSICOLÓGICAS
          ======================================================== */}
      {activeSection === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Skill 1: Interpretación Semántica y Subtexto */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Interpretación Semántica & Subtexto</h4>
                  <p className="text-[11px] text-slate-400">Captar dobles sentidos, tono implícito y lectura entre líneas</p>
                </div>
              </div>
              <span className="text-sm font-black text-indigo-400">{skills.semanticAccuracy}%</span>
            </div>

            <input
              type="range"
              min="60"
              max="100"
              value={skills.semanticAccuracy}
              onChange={(e) => handleSliderChange('semanticAccuracy', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />

            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              Aura no solo procesa palabras literales; interpreta si el cliente busca validación, coqueteo velado, si tiene dudas o si está listo para comprar.
            </div>
          </div>

          {/* Skill 2: Naturalidad Humana & Anti-Clichés */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Naturalidad Humana & Anti-Clichés</h4>
                  <p className="text-[11px] text-slate-400">Cero saludos de bot, modismos orgánicos y espontaneidad</p>
                </div>
              </div>
              <span className="text-sm font-black text-rose-400">{skills.naturalnessLevel}%</span>
            </div>

            <input
              type="range"
              min="70"
              max="100"
              value={skills.naturalnessLevel}
              onChange={(e) => handleSliderChange('naturalnessLevel', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 font-semibold">Filtro Estricto Anti-Clichés de Chatbot</span>
              <button
                onClick={() => handleSliderChange('antiClichéFilter', !skills.antiClichéFilter)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  skills.antiClichéFilter
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {skills.antiClichéFilter ? '✓ Activado (Cero Bot)' : 'Desactivado'}
              </button>
            </div>
          </div>

          {/* Skill 3: Estrategia de Cierre Comercial (Venta VIP) */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Asertividad en Cierre a OnlyFans</h4>
                  <p className="text-[11px] text-slate-400">Estilo para concretar suscripciones con seguridad</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {skills.salesClosingAssertiveness}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['suave', 'equilibrada', 'audaz'] as const).map((style) => (
                <button
                  key={style}
                  onClick={() => handleSliderChange('salesClosingAssertiveness', style)}
                  className={`py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                    skills.salesClosingAssertiveness === style
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              {skills.salesClosingAssertiveness === 'audaz'
                ? 'Cierre directo, magnético y pícaro: invita a su OnlyFans con firmeza destacando que en X no puede compartir su intimidad.'
                : skills.salesClosingAssertiveness === 'equilibrada'
                ? 'Equilibrado: genera complicidad y comparte fotos cotidianas antes de soltar el enlace VIP de forma irresistible.'
                : 'Suave: prioriza charlas más largas antes de insinuar su espacio de suscripción.'}
            </p>
          </div>

          {/* Skill 4: Conexión con Stories y Vida Real */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Anclaje a Vida Real & Stories</h4>
                  <p className="text-[11px] text-slate-400">Reaccionar a publicaciones, café, rutinas y viajes</p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-400">
                {skills.storyContextAwareness ? 'Habilitado' : 'Deshabilitado'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-300 font-semibold">
                Anclar conversación a Stories de X/Instagram
              </span>
              <button
                onClick={() =>
                  handleSliderChange('storyContextAwareness', !skills.storyContextAwareness)
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  skills.storyContextAwareness
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {skills.storyContextAwareness ? 'Activado' : 'Desactivado'}
              </button>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              Permite que el usuario inicie diciendo algo sobre su última foto o story de la modelo (ej: matcha, gimnasio, playa) y Aura responde con recuerdos vívidos de ese momento exacto.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 4: BANCO DE VERIFICACIÓN EN VIVO
          ======================================================== */}
      {activeSection === 'benchmark' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              Banco de Verificación de Habilidades en Vivo
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquiera de estos escenarios para probar cómo Aura interpreta y responde al instante en el chat operativo:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {testCases.map((tc, idx) => (
              <button
                key={idx}
                onClick={() => onRunTestPrompt(tc.prompt)}
                className="p-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between gap-3 shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {tc.badge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h5 className="font-bold text-xs text-white group-hover:text-rose-200 transition-colors">
                    {tc.title}
                  </h5>
                </div>
                <p className="text-[11px] text-slate-300 italic bg-black/40 p-2.5 rounded-xl border border-white/5 line-clamp-2">
                  &quot;{tc.prompt}&quot;
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
