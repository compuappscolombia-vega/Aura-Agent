import React, { useState, useEffect } from 'react';
import {
  ChatMessage,
  ModelProfile,
  ConfidenceMetrics,
  LeadItem,
  UserMemory,
  UserMood,
  AgentSkillSettings,
  UserSession,
} from './types';
import { CASUAL_PHOTOS } from './utils/mediaVault';
import { generateSessionFingerprint } from './utils/cryptoSim';
import { ChatInterface } from './components/ChatInterface';
import { TrustConfidenceMeter } from './components/TrustConfidenceMeter';
import { AgentBrainHUD } from './components/AgentBrainHUD';
import { CRMSubscriptions } from './components/CRMSubscriptions';
import { UserMemoryInspector } from './components/UserMemoryInspector';
import { AgentTrainingLab } from './components/AgentTrainingLab';
import { TwitterIntegrationHub } from './components/TwitterIntegrationHub';
import { ModelCatalogModal } from './components/ModelCatalogModal';
import { AuthLoginModal } from './components/AuthLoginModal';
import { ShareLiveWithModelModal } from './components/ShareLiveWithModelModal';
import { ManualViewerModal } from './components/ManualViewerModal';
import { InstallersModal } from './components/InstallersModal';
import { DEFAULT_MODELS } from './data/modelsRoster';
import {
  Sparkles,
  Share2,
  ShieldCheck,
  RotateCcw,
  LayoutDashboard,
  MessageSquare,
  Lock,
  Volume2,
  Sliders,
  Twitter,
  Image,
  Brain,
  UserCheck,
  Users,
  Flame,
  Radio,
  GraduationCap,
  FileText,
  X,
  Download,
} from 'lucide-react';

const INITIAL_MODEL_PROFILE: ModelProfile = DEFAULT_MODELS[0];

interface InboundScenario {
  id: string;
  name: string;
  icon: string;
  description: string;
  initialMessages: ChatMessage[];
  initialTrust: number;
}

const INBOUND_SCENARIOS: InboundScenario[] = [
  {
    id: 'story-cafe',
    name: 'Story: Café Matcha ☕',
    icon: '☕',
    description: 'El seguidor reacciona a su historia matutina en el café',
    initialTrust: 32,
    initialMessages: [
      {
        id: 'scen-user-1',
        sender: 'user',
        text: 'Qué delicia se ve ese matcha latte jaja, ¿en dónde te lo tomaste?',
        timestamp: 'Hace 3 min',
        isEncrypted: true,
      },
      {
        id: 'scen-model-1',
        sender: 'model',
        text: 'Jajaja uff estaba glorioso 🤤 pero casi me quemo por tomármelo apurada antes de salir. ¿Tú eres más de café negro cargado o de cosas dulces?',
        timestamp: 'Hace 1 min',
        photoCategory: 'cafe',
        photoCaption: 'Tomándome mi matcha frío ☕',
        isEncrypted: true,
      },
    ],
  },
  {
    id: 'story-gym',
    name: 'Story: Rutina Gym 💪',
    icon: '💪',
    description: 'El seguidor halaga su disciplina tras ver su foto de entrenamiento',
    initialTrust: 44,
    initialMessages: [
      {
        id: 'scen-user-2',
        sender: 'user',
        text: 'Impresionante disciplina que te cargas, te ves divina 🔥',
        timestamp: 'Hace 5 min',
        isEncrypted: true,
      },
      {
        id: 'scen-model-2',
        sender: 'model',
        text: 'Casi muero en las sentadillas hoy jaja, me tiemblan las piernas todavía 💪 pero no hay excusas. ¿Tú también entrenas o te tengo que poner a sudar conmigo? 😉',
        timestamp: 'Hace 2 min',
        photoCategory: 'gym',
        photoCaption: 'Muerta pero feliz después de pierna 💪',
        isEncrypted: true,
      },
    ],
  },
  {
    id: 'dm-spontaneous',
    name: 'DM Espontáneo en X 💬',
    icon: '💬',
    description: 'El seguidor desliza en DMs buscando llamar su atención',
    initialTrust: 25,
    initialMessages: [
      {
        id: 'scen-user-3',
        sender: 'user',
        text: 'Hola Valeria, me llamó mucho la atención tu perfil y tu vibra...',
        timestamp: 'Hace 4 min',
        isEncrypted: true,
      },
      {
        id: 'scen-model-3',
        sender: 'model',
        text: 'Jajaja a ver... me dio curiosidad tu mensaje. ¿Eres así de lanzado siempre o solo conmigo? 😉',
        timestamp: 'Hace un momento',
        isEncrypted: true,
      },
    ],
  },
  {
    id: 'clean-slate',
    name: 'Chat Limpio (Tú Escribes Primero) ✨',
    icon: '✨',
    description: 'Bandeja limpia: escribe tu propio mensaje y verifica cómo responde Aura',
    initialTrust: 20,
    initialMessages: [],
  },
];

const INITIAL_METRICS: ConfidenceMetrics = {
  trustScore: 35,
  reciprocity: 45,
  responseFluency: 60,
  positiveSentiment: 55,
  stage: 'cold',
  threshold: 75,
  isVipReady: false,
  reasoning:
    'Agente autónomo activo. Interpretando contexto situacional y estilo de comunicación del usuario.',
  detectedMood: 'contento',
  detectedStyle: 'Expresivo y Emojis',
};

const INITIAL_USER_MEMORY: UserMemory = {
  userId: 'lead-1',
  username: '@carlos_m92',
  nameAlias: 'Carlos',
  currentMood: 'coqueto',
  communicationStyle: 'Directo y Coqueto',
  moodIntensity: 8,
  keyFacts: [
    'Empresario de 32 años',
    'Viaja con frecuencia a Miami',
    'Le encanta el fitness y las fotos de gym',
    'Busca conexión exclusiva y trato preferencial',
  ],
  preferredTopics: ['viajes', 'gym', 'exclusividad'],
  interactionCount: 14,
  lastEmotionalState: 'Muy entusiasmado y coqueto',
  suggestedApproach: 'Mantener coqueteo recíproco y trato exclusivo VIP.',
  attachmentLevel: 'Alto',
};

export default function App() {
  const [models, setModels] = useState<ModelProfile[]>(DEFAULT_MODELS);
  const [modelProfile, setModelProfile] = useState<ModelProfile>(DEFAULT_MODELS[0]);
  const [isModelCatalogOpen, setIsModelCatalogOpen] = useState(false);
  const [metrics, setMetrics] = useState<ConfidenceMetrics>(INITIAL_METRICS);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('story-cafe');
  const [messages, setMessages] = useState<ChatMessage[]>(INBOUND_SCENARIOS[0].initialMessages);
  const [activeUsername, setActiveUsername] = useState<string>('@carlos_m92');
  const [userMemory, setUserMemory] = useState<UserMemory>(INITIAL_USER_MEMORY);
  const [isModelTyping, setIsModelTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'live_ops' | 'twitter_x' | 'training' | 'crm'>('live_ops');
  const [inspectorTab, setInspectorTab] = useState<'memory' | 'confidence' | 'brain'>('memory');
  const [platformSkin, setPlatformSkin] = useState<'X (Twitter)' | 'Web'>('X (Twitter)');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [lastReasoning, setLastReasoning] = useState<string>(
    'Aura activa: interpretación profunda de contexto, adaptación al estado anímico y orientación estratégica a cierre VIP.'
  );

  // Creator / Admin Auth Session State (Connected to @afire_sb)
  const [currentUserSession, setCurrentUserSession] = useState<UserSession | null>({
    id: 'usr-sess-prod-afire',
    name: 'Ana María',
    email: 'gato-284@hotmail.com',
    handle: '@afire_sb',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    provider: 'x',
    role: 'creator',
    connectedAt: new Date().toISOString(),
    xAccountConnected: true,
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isInstallersModalOpen, setIsInstallersModalOpen] = useState(false);
  const [isModelValidationMode, setIsModelValidationMode] = useState(false);

  // Parse URL query parameters to support live model preview (?model=... & ?view=model)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const modelParam = params.get('model');
      const viewParam = params.get('view');

      if (modelParam) {
        const cleanParam = modelParam.toLowerCase().replace('@', '');
        const matched = models.find(
          (m) =>
            m.id.toLowerCase() === cleanParam ||
            m.handle.toLowerCase().replace('@', '') === cleanParam ||
            m.name.toLowerCase().includes(cleanParam)
        );

        if (matched) {
          setModelProfile(matched);
          setMessages([
            {
              id: `msg-model-live-${Date.now()}`,
              sender: 'model',
              text: `¡Hola! Soy ${matched.name} (${matched.handle}) ✨ Ya tengo mi personalidad, mi voz configurada (${matched.voice.accent}) y mi bóveda de fotos activa. Escríbeme o envíame una nota de voz para probar en vivo cómo respondo y cómo fidelizo a tus suscriptores 😉`,
              timestamp: 'Ahora',
              isEncrypted: true,
            },
          ]);
        }
      }

      if (viewParam === 'model' || modelParam) {
        setIsModelValidationMode(true);
        setActiveTab('live_ops');
      }
    } catch (err) {
      console.warn('Error reading URL params:', err);
    }
  }, [models]);

  // Desktop keyboard shortcuts for high performance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          setActiveTab('live_ops');
        } else if (e.key === '2') {
          e.preventDefault();
          setActiveTab('twitter_x');
        } else if (e.key === '3') {
          e.preventDefault();
          setActiveTab('training');
        } else if (e.key === '4') {
          e.preventDefault();
          setActiveTab('crm');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync auth session from server on mount
  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.session) {
          setCurrentUserSession(data.session);
        }
      })
      .catch((err) => console.warn('Could not fetch auth session:', err));
  }, []);

  const handleSelectModel = (selected: ModelProfile) => {
    setModelProfile(selected);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-model-switch-${Date.now()}`,
        sender: 'model',
        text: `Hola, soy ${selected.name} (${selected.handle}) ✨ Me pillas justo tomándome un momento para responderte. Cuéntame qué tal tu día 😉`,
        timestamp: 'Ahora',
        isEncrypted: true,
      },
    ]);
  };

  const handleAddModel = (newM: ModelProfile) => {
    setModels((prev) => [newM, ...prev]);
  };

  const handleUpdateModel = (updated: ModelProfile) => {
    setModels((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    if (modelProfile.id === updated.id) {
      setModelProfile(updated);
    }
  };

  // Fetch initial leads from server
  useEffect(() => {
    fetch('/api/crm/leads')
      .then((r) => r.json())
      .then((data) => {
        if (data.leads) {
          setLeads(data.leads);
          const currentLead = data.leads.find((l: any) => l.username === activeUsername);
          if (currentLead?.memory) {
            setUserMemory(currentLead.memory);
          }
        }
      })
      .catch((err) => console.warn('Could not fetch CRM leads:', err));
  }, []);

  const handleSelectScenario = (scen: InboundScenario) => {
    setActiveScenarioId(scen.id);
    setMessages(scen.initialMessages);
    setMetrics((prev) => ({
      ...prev,
      trustScore: scen.initialTrust,
      isVipReady: scen.initialTrust >= modelProfile.rules.conversionThreshold,
      reasoning: `Contexto situacional cargado: ${scen.name}. Aura interpreta la interacción desde este punto real.`,
    }));
  };

  const handleSelectUser = (uname: string) => {
    setActiveUsername(uname);
    const selectedLead = leads.find((l) => l.username === uname);
    if (selectedLead?.memory) {
      setUserMemory(selectedLead.memory);
    } else {
      setUserMemory({
        userId: `lead-${Date.now()}`,
        username: uname,
        currentMood: 'contento',
        communicationStyle: 'Expresivo y Emojis',
        moodIntensity: 6,
        keyFacts: ['Nuevo usuario'],
        preferredTopics: ['estilo de vida'],
        interactionCount: 1,
        lastEmotionalState: 'Primer contacto',
        suggestedApproach: 'Romper el hielo con soltura y personalidad.',
        attachmentLevel: 'Inicial',
      });
    }

    if (selectedLead) {
      setMetrics((prev) => ({
        ...prev,
        trustScore: selectedLead.trustScore,
        reciprocity: selectedLead.reciprocity,
        stage: selectedLead.stage,
        isVipReady: selectedLead.trustScore >= modelProfile.rules.conversionThreshold,
      }));
    }

    // Default to natural coffee story context for this user
    setMessages([
      {
        id: `msg-ctx-${Date.now()}`,
        sender: 'user',
        text: `Hola Valeria, vi tu story de hoy y me encantó tu estilo.`,
        timestamp: 'Hace 2 min',
        isEncrypted: true,
      },
      {
        id: `msg-res-${Date.now()}`,
        sender: 'model',
        text: `Jajaja qué lindo, me pillaste justo con una taza de café en la mano ☕ A ver... cuéntame qué fue lo que más te llamó la atención 😉`,
        timestamp: 'Hace 1 min',
        photoCategory: 'cafe',
        photoCaption: 'Tomándome un café por la mañana ☕',
        isEncrypted: true,
      },
    ]);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
      isXSynced: true,
      xDeliveryStatus: 'Reflejado en X DMs (Entregado)',
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsModelTyping(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
          modelProfile,
          currentTrustScore: metrics.trustScore,
          username: activeUsername,
        }),
      });

      const resData = await response.json();
      const agentData = resData?.data || {
        replyText: 'Jajaja a ver... me encanta cómo piensas. Oye, ¿tú de dónde me escribes? 😉',
        trustScore: Math.min(100, metrics.trustScore + 8),
        reciprocityScore: Math.min(100, metrics.reciprocity + 10),
        stage: 'rapport',
        reasoning: 'Respuesta conversacional natural adaptada al contexto.',
        sendVoice: false,
        sendPhoto: false,
      };

      // Update user memory from agent response
      if (agentData.userMemory) {
        setUserMemory(agentData.userMemory);
        setLeads((prev) =>
          prev.map((l) =>
            l.username === activeUsername
              ? {
                  ...l,
                  memory: agentData.userMemory,
                  trustScore: agentData.trustScore ?? l.trustScore,
                  lastMessage: text,
                  lastActive: 'Ahora',
                }
              : l
          )
        );
      }

      // Update confidence metrics
      const newTrustScore = agentData.trustScore ?? metrics.trustScore;
      const newReciprocity = agentData.reciprocityScore ?? Math.min(100, metrics.reciprocity + 12);
      const isVipReady = newTrustScore >= modelProfile.rules.conversionThreshold;

      const newMetrics: ConfidenceMetrics = {
        trustScore: newTrustScore,
        reciprocity: newReciprocity,
        responseFluency: Math.min(95, metrics.responseFluency + 8),
        positiveSentiment: Math.min(96, metrics.positiveSentiment + 10),
        stage: agentData.stage || (isVipReady ? 'vip_ready' : 'rapport'),
        threshold: modelProfile.rules.conversionThreshold,
        isVipReady,
        reasoning: agentData.reasoning || 'Aura interpretó la intención del usuario y ajustó su estrategia.',
        detectedMood: agentData.detectedMood || userMemory.currentMood,
        detectedStyle: agentData.detectedStyle || userMemory.communicationStyle,
      };

      setMetrics(newMetrics);
      setLastReasoning(agentData.reasoning || 'Respuesta generada con inteligencia contextual y psicológica.');

      // Audio generation if sendVoice is true
      let audioBase64: string | undefined = undefined;
      if (agentData.sendVoice || isVipReady) {
        try {
          const ttsRes = await fetch('/api/gemini/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: agentData.voiceScript || agentData.replyText,
              voiceName: modelProfile.voice.name,
              stylePrompt: modelProfile.voice.description,
            }),
          });
          const ttsData = await ttsRes.json();
          if (ttsData?.audioBase64) {
            audioBase64 = ttsData.audioBase64;
          }
        } catch (ttsErr) {
          console.warn('TTS fetch failed:', ttsErr);
        }
      }

      // Attached photo selection if sendPhoto is true
      let photoCategory = agentData.photoCategory as (
        | 'cafe'
        | 'gym'
        | 'cozy'
        | 'beach'
        | 'teaser'
        | 'exclusive_ppv'
        | undefined
      );
      let mediaUrl: string | undefined = undefined;
      let photoCaption: string | undefined = undefined;

      if (agentData.sendPhoto) {
        // Priority 1: Match from model's real media vault
        const matchingVaultPhoto =
          modelProfile.mediaVault?.find((p) => p.category === photoCategory) ||
          modelProfile.mediaVault?.[0];
        if (matchingVaultPhoto) {
          mediaUrl = matchingVaultPhoto.url;
          photoCategory = matchingVaultPhoto.category;
          photoCaption = matchingVaultPhoto.caption;
        } else if (photoCategory && CASUAL_PHOTOS[photoCategory]) {
          mediaUrl = CASUAL_PHOTOS[photoCategory].url;
          photoCaption = CASUAL_PHOTOS[photoCategory].caption;
        } else {
          photoCategory = 'cozy';
          mediaUrl = CASUAL_PHOTOS.cozy.url;
          photoCaption = CASUAL_PHOTOS.cozy.caption;
        }

        // If agent didn't provide a contextual text, supply a short punchy caption directly referencing the photo
        if (!agentData.replyText || agentData.replyText.trim().length === 0) {
          if (photoCategory === 'cafe') {
            agentData.replyText = 'Tomándome un cafecito frío ☕ ¿Tú ya tomaste café hoy?';
          } else if (photoCategory === 'gym') {
            agentData.replyText = 'Terminando rutina en el gym 💪 ¿Hiciste ejercicio hoy o te pongo a sudar? 😉';
          } else if (photoCategory === 'beach') {
            agentData.replyText = 'Atardecer en la playita 🌊 Ojalá estuvieras aquí conmigo.';
          } else if (photoCategory === 'cozy') {
            agentData.replyText = 'Modo relax en casita ✨ ¿Qué planes tienes hoy?';
          }
        }
      }

      // Add model response message
      const modelMsg: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        sender: 'model',
        text: agentData.replyText || 'Jajaja qué risa contigo, me caes súper bien 😉',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mediaType: agentData.sendVoice ? 'audio' : agentData.sendPhoto ? 'image' : undefined,
        mediaUrl,
        audioBase64,
        audioDuration: Math.max(4, Math.round((agentData.replyText || '').length / 18)),
        photoCategory,
        photoCaption,
        confidenceSnapshot: newMetrics,
        userMoodSnapshot: agentData.detectedMood,
        pitchVip: Boolean(agentData.pitchVip || isVipReady),
        vipLink: modelProfile.vipLink,
        vipPrice: modelProfile.vipPrice,
        isEncrypted: true,
        isXSynced: true,
        xDmId: agentData.xDmId || `${Date.now()}`,
        xDeliveryStatus: agentData.xDeliveryStatus || 'Reflejado en X DMs',
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error('Error sending message:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-model-${Date.now()}`,
        sender: 'model',
        text: 'Jajaja a ver... me encanta tu vibra, cuéntame más 😉',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEncrypted: true,
        isXSynced: true,
        xDeliveryStatus: 'Reflejado en X DMs',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsModelTyping(false);
    }
  };

  const handleSendAudio = async (
    audioBase64: string,
    durationSeconds: number,
    simulatedTranscription?: string
  ) => {
    let transcriptionText = simulatedTranscription || 'Nota de voz enviada';

    if (!simulatedTranscription && audioBase64 !== 'simulated_voice_note_payload') {
      try {
        const transRes = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64 }),
        });
        const transData = await transRes.json();
        if (transData.transcription) {
          transcriptionText = transData.transcription;
        }
      } catch (err) {
        console.warn('Audio transcribe failed:', err);
      }
    }

    const userAudioMsg: ChatMessage = {
      id: `msg-user-audio-${Date.now()}`,
      sender: 'user',
      text: transcriptionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaType: 'audio',
      audioDuration: durationSeconds,
      isEncrypted: true,
    };

    setMessages((prev) => [...prev, userAudioMsg]);
    await handleSendMessage(transcriptionText);
  };

  const handleSendPhoto = async (url: string, caption?: string) => {
    const userPhotoMsg: ChatMessage = {
      id: `msg-user-photo-${Date.now()}`,
      sender: 'user',
      text: caption ? `[Foto compartida: ${caption}]` : '[Foto compartida]',
      mediaUrl: url,
      mediaType: 'image',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isEncrypted: true,
    };

    setMessages((prev) => [...prev, userPhotoMsg]);
    await handleSendMessage('Te comparto esta foto mía, ¿qué te parece?');
  };

  const handleResetConversation = () => {
    const defaultScen = INBOUND_SCENARIOS.find((s) => s.id === activeScenarioId) || INBOUND_SCENARIOS[0];
    setMessages(defaultScen.initialMessages);
    setMetrics({
      ...INITIAL_METRICS,
      trustScore: defaultScen.initialTrust,
    });
    setLastReasoning('Conversación restablecida al punto de entrada seleccionado.');
  };

  const handleForcePhoto = (category: 'cafe' | 'gym' | 'cozy' | 'beach') => {
    const vaultPhoto = modelProfile.mediaVault?.find((p) => p.category === category);
    const photo = CASUAL_PHOTOS[category];
    const photoCaption = vaultPhoto?.caption || photo?.caption || 'Foto casual';
    const photoMsg: ChatMessage = {
      id: `msg-force-photo-${Date.now()}`,
      sender: 'model',
      text: photoCaption,
      mediaUrl: vaultPhoto?.url || photo?.url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaType: 'image',
      photoCategory: category,
      photoCaption,
      isEncrypted: true,
    };
    setMessages((prev) => [...prev, photoMsg]);
    setMetrics((prev) => ({
      ...prev,
      trustScore: Math.min(100, prev.trustScore + 10),
      reasoning: `Envío de foto casual real (${category}). Saludo corto y referente a la foto.`,
    }));
  };

  const handleForceVoiceNote = async () => {
    const sampleText =
      'Oye, me encanta escucharte. Casi nunca hablo por aquí con nadie, pero contigo sentí una vibra súper linda y de confianza 🥰';
    const voiceMsg: ChatMessage = {
      id: `msg-force-voice-${Date.now()}`,
      sender: 'model',
      text: sampleText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mediaType: 'audio',
      audioDuration: 8,
      isEncrypted: true,
    };
    setMessages((prev) => [...prev, voiceMsg]);
    setMetrics((prev) => ({
      ...prev,
      trustScore: Math.min(100, prev.trustScore + 15),
      reasoning: 'Envío de nota de voz íntima. Eleva la inmersión y apego del cliente.',
    }));
  };

  const handleForceVipPitch = () => {
    const vipMsg: ChatMessage = {
      id: `msg-force-vip-${Date.now()}`,
      sender: 'model',
      text: `Oye lindo... aquí en el chat público me limitan un montón y no puedo subir mis fotos y videos más traviesos ni tener tanta privacidad 😉 Me encantaría que hablemos más cerquita por mi espacio VIP en ${modelProfile.vipLink}. Te dejé un regalito especial para que me acompañes hoy ✨ ¿Te animas a verme allá?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pitchVip: true,
      vipLink: modelProfile.vipLink,
      vipPrice: modelProfile.vipPrice,
      isEncrypted: true,
    };
    setMessages((prev) => [...prev, vipMsg]);
    setMetrics((prev) => ({
      ...prev,
      trustScore: 92,
      isVipReady: true,
      stage: 'vip_ready',
      reasoning:
        'Cierre comercial VIP ejecutado con asertividad y encanto.',
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white">
                AuraAgent
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AGENTE EN VIVO 100% OPERATIVO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Gestor agentico autónomo para modelos reales • Conversión, voz sintética y monetización recurrente
            </p>
          </div>
        </div>

        {/* Active Model Selector Pill */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setIsModelCatalogOpen(true)}
            className="flex items-center gap-2.5 px-2 py-1 rounded-xl hover:bg-slate-900 transition-all cursor-pointer group text-left"
            title="Cambiar o crear perfil de modelo real"
          >
            <div className="relative">
              <img
                src={modelProfile.avatarUrl}
                alt={modelProfile.name}
                className="w-8 h-8 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-slate-950" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 leading-tight">
                {modelProfile.name}
                <span className="text-[10px] text-sky-400 font-mono font-normal">
                  {modelProfile.handle}
                </span>
              </div>
              <div className="text-[10px] text-indigo-400 font-medium">
                {modelProfile.archetype} • {models.length} modelos
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 group-hover:bg-indigo-600 group-hover:text-white transition-all ml-1">
              Modelos ({models.length})
            </span>
          </button>
        </div>

        {/* User Switcher Pill Bar */}
        <div className="hidden 2xl:flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <span className="text-[10px] text-slate-400 font-semibold px-2 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Fan:
          </span>
          {['@carlos_m92', '@david_tech', '@alex_madrid', '@roberto_val'].map((u) => (
            <button
              key={u}
              onClick={() => handleSelectUser(u)}
              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeUsername === u
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {u.split('_')[0]}
            </button>
          ))}
        </div>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-800/90 border border-slate-700/70 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('live_ops')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'live_ops'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Operaciones en Vivo</span>
              <span className="sm:hidden">Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('twitter_x')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'twitter_x'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30 font-bold'
                  : 'text-slate-400 hover:text-sky-300'
              }`}
            >
              <Twitter className="w-3.5 h-3.5 text-sky-400" />
              <span>Integración X (Twitter)</span>
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse hidden md:inline-block" />
            </button>

            <button
              onClick={() => setActiveTab('training')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'training'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden md:inline">Entrenar Habilidades</span>
              <span className="md:hidden">Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'crm'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Panel & CRM</span>
            </button>
          </div>

          {/* Voz y Fotos de Mi Modelo Shortcut */}
          <button
            onClick={() => setActiveTab('twitter_x')}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-600/20 hover:from-rose-500/30 hover:to-purple-600/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Administrar las notas de voz, grabaciones y fotos de la modelo para X DMs"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden lg:inline">Voz & Bóveda de Mi Modelo</span>
            <span className="lg:hidden">Voz & Fotos</span>
          </button>

          {/* Compartir con la Modelo Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-sky-500/20 hover:from-emerald-500/30 hover:to-sky-500/30 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Compartir enlace en vivo con la modelo para supervisión en directo"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Compartir con la Modelo</span>
            <span className="sm:hidden">Compartir</span>
          </button>

          {/* Manual PDF Viewer & Download Button */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-600/20 hover:from-rose-500/30 hover:to-purple-600/30 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Abrir o descargar el Manual Oficial y Dossier Ejecutivo"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Manual PDF</span>
          </button>

          {/* Ejecutable Local Windows 64-bits & APK Instalador */}
          <button
            onClick={() => setIsInstallersModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-purple-500/20 hover:from-sky-500/30 hover:to-purple-500/30 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            title="Descargar ejecutable local para Windows 64-bits o instalar APK para celular"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Win64 & APK</span>
            <span className="sm:hidden">App</span>
          </button>

          {/* Reset button */}
          <button
            onClick={handleResetConversation}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700/80"
            title="Restablecer diálogo de prueba"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Auth Login Button (X or Google) */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              currentUserSession
                ? 'bg-slate-900 border-slate-700 hover:border-indigo-500 text-slate-200'
                : 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white border-transparent shadow-md'
            }`}
            title="Panel de inicio de sesión con X o Google"
          >
            {currentUserSession ? (
              <>
                <div className="relative">
                  <img
                    src={currentUserSession.avatar}
                    alt={currentUserSession.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="hidden md:inline font-bold">
                  {currentUserSession.handle || currentUserSession.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-sky-400 font-bold hidden lg:inline">
                  {currentUserSession.provider === 'x' ? '𝕏' : 'G'}
                </span>
              </>
            ) : (
              <>
                <Twitter className="w-3.5 h-3.5 text-sky-400" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Model Live Validation Banner (when opened via share link ?model=... & ?view=model) */}
      {isModelValidationMode && (
        <div className="bg-gradient-to-r from-emerald-950/90 via-teal-950/80 to-slate-900 border-b border-emerald-500/40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-lg animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-emerald-400/60 shadow-md flex-shrink-0">
              <img src={modelProfile.avatarUrl} alt={modelProfile.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Modo Supervisión en Vivo de Modelo: {modelProfile.name}
                </span>
                <span className="text-emerald-400 font-mono text-xs font-semibold">{modelProfile.handle}</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Voz: {modelProfile.voice.name} ({modelProfile.voice.accent})
                </span>
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  OnlyFans VIP: {modelProfile.vipPrice}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Estás interactuando en tiempo real con el clon agentico de <strong>{modelProfile.name}</strong>. Escribe un mensaje o envía un audio para escuchar su respuesta con tu tono de voz y verificar la progresión del Medidor de Confianza.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModelCatalogOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              Cambiar Modelo
            </button>
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Compartir Enlace
            </button>
            <button
              onClick={() => setIsModelValidationMode(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Ocultar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 pb-24 md:pb-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        {activeTab === 'live_ops' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Live Chat Interface with Context Selector (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3 h-[800px]">
              {/* Inbound Situational Context Bar */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0 shadow-md">
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-xs font-semibold pl-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Punto de Entrada en X:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {INBOUND_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      onClick={() => handleSelectScenario(scen)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                        activeScenarioId === scen.id
                          ? 'bg-rose-600 text-white shadow-md font-semibold'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                      }`}
                      title={scen.description}
                    >
                      <span>{scen.icon}</span>
                      <span>{scen.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Container */}
              <div className="flex-1 min-h-0">
                <ChatInterface
                  messages={messages}
                  modelProfile={modelProfile}
                  metrics={metrics}
                  userMemory={userMemory}
                  onSendMessage={handleSendMessage}
                  onSendAudio={handleSendAudio}
                  onSendPhoto={handleSendPhoto}
                  isModelTyping={isModelTyping}
                  platformSkin={platformSkin}
                  onChangeSkin={setPlatformSkin}
                />
              </div>
            </div>

            {/* Right Column: Multi-tab Inspector & Telemetry (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Inspector Tab Switcher */}
              <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-md">
                <button
                  onClick={() => setInspectorTab('memory')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    inspectorTab === 'memory'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Memoria & Emoción</span>
                </button>
                <button
                  onClick={() => setInspectorTab('confidence')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    inspectorTab === 'confidence'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Confianza & VIP</span>
                </button>
                <button
                  onClick={() => setInspectorTab('brain')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    inspectorTab === 'brain'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Cerebro Agentico</span>
                </button>
              </div>

              {/* Tab 1: Memory & Emotion Learning System */}
              {inspectorTab === 'memory' && (
                <UserMemoryInspector
                  memory={userMemory}
                  onUpdateMemory={(updated) => setUserMemory(updated)}
                  onSimulateMoodMessage={(text) => handleSendMessage(text)}
                />
              )}

              {/* Tab 2: Trust & Confidence Analyzer Module */}
              {inspectorTab === 'confidence' && (
                <TrustConfidenceMeter
                  metrics={metrics}
                  threshold={modelProfile.rules.conversionThreshold}
                  totalMessages={messages.length}
                  onForceVipPitch={handleForceVipPitch}
                />
              )}

              {/* Tab 3: Agent Brain HUD & Overrides */}
              {inspectorTab === 'brain' && (
                <AgentBrainHUD
                  metrics={metrics}
                  modelProfile={modelProfile}
                  lastDecisionReasoning={lastReasoning}
                  onForcePhoto={handleForcePhoto}
                  onForceVoiceNote={handleForceVoiceNote}
                  onForceVipPitch={handleForceVipPitch}
                  onUpdateThreshold={(val) =>
                    setModelProfile((prev) => ({
                      ...prev,
                      rules: { ...prev.rules, conversionThreshold: val },
                    }))
                  }
                  isSimulatingResponse={isModelTyping}
                />
              )}
            </div>
          </div>
        ) : activeTab === 'twitter_x' ? (
          /* Dedicated X (Twitter) Direct Messages Hub */
          <TwitterIntegrationHub
            activeModel={modelProfile}
            models={models}
            onSelectModel={handleSelectModel}
            currentSession={currentUserSession}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onOpenInstallers={() => setIsInstallersModalOpen(true)}
          />
        ) : activeTab === 'training' ? (
          /* Agent Training & Skill Benchmark Lab */
          <AgentTrainingLab
            modelProfile={modelProfile}
            onUpdateSkills={(newSkills) =>
              setModelProfile((prev) => ({ ...prev, skills: newSkills }))
            }
            onRunTestPrompt={(promptText) => {
              setActiveTab('live_ops');
              handleSendMessage(promptText);
            }}
          />
        ) : (
          /* CRM & Subscription Dashboard */
          <CRMSubscriptions
            modelProfile={modelProfile}
            leads={leads}
            onUpdateProfile={(updated) => setModelProfile(updated)}
            onSelectLeadForChat={(lead) => {
              setActiveTab('live_ops');
              handleSelectUser(lead.username);
            }}
          />
        )}
      </main>

      {/* Multi-Model Creator Catalog & Switcher Modal */}
      <ModelCatalogModal
        isOpen={isModelCatalogOpen}
        onClose={() => setIsModelCatalogOpen(false)}
        models={models}
        activeModel={modelProfile}
        onSelectModel={handleSelectModel}
        onAddModel={handleAddModel}
        onUpdateModel={handleUpdateModel}
      />

      {/* Login with X or Google Modal */}
      <AuthLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentSession={currentUserSession}
        onLogin={(sess) => setCurrentUserSession(sess)}
        onLogout={() => setCurrentUserSession(null)}
      />

      {/* Share Live with Model Modal */}
      <ShareLiveWithModelModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        model={modelProfile}
        models={models}
        onSelectModel={handleSelectModel}
      />

      {/* Manual & Dossier Interactive Viewer Modal */}
      <ManualViewerModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      {/* Local Windows 64-bit & Mobile APK Installers Modal */}
      <InstallersModal
        isOpen={isInstallersModalOpen}
        onClose={() => setIsInstallersModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Visible on phones & tablets) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-2xl"
      >
        <button
          onClick={() => setActiveTab('live_ops')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'live_ops' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('twitter_x')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'twitter_x' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Voz & Fotos</span>
        </button>

        <button
          onClick={() => setActiveTab('training')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'training' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('crm')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'crm' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>CRM</span>
        </button>

        <button
          onClick={() => setIsInstallersModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-xl text-sky-400 hover:text-sky-300 bg-sky-500/10 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-400" />
          <span>Win64 / APK</span>
        </button>
      </nav>

      {/* Footer / Privacy note */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>AuraAgent Operativo en Vivo • Aprendizaje Automatizado Continuo • Cifrado TLS 1.3</span>
        </div>
        <div>
          <span>AuraAgent Platform • Diseñado para Maximizar Ventas y Protección de Creadoras</span>
        </div>
      </footer>
    </div>
  );
}
