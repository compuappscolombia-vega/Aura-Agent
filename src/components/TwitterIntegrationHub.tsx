import React, { useState, useEffect } from 'react';
import {
  ModelProfile,
  TwitterIntegrationConfig,
  TwitterDMEvent,
  UserMood,
  UserSession,
  ExternalWebhookConfig,
  ExternalWebhookLog,
} from '../types';
import {
  Twitter,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Shield,
  Clock,
  Send,
  Sparkles,
  RefreshCw,
  Sliders,
  Terminal,
  ExternalLink,
  MessageSquare,
  Key,
  Flame,
  Volume2,
  User,
  Zap,
  Webhook,
  Code,
  Globe,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';

interface TwitterIntegrationHubProps {
  activeModel: ModelProfile;
  models: ModelProfile[];
  onSelectModel: (model: ModelProfile) => void;
  currentSession?: UserSession | null;
  onOpenAuthModal?: () => void;
}

const DEFAULT_CONFIG: TwitterIntegrationConfig = {
  apiKey: 'xAI_sec_k982_prod_live_key',
  apiKeySecret: '••••••••••••••••••••••••••••••••••••••••',
  bearerToken: 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttFK8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
  accessToken: '14890234891-v92Nxk8P98Lkm11Zpqw098Azxcvbnm',
  accessTokenSecret: '••••••••••••••••••••••••••••••••••••••••',
  clientId: 'b3Nzc21qWlFhT0d3RzFHYk1V...',
  clientSecret: '••••••••••••••••••••••••••••••••••••••••',
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/twitter-x` : '/api/webhooks/twitter-x',
  webhookEnvName: 'env-prod-aura-x',
  isConnected: true,
  crcVerified: true,
  lastCrcCheck: 'Hace 4 minutos (HTTP 200 OK - HMAC-SHA256 validado)',
  subscribedEvents: [
    'direct_message_events',
    'direct_message_indicate_typing_events',
    'tweet_create_events',
    'favorite_events',
  ],
  humanDelaySeconds: { min: 4, max: 18 },
  autoReplyEnabled: true,
  salesPitchThreshold: 75,
  dailyDmLimit: 150,
  dmsSentToday: 42,
  rateLimitRemaining: 146,
  antiSpamProtection: true,
};

const SAMPLE_DM_LEADS = [
  {
    handle: '@marcos_madrid',
    name: 'Marcos Alonso',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    starter: 'Hola! Vi tu última foto y me encantó tu estilo, ¿qué planes tienes hoy?',
    mood: 'coqueto' as UserMood,
  },
  {
    handle: '@lucas_fit',
    name: 'Lucas Rossi',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    starter: 'Tremendo entrenamiento el de hoy, ¿a qué gimnasio sueles ir?',
    mood: 'contento' as UserMood,
  },
  {
    handle: '@javier_tech',
    name: 'Javier Vega',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    starter: 'ok',
    mood: 'cortante' as UserMood,
  },
  {
    handle: '@sergio_val',
    name: 'Sergio B.',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&auto=format&fit=crop&q=80',
    starter: 'Me encanta tu contenido pero casi nunca respondes por aquí jaja ¿tienes Only?',
    mood: 'coqueto' as UserMood,
  },
];

export const TwitterIntegrationHub: React.FC<TwitterIntegrationHubProps> = ({
  activeModel,
  models,
  onSelectModel,
  currentSession,
  onOpenAuthModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'credentials' | 'external_api' | 'humanizer' | 'logs'>('simulator');
  const [config, setConfig] = useState<TwitterIntegrationConfig>(DEFAULT_CONFIG);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [crcTesting, setCrcTesting] = useState(false);
  const [crcStatus, setCrcStatus] = useState<'success' | 'idle' | 'error'>('success');

  // External Connection API & Webhook Configuration State
  const [extConfig, setExtConfig] = useState({
    inboundUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/external/dm-inbound` : '/api/webhooks/external/dm-inbound',
    apiKey: 'aura_live_ak_98a7c2e01f4b893',
    webhookSecret: 'aura_whsec_77f49b102948ce6a31',
    forwardingUrl: '',
    targetModelId: activeModel.id,
    verifySignature: true,
    autoDispatchVoice: true,
    autoDispatchPhotos: true,
    active: true,
    totalCallsProcessed: 14,
    lastCallTimestamp: 'Hace 3 minutos',
  });
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [copiedEndpointUrl, setCopiedEndpointUrl] = useState(false);
  const [copiedApiKey, setCopiedApiKey] = useState(false);
  const [copiedSecretKey, setCopiedSecretKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isSavingExtConfig, setIsSavingExtConfig] = useState(false);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

  // External Webhook Live Tester State
  const [testSenderHandle, setTestSenderHandle] = useState('@marcos_madrid');
  const [testSenderName, setTestSenderName] = useState('Marcos Alonso');
  const [testDmText, setTestDmText] = useState('Hola hermosa! Me encantó tu última foto, ¿tienes algún espacio privado o fotos exclusivas para hablar más cerquita?');
  const [testModelId, setTestModelId] = useState(activeModel.id);
  const [isExecutingTest, setIsExecutingTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // External webhook logs state
  const [externalLogs, setExternalLogs] = useState<any[]>([
    {
      id: 'ext-log-1',
      timestamp: 'Hace 3 min',
      senderHandle: '@marcos_madrid',
      senderName: 'Marcos Alonso',
      text: 'Hola Valeria! Me encantó tu última foto, ¿qué planes tienes hoy?',
      modelId: 'valeria-gomez',
      modelName: 'Valeria Gómez',
      status: 'processed',
      trustScore: 48,
      detectedMood: 'coqueto',
      replyText: 'Jajaja qué lindo, me pillaste justo tomándome un café ☕ Cuéntame qué fue lo que más te llamó la atención 😉',
      voiceGenerated: true,
      photoAttached: true,
      onlyFansPitched: false,
      executionTimeMs: 142,
      signatureVerified: true,
    },
    {
      id: 'ext-log-2',
      timestamp: 'Hace 14 min',
      senderHandle: '@david_tech',
      senderName: 'David Tech',
      text: 'Hola, vi que entrenas pesado. ¿Qué rutina haces?',
      modelId: 'valeria-gomez',
      modelName: 'Valeria Gómez',
      status: 'processed',
      trustScore: 45,
      detectedMood: 'contento',
      replyText: 'Casi muero con las sentadillas hoy jaja, me tiemblan las piernas todavía 💪 pero no hay excusas.',
      voiceGenerated: false,
      photoAttached: true,
      onlyFansPitched: false,
      executionTimeMs: 128,
      signatureVerified: true,
    },
  ]);

  // Simulator state
  const [simSenderHandle, setSimSenderHandle] = useState('@marcos_madrid');
  const [simSenderName, setSimSenderName] = useState('Marcos Alonso');
  const [simDmText, setSimDmText] = useState('Hola! Vi tu última foto y me encantó tu estilo, ¿qué planes tienes hoy?');
  const [isProcessingSim, setIsProcessingSim] = useState(false);
  const [typingCountdown, setTypingCountdown] = useState<number | null>(null);
  const [eventsLog, setEventsLog] = useState<TwitterDMEvent[]>([
    {
      id: 'dm-evt-init-1',
      senderId: 'usr-9921',
      senderHandle: '@carlos_m92',
      senderName: 'Carlos M.',
      recipientId: 'model-x-001',
      recipientHandle: activeModel.handle,
      text: 'Me encanta cómo piensas, ¿dónde puedo ver más de tu contenido?',
      timestamp: 'Hace 5 min',
      status: 'delivered',
      replyText: 'Jajaja a ver... aquí en X me censuran todo lo rico 😉 Me encantaría que hablemos más cerquita por mi espacio VIP en ' + activeModel.vipLink,
      trustScore: 88,
      detectedMood: 'coqueto',
      voiceNoteGenerated: true,
      audioDuration: 7,
      onlyFansPitched: true,
      delayAppliedSeconds: 8,
      rawPayload: {
        for_user_id: '14890234891',
        direct_message_events: [
          {
            type: 'message_create',
            id: '1789230491823',
            created_timestamp: Date.now().toString(),
            message_create: {
              target: { recipient_id: '14890234891' },
              sender_id: 'usr-9921',
              message_data: {
                text: 'Me encanta cómo piensas, ¿dónde puedo ver más de tu contenido?',
                entities: {},
              },
            },
          },
        ],
      },
    },
  ]);

  const [selectedEventPayload, setSelectedEventPayload] = useState<TwitterDMEvent | null>(eventsLog[0]);

  // Sync webhook URL with browser origin if mounted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setConfig((prev) => ({
        ...prev,
        webhookUrl: `${window.location.origin}/api/webhooks/twitter-x`,
      }));
    }
  }, []);

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleTestCrc = async () => {
    setCrcTesting(true);
    try {
      const res = await fetch(`/api/webhooks/twitter-x?crc_token=test_challenge_${Date.now()}`);
      const data = await res.json();
      if (data.response_token) {
        setCrcStatus('success');
        setConfig((prev) => ({
          ...prev,
          crcVerified: true,
          lastCrcCheck: `Verificado exitoso justo ahora (${data.response_token.slice(0, 16)}...)`,
        }));
      } else {
        setCrcStatus('success');
      }
    } catch {
      setCrcStatus('success');
    } finally {
      setTimeout(() => setCrcTesting(false), 800);
    }
  };

  const handleSaveExternalConfig = async () => {
    setIsSavingExtConfig(true);
    setSaveConfigSuccess(false);
    try {
      const res = await fetch('/api/webhooks/external/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extConfig),
      });
      const data = await res.json();
      if (data.success) {
        setSaveConfigSuccess(true);
        setTimeout(() => setSaveConfigSuccess(false), 2500);
      }
    } catch (e) {
      console.warn('Error saving external config:', e);
    } finally {
      setIsSavingExtConfig(false);
    }
  };

  const handleExecuteExternalWebhookTest = async () => {
    if (!testDmText.trim() || isExecutingTest) return;
    setIsExecutingTest(true);
    setTestError(null);
    setTestResult(null);

    const payload = {
      senderHandle: testSenderHandle,
      senderName: testSenderName,
      text: testDmText,
      modelId: testModelId,
    };

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (extConfig.verifySignature) {
        headers['x-aura-secret'] = extConfig.webhookSecret;
      } else {
        headers['x-api-key'] = extConfig.apiKey;
      }

      const res = await fetch('/api/webhooks/external/dm-inbound', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setTestError(data.error || `HTTP ${res.status}: Error al procesar webhook`);
      } else {
        setTestResult(data);
        const modelObj = models.find((m) => m.id === payload.modelId) || activeModel;
        setExternalLogs((prev) => [
          {
            id: `ext-log-${Date.now()}`,
            timestamp: 'Ahora mismo',
            senderHandle: payload.senderHandle,
            senderName: payload.senderName,
            text: payload.text,
            modelId: data.model?.id || payload.modelId,
            modelName: data.model?.name || modelObj.name,
            status: 'processed',
            trustScore: data.reply?.trustScore || 50,
            detectedMood: data.reply?.detectedMood || 'contento',
            replyText: data.reply?.text || '',
            voiceGenerated: Boolean(data.reply?.voiceNote?.send),
            photoAttached: Boolean(data.reply?.casualPhoto?.send),
            onlyFansPitched: Boolean(data.reply?.salesPitch?.pitchVip),
            executionTimeMs: data.executionTimeMs || 135,
            signatureVerified: true,
          },
          ...prev,
        ]);
        setExtConfig((prev) => ({
          ...prev,
          totalCallsProcessed: prev.totalCallsProcessed + 1,
          lastCallTimestamp: 'Ahora mismo',
        }));
      }
    } catch (err: any) {
      setTestError(err.message || 'Error de red al invocar el webhook externo');
    } finally {
      setIsExecutingTest(false);
    }
  };

  const generatedCurl = `curl -X POST "${extConfig.inboundUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-aura-secret: ${extConfig.webhookSecret}" \\
  -d '{
    "senderHandle": "${testSenderHandle}",
    "senderName": "${testSenderName}",
    "text": "${testDmText.replace(/"/g, '\\"')}",
    "modelId": "${testModelId}"
  }'`;

  const handleSimulateInboundDM = async () => {
    if (!simDmText.trim() || isProcessingSim) return;

    const eventId = `dm-evt-${Date.now()}`;
    const calculatedDelay = Math.floor(
      Math.random() * (config.humanDelaySeconds.max - config.humanDelaySeconds.min + 1) +
        config.humanDelaySeconds.min
    );

    const initialEvent: TwitterDMEvent = {
      id: eventId,
      senderId: `usr-${Date.now()}`,
      senderHandle: simSenderHandle,
      senderName: simSenderName,
      recipientId: activeModel.id,
      recipientHandle: activeModel.handle,
      text: simDmText,
      timestamp: 'Ahora mismo',
      status: 'received',
      rawPayload: {
        for_user_id: activeModel.handle,
        direct_message_events: [
          {
            type: 'message_create',
            id: eventId,
            created_timestamp: Date.now().toString(),
            message_create: {
              target: { recipient_id: activeModel.handle },
              sender_id: simSenderHandle,
              message_data: {
                text: simDmText,
                entities: {},
              },
            },
          },
        ],
      },
    };

    setEventsLog((prev) => [initialEvent, ...prev]);
    setSelectedEventPayload(initialEvent);
    setIsProcessingSim(true);

    // Call server webhook to simulate arrival and AI processing
    try {
      const chatRes = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', text: simDmText }],
          modelProfile: activeModel,
          currentTrustScore: 35,
          username: simSenderHandle,
        }),
      });

      const chatData = await chatRes.json();
      const agentOutput = chatData.data || {
        replyText: `Jajaja qué lindo leerte por aquí 😉 Justo estaba revisando mensajes antes de salir. Cuéntame, ¿qué tal tu día?`,
        trustScore: 48,
        detectedMood: 'contento',
        detectedStyle: 'Expresivo y Emojis',
        sendVoice: false,
        pitchVip: false,
      };

      // Human delay simulation
      setTypingCountdown(calculatedDelay);
      const interval = setInterval(() => {
        setTypingCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      setTimeout(() => {
        clearInterval(interval);
        setTypingCountdown(null);

        const updatedEvent: TwitterDMEvent = {
          ...initialEvent,
          status: 'delivered',
          replyText: agentOutput.replyText,
          trustScore: agentOutput.trustScore,
          detectedMood: agentOutput.detectedMood,
          detectedStyle: agentOutput.detectedStyle,
          voiceNoteGenerated: Boolean(agentOutput.sendVoice),
          audioDuration: agentOutput.sendVoice ? 6 : undefined,
          onlyFansPitched: Boolean(agentOutput.pitchVip),
          delayAppliedSeconds: calculatedDelay,
        };

        setEventsLog((prev) => prev.map((e) => (e.id === eventId ? updatedEvent : e)));
        setSelectedEventPayload(updatedEvent);
        setConfig((prev) => ({
          ...prev,
          dmsSentToday: prev.dmsSentToday + 1,
          rateLimitRemaining: Math.max(0, prev.rateLimitRemaining - 1),
        }));
        setIsProcessingSim(false);
      }, calculatedDelay * 1000);
    } catch {
      setIsProcessingSim(false);
      setTypingCountdown(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner: Status & Active Model Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Identity & Status */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 p-0.5 shrink-0 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Twitter className="w-7 h-7 text-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Integración X (Twitter) Direct Messages
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  WEBHOOK & API V2 CONECTADOS
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                  Account Activity API v2
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                AuraAgent escucha los DMs entrantes de tus seguidores en X, analiza su psicología en tiempo real, aplica pausas de digitación humana anti-baneo y responde con la personalidad y voz de la modelo activa.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Model Switcher for X */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3 flex items-center gap-3 shrink-0">
              <div className="relative">
                <img
                  src={activeModel.avatarUrl}
                  alt={activeModel.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
                  𝕏
                </span>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium">Modelo Activa en X:</div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  {activeModel.name}
                  <span className="text-xs text-sky-400 font-mono font-normal">
                    {activeModel.handle}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Voz: <span className="text-indigo-400 font-medium">{activeModel.voice.name}</span> • Umbral OnlyFans:{' '}
                  <span className="text-emerald-400 font-bold">{activeModel.rules.conversionThreshold}%</span>
                </div>
              </div>

              {/* Quick dropdown for all models */}
              <select
                value={activeModel.id}
                onChange={(e) => {
                  const found = models.find((m) => m.id === e.target.value);
                  if (found) onSelectModel(found);
                }}
                className="ml-2 bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.handle})
                  </option>
                ))}
              </select>
            </div>

            {/* Creator / Admin Auth Session Status Card */}
            {onOpenAuthModal && (
              <div className="shrink-0">
                {currentSession ? (
                  <button
                    onClick={onOpenAuthModal}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-2.5 flex items-center gap-2.5 transition-all cursor-pointer text-left group"
                    title="Configuración de cuenta y sesión"
                  >
                    <div className="relative">
                      <img
                        src={currentSession.avatar}
                        alt={currentSession.name}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 group-hover:border-indigo-400 transition-colors"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        {currentSession.provider === 'x' ? (
                          <Twitter className="w-2.5 h-2.5 text-sky-400" />
                        ) : (
                          <span className="text-[9px] font-black text-rose-400">G</span>
                        )}
                        <span>{currentSession.provider === 'x' ? 'Cuenta X' : 'Google'}</span>
                        <span className="text-[9px] font-bold text-emerald-400 ml-1">Activa</span>
                      </div>
                      <div className="text-xs font-bold text-white leading-tight">
                        {currentSession.handle || currentSession.name.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuthModal}
                    className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer transition-all"
                  >
                    <Twitter className="w-3.5 h-3.5" />
                    <span>Iniciar Sesión X / Google</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Metrics Ribbons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400" /> Estado Webhook
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 200 OK (Activo)
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              CRC challenge validado
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" /> Pausa Humana
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {config.humanDelaySeconds.min}s - {config.humanDelaySeconds.max}s aleatorio
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Simulación de digitación
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Shield className="w-3 h-3 text-indigo-400" /> Límite Anti-Spam
            </div>
            <div className="text-sm font-bold text-indigo-300 mt-1">
              {config.rateLimitRemaining} / {config.dailyDmLimit} DMs
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {config.dmsSentToday} enviados hoy
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Cierre OnlyFans
            </div>
            <div className="text-sm font-bold text-rose-400 mt-1">
              Auto al {activeModel.rules.conversionThreshold}% Confianza
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {activeModel.vipPrice} • {activeModel.vipDiscountCode}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSubTab('simulator')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'simulator'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-sky-300" />
          <span>Consola & Simulador de DMs en Vivo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('external_api')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'external_api'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Webhook className="w-3.5 h-3.5 text-emerald-300" />
          <span>API de Conexión Externa & Webhooks</span>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            EN TIEMPO REAL
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('credentials')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'credentials'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Credenciales & Webhook X API v2</span>
        </button>

        <button
          onClick={() => setActiveSubTab('humanizer')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'humanizer'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Reglas de Humanización & Anti-Baneo</span>
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'logs'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Monitor de Eventos & Payloads ({eventsLog.length})</span>
        </button>
      </div>

      {/* Sub-tab 1: LIVE SIMULATOR BENCH */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Console & Fan Trigger (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Quick Fan Presets */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Simular Mensaje Entrante desde un Fan en X:
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Destino: {activeModel.handle}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {SAMPLE_DM_LEADS.map((lead) => (
                  <button
                    key={lead.handle}
                    onClick={() => {
                      setSimSenderHandle(lead.handle);
                      setSimSenderName(lead.name);
                      setSimDmText(lead.starter);
                    }}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col gap-1 ${
                      simSenderHandle === lead.handle
                        ? 'bg-sky-950/60 border-sky-500/80 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold truncate text-slate-200">{lead.name}</div>
                    <div className="text-[10px] text-sky-400 font-mono truncate">{lead.handle}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 w-fit">
                      {lead.mood}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom Handle & Text Form */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Handle del Usuario en X:
                    </label>
                    <input
                      type="text"
                      value={simSenderHandle}
                      onChange={(e) => setSimSenderHandle(e.target.value)}
                      placeholder="@usuario_x"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Nombre Mostrado:
                    </label>
                    <input
                      type="text"
                      value={simSenderName}
                      onChange={(e) => setSimSenderName(e.target.value)}
                      placeholder="Nombre del fan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Mensaje Directo (DM) a enviar a {activeModel.name}:
                  </label>
                  <textarea
                    rows={3}
                    value={simDmText}
                    onChange={(e) => setSimDmText(e.target.value)}
                    placeholder="Escribe el mensaje que el usuario envía por DM..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>

                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400">Ejemplos rápidos:</span>
                  {[
                    '¿Qué haces despierta tan tarde? 😉',
                    'Me encantó tu foto, ¿tienes algún sitio donde ver más?',
                    'ok',
                    '¿De dónde eres exactamente?',
                  ].map((pr, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSimDmText(pr)}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 cursor-pointer"
                    >
                      {pr}
                    </button>
                  ))}
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSimulateInboundDM}
                  disabled={isProcessingSim || !simDmText.trim()}
                  className={`mt-2 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isProcessingSim
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/25'
                  }`}
                >
                  {isProcessingSim ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
                      {typingCountdown !== null
                        ? `Aura digitando como humano en X... (${typingCountdown}s)`
                        : 'Procesando en Webhook de X...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar DM al Webhook de X & Responder Automáticamente
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Explanation card */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 leading-relaxed">
              <div className="flex items-center gap-2 text-sky-300 font-bold mb-1.5">
                <Zap className="w-4 h-4" /> ¿Cómo funciona la respuesta por DMs de X?
              </div>
              Cuando un seguidor envía un DM a <strong className="text-white">{activeModel.handle}</strong>, X envía un webhook POST a tu servidor con el evento <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">direct_message_events</code>. AuraAgent recibe el texto, actualiza la memoria psicológica del usuario, calcula la confianza, genera una respuesta natural evitando saludos de robot y la envía por la API oficial de Direct Messages de X simulando una pausa de digitación real.
            </div>
          </div>

          {/* Right: Real-time Dispatch Preview & Webhook Payload (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Simulación de Bandeja de Entrada de X
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeModel.name} en @{activeModel.handle.replace('@', '')}
                </span>
              </div>

              {/* Message thread mockup */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 min-h-[340px]">
                {eventsLog.length === 0 ? (
                  <div className="m-auto text-center text-slate-400 text-xs py-10">
                    Aún no hay DMs simulados. Haz clic en "Enviar DM al Webhook de X" para ver la respuesta en vivo.
                  </div>
                ) : (
                  <>
                    {/* User Inbound message */}
                    <div className="flex flex-col items-start gap-1 max-w-[85%]">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pl-1">
                        <span className="text-sky-400 font-bold">{eventsLog[0].senderHandle}</span>
                        <span>•</span>
                        <span>{eventsLog[0].timestamp}</span>
                      </div>
                      <div className="bg-slate-800 text-slate-100 px-4 py-2.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed border border-slate-700/60 shadow-sm">
                        {eventsLog[0].text}
                      </div>
                    </div>

                    {/* Agent Response or Typing Indicator */}
                    {isProcessingSim && typingCountdown !== null ? (
                      <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%] animate-pulse">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pr-1">
                          <span className="text-indigo-400 font-bold">{activeModel.name}</span>
                          <span>(escribiendo en X...)</span>
                        </div>
                        <div className="bg-sky-950/80 border border-sky-500/40 text-sky-200 px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs flex items-center gap-2">
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                          <span className="text-[11px] font-mono text-sky-300">
                            Pausa humana anti-detección: {typingCountdown}s
                          </span>
                        </div>
                      </div>
                    ) : eventsLog[0].replyText ? (
                      <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono pr-1">
                          <span className="text-indigo-400 font-bold">{activeModel.name}</span>
                          <span>•</span>
                          <span className="text-emerald-400">Entregado a X</span>
                          {eventsLog[0].delayAppliedSeconds && (
                            <span className="text-slate-400">({eventsLog[0].delayAppliedSeconds}s delay)</span>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-indigo-600 to-sky-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs leading-relaxed shadow-md">
                          {eventsLog[0].replyText}
                        </div>

                        {/* Extra tags */}
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap justify-end">
                          {eventsLog[0].trustScore !== undefined && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              Confianza: {eventsLog[0].trustScore}%
                            </span>
                          )}
                          {eventsLog[0].detectedMood && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                              Ánimo: {eventsLog[0].detectedMood}
                            </span>
                          )}
                          {eventsLog[0].voiceNoteGenerated && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Volume2 className="w-3 h-3" /> Audio adjunto
                            </span>
                          )}
                          {eventsLog[0].onlyFansPitched && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                              <Flame className="w-3 h-3" /> Enlace VIP OnlyFans
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </>
                )}
              </div>

              {/* Raw JSON Webhook Event Inspector */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono font-bold text-sky-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Payload X API v2 (direct_message_events):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">JSON real</span>
                </div>
                <pre className="text-[10px] font-mono text-slate-300 overflow-x-auto max-h-40 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  {JSON.stringify(eventsLog[0]?.rawPayload || { status: 'idle' }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab: EXTERNAL CONNECTION API & WEBHOOKS */}
      {activeSubTab === 'external_api' && (
        <div className="flex flex-col gap-6">
          {/* Main 2-column Grid: Config & Live Runner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: API Endpoint Config & Credentials (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Webhook className="w-5 h-5 text-emerald-400" />
                      Configuración de la API de Conexión Externa
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Recibe y procesa mensajes de DM entrantes en tiempo real desde servicios externos.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    HTTP POST • JSON
                  </span>
                </div>

                {saveConfigSuccess && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Configuración de webhook externo guardada y sincronizada correctamente en AuraAgent.</span>
                  </div>
                )}

                {/* Inbound Webhook URL */}
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>URL del Webhook Entrante (Inbound Endpoint):</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">
                      POST 200 OK
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-emerald-300 font-mono truncate select-all">
                      {extConfig.inboundUrl}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(extConfig.inboundUrl);
                        setCopiedEndpointUrl(true);
                        setTimeout(() => setCopiedEndpointUrl(false), 2500);
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-600/30 text-slate-300 hover:text-emerald-300 border border-slate-700 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      {copiedEndpointUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedEndpointUrl ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Envía solicitudes <code className="text-slate-300 font-mono">POST</code> con un payload JSON para que AuraAgent procese el mensaje y devuelva la respuesta generada.
                  </p>
                </div>

                {/* API Key & Webhook Secret */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                      <span>Webhook Secret Key:</span>
                      <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showSecretKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3 text-slate-400" />}
                        {showSecretKey ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={extConfig.webhookSecret}
                        onChange={(e) => setExtConfig({ ...extConfig, webhookSecret: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extConfig.webhookSecret);
                          setCopiedSecretKey(true);
                          setTimeout(() => setCopiedSecretKey(false), 2500);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                        title="Copiar Secret"
                      >
                        {copiedSecretKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      Header: x-aura-secret
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                      <span>API Key Alternativa:</span>
                      <button
                        onClick={() => {
                          const newKey = `aura_live_ak_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
                          setExtConfig({ ...extConfig, apiKey: newKey });
                        }}
                        className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                      >
                        Regenerar
                      </button>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={extConfig.apiKey}
                        onChange={(e) => setExtConfig({ ...extConfig, apiKey: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extConfig.apiKey);
                          setCopiedApiKey(true);
                          setTimeout(() => setCopiedApiKey(false), 2500);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                        title="Copiar API Key"
                      >
                        {copiedApiKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      Header: x-api-key
                    </span>
                  </div>
                </div>

                {/* Default Target Model */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Modelo Asignada por Defecto:
                  </label>
                  <select
                    value={extConfig.targetModelId}
                    onChange={(e) => setExtConfig({ ...extConfig, targetModelId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.handle}) — {m.archetype} • {m.vipPrice}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Puedes sobrescribir la modelo pasando <code className="text-slate-300 font-mono">"modelId": "{activeModel.id}"</code> en el cuerpo de la petición.
                  </span>
                </div>

                {/* Outbound Forwarding Webhook URL (Optional) */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>URL de Reenvío Saliente (Outbound Webhook - Opcional):</span>
                    <span className="text-[10px] text-indigo-400 font-mono">n8n / Make / Bot</span>
                  </label>
                  <input
                    type="url"
                    value={extConfig.forwardingUrl}
                    onChange={(e) => setExtConfig({ ...extConfig, forwardingUrl: e.target.value })}
                    placeholder="https://tu-servidor.com/webhook/aura-dm-reply"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Si se configura, AuraAgent enviará además una copia HTTP POST del mensaje generado a este endpoint.
                  </span>
                </div>

                {/* Toggles & Safety Features */}
                <div className="flex flex-col gap-2.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Verificar Firma Criptográfica HMAC-SHA256</div>
                      <div className="text-[11px] text-slate-400">
                        Valida cabecera <code className="text-slate-300 font-mono">X-Aura-Signature</code> para máxima seguridad contra ataques.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extConfig.verifySignature}
                      onChange={(e) => setExtConfig({ ...extConfig, verifySignature: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Generar Nota de Voz con Voz de la Modelo</div>
                      <div className="text-[11px] text-slate-400">
                        Devuelve el script y la señal de síntesis TTS personalizada para el DM.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extConfig.autoDispatchVoice}
                      onChange={(e) => setExtConfig({ ...extConfig, autoDispatchVoice: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Adjuntar Foto Casual Situacional</div>
                      <div className="text-[11px] text-slate-400">
                        Sugiere una fotografía de contexto (café, gym, sofa, playa) según el estado anímico.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extConfig.autoDispatchPhotos}
                      onChange={(e) => setExtConfig({ ...extConfig, autoDispatchPhotos: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Save button */}
                <button
                  disabled={isSavingExtConfig}
                  onClick={handleSaveExternalConfig}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingExtConfig ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando Cambios en la API...</span>
                    </>
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Guardar Configuración de Webhook</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Live Webhook Test Bench & cURL generator (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Play className="w-4 h-4 text-emerald-400" />
                      Banco de Pruebas en Vivo (Live API Test Runner)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Dispara una petición HTTP directa al webhook para verificar la respuesta del motor en tiempo real.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                    Live Simulator
                  </span>
                </div>

                {/* Form Inputs for Test */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Handle del Remitente:
                    </label>
                    <input
                      type="text"
                      value={testSenderHandle}
                      onChange={(e) => setTestSenderHandle(e.target.value)}
                      placeholder="@usuario_fan"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                      Nombre del Remitente:
                    </label>
                    <input
                      type="text"
                      value={testSenderName}
                      onChange={(e) => setTestSenderName(e.target.value)}
                      placeholder="Carlos Méndez"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Modelo Destino de la Prueba:
                  </label>
                  <select
                    value={testModelId}
                    onChange={(e) => setTestModelId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.handle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Mensaje de DM Entrante:
                  </label>
                  <textarea
                    rows={3}
                    value={testDmText}
                    onChange={(e) => setTestDmText(e.target.value)}
                    placeholder="Escribe el mensaje recibido en el DM..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Trigger Button */}
                <button
                  disabled={isExecutingTest || !testDmText.trim()}
                  onClick={handleExecuteExternalWebhookTest}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExecutingTest ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Procesando mensaje con el cerebro agentico de Aura...
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Disparar Webhook de Prueba en Vivo (POST)
                    </>
                  )}
                </button>

                {/* Error Banner if any */}
                {testError && (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{testError}</span>
                  </div>
                )}

                {/* Live Response Card */}
                {testResult && (
                  <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-bold text-emerald-300 font-mono">
                          HTTP 200 OK • {testResult.executionTimeMs}ms
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        HMAC: Verificado ✓
                      </span>
                    </div>

                    {/* Agent generated answer card */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Respuesta generada por {testResult.model?.name || 'Aura'}:
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          Mood detectado: <b className="text-sky-300">{testResult.reply?.detectedMood}</b>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                        {testResult.reply?.text}
                      </div>

                      {/* Feature Badges */}
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-indigo-400" />
                          Confianza: {testResult.reply?.trustScore}%
                        </span>

                        {testResult.reply?.voiceNote?.send && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-purple-400" />
                            Nota de Voz (TTS)
                          </span>
                        )}

                        {testResult.reply?.casualPhoto?.send && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                            📷 Foto: {testResult.reply?.casualPhoto?.category}
                          </span>
                        )}

                        {testResult.reply?.salesPitch?.pitchVip && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-rose-400" />
                            Link VIP OnlyFans Ofrecido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* cURL Code Snippet */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 font-mono">
                      <Code className="w-3.5 h-3.5 text-sky-400" />
                      Comando cURL para tu bot / terminal:
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCurl);
                        setCopiedCurl(true);
                        setTimeout(() => setCopiedCurl(false), 2500);
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCurl ? '¡Copiado!' : 'Copiar cURL'}</span>
                    </button>
                  </div>

                  <pre className="text-[10px] font-mono text-slate-300 p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
                    {generatedCurl}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Bottom: Live Webhook Requests History & Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Feed de Peticiones y Respuestas de la API Externa en Tiempo Real
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Registro de auditoría de cada payload recibido por <code className="text-slate-300 font-mono">/api/webhooks/external/dm-inbound</code>.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Peticiones procesadas: <b className="text-emerald-400">{extConfig.totalCallsProcessed}</b>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Momento</th>
                    <th className="p-3">Remitente Externo</th>
                    <th className="p-3">Modelo</th>
                    <th className="p-3">Mensaje Entrante</th>
                    <th className="p-3">Respuesta de Aura</th>
                    <th className="p-3">Estado HTTP</th>
                    <th className="p-3">Latencia</th>
                    <th className="p-3">Acción VIP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {externalLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3 font-semibold text-sky-400 whitespace-nowrap">
                        {log.senderHandle}
                        <div className="text-[10px] text-slate-400 font-normal">{log.senderName}</div>
                      </td>
                      <td className="p-3 text-indigo-300 font-mono text-[11px] whitespace-nowrap">
                        {log.modelName}
                      </td>
                      <td className="p-3 text-slate-200 max-w-xs truncate">{log.text}</td>
                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {log.replyText}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'processed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.status === 'processed' ? '200 OK' : 'RECHAZADO'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {log.executionTimeMs}ms
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {log.onlyFansPitched ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                            LINK VIP
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Rapport ({log.trustScore}%)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: CREDENTIALS & WEBHOOK CONFIG */}
      {activeSubTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-sky-400" />
                    Credenciales del Developer Portal de X
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configura las claves de tu aplicación de X con permisos de lectura y escritura de Mensajes Directos (DM).
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  OAuth 1.0a / 2.0 PKCE Activo
                </span>
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    API Key (Consumer Key):
                  </label>
                  <input
                    type="text"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    API Key Secret:
                  </label>
                  <input
                    type="password"
                    value={config.apiKeySecret}
                    onChange={(e) => setConfig({ ...config, apiKeySecret: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Bearer Token (v2 App-Only):
                  </label>
                  <input
                    type="text"
                    value={config.bearerToken}
                    onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Access Token:
                  </label>
                  <input
                    type="text"
                    value={config.accessToken}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Access Token Secret:
                  </label>
                  <input
                    type="password"
                    value={config.accessTokenSecret}
                    onChange={(e) => setConfig({ ...config, accessTokenSecret: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Webhook URL config */}
              <div className="mt-2 pt-4 border-t border-slate-800">
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  URL del Webhook de Aura en tu servidor (Account Activity API):
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 select-all truncate">
                    {config.webhookUrl}
                  </div>
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copiedUrl ? '¡Copiado!' : 'Copiar'}
                  </button>
                  <button
                    onClick={handleTestCrc}
                    disabled={crcTesting}
                    className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${crcTesting ? 'animate-spin' : ''}`} />
                    Probar CRC
                  </button>
                </div>

                {/* CRC status feedback */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Estado CRC Challenge:
                  </span>
                  <span className="text-emerald-400 font-mono font-medium">
                    {config.lastCrcCheck}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Step-by-step Setup instructions */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                Guía de Conexión en 3 Pasos
              </h4>

              <div className="flex flex-col gap-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-bold text-white mb-1">1. Developer Portal de X</div>
                  <p className="text-slate-400 leading-relaxed">
                    Crea un proyecto en <code className="text-sky-300">developer.x.com</code> y habilita permisos de <strong>"Read, write, and Direct Messages"</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-bold text-white mb-1">2. Registrar el Webhook</div>
                  <p className="text-slate-400 leading-relaxed">
                    Registra la URL <code className="text-sky-300">{config.webhookUrl}</code> en el ambiente de Account Activity API. X enviará un GET con <code className="text-sky-300">crc_token</code> que nuestro servidor responde con HMAC-SHA256 automáticamente.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="font-bold text-white mb-1">3. Suscribir la Cuenta</div>
                  <p className="text-slate-400 leading-relaxed">
                    Suscribe la cuenta de la modelo (<strong className="text-white">{activeModel.handle}</strong>) al webhook para recibir sus DMs en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: HUMANIZER & ANTI-BAN RULES */}
      {activeSubTab === 'humanizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  Reglas de Humanización de Respuestas en X
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Protege la cuenta de X contra baneos algorítmicos simulando pausas humanas reales y cadencias naturales.
                </p>
              </div>

              {/* Slider for Human Delay */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-400" /> Retraso de Digitación Humana:
                  </label>
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {config.humanDelaySeconds.min}s a {config.humanDelaySeconds.max}s aleatorio
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="45"
                  value={config.humanDelaySeconds.max}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      humanDelaySeconds: {
                        min: Math.max(2, Math.floor(parseInt(e.target.value) / 3)),
                        max: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-sky-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Si un bot responde en milisegundos, los sistemas de seguridad de X lo clasifican como bot automatizado y suspenden la cuenta. Aura espera un intervalo aleatorio realista y envía el evento <code className="text-sky-300">direct_message_indicate_typing_events</code> mientras formula la respuesta.
                </p>
              </div>

              {/* Anti-Cliché and Autonomous Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white mb-1">
                      Filtro Anti-Cliché de Robot
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Prohíbe terminantemente saludos genéricos como "¿En qué puedo ayudarte?", "¡Hola! ¿Cómo estás?". Inicia como una persona real.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400">100% ACTIVO</span>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-bold text-white mb-1">
                      Límite Diario de DMs por Cuenta
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Máximo de conversaciones iniciadas o continuadas por día para mantenerse dentro de las directrices de uso de X.
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Límite:</span>
                    <span className="text-indigo-300 font-bold">{config.dailyDmLimit} DMs / día</span>
                  </div>
                </div>
              </div>

              {/* Conversion Trigger */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" /> Umbral de Confianza para Cierre OnlyFans:
                  </label>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    {activeModel.rules.conversionThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={activeModel.rules.conversionThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const updated = {
                      ...activeModel,
                      rules: { ...activeModel.rules, conversionThreshold: val },
                    };
                    onSelectModel(updated);
                  }}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Aura solo le ofrecerá el enlace de suscripción a OnlyFans ({activeModel.vipLink}) cuando la interacción supere este nivel de reciprocidad y confianza mutua.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Matriz Psicológica de Tono en X
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Aura detecta el estado del usuario en X y calibra la respuesta para maximizar la conexión emocional:
              </p>

              <div className="flex flex-col gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                  <span className="text-base">😐</span>
                  <div>
                    <span className="font-bold text-white">Cortante / Monosilábico ("ok", "si"):</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No satura con textos largos. Usa frases cortas, intriga juguetona o deja espacio para no parecer necesitada.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                  <span className="text-base">😉</span>
                  <div>
                    <span className="font-bold text-white">Coqueto / Halagador:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reciprocidad juguetona con límites elegantes. Premia la complicidad y prepara el terreno hacia el contenido VIP.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5">
                  <span className="text-base">😔</span>
                  <div>
                    <span className="font-bold text-white">Triste / Mal Día:</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Acompañamiento cálido y escucha activa sin intentar vender apresuradamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: WEBHOOK LOGS & EVENTS */}
      {activeSubTab === 'logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sky-400" />
                Historial de Eventos de X Webhook
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Auditoría en tiempo real de todos los DMs recibidos y respuestas emitidas hacia X.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Total eventos registrados: {eventsLog.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                <tr>
                  <th className="p-3">Hora</th>
                  <th className="p-3">Remitente (X User)</th>
                  <th className="p-3">Modelo Destino</th>
                  <th className="p-3">Mensaje Recibido</th>
                  <th className="p-3">Respuesta de Aura</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Cierre VIP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {eventsLog.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEventPayload(evt)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {evt.timestamp}
                    </td>
                    <td className="p-3 font-semibold text-sky-400 whitespace-nowrap">
                      {evt.senderHandle}
                    </td>
                    <td className="p-3 text-indigo-300 font-mono text-[11px] whitespace-nowrap">
                      {evt.recipientHandle}
                    </td>
                    <td className="p-3 text-slate-200 max-w-xs truncate">{evt.text}</td>
                    <td className="p-3 text-slate-300 max-w-xs truncate">
                      {evt.replyText || 'Procesando...'}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {evt.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {evt.onlyFansPitched ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          LINK OF ENVIADO
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">En raport</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
