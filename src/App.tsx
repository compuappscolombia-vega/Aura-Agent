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
import { ModelVoiceAndMediaVault } from './components/ModelVoiceAndMediaVault';
import { DEFAULT_MODELS } from './data/modelsRoster';
import { AuraAgentLogo } from './components/AuraAgentLogo';
import { voiceEngine } from './utils/audioPlayer';
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
  UserPlus,
  Crown,
  ChevronDown,
  LogOut,
  User,
  Camera,
  Upload,
} from 'lucide-react';
import { XLogo } from './components/icons/XLogo';

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
    initialTrust: 24,
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
    initialTrust: 28,
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
    initialTrust: 20,
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
    initialTrust: 18,
    initialMessages: [],
  },
];

const INITIAL_METRICS: ConfidenceMetrics = {
  trustScore: 24,
  reciprocity: 35,
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
  const [models, setModels] = useState<ModelProfile[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('aura_models');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const ids = new Set(parsed.map((p: any) => p.id));
            const merged = [...parsed];
            for (const dm of DEFAULT_MODELS) {
              if (!ids.has(dm.id)) merged.push(dm);
            }
            return merged;
          }
        }
      } catch (e) {
        console.warn('Could not load models from storage:', e);
      }
    }
    return DEFAULT_MODELS;
  });

  // Creator / Admin Auth Session State - Returns null if not logged in
  const [currentUserSession, setCurrentUserSession] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('aura_current_session');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.warn('Could not load session from storage:', e);
      }
    }
    return null;
  });

  const [modelProfile, setModelProfile] = useState<ModelProfile>(() => {
    const defaultM = DEFAULT_MODELS[0];
    return defaultM;
  });
  const [isModelCatalogOpen, setIsModelCatalogOpen] = useState(false);
  const [metrics, setMetrics] = useState<ConfidenceMetrics>(INITIAL_METRICS);
  const [activeUsername, setActiveUsername] = useState<string>('@carlos_m92');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const initialModelId = DEFAULT_MODELS[0].id;
        const saved = localStorage.getItem(`aura_chat_msgs_${initialModelId}_@carlos_m92`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.warn('Could not read saved messages:', e);
      }
    }
    return INBOUND_SCENARIOS[0].initialMessages;
  });
  const [userMemory, setUserMemory] = useState<UserMemory>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('aura_memory_@carlos_m92');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn('Could not read saved memory:', e);
      }
    }
    return INITIAL_USER_MEMORY;
  });
  const [isModelTyping, setIsModelTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'live_ops' | 'twitter_x' | 'training' | 'crm' | 'vault'>('live_ops');
  const [inspectorTab, setInspectorTab] = useState<'memory' | 'confidence' | 'brain'>('memory');
  const [platformSkin, setPlatformSkin] = useState<'X (Twitter)' | 'Web'>('X (Twitter)');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [lastReasoning, setLastReasoning] = useState<string>(
    'Aura activa: interpretación profunda de contexto, adaptación al estado anímico y orientación estratégica a cierre VIP.'
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isInstallersModalOpen, setIsInstallersModalOpen] = useState(false);
  const [isModelValidationMode, setIsModelValidationMode] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string>('story-cafe');
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const toolsRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const navMenuRef = React.useRef<HTMLDivElement>(null);
  const adminAvatarInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-persist conversation history whenever messages change (100% resilient across reload/switches)
  useEffect(() => {
    if (typeof window !== 'undefined' && messages.length > 0) {
      try {
        const key = `aura_chat_msgs_${modelProfile.id}_${activeUsername}`;
        localStorage.setItem(key, JSON.stringify(messages));
      } catch (e) {
        console.warn('Could not save chat messages:', e);
      }
    }
  }, [messages, modelProfile.id, activeUsername]);

  // Auto-persist user memory whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && userMemory) {
      try {
        localStorage.setItem(`aura_memory_${activeUsername}`, JSON.stringify(userMemory));
      } catch (e) {
        console.warn('Could not save user memory:', e);
      }
    }
  }, [userMemory, activeUsername]);

  // Synchronize calibrated natural voice profile whenever active model changes
  useEffect(() => {
    voiceEngine.loadModelVoiceProfile(modelProfile.id, {
      pitch: modelProfile.voiceDna?.pitch ?? modelProfile.voice.pitch,
      rate: modelProfile.voiceDna?.rate ?? modelProfile.voice.rate,
      accent: modelProfile.voiceDna?.accentDialect ?? modelProfile.voice.accent,
      voiceName: modelProfile.voice.name,
      lang: modelProfile.voice.lang || 'es-CO',
      ambiencePreset: (modelProfile.voiceDna?.ambientPresenceType as any) || 'room_intimate',
      enableAmbience: true,
    });
  }, [modelProfile.id]);

  // Admin Profile Photo Upload Handler - Restricted exclusively to admin role
  const handleAdminAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserSession || currentUserSession.role !== 'admin') return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen de perfil no debe superar los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;
      const updatedSession: UserSession = {
        ...currentUserSession,
        avatar: base64Url,
      };
      setCurrentUserSession(updatedSession);
      localStorage.setItem('aura_current_session', JSON.stringify(updatedSession));
    };
    reader.readAsDataURL(file);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navMenuRef.current && !navMenuRef.current.contains(e.target as Node)) {
        setIsNavMenuOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    if (typeof window !== 'undefined') {
      try {
        const key = `aura_chat_msgs_${selected.id}_${activeUsername}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not read saved model chat:', e);
      }
    }
    setMessages([
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
    setModels((prev) => {
      const updated = [newM, ...prev.filter((m) => m.id !== newM.id)];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aura_models', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    // Also persist to backend
    fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newM),
    }).catch((err) => console.warn('Could not sync model to backend:', err));
  };

  const handleSetUserSession = (sess: UserSession | null, associatedModel?: ModelProfile) => {
    setCurrentUserSession(sess);
    if (typeof window !== 'undefined') {
      try {
        if (sess) {
          localStorage.setItem('aura_current_session', JSON.stringify(sess));
        } else {
          localStorage.removeItem('aura_current_session');
        }
      } catch (e) {}
    }

    if (!sess) {
      fetch('/api/auth/logout', { method: 'POST' }).catch((err) =>
        console.warn('Could not sync logout to backend:', err)
      );
      return;
    }

    if (associatedModel) {
      setModelProfile(associatedModel);
    } else if (sess?.role === 'creator') {
      const matched =
        models.find((m) => m.id === sess.associatedModelId || m.handle === sess.handle) ||
        models.find((m) => !m.isSystemDefault);
      if (matched) {
        setModelProfile(matched);
      }
    }
  };

  const handleUpdateModel = (updated: ModelProfile) => {
    setModels((prev) => {
      const updatedList = prev.map((m) => (m.id === updated.id ? updated : m));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('aura_models', JSON.stringify(updatedList));
        } catch (e) {}
      }
      return updatedList;
    });
    if (modelProfile.id === updated.id) {
      setModelProfile(updated);
    }
    fetch('/api/models', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Could not update model on backend:', err));
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

    // Check persistent chat history for this user & model
    if (typeof window !== 'undefined') {
      try {
        const key = `aura_chat_msgs_${modelProfile.id}_${uname}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            return;
          }
        }
      } catch (e) {
        console.warn('Could not read saved user chat history:', e);
      }
    }

    // Default to natural initial context for a new contact
    setMessages([
      {
        id: `msg-ctx-${Date.now()}`,
        sender: 'user',
        text: `Hola ${modelProfile.name}, vi tu perfil y me encantó tu estilo.`,
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

      // Update confidence metrics with organic conversational requirements
      const userMessageCount = updatedMessages.filter((m) => m.sender === 'user').length;
      const hasExchangedMedia =
        updatedMessages.some(
          (m) => m.mediaType === 'image' || m.mediaType === 'audio' || m.photoCategory || m.audioBase64
        ) || Boolean(agentData.sendPhoto) || Boolean(agentData.sendVoice);

      const newTrustScore = agentData.trustScore ?? metrics.trustScore;
      const newReciprocity = agentData.reciprocityScore ?? Math.min(100, metrics.reciprocity + 12);

      // Strict rule: VIP is ready ONLY after 6+ user messages, exchanging photos/audio, and earned high trust
      const isVipReady =
        newTrustScore >= modelProfile.rules.conversionThreshold &&
        userMessageCount >= 6 &&
        hasExchangedMedia;

      const newMetrics: ConfidenceMetrics = {
        trustScore: newTrustScore,
        reciprocity: newReciprocity,
        responseFluency: Math.min(95, metrics.responseFluency + 8),
        positiveSentiment: Math.min(96, metrics.positiveSentiment + 10),
        stage: isVipReady ? 'vip_ready' : newTrustScore >= 55 ? 'warm' : newTrustScore >= 35 ? 'rapport' : 'cold',
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
              modelName: modelProfile.name,
              accent: modelProfile.voiceDna?.accentDialect || modelProfile.voice.accent,
              pitch: modelProfile.voiceDna?.pitch ?? modelProfile.voice.pitch,
              rate: modelProfile.voiceDna?.rate ?? modelProfile.voice.rate,
              timbreScore: modelProfile.voiceDna?.timbreScore ?? 99.4,
              breathiness: modelProfile.voiceDna?.breathiness ?? 34,
              roomAcoustics: modelProfile.voiceDna?.roomAcoustics,
              voiceDna: modelProfile.voiceDna,
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
        pitchVip: Boolean(agentData.pitchVip && isVipReady),
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
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`aura_chat_msgs_${modelProfile.id}_${activeUsername}`);
      } catch (e) {}
    }
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

  if (!currentUserSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 font-sans selection:bg-rose-500 selection:text-white">
        <AuthLoginModal
          isOpen={true}
          canClose={false}
          onClose={() => {}}
          currentSession={null}
          onLogin={handleSetUserSession}
          onLogout={() => handleSetUserSession(null)}
          realModels={models.filter((m) => !m.isSystemDefault)}
          onRegisterRealModel={handleAddModel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar: Clean, Responsive 3-Zone Architecture */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Zone: Brand & Active Model Selector */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <AuraAgentLogo size="md" showText={true} />
            <span className="hidden xl:inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
              Secure Engine
            </span>
          </div>

          {/* Active Model Selector Pill - ONLY rendered for Administrator profile */}
          {currentUserSession?.role === 'admin' && (
            <>
              <div className="h-5 w-px bg-slate-800 hidden sm:block" />
              <button
                onClick={() => setIsModelCatalogOpen(true)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left shadow-sm group"
                title="Supervisar catálogo de modelos (Vista Administrador)"
              >
                <div className="relative shrink-0">
                  <img
                    src={modelProfile.avatarUrl}
                    alt={modelProfile.name}
                    className="w-6 h-6 rounded-lg object-cover border border-slate-700 group-hover:border-indigo-400 transition-colors"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
                </div>
                <div className="hidden md:block leading-tight pr-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1">
                    <span className="truncate max-w-[100px]">{modelProfile.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Supervisión
                    </span>
                  </div>
                  <span className="text-[10px] text-sky-400 font-mono">
                    {modelProfile.handle}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </>
          )}
        </div>

        {/* Center Zone: Dropdown of System Modules matching Herramientas style (Image 2) */}
        <div className="relative" ref={navMenuRef}>
          <button
            onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Seleccionar módulo o función activa"
          >
            {activeTab === 'live_ops' && <Radio className="w-3.5 h-3.5 text-emerald-400" />}
            {activeTab === 'twitter_x' && <XLogo className="w-3.5 h-3.5 text-sky-400" />}
            {activeTab === 'training' && <GraduationCap className="w-3.5 h-3.5 text-amber-300" />}
            {activeTab === 'crm' && <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />}
            {activeTab === 'vault' && <Volume2 className="w-3.5 h-3.5 text-rose-400" />}

            <span className="font-semibold text-white">
              {activeTab === 'live_ops' && 'Operaciones en Vivo'}
              {activeTab === 'twitter_x' && 'Integración X'}
              {activeTab === 'training' && 'Entrenar Aura'}
              {activeTab === 'crm' && 'Panel & CRM'}
              {activeTab === 'vault' && 'Voz & Bóveda'}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isNavMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isNavMenuOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in flex flex-col gap-1">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Módulos del Sistema
              </div>

              {/* 1. Operaciones en Vivo */}
              <button
                onClick={() => {
                  setActiveTab('live_ops');
                  setIsNavMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 text-left text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'live_ops'
                    ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/30'
                    : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Operaciones en Vivo</span>
                    {activeTab === 'live_ops' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Chat autónomo y medidor de confianza</div>
                </div>
              </button>

              {/* 2. Integración X */}
              <button
                onClick={() => {
                  setActiveTab('twitter_x');
                  setIsNavMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 text-left text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'twitter_x'
                    ? 'bg-sky-600/20 text-white font-semibold border border-sky-500/30'
                    : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <XLogo className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Integración X</span>
                    {activeTab === 'twitter_x' && <span className="w-2 h-2 rounded-full bg-sky-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Sincronización en tiempo real de DMs</div>
                </div>
              </button>

              {/* 3. Entrenar Aura (solo Administrador) */}
              {currentUserSession?.role === 'admin' && (
                <button
                  onClick={() => {
                    setActiveTab('training');
                    setIsNavMenuOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 text-left text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'training'
                      ? 'bg-amber-600/20 text-white font-semibold border border-amber-500/30'
                      : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white flex items-center justify-between">
                      <span>Entrenar Aura</span>
                      {activeTab === 'training' && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">Lab de voz hiperrealista y A/B testing</div>
                  </div>
                </button>
              )}

              {/* 4. Panel & CRM */}
              <button
                onClick={() => {
                  setActiveTab('crm');
                  setIsNavMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 text-left text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'crm'
                    ? 'bg-purple-600/20 text-white font-semibold border border-purple-500/30'
                    : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Panel & CRM</span>
                    {activeTab === 'crm' && <span className="w-2 h-2 rounded-full bg-purple-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Leads, embudo de ventas y suscriptores</div>
                </div>
              </button>

              {/* 5. Voz & Bóveda */}
              <button
                onClick={() => {
                  setActiveTab('vault');
                  setIsNavMenuOpen(false);
                }}
                className={`w-full px-2.5 py-2 text-left text-xs rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${
                  activeTab === 'vault'
                    ? 'bg-rose-600/20 text-white font-semibold border border-rose-500/30'
                    : 'text-slate-200 hover:bg-slate-800 border border-transparent'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Voz & Bóveda</span>
                    {activeTab === 'vault' && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Clon de voz, audios y fotos exclusivas</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Right Zone: Tools Dropdown + User Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Herramientas Dropdown Menu */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Herramientas del sistema, manual y descargas"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Herramientas</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in flex flex-col gap-1">
                <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Acciones & Herramientas
                </div>

                {currentUserSession?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      setIsShareModalOpen(true);
                    }}
                    className="w-full px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Compartir con la Modelo</div>
                      <div className="text-[10px] text-slate-400">Supervisión en vivo para creadoras</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsToolsOpen(false);
                    setIsManualModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Manual Oficial PDF</div>
                    <div className="text-[10px] text-slate-400">Dossier y manual de operación</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsToolsOpen(false);
                    setIsInstallersModalOpen(true);
                  }}
                  className="w-full px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Descargas Win64 & APK</div>
                    <div className="text-[10px] text-slate-400">Instalador Windows y app móvil</div>
                  </div>
                </button>

                {currentUserSession?.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsToolsOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Registrar Nuevo Perfil</div>
                      <div className="text-[10px] text-slate-400">Nueva modelo real o administrador</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsToolsOpen(false);
                    handleResetConversation();
                  }}
                  className="w-full px-2.5 py-2 text-left text-xs text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="font-semibold text-white">Restablecer Diálogo</div>
                    <div className="text-[10px] text-slate-400">Reiniciar conversación de prueba</div>
                  </div>
                </button>

                <div className="h-px bg-slate-800 my-1" />

                {/* Fan Switcher inside Tools */}
                <div className="px-2.5 py-1">
                  <div className="text-[10px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                    <Users className="w-3 h-3 text-indigo-400" /> Simular Lead / Fan:
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {['@carlos_m92', '@david_tech', '@alex_madrid', '@roberto_val'].map((u) => (
                      <button
                        key={u}
                        onClick={() => {
                          handleSelectUser(u);
                          setIsToolsOpen(false);
                        }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-left ${
                          activeUsername === u
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu with Explicit Logout */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 pr-2 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Cuenta y sesión actual"
            >
              <div className="relative shrink-0">
                <img
                  src={currentUserSession.avatar}
                  alt={currentUserSession.name}
                  className="w-6 h-6 rounded-lg object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
              </div>
              <span className="hidden sm:inline font-bold text-white truncate max-w-[90px]">
                {currentUserSession.name.split(' ')[0]}
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in flex flex-col gap-1.5">
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
                  <div className="relative group shrink-0">
                    <img
                      src={currentUserSession.avatar}
                      alt={currentUserSession.name}
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                    {currentUserSession.role === 'admin' && (
                      <button
                        onClick={() => adminAvatarInputRef.current?.click()}
                        className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                        title="Cambiar foto de perfil"
                      >
                        <Camera className="w-4 h-4 text-rose-400" />
                      </button>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{currentUserSession.name}</div>
                    <div className="text-[10px] text-sky-400 font-mono truncate">
                      {currentUserSession.handle || currentUserSession.email}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      {currentUserSession.role === 'admin' ? '👑 Administrador General' : '🔒 Modelo Real Oficial'}
                    </div>
                  </div>
                </div>

                {/* Subir foto de perfil: STRICTLY EXCLUSIVE TO ADMINISTRATOR */}
                {currentUserSession?.role === 'admin' && (
                  <>
                    <input
                      type="file"
                      ref={adminAvatarInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleAdminAvatarUpload}
                    />
                    <button
                      onClick={() => adminAvatarInputRef.current?.click()}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-500/30 rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                      title="Subir foto de perfil (solo administrador)"
                    >
                      <div className="flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5 text-rose-400" />
                        <span>Subir Foto de Perfil</span>
                      </div>
                      <Upload className="w-3 h-3 text-rose-400/80" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Gestionar Perfiles</span>
                </button>

                <div className="h-px bg-slate-800 my-0.5" />

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleSetUserSession(null);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-bold text-rose-400 hover:bg-rose-500/15 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
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
            {currentUserSession?.role === 'admin' && (
              <button
                onClick={() => setIsModelCatalogOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Users className="w-3.5 h-3.5" />
                Cambiar Modelo
              </button>
            )}
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
              {/* Inbound Situational Context Bar matching Herramientas style */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0 shadow-md">
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400 text-xs font-semibold pl-1">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Punto de Entrada en X:</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {INBOUND_SCENARIOS.map((scen) => (
                    <button
                      key={scen.id}
                      onClick={() => handleSelectScenario(scen)}
                      className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shadow-sm border ${
                        activeScenarioId === scen.id
                          ? 'bg-rose-600 text-white border-rose-500 shadow-rose-500/20 font-bold'
                          : 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-200'
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
                  onResetConversation={handleResetConversation}
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
            allModels={models}
            onUpdateSkills={(newSkills) =>
              setModelProfile((prev) => ({ ...prev, skills: newSkills }))
            }
            onUpdateModel={handleUpdateModel}
            onRunTestPrompt={(promptText) => {
              setActiveTab('live_ops');
              handleSendMessage(promptText);
            }}
          />
        ) : activeTab === 'crm' ? (
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
        ) : (
          /* Model Voice DNA & Media Vault Hub */
          <ModelVoiceAndMediaVault
            activeModel={modelProfile}
            onUpdateModel={handleUpdateModel}
            onTestWebhook={(sampleText) => {
              setActiveTab('live_ops');
              handleSendMessage(sampleText);
            }}
            onOpenInstallers={() => setIsInstallersModalOpen(true)}
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
        currentUserRole={currentUserSession?.role || 'creator'}
        onOpenRegistration={() => setIsAuthModalOpen(true)}
      />

      {/* Registration & Login Modal for Real Models and Admin */}
      <AuthLoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentSession={currentUserSession}
        onLogin={handleSetUserSession}
        onLogout={() => handleSetUserSession(null)}
        realModels={models.filter((m) => !m.isSystemDefault)}
        onRegisterRealModel={(newModel) => {
          handleAddModel(newModel);
        }}
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
          onClick={() => setActiveTab('vault')}
          className={`flex flex-col items-center gap-1 text-[10px] font-bold py-1 px-2 rounded-xl transition-colors cursor-pointer ${
            activeTab === 'vault' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Voz & Bóveda</span>
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

      {/* Footer: By CompuApps SecureDev */}
      <footer className="border-t border-slate-800/80 bg-slate-950/95 py-4 px-4 sm:px-6 text-xs text-slate-400 mt-auto w-full backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <AuraAgentLogo size="sm" showText={true} />
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 inline shrink-0" />
              Cifrado TLS 1.3 • Persistencia Conversacional Continua • Anti-Detección
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
            <span className="text-slate-500 text-[11px]">Plataforma oficial protegida por</span>
            <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-950/90 via-slate-900 to-indigo-950/90 border border-cyan-500/40 text-cyan-300 font-extrabold tracking-wide shadow-sm text-xs">
              By CompuApps SecureDev
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
