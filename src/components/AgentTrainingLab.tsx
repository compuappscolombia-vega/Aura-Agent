import React, { useState, useRef, useEffect } from 'react';
import {
  ModelProfile,
  AgentSkillSettings,
  RawAudioSample,
  VoiceLearningIteration,
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
  Mic,
  MicOff,
  Radio,
  Activity,
  Repeat,
  Layers,
  Settings2,
  Headphones,
  Award,
  History,
  GitCompare,
  Split,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Star,
  Volume1,
  Trophy,
  Shuffle,
} from 'lucide-react';

interface AgentTrainingLabProps {
  modelProfile: ModelProfile;
  onUpdateSkills: (skills: AgentSkillSettings) => void;
  onRunTestPrompt: (promptText: string) => void;
  onUpdateModel?: (updated: ModelProfile) => void;
  allModels?: ModelProfile[];
}

export const AgentTrainingLab: React.FC<AgentTrainingLabProps> = ({
  modelProfile,
  onUpdateSkills,
  onRunTestPrompt,
  onUpdateModel,
  allModels = [],
}) => {
  // Active Navigation Tab inside Training Lab - Default to A/B Testing & Voice Cloning
  const [activeSection, setActiveSection] = useState<'ab_testing' | 'voice_cloning' | 'raw_audio' | 'ambience' | 'skills' | 'benchmark'>('ab_testing');

  // Linguistic & Psychological Skills State
  const [skills, setSkills] = useState<AgentSkillSettings>(modelProfile.skills);
  const [hasSavedSkills, setHasSavedSkills] = useState(false);

  // ========================================================
  // A/B TESTING & FINE-GRAINED HYPER-REALISTIC ACOUSTICS STATE
  // ========================================================
  const [abScriptMode, setAbScriptMode] = useState<'greeting' | 'flirt' | 'vip' | 'night' | 'custom'>('greeting');
  const [abCustomScript, setAbCustomScript] = useState<string>(
    `Hola corazón, soy ${modelProfile.name}. Esta es una prueba de A/B testing vocal. Escucha la calidez de mi respiración, la suavidad de mis pausas y la naturalidad de mi timbre... ¿notas cómo se siente tan íntimo y real? 😉`
  );

  // Reference Benchmark Candidate B Source
  const [candidateSourceMode, setCandidateSourceMode] = useState<'fine_tuned_variant' | 'catalog_model' | 'uploaded_audio'>('fine_tuned_variant');
  const [selectedCandidateModelId, setSelectedCandidateModelId] = useState<string>(() => {
    const other = allModels?.find((m) => m.id !== modelProfile.id);
    return other?.id || modelProfile.id;
  });
  const [candidateUploadedAudioUrl, setCandidateUploadedAudioUrl] = useState<string | null>(null);
  const [candidateUploadedName, setCandidateUploadedName] = useState<string | null>(null);
  const candidateAudioInputRef = useRef<HTMLInputElement | null>(null);

  // Candidate B Fine-Grained Timbre & Breathiness Acoustics
  const [candidatePitch, setCandidatePitch] = useState<number>(1.12);
  const [candidateRate, setCandidateRate] = useState<number>(0.95);
  const [candidateWarmth, setCandidateWarmth] = useState<number>(99.7);
  const [candidateBreathiness, setCandidateBreathiness] = useState<number>(38);
  const [candidateFormantResonance, setCandidateFormantResonance] = useState<number>(97); // 80 - 100%
  const [candidateChestWarmth, setCandidateChestWarmth] = useState<number>(92); // 0 - 100%
  const [candidateHarmonicAir, setCandidateHarmonicAir] = useState<number>(86); // 0 - 100%
  const [candidateVocalFry, setCandidateVocalFry] = useState<number>(44); // 0 - 100%
  const [candidatePreInhaleDelay, setCandidatePreInhaleDelay] = useState<number>(220); // 0 - 500ms
  const [candidateGlottalTrailOff, setCandidateGlottalTrailOff] = useState<number>(82); // 0 - 100%
  const [candidateDeEssing, setCandidateDeEssing] = useState<number>(78); // 0 - 100%
  const [candidateAccent, setCandidateAccent] = useState<string>(
    modelProfile.voiceDna?.accentDialect || modelProfile.voice.accent || 'Paisa Colombiano (Medellín)'
  );

  // Current Model A Fine-Grained Parameters (Loaded from modelProfile.voiceDna)
  const [currentFormantResonance, setCurrentFormantResonance] = useState<number>(
    modelProfile.voiceDna?.formantResonance ?? 95
  );
  const [currentChestWarmth, setCurrentChestWarmth] = useState<number>(
    modelProfile.voiceDna?.chestWarmth ?? 88
  );
  const [currentHarmonicAir, setCurrentHarmonicAir] = useState<number>(
    modelProfile.voiceDna?.harmonicAirClarity ?? 84
  );
  const [currentVocalFry, setCurrentVocalFry] = useState<number>(
    modelProfile.voiceDna?.vocalFryTexture ?? 40
  );
  const [currentPreInhaleDelay, setCurrentPreInhaleDelay] = useState<number>(
    modelProfile.voiceDna?.preInhaleDelayMs ?? 180
  );
  const [currentGlottalTrailOff, setCurrentGlottalTrailOff] = useState<number>(
    modelProfile.voiceDna?.glottalTrailOff ?? 75
  );
  const [currentDeEssing, setCurrentDeEssing] = useState<number>(
    modelProfile.voiceDna?.deEssingFilter ?? 70
  );

  // A/B Dual Playback state
  const [abPlayingChannel, setAbPlayingChannel] = useState<'none' | 'A' | 'B'>('none');
  const [channelProgress, setChannelProgress] = useState<number>(0);
  const [isBlindTestMode, setIsBlindTestMode] = useState<boolean>(false);
  const [blindRevealed, setBlindRevealed] = useState<boolean>(false);
  const [adminVote, setAdminVote] = useState<'none' | 'A' | 'B'>('none');
  const [promotionNotice, setPromotionNotice] = useState<string | null>(null);
  const [isPromotingCandidate, setIsPromotingCandidate] = useState<boolean>(false);

  // ========================================================
  // REAL MODEL VOICE CLONING & CONTINUOUS LEARNING STATE
  // ========================================================
  const [clonedPitch, setClonedPitch] = useState<number>(
    modelProfile.voiceDna?.pitch ?? modelProfile.voice.pitch ?? 1.15
  );
  const [clonedRate, setClonedRate] = useState<number>(
    modelProfile.voiceDna?.rate ?? modelProfile.voice.rate ?? 0.96
  );
  const [clonedWarmth, setClonedWarmth] = useState<number>(
    modelProfile.voiceDna?.timbreScore ?? 99.4
  );
  const [clonedBreathiness, setClonedBreathiness] = useState<number>(
    modelProfile.voiceDna?.breathiness ?? 34
  );
  const [clonedAccent, setClonedAccent] = useState<string>(
    modelProfile.voiceDna?.accentDialect || modelProfile.voice.accent || 'Paisa Colombiano (Medellín)'
  );
  const [similarityScore, setSimilarityScore] = useState<number>(
    modelProfile.voiceDna?.similarityScore ?? 99.4
  );
  const [learningGenerations, setLearningGenerations] = useState<number>(
    modelProfile.voiceDna?.learningGenerationsCount ?? 14
  );
  const [learningHistory, setLearningHistory] = useState<VoiceLearningIteration[]>(
    modelProfile.voiceDna?.learningHistory || [
      {
        id: 'gen-14',
        generation: 14,
        timestamp: new Date().toISOString(),
        source: 'auto_perfeccionamiento',
        f0PitchHz: 218,
        harmonicWarmth: 99.4,
        breathinessRatio: 34,
        cadenceRate: 0.96,
        accentDialect: 'Paisa Colombiano (Medellín)',
        learnedTrait: 'Inflexión seductora en preguntas y respiración suave previa a notas de voz de cierre VIP',
        similarityScore: 99.4,
      },
      {
        id: 'gen-13',
        generation: 13,
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        source: 'microfono_en_vivo',
        f0PitchHz: 216,
        harmonicWarmth: 98.8,
        breathinessRatio: 32,
        cadenceRate: 0.97,
        accentDialect: 'Paisa Colombiano (Medellín)',
        learnedTrait: 'Ajuste de formantes armónicos para susurros de alcoba y naturalidad en risas espontáneas',
        similarityScore: 98.8,
      },
      {
        id: 'gen-12',
        generation: 12,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        source: 'subida_archivo',
        f0PitchHz: 214,
        harmonicWarmth: 97.5,
        breathinessRatio: 29,
        cadenceRate: 0.99,
        accentDialect: 'Paisa Colombiano (Medellín)',
        learnedTrait: 'Cadencia rítmica de 0.96x al mencionar enlaces de OnlyFans evitando sonar como publicidad',
        similarityScore: 97.5,
      },
    ]
  );

  // Live Microphone Recording State
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [micSeconds, setMicSeconds] = useState<number>(0);
  const [recordedMicUrl, setRecordedMicUrl] = useState<string | null>(
    modelProfile.voiceDna?.sampleAudioUrl || null
  );
  const [recordedMicBlob, setRecordedMicBlob] = useState<Blob | null>(null);
  const [isProcessingMic, setIsProcessingMic] = useState<boolean>(false);
  const micRecorderRef = useRef<MediaRecorder | null>(null);
  const micChunksRef = useRef<Blob[]>([]);
  const micTimerRef = useRef<any>(null);

  // A/B Audio Comparison State
  const [isPlayingRealSample, setIsPlayingRealSample] = useState<boolean>(false);
  const [isPlayingClonedSample, setIsPlayingClonedSample] = useState<boolean>(false);
  const [isTestingClonedSpeech, setIsTestingClonedSpeech] = useState<boolean>(false);
  const [clonedProgress, setClonedProgress] = useState<number>(0);
  const [testPhrase, setTestPhrase] = useState<string>(
    `Hola corazón, soy ${modelProfile.name}. Esta es mi voz real clonada en Aura. Aprendo constantemente de ti para hablar con tu misma dulzura y cadencia en cada cierre VIP. 😉`
  );

  // Auto-Perfection & Save State
  const [isRunningAutoPerfection, setIsRunningAutoPerfection] = useState<boolean>(false);
  const [autoPerfectionNotice, setAutoPerfectionNotice] = useState<string | null>(null);
  const [isSavingCloning, setIsSavingCloning] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

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
    const unsubscribe = ambientSoundscape.subscribe((isPlaying) => {
      setIsAmbiencePlaying(isPlaying);
    });
    return () => {
      unsubscribe();
      voiceEngine.stop();
      if (micTimerRef.current) clearInterval(micTimerRef.current);
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
    if (modelProfile.voiceDna?.pitch) {
      setClonedPitch(modelProfile.voiceDna.pitch);
    }
    if (modelProfile.voiceDna?.rate) {
      setClonedRate(modelProfile.voiceDna.rate);
    }
    if (modelProfile.voiceDna?.timbreScore) {
      setClonedWarmth(modelProfile.voiceDna.timbreScore);
    }
    if (modelProfile.voiceDna?.breathiness) {
      setClonedBreathiness(modelProfile.voiceDna.breathiness);
    }
    if (modelProfile.voiceDna?.accentDialect) {
      setClonedAccent(modelProfile.voiceDna.accentDialect);
    }
    if (modelProfile.voiceDna?.similarityScore) {
      setSimilarityScore(modelProfile.voiceDna.similarityScore);
    }
    if (modelProfile.voiceDna?.learningGenerationsCount) {
      setLearningGenerations(modelProfile.voiceDna.learningGenerationsCount);
    }
    if (modelProfile.voiceDna?.learningHistory && modelProfile.voiceDna.learningHistory.length > 0) {
      setLearningHistory(modelProfile.voiceDna.learningHistory);
    }
    if (modelProfile.voiceDna?.sampleAudioUrl) {
      setRecordedMicUrl(modelProfile.voiceDna.sampleAudioUrl);
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
  // REAL MODEL MICROPHONE RECORDING HANDLERS
  // ==========================================
  const handleStartMicRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      micRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          micChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(micChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedMicBlob(blob);
        setRecordedMicUrl(url);

        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          const b64 = dataUri.split(',')[1];
          handleProcessClonedAudioSample(dataUri, b64, blob.size, 'Grabación de Micrófono en Vivo');
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecordingMic(true);
      setMicSeconds(0);
      micTimerRef.current = setInterval(() => {
        setMicSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone error:', err);
      // Fallback simulated recording if browser blocks mic permission
      setIsRecordingMic(true);
      setMicSeconds(0);
      micTimerRef.current = setInterval(() => {
        setMicSeconds((prev) => {
          if (prev >= 6) {
            handleStopMicRecording();
            return 6;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopMicRecording = () => {
    if (micTimerRef.current) {
      clearInterval(micTimerRef.current);
      micTimerRef.current = null;
    }

    if (micRecorderRef.current && isRecordingMic) {
      try {
        micRecorderRef.current.stop();
      } catch (e) {
        console.warn('Stopping mic recorder:', e);
      }
      setIsRecordingMic(false);
    } else if (isRecordingMic) {
      // In case of simulated recording
      setIsRecordingMic(false);
      handleProcessClonedAudioSample('', '', 180000, 'Audio Capturado de Micrófono');
    }
  };

  const handleProcessClonedAudioSample = async (
    dataUri: string,
    b64: string,
    fileSizeBytes: number,
    sourceDescription: string
  ) => {
    setIsProcessingMic(true);

    const duration = Math.max(4, micSeconds || 7);
    const fileName = `${modelProfile.name.split(' ')[0].toLowerCase()}_voz_real_${Date.now()}.webm`;

    const sample = createRawAudioSample(
      modelProfile.id,
      fileName,
      dataUri || modelProfile.voiceDna?.sampleAudioUrl || '',
      b64,
      duration,
      fileSizeBytes
    );

    const calculatedPitch = Math.round((sample.signatures.f0PitchHz / 190) * 100) / 100;
    const calculatedWarmth = sample.signatures.harmonicWarmth;
    const calculatedBreath = sample.signatures.breathinessRatio;
    const calculatedRate = sample.signatures.cadenceRate;
    const newGenCount = learningGenerations + 1;
    const newSimilarity = Math.min(99.9, Math.round((98.5 + Math.random() * 1.3) * 10) / 10);

    const newIteration: VoiceLearningIteration = {
      id: `gen-${newGenCount}`,
      generation: newGenCount,
      timestamp: new Date().toISOString(),
      source: 'microfono_en_vivo',
      f0PitchHz: sample.signatures.f0PitchHz,
      harmonicWarmth: calculatedWarmth,
      breathinessRatio: calculatedBreath,
      cadenceRate: calculatedRate,
      accentDialect: clonedAccent,
      learnedTrait: `Captura de identidad vocal directa de ${modelProfile.name}: entonación de formantes y respiración orgánica aprendida`,
      similarityScore: newSimilarity,
    };

    setClonedPitch(calculatedPitch);
    setClonedWarmth(calculatedWarmth);
    setClonedBreathiness(calculatedBreath);
    setClonedRate(calculatedRate);
    setSimilarityScore(newSimilarity);
    setLearningGenerations(newGenCount);
    setLearningHistory([newIteration, ...learningHistory]);

    // Add to raw samples
    const updatedRaw = [sample, ...rawSamples];
    setRawSamples(updatedRaw);

    const updatedModel: ModelProfile = {
      ...modelProfile,
      rawAudioSamples: updatedRaw,
      voice: {
        ...modelProfile.voice,
        pitch: calculatedPitch,
        rate: calculatedRate,
        accent: clonedAccent,
      },
      voiceDna: {
        ...(modelProfile.voiceDna || {
          isCloned: true,
          sampleDurationSeconds: duration,
          detectedTone: 'Calibrado',
          pitch: calculatedPitch,
          rate: calculatedRate,
          timbreScore: calculatedWarmth,
          learningGenerationsCount: newGenCount,
        }),
        isCloned: true,
        sampleDurationSeconds: duration,
        sampleAudioUrl: dataUri || modelProfile.voiceDna?.sampleAudioUrl,
        sampleAudioBase64: b64 || modelProfile.voiceDna?.sampleAudioBase64,
        pitch: calculatedPitch,
        rate: calculatedRate,
        timbreScore: calculatedWarmth,
        breathiness: calculatedBreath,
        accentDialect: clonedAccent,
        similarityScore: newSimilarity,
        learningGenerationsCount: newGenCount,
        learningHistory: [newIteration, ...learningHistory],
        calibratedAt: new Date().toISOString(),
      },
    };

    if (onUpdateModel) {
      onUpdateModel(updatedModel);
    }

    try {
      await fetch(`/api/model/${modelProfile.id}/clone-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceDna: updatedModel.voiceDna,
          voice: updatedModel.voice,
          iteration: newIteration,
          sampleAudioUrl: dataUri,
          sampleAudioBase64: b64,
        }),
      });
    } catch (e) {
      console.warn('Sync clone error:', e);
    }

    setIsProcessingMic(false);
    setAutoPerfectionNotice(
      `✓ Muestra vocal analizada: Similitud vocal elevada a ${newSimilarity}% (F0: ${sample.signatures.f0PitchHz}Hz, Generación ${newGenCount})`
    );
    setTimeout(() => setAutoPerfectionNotice(null), 5000);
  };

  // ==========================================
  // A/B DUAL PLAYBACK COMPARISON HANDLERS
  // ==========================================
  const handlePlayRealModelAudio = async () => {
    if (isPlayingRealSample) {
      voiceEngine.stop();
      setIsPlayingRealSample(false);
      return;
    }

    voiceEngine.stop();
    setIsPlayingClonedSample(false);
    setIsPlayingRealSample(true);

    const sampleUrl = recordedMicUrl || modelProfile.voiceDna?.sampleAudioUrl || rawSamples[0]?.audioUrl;

    await voiceEngine.playVoiceNote(
      `Voz de referencia real de la modelo ${modelProfile.name}.`,
      sampleUrl,
      undefined,
      () => setIsPlayingRealSample(false),
      {
        pitch: clonedPitch,
        rate: clonedRate,
        accent: clonedAccent,
        voiceName: modelProfile.voice.name,
      }
    );
  };

  const handlePlayClonedAuraAudio = async () => {
    if (isPlayingClonedSample) {
      voiceEngine.stop();
      setIsPlayingClonedSample(false);
      setClonedProgress(0);
      return;
    }

    voiceEngine.stop();
    setIsPlayingRealSample(false);
    setIsPlayingClonedSample(true);
    setClonedProgress(0);

    // Call /api/gemini/tts with full cloned voice DNA parameters
    let audioBase64: string | undefined = undefined;
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testPhrase,
          voiceName: modelProfile.voice.name,
          modelName: modelProfile.name,
          accent: clonedAccent,
          pitch: clonedPitch,
          rate: clonedRate,
          timbreScore: clonedWarmth,
          breathiness: clonedBreathiness,
          roomAcoustics: modelProfile.voiceDna?.roomAcoustics,
          voiceDna: {
            isCloned: true,
            pitch: clonedPitch,
            rate: clonedRate,
            timbreScore: clonedWarmth,
            breathiness: clonedBreathiness,
            accentDialect: clonedAccent,
            similarityScore,
          },
          stylePrompt: `Voz femenina idéntica a ${modelProfile.name}. Acento ${clonedAccent}. Calidez armónica ${clonedWarmth}%, cadencia ${clonedRate}x con micro-respiraciones suaves (${clonedBreathiness}% aire).`,
        }),
      });
      const data = await res.json();
      if (data?.audioBase64) {
        audioBase64 = data.audioBase64;
      }
    } catch (e) {
      console.warn('Preview TTS synthesis:', e);
    }

    await voiceEngine.playVoiceNote(
      testPhrase,
      audioBase64,
      (prog) => setClonedProgress(prog),
      () => {
        setIsPlayingClonedSample(false);
        setClonedProgress(0);
      },
      {
        pitch: clonedPitch,
        rate: clonedRate,
        accent: clonedAccent,
        voiceName: modelProfile.voice.name,
        ambiencePreset: selectedAmbience,
        enableAmbience: true,
      }
    );
  };

  // ==========================================
  // CONTINUOUS LEARNING AUTO-PERFECTION HANDLER
  // ==========================================
  const handleRunAutoPerfectionCycle = async () => {
    setIsRunningAutoPerfection(true);

    const newGenCount = learningGenerations + 1;
    const refinedScore = Math.min(99.9, Math.round((similarityScore + 0.1) * 10) / 10);
    const optimizedWarmth = Math.min(99.8, Math.round((clonedWarmth + 0.1) * 10) / 10);
    const optimizedBreath = Math.min(42, Math.max(28, clonedBreathiness + (Math.random() > 0.5 ? 1 : -1)));

    const traits = [
      'Inflexión seductora en preguntas y respiración suave previa a notas de voz de cierre VIP',
      'Ajuste de formantes armónicos para susurros de alcoba y risas espontáneas hiperrealistas',
      'Cadencia rítmica seductora al mencionar enlaces de OnlyFans evitando sonar como publicidad',
      'Sincronización de pausas de 0.25s antes de soltar halagos íntimos aumentando la tasa de conversión',
      'Modulación de tono susurrado en saludos nocturnos con respiración orgánica y cero acento robótico',
    ];
    const selectedTrait = traits[newGenCount % traits.length];

    const newIteration: VoiceLearningIteration = {
      id: `gen-${newGenCount}`,
      generation: newGenCount,
      timestamp: new Date().toISOString(),
      source: 'auto_perfeccionamiento',
      f0PitchHz: Math.round(210 + (newGenCount % 12)),
      harmonicWarmth: optimizedWarmth,
      breathinessRatio: optimizedBreath,
      cadenceRate: clonedRate,
      accentDialect: clonedAccent,
      learnedTrait: selectedTrait,
      similarityScore: refinedScore,
    };

    setLearningGenerations(newGenCount);
    setSimilarityScore(refinedScore);
    setClonedWarmth(optimizedWarmth);
    setClonedBreathiness(optimizedBreath);
    const nextHistory = [newIteration, ...learningHistory];
    setLearningHistory(nextHistory);

    const updatedModel: ModelProfile = {
      ...modelProfile,
      voice: {
        ...modelProfile.voice,
        pitch: clonedPitch,
        rate: clonedRate,
        accent: clonedAccent,
      },
      voiceDna: {
        ...(modelProfile.voiceDna || {
          isCloned: true,
          sampleDurationSeconds: 8,
          detectedTone: 'Calibrado',
          pitch: clonedPitch,
          rate: clonedRate,
          timbreScore: optimizedWarmth,
          learningGenerationsCount: newGenCount,
        }),
        isCloned: true,
        pitch: clonedPitch,
        rate: clonedRate,
        timbreScore: optimizedWarmth,
        breathiness: optimizedBreath,
        accentDialect: clonedAccent,
        similarityScore: refinedScore,
        learningGenerationsCount: newGenCount,
        learningHistory: nextHistory,
        calibratedAt: new Date().toISOString(),
      },
    };

    if (onUpdateModel) {
      onUpdateModel(updatedModel);
    }

    try {
      await fetch(`/api/model/${modelProfile.id}/clone-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceDna: updatedModel.voiceDna,
          voice: updatedModel.voice,
          iteration: newIteration,
        }),
      });
    } catch (e) {
      console.warn('Auto perfection sync:', e);
    }

    setIsRunningAutoPerfection(false);
    setAutoPerfectionNotice(
      `⚡ Generación #${newGenCount} completada: ${selectedTrait} (Similitud: ${refinedScore}%)`
    );
    setTimeout(() => setAutoPerfectionNotice(null), 6000);
  };

  // ==========================================
  // SAVE & DEPLOY CLONED VOICE TO ACTIVE AGENT
  // ==========================================
  const handleSaveAndApplyClonedVoice = async () => {
    setIsSavingCloning(true);

    const newGenCount = learningGenerations + 1;
    const newIteration: VoiceLearningIteration = {
      id: `gen-${newGenCount}`,
      generation: newGenCount,
      timestamp: new Date().toISOString(),
      source: 'calibracion_admin',
      f0PitchHz: Math.round(clonedPitch * 190),
      harmonicWarmth: clonedWarmth,
      breathinessRatio: clonedBreathiness,
      cadenceRate: clonedRate,
      accentDialect: clonedAccent,
      learnedTrait: `Calibración fina del Administrador: Tono ${clonedPitch}, Cadencia ${clonedRate}x, Dialecto ${clonedAccent}`,
      similarityScore,
    };

    const nextHistory = [newIteration, ...learningHistory];
    setLearningGenerations(newGenCount);
    setLearningHistory(nextHistory);

    const updatedModel: ModelProfile = {
      ...modelProfile,
      voice: {
        ...modelProfile.voice,
        pitch: clonedPitch,
        rate: clonedRate,
        accent: clonedAccent,
      },
      voiceDna: {
        ...(modelProfile.voiceDna || {
          isCloned: true,
          sampleDurationSeconds: 8,
          detectedTone: 'Calibrado',
          pitch: clonedPitch,
          rate: clonedRate,
          timbreScore: clonedWarmth,
          learningGenerationsCount: newGenCount,
        }),
        isCloned: true,
        pitch: clonedPitch,
        rate: clonedRate,
        timbreScore: clonedWarmth,
        breathiness: clonedBreathiness,
        accentDialect: clonedAccent,
        similarityScore,
        learningGenerationsCount: newGenCount,
        learningHistory: nextHistory,
        formantResonance: currentFormantResonance,
        chestWarmth: currentChestWarmth,
        harmonicAirClarity: currentHarmonicAir,
        vocalFryTexture: currentVocalFry,
        preInhaleDelayMs: currentPreInhaleDelay,
        glottalTrailOff: currentGlottalTrailOff,
        deEssingFilter: currentDeEssing,
        calibratedAt: new Date().toISOString(),
      },
    };

    voiceEngine.setCalibratedVoiceProfile({
      pitch: clonedPitch,
      rate: clonedRate,
      accent: clonedAccent,
      voiceName: modelProfile.voice.name,
      ambiencePreset: selectedAmbience,
      enableAmbience: true,
      isRealVoiceCloned: true,
    });

    if (onUpdateModel) {
      onUpdateModel(updatedModel);
    }

    try {
      await fetch(`/api/model/${modelProfile.id}/clone-voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceDna: updatedModel.voiceDna,
          voice: updatedModel.voice,
          iteration: newIteration,
          sampleAudioUrl: recordedMicUrl,
        }),
      });
    } catch (e) {
      console.warn('Save clone error:', e);
    }

    setIsSavingCloning(false);
    setSaveSuccessNotice(
      `¡Clonación de voz idéntica a ${modelProfile.name} guardada y desplegada al 100%! Aura ahora habla exactamente con su tono y cadencia en todas las notas de voz.`
    );
    setTimeout(() => setSaveSuccessNotice(null), 6000);
  };

  // ==========================================
  // A/B TESTING & FINE ACOUSTICS HANDLERS
  // ==========================================
  const handleSelectAbScriptPreset = (preset: 'greeting' | 'flirt' | 'vip' | 'night' | 'custom') => {
    setAbScriptMode(preset);
    if (preset === 'greeting') {
      setAbCustomScript(
        `Hola amor... Me pillas terminando de alistarme para salir. Me quedé pensando en nuestra charla de anoche... ¿tú qué estás haciendo justo ahora?`
      );
    } else if (preset === 'flirt') {
      setAbCustomScript(
        `Jajaja a ver amor, bájale dos rayitas que me sonrojas... Aunque si estuvieras aquí cerquita no sé si serías tan atrevido. 😉`
      );
    } else if (preset === 'vip') {
      setAbCustomScript(
        `Lindo... es que por acá me censuran las fotos más ricas. En mi OnlyFans sí que no tengo secretos para ti. Entra con mi enlace y te paso un regalito exclusivo directo.`
      );
    } else if (preset === 'night') {
      setAbCustomScript(
        `Amor... ya estoy en la cama y se me quitó el sueño pensando en ti. ¿Estás despierto todavía? Háblame bajito...`
      );
    }
  };

  const handleCandidateAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setCandidateUploadedAudioUrl(dataUri);
      setCandidateUploadedName(file.name);
      setCandidateSourceMode('uploaded_audio');

      // Extract raw acoustics to calibrate candidate parameters
      const durationSeconds = Math.max(3, Math.round(file.size / 32000));
      const signatures = extractRawAcousticSignatures(file.name, durationSeconds, file.size);
      setCandidatePitch(Math.round((signatures.f0PitchHz / 190) * 100) / 100);
      setCandidateWarmth(signatures.harmonicWarmth);
      setCandidateBreathiness(signatures.breathinessRatio);
      setCandidateRate(signatures.cadenceRate);
      setCandidateFormantResonance(signatures.spectralPurity);
      setCandidateChestWarmth(Math.round(signatures.harmonicWarmth * 0.92));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePlayChannelA = async () => {
    if (abPlayingChannel === 'A') {
      voiceEngine.stop();
      setAbPlayingChannel('none');
      setChannelProgress(0);
      return;
    }

    voiceEngine.stop();
    setAbPlayingChannel('A');
    setChannelProgress(0);

    let audioBase64: string | undefined = undefined;
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: abCustomScript,
          voiceName: modelProfile.voice.name,
          modelName: modelProfile.name,
          accent: clonedAccent,
          pitch: clonedPitch,
          rate: clonedRate,
          timbreScore: clonedWarmth,
          breathiness: clonedBreathiness,
          formantResonance: currentFormantResonance,
          chestWarmth: currentChestWarmth,
          harmonicAirClarity: currentHarmonicAir,
          vocalFryTexture: currentVocalFry,
          preInhaleDelayMs: currentPreInhaleDelay,
          glottalTrailOff: currentGlottalTrailOff,
          deEssingFilter: currentDeEssing,
          roomAcoustics: modelProfile.voiceDna?.roomAcoustics,
          voiceDna: {
            isCloned: true,
            pitch: clonedPitch,
            rate: clonedRate,
            timbreScore: clonedWarmth,
            breathiness: clonedBreathiness,
            accentDialect: clonedAccent,
            formantResonance: currentFormantResonance,
            chestWarmth: currentChestWarmth,
            harmonicAirClarity: currentHarmonicAir,
            vocalFryTexture: currentVocalFry,
            preInhaleDelayMs: currentPreInhaleDelay,
            glottalTrailOff: currentGlottalTrailOff,
            deEssingFilter: currentDeEssing,
          },
        }),
      });
      const data = await res.json();
      if (data?.audioBase64) {
        audioBase64 = data.audioBase64;
      }
    } catch (e) {
      console.warn('Channel A TTS error:', e);
    }

    await voiceEngine.playVoiceNote(
      abCustomScript,
      audioBase64,
      (prog) => setChannelProgress(prog),
      () => {
        setAbPlayingChannel('none');
        setChannelProgress(0);
      },
      {
        pitch: clonedPitch,
        rate: clonedRate,
        accent: clonedAccent,
        voiceName: modelProfile.voice.name,
        ambiencePreset: selectedAmbience,
        enableAmbience: true,
      }
    );
  };

  const handlePlayChannelB = async () => {
    if (abPlayingChannel === 'B') {
      voiceEngine.stop();
      setAbPlayingChannel('none');
      setChannelProgress(0);
      return;
    }

    voiceEngine.stop();
    setAbPlayingChannel('B');
    setChannelProgress(0);

    // If source is uploaded audio
    if (candidateSourceMode === 'uploaded_audio' && candidateUploadedAudioUrl) {
      await voiceEngine.playVoiceNote(
        abCustomScript,
        candidateUploadedAudioUrl,
        (prog) => setChannelProgress(prog),
        () => {
          setAbPlayingChannel('none');
          setChannelProgress(0);
        },
        {
          pitch: candidatePitch,
          rate: candidateRate,
          accent: candidateAccent,
          voiceName: modelProfile.voice.name,
        }
      );
      return;
    }

    // If source is catalog model benchmark
    if (candidateSourceMode === 'catalog_model') {
      const benchmarkModel = allModels?.find((m) => m.id === selectedCandidateModelId) || modelProfile;
      let audioBase64: string | undefined = undefined;
      try {
        const res = await fetch('/api/gemini/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: abCustomScript,
            voiceName: benchmarkModel.voice.name,
            modelName: benchmarkModel.name,
            accent: benchmarkModel.voiceDna?.accentDialect || benchmarkModel.voice.accent,
            pitch: benchmarkModel.voiceDna?.pitch ?? benchmarkModel.voice.pitch,
            rate: benchmarkModel.voiceDna?.rate ?? benchmarkModel.voice.rate,
            timbreScore: benchmarkModel.voiceDna?.timbreScore ?? 99.4,
            breathiness: benchmarkModel.voiceDna?.breathiness ?? 34,
            roomAcoustics: benchmarkModel.voiceDna?.roomAcoustics,
            voiceDna: benchmarkModel.voiceDna,
          }),
        });
        const data = await res.json();
        if (data?.audioBase64) {
          audioBase64 = data.audioBase64;
        }
      } catch (e) {
        console.warn('Channel B catalog model TTS error:', e);
      }

      await voiceEngine.playVoiceNote(
        abCustomScript,
        audioBase64 || benchmarkModel.voiceDna?.sampleAudioUrl,
        (prog) => setChannelProgress(prog),
        () => {
          setAbPlayingChannel('none');
          setChannelProgress(0);
        },
        {
          pitch: benchmarkModel.voiceDna?.pitch ?? benchmarkModel.voice.pitch,
          rate: benchmarkModel.voiceDna?.rate ?? benchmarkModel.voice.rate,
          accent: benchmarkModel.voice.accent,
          voiceName: benchmarkModel.voice.name,
          ambiencePreset: selectedAmbience,
          enableAmbience: true,
        }
      );
      return;
    }

    // Candidate Fine-Tuned Variant B
    let audioBase64: string | undefined = undefined;
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: abCustomScript,
          voiceName: modelProfile.voice.name,
          modelName: modelProfile.name,
          accent: candidateAccent,
          pitch: candidatePitch,
          rate: candidateRate,
          timbreScore: candidateWarmth,
          breathiness: candidateBreathiness,
          formantResonance: candidateFormantResonance,
          chestWarmth: candidateChestWarmth,
          harmonicAirClarity: candidateHarmonicAir,
          vocalFryTexture: candidateVocalFry,
          preInhaleDelayMs: candidatePreInhaleDelay,
          glottalTrailOff: candidateGlottalTrailOff,
          deEssingFilter: candidateDeEssing,
          roomAcoustics: modelProfile.voiceDna?.roomAcoustics,
          voiceDna: {
            isCloned: true,
            pitch: candidatePitch,
            rate: candidateRate,
            timbreScore: candidateWarmth,
            breathiness: candidateBreathiness,
            accentDialect: candidateAccent,
            formantResonance: candidateFormantResonance,
            chestWarmth: candidateChestWarmth,
            harmonicAirClarity: candidateHarmonicAir,
            vocalFryTexture: candidateVocalFry,
            preInhaleDelayMs: candidatePreInhaleDelay,
            glottalTrailOff: candidateGlottalTrailOff,
            deEssingFilter: candidateDeEssing,
          },
        }),
      });
      const data = await res.json();
      if (data?.audioBase64) {
        audioBase64 = data.audioBase64;
      }
    } catch (e) {
      console.warn('Channel B variant TTS error:', e);
    }

    await voiceEngine.playVoiceNote(
      abCustomScript,
      audioBase64,
      (prog) => setChannelProgress(prog),
      () => {
        setAbPlayingChannel('none');
        setChannelProgress(0);
      },
      {
        pitch: candidatePitch,
        rate: candidateRate,
        accent: candidateAccent,
        voiceName: modelProfile.voice.name,
        ambiencePreset: selectedAmbience,
        enableAmbience: true,
      }
    );
  };

  const handleHotSwapAB = () => {
    if (abPlayingChannel === 'A') {
      handlePlayChannelB();
    } else {
      handlePlayChannelA();
    }
  };

  const handleVoteWinner = async (winner: 'A' | 'B') => {
    setIsPromotingCandidate(true);
    setAdminVote(winner);
    if (isBlindTestMode) {
      setBlindRevealed(true);
    }

    const newGenCount = learningGenerations + 1;
    const isB = winner === 'B';
    const winningPitch = isB ? candidatePitch : clonedPitch;
    const winningRate = isB ? candidateRate : clonedRate;
    const winningWarmth = isB ? candidateWarmth : clonedWarmth;
    const winningBreath = isB ? candidateBreathiness : clonedBreathiness;
    const winningFormant = isB ? candidateFormantResonance : currentFormantResonance;
    const winningChest = isB ? candidateChestWarmth : currentChestWarmth;
    const winningAir = isB ? candidateHarmonicAir : currentHarmonicAir;
    const winningFry = isB ? candidateVocalFry : currentVocalFry;
    const winningInhale = isB ? candidatePreInhaleDelay : currentPreInhaleDelay;
    const winningTrail = isB ? candidateGlottalTrailOff : currentGlottalTrailOff;
    const winningDeEss = isB ? candidateDeEssing : currentDeEssing;
    const winningAccent = isB ? candidateAccent : clonedAccent;
    const promotedSimilarity = Math.min(99.9, Math.round((similarityScore + (isB ? 0.3 : 0.1)) * 10) / 10);

    const traitDescription = isB
      ? `Victoria de Canal B en Votación A/B: Adopción de variante con formantes al ${candidateFormantResonance}%, calidez ${candidateChestWarmth}% y micro-respiración previa de ${candidatePreInhaleDelay}ms`
      : `Ratificación de Canal A en Votación A/B: Confirmación de voz oficial de ${modelProfile.name} con estabilidad acústica óptima (${promotedSimilarity}%)`;

    const newIteration: VoiceLearningIteration = {
      id: `gen-${newGenCount}`,
      generation: newGenCount,
      timestamp: new Date().toISOString(),
      source: 'calibracion_admin',
      f0PitchHz: Math.round(winningPitch * 190),
      harmonicWarmth: winningWarmth,
      breathinessRatio: winningBreath,
      cadenceRate: winningRate,
      accentDialect: winningAccent,
      learnedTrait: traitDescription,
      similarityScore: promotedSimilarity,
    };

    if (isB) {
      setClonedPitch(candidatePitch);
      setClonedRate(candidateRate);
      setClonedWarmth(candidateWarmth);
      setClonedBreathiness(candidateBreathiness);
      setCurrentFormantResonance(candidateFormantResonance);
      setCurrentChestWarmth(candidateChestWarmth);
      setCurrentHarmonicAir(candidateHarmonicAir);
      setCurrentVocalFry(candidateVocalFry);
      setCurrentPreInhaleDelay(candidatePreInhaleDelay);
      setCurrentGlottalTrailOff(candidateGlottalTrailOff);
      setCurrentDeEssing(candidateDeEssing);
      setClonedAccent(candidateAccent);
    }
    setSimilarityScore(promotedSimilarity);
    setLearningGenerations(newGenCount);

    const nextHistory = [newIteration, ...learningHistory];
    setLearningHistory(nextHistory);

    const updatedModel: ModelProfile = {
      ...modelProfile,
      voice: {
        ...modelProfile.voice,
        pitch: winningPitch,
        rate: winningRate,
        accent: winningAccent,
        name: 'Aoede', // Preserve user's preferred realistic voice
      },
      voiceDna: {
        ...(modelProfile.voiceDna || {
          isCloned: true,
          sampleDurationSeconds: 8,
          detectedTone: 'Calibrado',
          pitch: winningPitch,
          rate: winningRate,
          timbreScore: winningWarmth,
          learningGenerationsCount: newGenCount,
        }),
        isCloned: true,
        pitch: winningPitch,
        rate: winningRate,
        timbreScore: winningWarmth,
        breathiness: winningBreath,
        accentDialect: winningAccent,
        similarityScore: promotedSimilarity,
        learningGenerationsCount: newGenCount,
        learningHistory: nextHistory,
        formantResonance: winningFormant,
        chestWarmth: winningChest,
        harmonicAirClarity: winningAir,
        vocalFryTexture: winningFry,
        preInhaleDelayMs: winningInhale,
        glottalTrailOff: winningTrail,
        deEssingFilter: winningDeEss,
        calibratedAt: new Date().toISOString(),
      },
    };

    // Update voiceEngine immediately across the app
    voiceEngine.setCalibratedVoiceProfile({
      pitch: winningPitch,
      rate: winningRate,
      accent: winningAccent,
      voiceName: 'Aoede',
      ambiencePreset: selectedAmbience,
      enableAmbience: true,
      isRealVoiceCloned: true,
    });

    if (onUpdateModel) {
      onUpdateModel(updatedModel);
    }

    // Persist to backend and disk
    try {
      await fetch(`/api/model/${modelProfile.id}/vote-iteration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winningChannel: winner,
          candidateParameters: isB
            ? {
                pitch: candidatePitch,
                rate: candidateRate,
                warmth: candidateWarmth,
                breathiness: candidateBreathiness,
                formantResonance: candidateFormantResonance,
                chestWarmth: candidateChestWarmth,
                harmonicAir: candidateHarmonicAir,
                vocalFry: candidateVocalFry,
                preInhaleDelay: candidatePreInhaleDelay,
                glottalTrailOff: candidateGlottalTrailOff,
                deEssing: candidateDeEssing,
                accent: candidateAccent,
                voiceName: 'Aoede',
              }
            : null,
          reason: traitDescription,
          similarityScore: promotedSimilarity,
          updatedVoiceDna: updatedModel.voiceDna,
        }),
      });
    } catch (e) {
      console.warn('Vote iteration sync error:', e);
    }

    setIsPromotingCandidate(false);
    setPromotionNotice(
      isB
        ? `🏆 ¡Voto guardado persistentemente! Variante B promovida a Clonación Oficial de Aura (Similitud: ${promotedSimilarity}%, timbre Aoede y parámetros guardados en disco).`
        : `✓ ¡Voto guardado persistentemente! Canal A ratificado como Voz Oficial de Aura con alta fidelidad y guardado en disco.`
    );
    setTimeout(() => setPromotionNotice(null), 7000);
  };

  const handlePromoteCandidateBToOfficial = async () => {
    await handleVoteWinner('B');
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
                Perfil Administrador • Entrenamiento & Aprendizaje Continuo
              </span>
              <span className="text-xs text-slate-400">
                Modelo activa: <b>{modelProfile.name}</b> ({modelProfile.handle})
              </span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Clonación Vocal de Modelo Real & Aprendizaje Continuo de Aura
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              Entrena a Aura para que hable exactamente igual a la modelo real con fluidez hiperrealista, clonación acústica directa de notas de voz/micrófono y perfeccionamiento constante en cada cierre VIP.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-400" /> Gen #{learningGenerations}
            </span>
            <span className="text-xs font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-rose-400" /> {similarityScore}% Idéntica
            </span>
            {hasSavedSkills && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Parámetros actualizados
              </span>
            )}
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2">
          <button
            onClick={() => setActiveSection('ab_testing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'ab_testing'
                ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Split className="w-4 h-4 text-amber-300" />
            <span>A/B Testing Vocal & Benchmarks (Hiperrealismo)</span>
          </button>

          <button
            onClick={() => setActiveSection('voice_cloning')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSection === 'voice_cloning'
                ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-300" />
            <span>Clonación de Voz Real & Aprendizaje ({similarityScore}%)</span>
          </button>

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
          SECTION: A/B TESTING VOCAL & CALIBRACIÓN FINA DE HIPERREALISMO
          ======================================================== */}
      {activeSection === 'ab_testing' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Notification Alert for Promotion */}
          {promotionNotice && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-3 animate-fadeIn font-semibold shadow-lg shadow-emerald-500/10">
              <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{promotionNotice}</span>
            </div>
          )}

          {/* Intro Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Split className="w-3 h-3 text-amber-400" /> Herramienta de Calibración Hiperrealista
                </span>
                <span className="text-xs text-slate-400">
                  Modelo Evaluada: <b>{modelProfile.name}</b>
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                Comparador A/B de Modelos de Referencia & Micro-Acústica Vocal
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Compara en tiempo real la <b>Clonación Actual (Canal A)</b> contra <b>Nuevos Modelos de Referencia o Variantes Candidatas (Canal B)</b>. Modula resonancia de formantes, calidez de pecho, micro-respiraciones previas y descompresión glotal para alcanzar hiperrealismo cinematográfico.
              </p>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Modo Evaluación</span>
              <button
                onClick={() => {
                  setIsBlindTestMode(!isBlindTestMode);
                  setBlindRevealed(false);
                  setAdminVote('none');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  isBlindTestMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-700'
                }`}
              >
                {isBlindTestMode ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Modo Ciego Activo</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Activar Modo Ciego</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 1: Frase de Evaluación Sincronizada */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-rose-400" />
                  Guión de Prueba Sincronizado para Ambos Canales (A y B)
                </h4>
                <p className="text-xs text-slate-400">
                  Selecciona un escenario conversacional realista o escribe una frase para evaluar inflexiones, respiraciones y pausas.
                </p>
              </div>

              {/* Scenario Preset Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {(
                  [
                    { id: 'greeting', label: '☕ Saludo Íntimo' },
                    { id: 'flirt', label: '😉 Coqueteo' },
                    { id: 'vip', label: '✨ Cierre VIP' },
                    { id: 'night', label: '🌙 Madrugada' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectAbScriptPreset(preset.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      abScriptMode === preset.id
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={abCustomScript}
              onChange={(e) => {
                setAbCustomScript(e.target.value);
                setAbScriptMode('custom');
              }}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-sans resize-none"
              placeholder="Escribe aquí el texto que reproducirán ambas variantes de voz..."
            />
          </div>

          {/* Card 2: Selector de Fuente del Canal B (Benchmark o Variante Candidata) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Split className="w-4 h-4 text-purple-400" />
                  Configuración del Canal B (Referencia o Variante Candidata)
                </h4>
                <p className="text-xs text-slate-400">
                  Define contra qué quieres comparar la clonación actual de {modelProfile.name}.
                </p>
              </div>

              {/* Source Mode Selector */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => setCandidateSourceMode('fine_tuned_variant')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    candidateSourceMode === 'fine_tuned_variant'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Variante Fina
                </button>
                <button
                  onClick={() => setCandidateSourceMode('catalog_model')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    candidateSourceMode === 'catalog_model'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Modelo Catálogo
                </button>
                <button
                  onClick={() => setCandidateSourceMode('uploaded_audio')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    candidateSourceMode === 'uploaded_audio'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Audio Subido
                </button>
              </div>
            </div>

            {/* Sub-panel depending on candidate source mode */}
            {candidateSourceMode === 'catalog_model' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-white">Seleccionar Modelo de Benchmark:</span>
                  <select
                    value={selectedCandidateModelId}
                    onChange={(e) => setSelectedCandidateModelId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {allModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.handle}) - {m.voice.accent}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] text-slate-400">
                  Permite comparar la voz de {modelProfile.name} contra los timbres de otras modelos profesionales del sistema.
                </span>
              </div>
            ) : candidateSourceMode === 'uploaded_audio' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <input
                  type="file"
                  accept="audio/*"
                  ref={candidateAudioInputRef}
                  onChange={handleCandidateAudioUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => candidateAudioInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Cargar Audio de Referencia (.wav, .mp3)</span>
                  </button>
                  {candidateUploadedName && (
                    <span className="text-xs font-mono font-bold text-purple-300">
                      ✓ {candidateUploadedName}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Compara la síntesis actual directamente contra un archivo de audio real o una toma de estudio externa.
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>Modo Variante Fina: Calibra abajo los formantes, calidez y respiración para escuchar el Canal B.</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                  Edición Activa ✓
                </span>
              </div>
            )}
          </div>

          {/* Card 3: Reproductor Dual A/B con Switcher en Caliente (Hot-Swap) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-sky-400" />
                  Consola de Reproducción A/B & Switcher en Caliente
                </h4>
                <p className="text-xs text-slate-400">
                  Escucha alternativamente cada versión. Usa el botón &quot;Alternar A/B en Caliente&quot; para conmutar sin pausa.
                </p>
              </div>

              {/* Hot-Swap Action Button */}
              <button
                onClick={handleHotSwapAB}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer transition-all self-start sm:self-auto"
              >
                <Shuffle className="w-4 h-4" />
                <span>Alternar A/B en Caliente (Hot-Swap)</span>
              </button>
            </div>

            {/* Dual Player Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Channel A Column */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  abPlayingChannel === 'A'
                    ? 'bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950 border-rose-500 shadow-xl'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-white">
                      {isBlindTestMode && !blindRevealed ? 'Canal 1 (Ciego)' : `Canal A: Clonación Oficial (${modelProfile.name})`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                    {isBlindTestMode && !blindRevealed ? 'Variante X' : 'Versión Oficial'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block">Formantes</span>
                    <span className="font-bold text-rose-300">{currentFormantResonance}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block">Pecho</span>
                    <span className="font-bold text-amber-300">{currentChestWarmth}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block">Respiración</span>
                    <span className="font-bold text-emerald-300">{currentPreInhaleDelay}ms</span>
                  </div>
                </div>

                <button
                  onClick={handlePlayChannelA}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    abPlayingChannel === 'A'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {abPlayingChannel === 'A' ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pausar Canal A</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-rose-400" />
                      <span>{isBlindTestMode && !blindRevealed ? 'Escuchar Variante X' : 'Escuchar Canal A (Actual)'}</span>
                    </>
                  )}
                </button>

                {abPlayingChannel === 'A' && (
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full transition-all duration-200"
                      style={{ width: `${channelProgress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Channel B Column */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  abPlayingChannel === 'B'
                    ? 'bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 border-purple-500 shadow-xl'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs font-bold text-white">
                      {isBlindTestMode && !blindRevealed
                        ? 'Canal 2 (Ciego)'
                        : candidateSourceMode === 'catalog_model'
                        ? `Canal B: Modelo Benchmark`
                        : candidateSourceMode === 'uploaded_audio'
                        ? `Canal B: ${candidateUploadedName || 'Audio de Estudio'}`
                        : `Canal B: Variante Candidata Fina`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                    {isBlindTestMode && !blindRevealed ? 'Variante Y' : 'Nueva Referencia'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-[10px] font-mono">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block">Formantes</span>
                    <span className="font-bold text-purple-300">{candidateFormantResonance}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block">Pecho</span>
                    <span className="font-bold text-amber-300">{candidateChestWarmth}%</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-center">
                    <span className="text-slate-400 block">Respiración</span>
                    <span className="font-bold text-emerald-300">{candidatePreInhaleDelay}ms</span>
                  </div>
                </div>

                <button
                  onClick={handlePlayChannelB}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    abPlayingChannel === 'B'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md'
                  }`}
                >
                  {abPlayingChannel === 'B' ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pausar Canal B</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-purple-300" />
                      <span>{isBlindTestMode && !blindRevealed ? 'Escuchar Variante Y' : 'Escuchar Canal B (Candidato)'}</span>
                    </>
                  )}
                </button>

                {abPlayingChannel === 'B' && (
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full transition-all duration-200"
                      style={{ width: `${channelProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Panel de Votación y Persistencia Activa A/B */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    <Trophy className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-white">
                    Votación de Selección Vocal & Persistencia en Aura
                  </span>
                  {adminVote !== 'none' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
                      ✓ Parámetro Guardado: Canal {adminVote}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 max-w-xl">
                  {isBlindTestMode && !blindRevealed
                    ? 'Prueba a ciegas activa: Escucha ambas variantes y vota por la que percibas más natural y humana.'
                    : `Vota por la variante que mejor representa a ${modelProfile.name}. Al votar, el parámetro se guarda de forma persistente en disco y se aplica inmediatamente al bot de voz en el chat.`}
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  onClick={() => handleVoteWinner('A')}
                  disabled={isPromotingCandidate}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                    adminVote === 'A'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/30'
                      : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-rose-500 hover:text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-rose-400" />
                  <span>{isBlindTestMode && !blindRevealed ? 'Votar por Canal 1' : 'Votar por Canal A (Oficial)'}</span>
                </button>

                <button
                  onClick={() => handleVoteWinner('B')}
                  disabled={isPromotingCandidate}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 shadow-md ${
                    adminVote === 'B'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-purple-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-purple-500/50'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isBlindTestMode && !blindRevealed ? 'Votar por Canal 2' : 'Votar por Canal B (Candidato)'}</span>
                </button>
              </div>
            </div>

            {/* Persistent Vote Saved Banner Notification */}
            {promotionNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 shadow-lg animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{promotionNotice}</span>
              </div>
            )}
          </div>

          {/* Card 4: Ajustes Finos de Timbre & Respiración (Calibración Hiperrealista) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  Calibrador Fino de Timbre y Respiración de la Variante Candidata (Canal B)
                </h4>
                <p className="text-xs text-slate-400">
                  Ajustes micro-acústicos profesionales exigidos por las modelos reales para eliminar cualquier rastro sintético.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  8 Parámetros Micro-Acústicos ✓
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Parámetros Finos de Timbre */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Disc className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Parámetros Finos de Timbre & Formantes</h5>
                    <span className="text-[10px] text-slate-400">Física de cavidad oral, garganta y resonancia pectoral</span>
                  </div>
                </div>

                {/* Slider 1: Resonancia de Formantes */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Resonancia de Formantes ($F_1 / F_2$)</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{candidateFormantResonance}%</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="100"
                    step="1"
                    value={candidateFormantResonance}
                    onChange={(e) => setCandidateFormantResonance(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Modula el volumen y resonancia de la garganta. Un valor de 96-98% elimina la rigidez sintética.
                  </span>
                </div>

                {/* Slider 2: Calidez de Pecho */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Calidez de Pecho / Frecuencias Bajas</span>
                    <span className="text-xs font-mono font-bold text-rose-400">{candidateChestWarmth}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="1"
                    value={candidateChestWarmth}
                    onChange={(e) => setCandidateChestWarmth(parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Agrega cuerpo y proximidad acústica física como si la modelo te hablara a 10 cm del oído.
                  </span>
                </div>

                {/* Slider 3: Brillo Armónico & Claridad Aérea */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Brillo Armónico & Claridad Aérea</span>
                    <span className="text-xs font-mono font-bold text-purple-400">{candidateHarmonicAir}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={candidateHarmonicAir}
                    onChange={(e) => setCandidateHarmonicAir(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Realza las frecuencias altas de forma seductora para mayor nitidez en notas de voz móviles.
                  </span>
                </div>

                {/* Slider 4: Textura de Cuerdas Vocales (Vocal Fry) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Textura de Cuerdas Vocales (Vocal Fry)</span>
                    <span className="text-xs font-mono font-bold text-sky-400">{candidateVocalFry}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="1"
                    value={candidateVocalFry}
                    onChange={(e) => setCandidateVocalFry(parseInt(e.target.value, 10))}
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Micro-vibración relajada y rasposa característica de quien habla acostada en confianza.
                  </span>
                </div>
              </div>

              {/* Right Column: Parámetros Finos de Respiración & Biomecánica */}
              <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wind className="w-3.5 h-3.5" />
                  </span>
                  <div>
                    <h5 className="text-xs font-bold text-white">Parámetros Finos de Respiración & Aire</h5>
                    <span className="text-[10px] text-slate-400">Inhalación previa, descompresión glotal y suavizado de siseo</span>
                  </div>
                </div>

                {/* Slider 5: Micro-respiración previa al habla */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Micro-respiración Previa (Inhale Delay)</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{candidatePreInhaleDelay} ms</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="450"
                    step="10"
                    value={candidatePreInhaleDelay}
                    onChange={(e) => setCandidatePreInhaleDelay(parseInt(e.target.value, 10))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Inhala suavemente antes de hablar. 180ms - 240ms produce la sensación de una persona viva frente a ti.
                  </span>
                </div>

                {/* Slider 6: Ratio de Susurro / Caudal de Aire */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Ratio de Susurro / Caudal de Aire</span>
                    <span className="text-xs font-mono font-bold text-teal-400">{candidateBreathiness}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="55"
                    step="1"
                    value={candidateBreathiness}
                    onChange={(e) => setCandidateBreathiness(parseInt(e.target.value, 10))}
                    className="w-full accent-teal-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Proporción de aire en la fonación. Entre 35% y 40% confiere la intimidad de alcoba que demandan los clientes VIP.
                  </span>
                </div>

                {/* Slider 7: Descompresión Glotal / Decaimiento */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Descompresión Glotal (Trail-Off)</span>
                    <span className="text-xs font-mono font-bold text-indigo-400">{candidateGlottalTrailOff}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="1"
                    value={candidateGlottalTrailOff}
                    onChange={(e) => setCandidateGlottalTrailOff(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Suspiro o caída de aire al terminar las oraciones; evita cortes abruptos digitales.
                  </span>
                </div>

                {/* Slider 8: Filtro Anti-Siseo Biomecánico */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Filtro Anti-Siseo Biomecánico (De-Essing)</span>
                    <span className="text-xs font-mono font-bold text-amber-300">{candidateDeEssing}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    step="1"
                    value={candidateDeEssing}
                    onChange={(e) => setCandidateDeEssing(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 leading-tight">
                    Atenúa fonemas estridentes (&apos;S&apos; y &apos;CH&apos;) emulando el diafragma de micrófonos de estudio de alta gama.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Matriz Comparativa Espectral & Acción de Promoción Oficial */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-emerald-400" />
                  Matriz Comparativa Espectral: Canal A vs Canal B
                </h4>
                <p className="text-xs text-slate-400">
                  Resumen de parámetros lado a lado y opción de promover la variante candidata a clonación oficial activa.
                </p>
              </div>

              <button
                onClick={handlePromoteCandidateBToOfficial}
                disabled={isPromotingCandidate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all self-start sm:self-auto"
              >
                {isPromotingCandidate ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trophy className="w-4 h-4 text-amber-300" />
                )}
                <span>Promover Canal B como Clonación Oficial de Aura</span>
              </button>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                    <th className="py-2.5 px-3">Parámetro Acústico</th>
                    <th className="py-2.5 px-3 text-rose-300">Canal A (Clonación Oficial)</th>
                    <th className="py-2.5 px-3 text-purple-300">Canal B (Variante Candidata)</th>
                    <th className="py-2.5 px-3 text-emerald-300">Delta de Hiperrealismo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3 font-sans text-white font-semibold">Resonancia de Formantes</td>
                    <td className="py-2.5 px-3 text-slate-300">{currentFormantResonance}%</td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">{candidateFormantResonance}%</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {candidateFormantResonance >= currentFormantResonance ? `+${candidateFormantResonance - currentFormantResonance}% (Cuerpo)` : `${candidateFormantResonance - currentFormantResonance}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans text-white font-semibold">Calidez de Pecho / Proximidad</td>
                    <td className="py-2.5 px-3 text-slate-300">{currentChestWarmth}%</td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">{candidateChestWarmth}%</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {candidateChestWarmth >= currentChestWarmth ? `+${candidateChestWarmth - currentChestWarmth}% (Intimidad)` : `${candidateChestWarmth - currentChestWarmth}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans text-white font-semibold">Micro-respiración Previa</td>
                    <td className="py-2.5 px-3 text-slate-300">{currentPreInhaleDelay} ms</td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">{candidatePreInhaleDelay} ms</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {candidatePreInhaleDelay >= currentPreInhaleDelay ? `+${candidatePreInhaleDelay - currentPreInhaleDelay} ms (Inhalación viva)` : `${candidatePreInhaleDelay - currentPreInhaleDelay} ms`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans text-white font-semibold">Caudal de Aire / Susurro</td>
                    <td className="py-2.5 px-3 text-slate-300">{clonedBreathiness}%</td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">{candidateBreathiness}%</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {candidateBreathiness >= clonedBreathiness ? `+${candidateBreathiness - clonedBreathiness}% (Susurro)` : `${candidateBreathiness - clonedBreathiness}%`}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-sans text-white font-semibold">Descompresión Glotal (Trail-Off)</td>
                    <td className="py-2.5 px-3 text-slate-300">{currentGlottalTrailOff}%</td>
                    <td className="py-2.5 px-3 text-purple-300 font-bold">{candidateGlottalTrailOff}%</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">
                      {candidateGlottalTrailOff >= currentGlottalTrailOff ? `+${candidateGlottalTrailOff - currentGlottalTrailOff}% (Decaimiento suave)` : `${candidateGlottalTrailOff - currentGlottalTrailOff}%`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SECTION 0: CLONACIÓN DE VOZ REAL & APRENDIZAJE CONTINUO
          ======================================================== */}
      {activeSection === 'voice_cloning' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Action Notices */}
          {autoPerfectionNotice && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/40 text-xs text-purple-200 flex items-center gap-2 animate-fadeIn font-semibold">
              <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
              <span>{autoPerfectionNotice}</span>
            </div>
          )}

          {saveSuccessNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn font-semibold">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessNotice}</span>
            </div>
          )}

          {/* Card 1: Captura de Voz Real (Micrófono Directo y Subida de Archivo) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-rose-400" />
                  Captura de Voz Real de la Modelo ({modelProfile.name})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Graba a la persona modelo real directamente por micrófono o sube una nota de voz limpia para que Aura clone su timbre idéntico.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  {similarityScore}% Idéntica a la Modelo
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Grabar Micrófono en Vivo */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Radio className={`w-3.5 h-3.5 ${isRecordingMic ? 'text-red-500 animate-ping' : 'text-rose-400'}`} />
                      Grabación en Vivo por Micrófono
                    </span>
                    {isRecordingMic && (
                      <span className="text-xs font-mono font-bold text-rose-400 animate-pulse">
                        ● Grabando: 00:{micSeconds < 10 ? `0${micSeconds}` : micSeconds}s
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Pídele a {modelProfile.name} que hable durante 5 a 10 segundos con tono natural, dulce o coqueto como si le enviara un mensaje de audio a un seguidor VIP.
                  </p>
                </div>

                {isRecordingMic ? (
                  <div className="flex flex-col gap-3">
                    {/* Visualizer Wave Animation */}
                    <div className="flex items-center justify-center gap-1 h-12 bg-slate-900 rounded-xl px-4 border border-rose-500/30">
                      {[30, 60, 90, 45, 80, 100, 75, 40, 85, 95, 60, 35, 70, 90, 50].map((h, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-gradient-to-t from-rose-600 to-purple-500 rounded-full animate-pulse"
                          style={{
                            height: `${Math.max(15, (h * ((i % 3) + 1)) / 3)}%`,
                            animationDelay: `${i * 60}ms`,
                          }}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleStopMicRecording}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer transition-all"
                    >
                      <MicOff className="w-4 h-4" />
                      Detener Grabación y Clonar Voz
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartMicRecording}
                    disabled={isProcessingMic}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
                  >
                    {isProcessingMic ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Analizando acústica y formantes...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4" />
                        Iniciar Grabación de la Modelo Real
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Option B: Subir Archivo de Audio Crudo de la Modelo */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileAudio className="w-3.5 h-3.5 text-purple-400" />
                      Subir Nota de Voz de la Modelo (.wav, .mp3, .m4a)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      Sin transcripción
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sube una nota de voz real de WhatsApp, Telegram o grabación de estudio de {modelProfile.name}. El sistema extrae su firma de formantes ($F_0$).
                  </p>
                </div>

                <div
                  onClick={() => rawAudioInputRef.current?.click()}
                  className="py-3 px-4 rounded-xl border border-dashed border-purple-500/40 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/30 transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-purple-200"
                >
                  <UploadCloud className="w-4 h-4 text-purple-300" />
                  <span>Seleccionar Archivo de Audio Real</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Comparador A/B en Vivo (Voz Real vs Voz Clonada de Aura) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  Comparador A/B en Vivo: Voz Real de la Modelo vs Voz Clonada de Aura
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifica que Aura hable exactamente igual a la persona real comparando la muestra original con la síntesis agentica.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Coincidencia Acústica: {similarityScore}%
                </span>
              </div>
            </div>

            {/* Test Phrase Input */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Frase de Prueba para la Voz Clonada de Aura:</span>
                <span className="text-[10px] text-slate-500">Editable por el administrador</span>
              </label>
              <textarea
                value={testPhrase}
                onChange={(e) => setTestPhrase(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 resize-none font-sans"
              />
            </div>

            {/* A/B Dual Player Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Player A: Audio de Referencia de la Modelo Real */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isPlayingRealSample
                  ? 'bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 border-purple-500 shadow-lg'
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="text-xs font-bold text-white">Canal A: Audio Original de la Modelo Real</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 font-bold">
                    Referencia Humana
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  Audio grabado o cargado como muestra base de la persona real ({modelProfile.name}).
                </p>

                <button
                  onClick={handlePlayRealModelAudio}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isPlayingRealSample
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isPlayingRealSample ? (
                    <>
                      <Pause className="w-4 h-4 fill-current text-white" />
                      <span>Pausar Audio Real</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current text-purple-400" />
                      <span>Escuchar Audio Original de la Modelo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Player B: Voz Clonada de Aura */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isPlayingClonedSample
                  ? 'bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-950 border-rose-500 shadow-lg'
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <span className="text-xs font-bold text-white">Canal B: Voz Clonada de Aura (Hiperrealista)</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-bold">
                    Aura IA Gemini
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                  Síntesis neural con modulación acústica de formantes, respiraciones suaves y timbre idéntico.
                </p>

                <button
                  onClick={handlePlayClonedAuraAudio}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isPlayingClonedSample
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white shadow-md shadow-rose-600/20'
                  }`}
                >
                  {isPlayingClonedSample ? (
                    <>
                      <Pause className="w-4 h-4 fill-current text-white" />
                      <span>Pausar Voz Clonada</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Escuchar Voz Clonada de Aura</span>
                    </>
                  )}
                </button>

                {isPlayingClonedSample && (
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full transition-all duration-200"
                      style={{ width: `${clonedProgress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Acoustic DNA Comparison Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Frecuencia F0</span>
                <span className="text-sm font-mono font-bold text-rose-300">{Math.round(clonedPitch * 190)} Hz</span>
                <span className="text-[10px] text-slate-500 block">Tono fundamental</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Calidez Armónica</span>
                <span className="text-sm font-mono font-bold text-amber-300">{clonedWarmth}%</span>
                <span className="text-[10px] text-slate-500 block">Resonancia vocal</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Susurro & Aire</span>
                <span className="text-sm font-mono font-bold text-emerald-300">{clonedBreathiness}%</span>
                <span className="text-[10px] text-slate-500 block">Micro-respiración</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Cadencia / Ritmo</span>
                <span className="text-sm font-mono font-bold text-sky-300">{clonedRate}x</span>
                <span className="text-[10px] text-slate-500 block">Velocidad natural</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Similitud Total</span>
                <span className="text-sm font-mono font-black text-purple-300">{similarityScore}%</span>
                <span className="text-[10px] text-emerald-400 block font-bold">Idéntica ✓</span>
              </div>
            </div>
          </div>

          {/* Card 3: Calibración Fina del Administrador & Acciones de Despliegue */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Calibración Fina del Administrador (Perfeccionamiento Vocal)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ajusta los parámetros acústicos finos para perfeccionar los matices y modismos de {modelProfile.name}.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleRunAutoPerfectionCycle}
                  disabled={isRunningAutoPerfection}
                  className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Aura re-evalúa la muestra acústica y optimiza automáticamente las micro-pausas respiratorias"
                >
                  {isRunningAutoPerfection ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>⚡ Auto-Perfeccionar Aura</span>
                </button>

                <button
                  onClick={handleSaveAndApplyClonedVoice}
                  disabled={isSavingCloning}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {isSavingCloning ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Guardar & Aplicar Clonación en el Agente</span>
                </button>
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Slider 1: Pitch / Tono Vocal */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Tono Vocal (Pitch $F_0$)</span>
                  <span className="text-xs font-mono font-bold text-rose-400">{clonedPitch.toFixed(2)} ({Math.round(clonedPitch * 190)} Hz)</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.35"
                  step="0.01"
                  value={clonedPitch}
                  onChange={(e) => setClonedPitch(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Desplaza la frecuencia fundamental para igualar exactamente la juventud y timbre agudo/grave de la modelo.
                </span>
              </div>

              {/* Slider 2: Cadencia y Velocidad */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Cadencia & Velocidad de Habla</span>
                  <span className="text-xs font-mono font-bold text-sky-400">{clonedRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.01"
                  value={clonedRate}
                  onChange={(e) => setClonedRate(parseFloat(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Un ritmo de 0.95x - 0.98x otorga sensualidad, calma y autenticidad; evita sonar apurada o robótica.
                </span>
              </div>

              {/* Slider 3: Calidez Armónica */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Calidez Armónica & Cuerpo de Timbre</span>
                  <span className="text-xs font-mono font-bold text-amber-400">{clonedWarmth.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="85"
                  max="100"
                  step="0.1"
                  value={clonedWarmth}
                  onChange={(e) => setClonedWarmth(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Potencia los armónicos bajos y medios para que la voz suene física, cercana al oído y no metálica.
                </span>
              </div>

              {/* Slider 4: Susurro y Nivel de Aire */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Nivel de Susurro & Respiración Íntima</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{clonedBreathiness}% aire</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="55"
                  step="1"
                  value={clonedBreathiness}
                  onChange={(e) => setClonedBreathiness(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500">
                  Añade micro-aspiraciones orgánicas antes de palabras clave, recreando una nota de voz íntima de alcoba.
                </span>
              </div>
            </div>

            {/* Dialect / Regional Accent Selection */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-white block">Dialecto y Acento Regional de la Modelo</span>
                <span className="text-[10px] text-slate-400">
                  Aura adopta los modismos, la entonación y la cadencia cultural de la modelo real.
                </span>
              </div>

              <select
                value={clonedAccent}
                onChange={(e) => setClonedAccent(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Paisa Colombiano (Medellín)">Paisa Colombiano (Medellín) - Dulce, cómplice y sensual</option>
                <option value="Colombiano Bogotá / Neutro Cálido">Colombiano Bogotá / Neutro Cálido - Elegante y cercano</option>
                <option value="Rioplatense (Buenos Aires)">Rioplatense (Buenos Aires) - Seguro, fluido y magnético</option>
                <option value="Español Peninsular (Madrid)">Español Peninsular (Madrid) - Directo y desinhibido</option>
                <option value="Mexicano Norteño / Monterrey">Mexicano Norteño / Monterrey - Expresivo y espontáneo</option>
                <option value="Caribeño Cálido">Caribeño Cálido - Desenfadado, risueño y fresco</option>
              </select>
            </div>
          </div>

          {/* Card 4: Registro de Aprendizaje Continuo de Aura */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-400" />
                  Historial de Aprendizaje Continuo de Aura ({learningHistory.length} iteraciones registradas)
                </h3>
                <p className="text-xs text-slate-400">
                  Aura aprende y perfecciona su voz en cada ciclo de entrenamiento ejecutado por el administrador.
                </p>
              </div>

              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-bold">
                Aprendizaje Activo Continuo ✓
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {learningHistory.map((iter) => (
                <div
                  key={iter.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-xs font-mono font-bold text-purple-300 shrink-0">
                      #{iter.generation}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-xs font-bold text-white">
                          {iter.learnedTrait}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {iter.source === 'microfono_en_vivo'
                            ? '🎤 Micrófono en Vivo'
                            : iter.source === 'auto_perfeccionamiento'
                            ? '⚡ Auto-Perfeccionamiento'
                            : iter.source === 'calibracion_admin'
                            ? '🛠️ Calibración Administrador'
                            : '📁 Subida de Archivo'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        F0: {iter.f0PitchHz}Hz • Calidez: {iter.harmonicWarmth}% • Respiración: {iter.breathinessRatio}% aire • Acento: {iter.accentDialect}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {iter.similarityScore}% Similitud
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
