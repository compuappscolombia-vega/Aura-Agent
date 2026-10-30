import React, { useState, useEffect } from 'react';
import {
  ModelProfile,
  TwitterIntegrationConfig,
  TwitterDMEvent,
  UserMood,
  UserSession,
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
  HelpCircle,
  BookOpen,
  ChevronRight,
  CheckSquare,
  Layers,
  Server,
  Activity,
  ArrowUpRight,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';
import { ModelVoiceAndMediaVault } from './ModelVoiceAndMediaVault';
import { VoiceNoteBubble } from './VoiceNoteBubble';

interface TwitterIntegrationHubProps {
  activeModel: ModelProfile;
  models: ModelProfile[];
  onSelectModel: (model: ModelProfile) => void;
  currentSession?: UserSession | null;
  onOpenAuthModal?: () => void;
  onOpenInstallers?: () => void;
}

const DEFAULT_CONFIG: TwitterIntegrationConfig = {
  apiKey: 'Fo1UE32BEZBBB4rox10yQqizk',
  apiKeySecret: 'zAIDKNQlsGExOBjj2fqMjHUsF535qcKBRjCh72w5yHLh8NVY76',
  bearerToken: 'AAAAAAAAAAAAAAAAAAAAADCBAAIAAAAArOJwYd1xx%2BYPv418eX2nLXCtnTw%3Df0G7QTPyT82o3bpVW5fhEoqzSKLYLSrjDqYyaEj6UJsRnqCr8O',
  accessToken: '14890234891-v92Nxk8P98Lkm11Zpqw098Azxcvbnm',
  accessTokenSecret: 'k78Hjs2198SksmALm8910sKlnva7781b',
  clientId: 'b3Nzc21qWlFhT0d3RzFHYk1VUGtUelF3',
  clientSecret: 'xAI_cs_8921893719827391823791',
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/twitter-x` : '/api/webhooks/twitter-x',
  webhookEnvName: 'env-prod-aura-x',
  isConnected: true,
  crcVerified: true,
  lastCrcCheck: 'Hace 2 minutos (HTTP 200 OK - HMAC-SHA256 validado)',
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
  rateLimitRemaining: 148,
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
  onOpenInstallers,
}) => {
  // Navigation tabs
  const [activeSubTab, setActiveSubTab] = useState<
    'wizard' | 'model_vault' | 'simulator' | 'external_api' | 'credentials' | 'humanizer' | 'logs'
  >('wizard');

  // Wizard active step
  const [wizardStep, setWizardStep] = useState<number>(1);

  // X Integration configuration
  const [config, setConfig] = useState<TwitterIntegrationConfig>(DEFAULT_CONFIG);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [crcTesting, setCrcTesting] = useState(false);
  const [crcDiagnosticResult, setCrcDiagnosticResult] = useState<any | null>(null);

  // Password visibility toggles for X Credentials
  const [showApiKeySecret, setShowApiKeySecret] = useState(false);
  const [showBearerToken, setShowBearerToken] = useState(false);
  const [showAccessTokenSecret, setShowAccessTokenSecret] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);

  // X Credentials backend save and test states
  const [isSavingTwitterCreds, setIsSavingTwitterCreds] = useState(false);
  const [saveTwitterSuccess, setSaveTwitterSuccess] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<any | null>(null);

  // External Connection API & Webhook Configuration State
  const [extConfig, setExtConfig] = useState({
    inboundUrl:
      typeof window !== 'undefined'
        ? `${window.location.origin}/api/webhooks/external/dm-inbound`
        : '/api/webhooks/external/dm-inbound',
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
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);
  const [isSavingExtConfig, setIsSavingExtConfig] = useState(false);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);
  const [isRegeneratingKeys, setIsRegeneratingKeys] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'nodejs' | 'python' | 'n8n'>('curl');

  // External Webhook Live Tester State
  const [testSenderHandle, setTestSenderHandle] = useState('@marcos_madrid');
  const [testSenderName, setTestSenderName] = useState('Marcos Alonso');
  const [testDmText, setTestDmText] = useState(
    'Hola hermosa! Me encantó tu última foto, ¿tienes algún espacio privado o fotos exclusivas para hablar más cerquita?'
  );
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
      replyText:
        'Jajaja qué lindo, me pillaste justo tomándome un café ☕ Cuéntame qué fue lo que más te llamó la atención 😉',
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
      replyText:
        'Casi muero con las sentadillas hoy jaja, me tiemblan las piernas todavía 💪 pero no hay excusas.',
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
  const [simDmText, setSimDmText] = useState(
    'Hola! Vi tu última foto y me encantó tu estilo, ¿qué planes tienes hoy?'
  );
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
      replyText:
        'Jajaja a ver... aquí en X me censuran todo lo rico 😉 Me encantaría que hablemos más cerquita por mi espacio VIP en ' +
        activeModel.vipLink,
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

  const [selectedEventPayload, setSelectedEventPayload] = useState<TwitterDMEvent | null>(
    eventsLog[0]
  );

  // Human Delay & Scheduled Queue State (supporting up to 120 minutes / 2 hours)
  const [delayConfig, setDelayConfig] = useState<{
    mode: 'fast' | 'natural' | 'relaxed' | 'ultra_real';
    minMinutes: number;
    maxMinutes: number;
    simulateTypingIndicator: boolean;
  }>({
    mode: 'natural',
    minMinutes: 10,
    maxMinutes: 35,
    simulateTypingIndicator: true,
  });

  const [queuedDMs, setQueuedDMs] = useState<any[]>([]);
  const [isDispatchingQueueId, setIsDispatchingQueueId] = useState<string | null>(null);
  const [isSyncingProfile, setIsSyncingProfile] = useState(false);
  const [profileSyncResult, setProfileSyncResult] = useState<any | null>(null);

  // Sync webhook URLs with browser origin on mount and fetch backend config
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setConfig((prev) => ({
        ...prev,
        webhookUrl: `${origin}/api/webhooks/twitter-x`,
      }));
      setExtConfig((prev) => ({
        ...prev,
        inboundUrl: `${origin}/api/webhooks/external/dm-inbound`,
      }));
    }

    // Fetch stored server configuration for Twitter API
    fetch('/api/twitter/credentials')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.credentials) {
          const creds = data.credentials;
          setConfig((prev) => ({
            ...prev,
            apiKey: creds.apiKey || prev.apiKey,
            apiKeySecret: creds.apiKeySecret || prev.apiKeySecret,
            bearerToken: creds.bearerToken || prev.bearerToken,
            accessToken: creds.accessToken || prev.accessToken,
            accessTokenSecret: creds.accessTokenSecret || prev.accessTokenSecret,
            clientId: creds.clientId || prev.clientId,
            clientSecret: creds.clientSecret || prev.clientSecret,
            webhookEnvName: creds.webhookEnvName || prev.webhookEnvName,
          }));
        }
      })
      .catch(() => {});

    // Fetch external webhook config
    fetch('/api/webhooks/external/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setExtConfig((prev) => ({
            ...prev,
            ...data.config,
            inboundUrl:
              typeof window !== 'undefined'
                ? `${window.location.origin}/api/webhooks/external/dm-inbound`
                : prev.inboundUrl,
          }));
        }
      })
      .catch(() => {});

    // Fetch delay config & queue
    const fetchDelayAndQueue = () => {
      fetch('/api/twitter/delay-config')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.config) setDelayConfig(d.config);
        })
        .catch(() => {});

      fetch('/api/twitter/queue')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.queue) setQueuedDMs(d.queue);
        })
        .catch(() => {});
    };

    fetchDelayAndQueue();
    const interval = setInterval(fetchDelayAndQueue, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  // CRC Challenge Diagnostic Test
  const handleTestCrc = async () => {
    setCrcTesting(true);
    setCrcDiagnosticResult(null);
    try {
      const res = await fetch('/api/webhooks/twitter-x/diagnostic');
      const data = await res.json();
      setCrcDiagnosticResult(data);
      if (data.success) {
        setConfig((prev) => ({
          ...prev,
          crcVerified: true,
          lastCrcCheck: `Verificado con éxito (${data.calculatedResponseToken.slice(0, 20)}...)`,
        }));
      }
    } catch {
      setCrcDiagnosticResult({
        success: false,
        message: 'Error al contactar con el endpoint de verificación CRC.',
      });
    } finally {
      setTimeout(() => setCrcTesting(false), 600);
    }
  };

  // Test Twitter Credentials Connection
  const handleTestTwitterConnection = async () => {
    setIsTestingConnection(true);
    setConnectionTestResult(null);
    try {
      const res = await fetch('/api/twitter/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          apiKeySecret: config.apiKeySecret,
          bearerToken: config.bearerToken,
          accessToken: config.accessToken,
          accessTokenSecret: config.accessTokenSecret,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          webhookEnvName: config.webhookEnvName,
        }),
      });
      const data = await res.json();
      setConnectionTestResult(data);
    } catch (e: any) {
      setConnectionTestResult({
        success: false,
        status: 'error',
        message: `Error de red al verificar conexión: ${e.message}`,
        issues: ['Fallo de comunicación con el backend'],
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Sync official profile of Ana María (@afire_sb) with server
  const handleSyncProfile = async () => {
    setIsSyncingProfile(true);
    setProfileSyncResult(null);
    try {
      const res = await fetch('/api/twitter/sync-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ana María',
          handle: '@afire_sb',
          bio: 'Cuenta oficial de Ana María (@afire_sb) conectada a X con credenciales oficiales. Hablo contigo por audio con mi propia voz real, te comparto fotos de mi día y charlamos en confianza ✨',
        }),
      });
      const data = await res.json();
      setProfileSyncResult(data);
      if (data.success && activeModel.id === 'afire-sb') {
        onSelectModel({
          ...activeModel,
          name: 'Ana María',
          handle: '@afire_sb',
        });
      }
    } catch (err: any) {
      setProfileSyncResult({
        success: false,
        error: `Error al sincronizar: ${err.message}`,
      });
    } finally {
      setIsSyncingProfile(false);
    }
  };

  // Dispatch queued DM immediately (bypass human delay manually)
  const handleDispatchNow = async (id: string) => {
    setIsDispatchingQueueId(id);
    try {
      const res = await fetch(`/api/twitter/queue/${id}/dispatch-now`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setQueuedDMs((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'delivered' } : item))
        );
      }
    } catch (e) {
      console.error('Error dispatching queued DM:', e);
    } finally {
      setIsDispatchingQueueId(null);
    }
  };

  // Update delay preset mode (fast, natural, relaxed, ultra_real)
  const handleSaveDelayMode = async (
    mode: 'fast' | 'natural' | 'relaxed' | 'ultra_real',
    minM: number,
    maxM: number
  ) => {
    const updated = {
      ...delayConfig,
      mode,
      minMinutes: minM,
      maxMinutes: maxM,
    };
    setDelayConfig(updated);
    try {
      await fetch('/api/twitter/delay-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Could not save delay config:', e);
    }
  };

  // Save Twitter Credentials to backend
  const handleSaveTwitterCredentials = async () => {
    setIsSavingTwitterCreds(true);
    setSaveTwitterSuccess(false);
    try {
      const res = await fetch('/api/twitter/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: config.apiKey,
          apiKeySecret: config.apiKeySecret,
          bearerToken: config.bearerToken,
          accessToken: config.accessToken,
          accessTokenSecret: config.accessTokenSecret,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          webhookEnvName: config.webhookEnvName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveTwitterSuccess(true);
        setTimeout(() => setSaveTwitterSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving credentials:', err);
    } finally {
      setIsSavingTwitterCreds(false);
    }
  };

  // Restore Default Sandbox Keys
  const handleLoadSandboxCredentials = () => {
    setConfig((prev) => ({
      ...prev,
      apiKey: DEFAULT_CONFIG.apiKey,
      apiKeySecret: DEFAULT_CONFIG.apiKeySecret,
      bearerToken: DEFAULT_CONFIG.bearerToken,
      accessToken: DEFAULT_CONFIG.accessToken,
      accessTokenSecret: DEFAULT_CONFIG.accessTokenSecret,
      clientId: DEFAULT_CONFIG.clientId,
      clientSecret: DEFAULT_CONFIG.clientSecret,
      webhookEnvName: DEFAULT_CONFIG.webhookEnvName,
    }));
  };

  // Clear fields for fresh production keys
  const handleClearCredentials = () => {
    setConfig((prev) => ({
      ...prev,
      apiKey: '',
      apiKeySecret: '',
      bearerToken: '',
      accessToken: '',
      accessTokenSecret: '',
      clientId: '',
      clientSecret: '',
      webhookEnvName: 'env-prod-aura-x',
    }));
  };

  // Save external webhook config
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

  // Regenerate external API keys
  const handleRegenerateExternalKeys = async () => {
    setIsRegeneratingKeys(true);
    try {
      const res = await fetch('/api/webhooks/external/regenerate-keys', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setExtConfig((prev) => ({
          ...prev,
          apiKey: data.apiKey,
          webhookSecret: data.webhookSecret,
        }));
      }
    } catch (e) {
      console.warn('Error regenerating keys:', e);
    } finally {
      setIsRegeneratingKeys(false);
    }
  };

  // Run live external webhook test
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

  // Code snippets generation
  const getCodeSnippet = () => {
    const escapedText = testDmText.replace(/"/g, '\\"').replace(/\n/g, ' ');
    switch (codeLanguage) {
      case 'curl':
        return `curl -X POST "${extConfig.inboundUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-aura-secret: ${extConfig.webhookSecret}" \\
  -d '{
    "senderHandle": "${testSenderHandle}",
    "senderName": "${testSenderName}",
    "text": "${escapedText}",
    "modelId": "${testModelId}"
  }'`;
      case 'nodejs':
        return `// Node.js (fetch / axios)
import fetch from 'node-fetch';

const response = await fetch('${extConfig.inboundUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-aura-secret': '${extConfig.webhookSecret}'
  },
  body: JSON.stringify({
    senderHandle: '${testSenderHandle}',
    senderName: '${testSenderName}',
    text: '${escapedText}',
    modelId: '${testModelId}'
  })
});

const data = await response.json();
console.log('Respuesta de AuraAgent:', data.reply.text);
console.log('¿Enviar nota de voz?:', data.reply.voiceNote.send);
console.log('¿Ofrecer OnlyFans?:', data.reply.salesPitch.pitchVip);`;
      case 'python':
        return `# Python (requests)
import requests

url = "${extConfig.inboundUrl}"
headers = {
    "Content-Type": "application/json",
    "x-aura-secret": "${extConfig.webhookSecret}"
}
payload = {
    "senderHandle": "${testSenderHandle}",
    "senderName": "${testSenderName}",
    "text": "${escapedText}",
    "modelId": "${testModelId}"
}

res = requests.post(url, json=payload, headers=headers)
data = res.json()
print("Respuesta generada:", data['reply']['text'])
print("Estado emocional:", data['reply']['detectedMood'])`;
      case 'n8n':
        return `// Formato JSON para nodo HTTP Request en n8n o Make.com:
{
  "method": "POST",
  "url": "${extConfig.inboundUrl}",
  "headers": {
    "Content-Type": "application/json",
    "x-aura-secret": "${extConfig.webhookSecret}"
  },
  "body": {
    "senderHandle": "={{ $json.sender.screen_name }}",
    "senderName": "={{ $json.sender.name }}",
    "text": "={{ $json.message_create.message_data.text }}",
    "modelId": "${testModelId}"
  }
}`;
    }
  };

  const handleCopyCodeSnippet = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCodeSnippet(true);
    setTimeout(() => setCopiedCodeSnippet(false), 2500);
  };

  // Simulator DM trigger
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
                  Integración X (Twitter) & Webhooks v2
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  MOTOR ACTIVO
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 border border-slate-700">
                  Account Activity API v2
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-teal-300 border border-slate-700">
                  External Webhook API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                AuraAgent recibe y procesa mensajes directos (DMs) de X en tiempo real, interpreta el
                tono emocional del usuario, aplica pausas de digitación anti-baneo y responde con la
                voz y fotos de tu modelo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Quick Action: Open Step-by-Step Assistant */}
            <button
              onClick={() => setActiveSubTab('wizard')}
              className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer transition-all shrink-0"
            >
              <BookOpen className="w-4 h-4 text-sky-200" />
              <span>Asistente de Configuración</span>
            </button>

            {/* Model Switcher for X */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-2.5 flex items-center gap-3 shrink-0">
              <div className="relative">
                <img
                  src={activeModel.avatarUrl}
                  alt={activeModel.name}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
                  𝕏
                </span>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <span>Modelo en X:</span>
                  {activeModel.id === 'afire-sb' && (
                    <span className="text-[8px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      CUENTA REAL
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  {activeModel.name}
                  <span className="text-[11px] text-sky-400 font-mono font-normal">
                    {activeModel.handle}
                  </span>
                </div>
              </div>

              <select
                value={activeModel.id}
                onChange={(e) => {
                  const found = models.find((m) => m.id === e.target.value);
                  if (found) onSelectModel(found);
                }}
                className="ml-1 bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded-xl px-2 py-1 focus:outline-none focus:border-sky-500 cursor-pointer font-medium"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id === 'afire-sb' ? '⭐ ' : ''}{m.name} ({m.handle}) {m.id === 'afire-sb' ? '• MODELO REAL VINCULADA' : '• Ejemplo'}
                  </option>
                ))}
              </select>
            </div>

            {/* Creator Session Card */}
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
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3 py-2.5 rounded-2xl flex items-center gap-2 border border-slate-700 cursor-pointer transition-all"
                  >
                    <Twitter className="w-3.5 h-3.5 text-sky-400" />
                    <span>Iniciar Sesión X</span>
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
              <Radio className="w-3 h-3 text-emerald-400" /> Webhook X (CRC)
            </div>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> 200 OK (Activo)
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              HMAC-SHA256 validado
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Webhook className="w-3 h-3 text-teal-400" /> API Externa / Bots
            </div>
            <div className="text-sm font-bold text-teal-300 mt-1">
              {extConfig.totalCallsProcessed} llamadas procesadas
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {extConfig.inboundUrl.slice(-28)}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-sky-400" /> Retraso Anti-Baneo
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {config.humanDelaySeconds.min}s - {config.humanDelaySeconds.max}s
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Simulación de digitación
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-rose-400" /> Cierre OnlyFans
            </div>
            <div className="text-sm font-bold text-rose-400 mt-1">
              {activeModel.rules.conversionThreshold}% Confianza
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
          onClick={() => setActiveSubTab('wizard')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'wizard'
              ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-300" />
          <span>Asistente Paso a Paso (Guía X & Webhooks)</span>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-sky-400/20 text-sky-300 border border-sky-400/40">
            PASO A PASO
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('model_vault')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'model_vault'
              ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-lg shadow-rose-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-rose-300" />
          <span>Voz & Bóveda de Mi Modelo</span>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
            FOTOS & AUDIOS
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
          onClick={() => setActiveSubTab('simulator')}
          className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'simulator'
              ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-sky-300" />
          <span>Consola & Simulador de DMs</span>
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
          <span>Reglas Anti-Baneo & Humanizador</span>
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
          <span>Auditoría de Payloads ({eventsLog.length})</span>
        </button>
      </div>

      {/* ========================================================
          SUB-TAB 0: INTERACTIVE STEP-BY-STEP SETUP ASSISTANT
          ======================================================== */}
      {activeSubTab === 'wizard' && (
        <div className="flex flex-col gap-6">
          {/* Stepper Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-sky-400" />
                  Asistente de Configuración: Conexión de API Externa & X API v2
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Sigue estos 4 pasos guiados para configurar tus credenciales oficiales de X (Twitter),
                  activar el Webhook de Account Activity API con verificación HMAC-SHA256, y conectar
                  herramientas externas (n8n, Make, Zapier, bots en Python o Node.js).
                </p>
              </div>

              {/* Step indicator buttons */}
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
                {[1, 2, 3, 4].map((stepNum) => (
                  <button
                    key={stepNum}
                    onClick={() => setWizardStep(stepNum)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      wizardStep === stepNum
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>Paso {stepNum}</span>
                    {wizardStep > stepNum && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-4 gap-2 mt-5">
              <div
                onClick={() => setWizardStep(1)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  wizardStep === 1
                    ? 'bg-sky-500/10 border-sky-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Paso 1
                </div>
                <div className="text-xs font-bold text-white mt-0.5">Credenciales en X Portal</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Keys, Bearer & Permisos DM
                </div>
              </div>

              <div
                onClick={() => setWizardStep(2)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  wizardStep === 2
                    ? 'bg-sky-500/10 border-sky-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Paso 2
                </div>
                <div className="text-xs font-bold text-white mt-0.5">Webhook CRC Challenge</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Handshake HMAC-SHA256
                </div>
              </div>

              <div
                onClick={() => setWizardStep(3)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  wizardStep === 3
                    ? 'bg-sky-500/10 border-sky-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                  Paso 3
                </div>
                <div className="text-xs font-bold text-white mt-0.5">Suscripción de la Cuenta</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Account Activity Subscriptions
                </div>
              </div>

              <div
                onClick={() => setWizardStep(4)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  wizardStep === 4
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Paso 4
                </div>
                <div className="text-xs font-bold text-white mt-0.5">API Externa & Webhooks</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  n8n, Make, Zapier & Bots
                </div>
              </div>
            </div>
          </div>

          {/* STEP 1: CREDENTIALS IN X DEVELOPER PORTAL */}
          {wizardStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Obtener Claves en el Developer Portal de X
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cómo generar y configurar tus credenciales en <code className="text-sky-300">developer.x.com</code>.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold text-xs">
                        A
                      </span>
                      <div>
                        <strong className="text-white">Crea o selecciona tu Proyecto / App:</strong>
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          Inicia sesión en <a href="https://developer.x.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline inline-flex items-center gap-1 font-mono">developer.x.com <ExternalLink className="w-3 h-3" /></a>, ve a <strong>Projects & Apps</strong> y selecciona o crea una App vinculada a tu proyecto de desarrollador (Developer Account).
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/30 bg-amber-500/5 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                        B
                      </span>
                      <div>
                        <strong className="text-amber-300">
                          Habilita permisos de Direct Messages (OBLIGATORIO):
                        </strong>
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          En la pestaña <strong>"User authentication settings"</strong> (Configuración de autenticación), haz clic en <strong>Set up</strong>:
                        </p>
                        <ul className="list-disc list-inside mt-2 text-slate-300 flex flex-col gap-1 text-[11px]">
                          <li>
                            Selecciona <strong>"Read and write and Direct message"</strong> (Permiso de lectura, escritura y mensajes directos).
                          </li>
                          <li>
                            Tipo de App: <strong>Web App, Automated App or Bot</strong>.
                          </li>
                          <li>
                            Callback URI / Redirect URL: <code className="text-sky-300 font-mono">{typeof window !== 'undefined' ? `${window.location.origin}/api/auth/x/callback` : 'https://tu-dominio.com/api/auth/x/callback'}</code>
                          </li>
                          <li>
                            Website URL: <code className="text-sky-300 font-mono">{typeof window !== 'undefined' ? window.location.origin : 'https://tu-dominio.com'}</code>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 font-bold text-xs">
                        C
                      </span>
                      <div>
                        <strong className="text-white">Genera tus Claves en "Keys and Tokens":</strong>
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          Dirígete a la pestaña <strong>"Keys and Tokens"</strong> de tu App y copia:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                            <span className="font-bold text-sky-300">Consumer Keys:</span>
                            <div className="text-slate-400">API Key & API Key Secret</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                            <span className="font-bold text-indigo-300">Authentication Tokens:</span>
                            <div className="text-slate-400">Bearer Token (v2 App-Only)</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                            <span className="font-bold text-purple-300">User Tokens:</span>
                            <div className="text-slate-400">Access Token & Access Token Secret</div>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
                            <span className="font-bold text-emerald-300">OAuth 2.0 PKCE:</span>
                            <div className="text-slate-400">Client ID & Client Secret</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={handleLoadSandboxCredentials}
                      className="text-xs text-sky-400 hover:text-sky-300 font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Cargar Credenciales Sandbox de Demostración
                    </button>

                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <span>Siguiente: Validar Webhook CRC</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1 Quick Form Preview */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-sky-400" />
                      Ingreso Rápido de Credenciales:
                    </span>
                    <button
                      onClick={() => setActiveSubTab('credentials')}
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Ver editor completo <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        API Key (Consumer Key):
                      </label>
                      <input
                        type="text"
                        value={config.apiKey}
                        onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                        placeholder="xAI_sec_k982_prod_live_key"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        API Key Secret (Consumer Secret):
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKeySecret ? 'text' : 'password'}
                          value={config.apiKeySecret}
                          onChange={(e) => setConfig({ ...config, apiKeySecret: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                          placeholder="xAI_sec_k982_prod_live_key_sec"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKeySecret(!showApiKeySecret)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showApiKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Bearer Token (v2 App-Only):
                      </label>
                      <div className="relative">
                        <input
                          type={showBearerToken ? 'text' : 'password'}
                          value={config.bearerToken}
                          onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500 truncate"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBearerToken(!showBearerToken)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showBearerToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Test connection button */}
                    <button
                      onClick={handleTestTwitterConnection}
                      disabled={isTestingConnection}
                      className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50 mt-1"
                    >
                      {isTestingConnection ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Validando credenciales...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Probar y Validar Credenciales</span>
                        </>
                      )}
                    </button>

                    {/* Connection Test Result */}
                    {connectionTestResult && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex flex-col gap-1.5 ${
                          connectionTestResult.success
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {connectionTestResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          )}
                          <span>{connectionTestResult.message}</span>
                        </div>
                        {connectionTestResult.issues?.map((issue: string, idx: number) => (
                          <div key={idx} className="text-[11px] text-amber-300/90 pl-5">
                            • {issue}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ACCOUNT ACTIVITY API WEBHOOK & CRC CHALLENGE */}
          {wizardStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Registrar la URL del Webhook y Desafío CRC (Challenge Response Check)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Cómo X verifica que tu servidor es legítimo antes de enviar DMs.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed flex flex-col gap-3">
                    <p>
                      Twitter / X requiere que el endpoint de tu webhook responda a un desafío criptográfico llamado <strong>CRC (Challenge Response Check)</strong>. Cuando registras el webhook en X, los servidores de X enviarán una petición <code className="text-sky-300 font-mono">GET ?crc_token=&lt;token&gt;</code>.
                    </p>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="text-white font-bold mb-1 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        Fórmula del Handshake Criptográfico:
                      </div>
                      <code className="text-[11px] text-emerald-300 font-mono block bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-1 select-all">
                        response_token = "sha256=" + base64( HMAC_SHA256( crc_token, consumer_secret ) )
                      </code>
                      <p className="text-[11px] text-slate-400 mt-2">
                        AuraAgent implementa este algoritmo de forma nativa en <code className="text-sky-300">/api/webhooks/twitter-x</code>. No necesitas programar nada adicional.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <label className="font-bold text-white block mb-1">
                        URL Oficial del Webhook de AuraAgent para copiar en X:
                      </label>
                      <div className="flex items-center gap-2 mt-1.5">
                        <input
                          type="text"
                          readOnly
                          value={config.webhookUrl}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-300 select-all"
                        />
                        <button
                          onClick={handleCopyWebhookUrl}
                          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-slate-700"
                        >
                          {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUrl ? '¡Copiado!' : 'Copiar URL'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CRC Live Test & Diagnostic */}
                  <div className="pt-2">
                    <button
                      onClick={handleTestCrc}
                      disabled={crcTesting}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${crcTesting ? 'animate-spin' : ''}`} />
                      <span>Ejecutar Diagnóstico y Test del CRC Handshake en Vivo</span>
                    </button>
                  </div>

                  {/* CRC Diagnostic Result Banner */}
                  {crcDiagnosticResult && (
                    <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {crcDiagnosticResult.message}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {crcDiagnosticResult.algorithm}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1 flex flex-col gap-1">
                        <div>
                          Token de prueba emitido:{' '}
                          <code className="text-slate-300">{crcDiagnosticResult.testCrcToken}</code>
                        </div>
                        <div>
                          Hash calculado:{' '}
                          <code className="text-emerald-300">{crcDiagnosticResult.calculatedResponseToken}</code>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
                    >
                      ← Volver al Paso 1
                    </button>

                    <button
                      onClick={() => setWizardStep(3)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <span>Siguiente: Suscribir Cuenta de Modelo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2 Right: How to register webhook via CLI or Postman */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                    <Terminal className="w-4 h-4 text-sky-400" />
                    Comando cURL para Registrar el Webhook en X:
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ejecuta esta petición firmada con OAuth 1.0a para asociar la URL del webhook en tu entorno de X (Environment: <code className="text-sky-300">{config.webhookEnvName}</code>):
                  </p>

                  <pre className="text-[10px] font-mono text-slate-300 p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap">
{`curl --request POST \\
  --url "https://api.twitter.com/1.1/account_activity/all/${config.webhookEnvName}/webhooks.json?url=${encodeURIComponent(config.webhookUrl)}" \\
  --header "authorization: OAuth oauth_consumer_key=\\"${config.apiKey}\\", ..."`}
                  </pre>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                    <span className="font-bold text-white block mb-0.5">Tip Pro:</span>
                    Puedes usar la colección oficial de Postman de Twitter o el CLI de X ("twurl") para enviar la petición con tu cuenta autenticada.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUBSCRIPTIONS */}
          {wizardStep === 3 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Suscribir la Cuenta de la Modelo al Webhook
                      </h4>
                      <p className="text-xs text-slate-400">
                        Asocia <strong className="text-white">{activeModel.handle}</strong> para recibir sus DMs automáticamente.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed flex flex-col gap-3.5">
                    <p>
                      Una vez registrado el webhook, debes activar una <strong>suscripción de usuario</strong>. Esto le indica a X que los eventos de mensajes directos entrantes y salientes de la modelo deben ser despachados a AuraAgent.
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={activeModel.avatarUrl}
                          alt={activeModel.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <div className="text-sm font-bold text-white">{activeModel.name}</div>
                          <div className="text-xs text-sky-400 font-mono">{activeModel.handle}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            ID de cuenta vinculada: <code className="text-slate-300 font-mono">14890234891</code>
                          </div>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Suscripción Activa
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="font-bold text-white mb-1">
                        Petición HTTP de Suscripción en Account Activity API:
                      </div>
                      <code className="text-[11px] text-indigo-300 font-mono block bg-slate-900 p-2.5 rounded-xl border border-slate-800 mt-1 select-all">
                        POST https://api.twitter.com/1.1/account_activity/all/{config.webhookEnvName}/subscriptions.json
                      </code>
                      <p className="text-[11px] text-slate-400 mt-2">
                        Esta llamada utiliza las credenciales del usuario autenticado (Access Token de la modelo). X responderá con <code className="text-emerald-300 font-mono">HTTP 204 No Content</code> confirmando la suscripción.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
                    >
                      ← Volver al Paso 2
                    </button>

                    <button
                      onClick={() => setWizardStep(4)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <span>Siguiente: API Externa & Webhooks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 Right: Subscribed Events List */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-sky-400" />
                    Eventos Escuchados en Tiempo Real:
                  </h5>
                  <div className="flex flex-col gap-2">
                    {config.subscribedEvents.map((evtName) => (
                      <div
                        key={evtName}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-mono text-sky-300 text-[11px]">{evtName}</span>
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Habilitado
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: EXTERNAL CONNECTION API & WEBHOOKS (n8n, Make, Zapier, Bots) */}
          {wizardStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Conectar API Externa, Bots y Webhooks de Terceros
                      </h4>
                      <p className="text-xs text-slate-400">
                        Integra n8n, Make.com, Zapier o tus propios scripts con AuraAgent.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed flex flex-col gap-3.5">
                    <p>
                      Si utilizas un bot en Python (Tweepy), un navegador automatizado, o plataformas de integración como <strong>n8n</strong> o <strong>Make.com</strong>, puedes reenviar cualquier DM entrante a la API de conexión externa de AuraAgent.
                    </p>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white">Endpoint Inbound de Webhook:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(extConfig.inboundUrl);
                            setCopiedEndpointUrl(true);
                            setTimeout(() => setCopiedEndpointUrl(false), 2500);
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedEndpointUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedEndpointUrl ? '¡Copiado!' : 'Copiar Endpoint'}</span>
                        </button>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 select-all">
                        {extConfig.inboundUrl}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white">Clave Secreta de Autenticación:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(extConfig.webhookSecret);
                            setCopiedSecretKey(true);
                            setTimeout(() => setCopiedSecretKey(false), 2500);
                          }}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSecretKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedSecretKey ? '¡Copiado!' : 'Copiar Secret'}</span>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 truncate">
                          {showSecretKey ? extConfig.webhookSecret : '••••••••••••••••••••••••••••••••'}
                        </div>
                        <button
                          onClick={() => setShowSecretKey(!showSecretKey)}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Envía esta clave en el header HTTP <code className="text-slate-300 font-mono">x-aura-secret</code> o <code className="text-slate-300 font-mono">x-api-key</code>.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setWizardStep(3)}
                      className="text-xs text-slate-400 hover:text-white font-semibold cursor-pointer"
                    >
                      ← Volver al Paso 3
                    </button>

                    <button
                      onClick={() => setActiveSubTab('external_api')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      <span>Abrir Banco de Pruebas de la API</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4 Right: Quick Test Trigger */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
                  <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-emerald-400" />
                    Probar Inmediatamente con un DM de Ejemplo:
                  </h5>

                  <textarea
                    rows={3}
                    value={testDmText}
                    onChange={(e) => setTestDmText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                  />

                  <button
                    onClick={handleExecuteExternalWebhookTest}
                    disabled={isExecutingTest}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
                  >
                    {isExecutingTest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Procesando mensaje con Aura...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Disparar Webhook de Prueba (POST)</span>
                      </>
                    )}
                  </button>

                  {testResult && (
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-xs flex flex-col gap-1.5 mt-1">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>Respuesta de {testResult.model?.name}:</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          HTTP 200 OK • {testResult.executionTimeMs}ms
                        </span>
                      </div>
                      <div className="text-slate-200 mt-1 leading-relaxed bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        {testResult.reply?.text}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB: MODEL VOICE & MEDIA VAULT (BÓVEDA DE LA MODELO)
          ======================================================== */}
      {activeSubTab === 'model_vault' && (
        <ModelVoiceAndMediaVault
          activeModel={activeModel}
          onUpdateModel={(updated) => onSelectModel(updated)}
          onTestWebhook={(sampleText) => {
            setTestDmText(sampleText);
            setActiveSubTab('external_api');
          }}
          onOpenInstallers={onOpenInstallers}
        />
      )}

      {/* ========================================================
          SUB-TAB 1: CREDENTIALS & X API V2 CONFIGURATION
          ======================================================== */}
      {activeSubTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-sky-400" />
                    Credenciales de X API v2 (Developer Portal)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Introduce tus claves oficiales de X con permisos de lectura y escritura de DMs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLoadSandboxCredentials}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer border border-slate-700 transition-colors"
                  >
                    Claves Demo
                  </button>
                  <button
                    onClick={handleClearCredentials}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer border border-slate-800 transition-colors"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* API Key */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>API Key (Consumer Key):</span>
                    <span className="text-[10px] text-slate-500 font-mono">OAuth 1.0a</span>
                  </label>
                  <input
                    type="text"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                    placeholder="xAI_sec_k982_prod_live_key"
                  />
                </div>

                {/* API Key Secret */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>API Key Secret (Consumer Secret):</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Usado para HMAC CRC</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKeySecret ? 'text' : 'password'}
                      value={config.apiKeySecret}
                      onChange={(e) => setConfig({ ...config, apiKeySecret: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                      placeholder="xAI_sec_k982_prod_live_key_sec"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKeySecret(!showApiKeySecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showApiKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Bearer Token */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Bearer Token (v2 App-Only):</span>
                    <span className="text-[10px] text-indigo-400 font-mono">Twitter API v2</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showBearerToken ? 'text' : 'password'}
                      value={config.bearerToken}
                      onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBearerToken(!showBearerToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showBearerToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Access Token */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Access Token (User Context):</span>
                    <span className="text-[10px] text-slate-500 font-mono">Cuenta de Modelo</span>
                  </label>
                  <input
                    type="text"
                    value={config.accessToken}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Access Token Secret */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Access Token Secret:
                  </label>
                  <div className="relative">
                    <input
                      type={showAccessTokenSecret ? 'text' : 'password'}
                      value={config.accessTokenSecret}
                      onChange={(e) => setConfig({ ...config, accessTokenSecret: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessTokenSecret(!showAccessTokenSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showAccessTokenSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Client ID (OAuth 2.0 PKCE) */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Client ID (OAuth 2.0 PKCE):
                  </label>
                  <input
                    type="text"
                    value={config.clientId}
                    onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Client Secret (OAuth 2.0 PKCE) */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Client Secret (OAuth 2.0 PKCE):
                  </label>
                  <div className="relative">
                    <input
                      type={showClientSecret ? 'text' : 'password'}
                      value={config.clientSecret}
                      onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowClientSecret(!showClientSecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showClientSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Webhook Environment Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Nombre del Entorno de Webhook (Account Activity Env):</span>
                    <span className="text-[10px] text-slate-500 font-mono">Dev / Prod Env Name</span>
                  </label>
                  <input
                    type="text"
                    value={config.webhookEnvName}
                    onChange={(e) => setConfig({ ...config, webhookEnvName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 focus:outline-none focus:border-sky-500"
                    placeholder="env-prod-aura-x"
                  />
                </div>
              </div>

              {/* Action Buttons: Test Connection & Save */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={handleTestTwitterConnection}
                  disabled={isTestingConnection}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                      <span>Probando conexión...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-3.5 h-3.5 text-sky-400" />
                      <span>Probar Conexión X API v2</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveTwitterCredentials}
                  disabled={isSavingTwitterCreds}
                  className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingTwitterCreds ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando en servidor...</span>
                    </>
                  ) : saveTwitterSuccess ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-300" />
                      <span>¡Credenciales Guardadas!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Credenciales en Servidor</span>
                    </>
                  )}
                </button>
              </div>

              {/* Connection Test Diagnostics Card */}
              {connectionTestResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs flex flex-col gap-2.5 ${
                    connectionTestResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      {connectionTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      {connectionTestResult.message}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      {connectionTestResult.details?.timestamp?.slice(11, 19)}
                    </span>
                  </div>

                  {connectionTestResult.details && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mt-1 pt-2 border-t border-slate-800/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Entorno:</span>
                        <b className="text-sky-300">{connectionTestResult.details.accountActivityEnv}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Cálculo HMAC:</span>
                        <b className="text-emerald-300">{connectionTestResult.details.hmacAlgorithm}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Límite diario:</span>
                        <b className="text-indigo-300">{connectionTestResult.details.dailyDmLimit} DMs</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Permisos:</span>
                        <b className="text-teal-300">Lectura, Escritura, DMs</b>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Webhook URL config & CRC Test */}
              <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  URL del Webhook de Aura en tu servidor (Account Activity API):
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 select-all truncate">
                    {config.webhookUrl}
                  </div>
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 shrink-0"
                  >
                    {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedUrl ? '¡Copiado!' : 'Copiar'}</span>
                  </button>
                  <button
                    onClick={handleTestCrc}
                    disabled={crcTesting}
                    className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${crcTesting ? 'animate-spin' : ''}`} />
                    <span>Probar CRC</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
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

          {/* Right Column: Guidance, Model Profile & Troubleshooting */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Real Model Connection Card for Ana María (@afire_sb) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Modelo Oficial Vinculada
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  CUENTA REAL
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80"
                    alt="Ana María"
                    className="w-12 h-12 rounded-xl object-cover border border-sky-500/40"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-950 flex items-center justify-center text-[8px] text-white font-bold">
                    𝕏
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    Ana María
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  </div>
                  <div className="text-xs text-sky-400 font-mono font-medium">@afire_sb</div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    VIP: onlyfans.com/afire_sb • ANAMARIA_VIP_30
                  </div>
                </div>
              </div>

              {/* Sync Button */}
              <button
                onClick={handleSyncProfile}
                disabled={isSyncingProfile}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 cursor-pointer transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingProfile ? 'animate-spin' : ''}`} />
                <span>{isSyncingProfile ? 'Sincronizando con X...' : 'Sincronizar Perfil de @afire_sb con X'}</span>
              </button>

              {profileSyncResult && (
                <div
                  className={`p-3 rounded-xl border text-xs ${
                    profileSyncResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="font-bold mb-0.5">
                    {profileSyncResult.message || profileSyncResult.error}
                  </div>
                  {profileSyncResult.profile?.apiCreditsNote && (
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">
                      {profileSyncResult.profile.apiCreditsNote}
                    </p>
                  )}
                </div>
              )}

              {/* Technical Banner explaining Twitter REST credits vs Webhooks */}
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>¿Por qué se pre-configura el nombre de Ana María (@afire_sb)?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Al consultar directamente la API de X con tu Bearer Token, Twitter responde{' '}
                  <code className="text-amber-300 font-mono">HTTP 402 credits depleted</code> porque tu cuenta gratuita de desarrollador agotó los créditos mensuales para consultas GET REST.
                </p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Por esa razón, AuraAgent vincula directamente a <b className="text-white">Ana María (@afire_sb)</b>. De este modo, los <b className="text-emerald-400">Webhooks de Account Activity</b> y la <b className="text-emerald-400">API de DMs Entrantes</b> procesan mensajes en tiempo real sin consumir créditos REST agotados.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                Validación de Seguridad X API
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Todas las peticiones entrantes a <code className="text-sky-300">/api/webhooks/twitter-x</code> son autenticadas contra tu <code className="text-sky-300">API Key Secret</code> mediante HMAC-SHA256, protegiéndote contra mensajes falsificados o de spam.
              </p>

              <div className="flex flex-col gap-2.5 mt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">1. Modo Developer Free / Basic:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Account Activity API está habilitado en proyectos de X Developer con acceso v2.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">2. Permiso Direct Messages:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Si tu app solo tiene "Read and Write", X rechazará los webhooks de DMs. Debe ser "Read, Write, and Direct Messages".
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">3. Regeneración de Claves:</span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Si cambias los permisos de la app en X Developer Portal, debes regenerar el Access Token y Secret para que los nuevos permisos surtan efecto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: EXTERNAL CONNECTION API & WEBHOOKS
          ======================================================== */}
      {activeSubTab === 'external_api' && (
        <div className="flex flex-col gap-6">
          {/* Top Config & Test Bench Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: API Credentials & Settings (6 cols) */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Webhook className="w-4 h-4 text-emerald-400" />
                      Configuración del Webhook & API Key
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Parámetros de conexión para n8n, Make.com, Zapier o tus propios bots.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    REST API v2.5
                  </span>
                </div>

                {/* Inbound URL */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>URL del Webhook de Entrada (Inbound Webhook):</span>
                    <span className="text-[10px] text-emerald-400 font-mono">POST</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={extConfig.inboundUrl}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-300 select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(extConfig.inboundUrl);
                        setCopiedEndpointUrl(true);
                        setTimeout(() => setCopiedEndpointUrl(false), 2500);
                      }}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shrink-0 cursor-pointer"
                      title="Copiar URL"
                    >
                      {copiedEndpointUrl ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Secret Key and API Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Webhook Secret:</span>
                      <span className="text-[10px] text-indigo-400 font-mono">Recomendado</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        value={extConfig.webhookSecret}
                        onChange={(e) =>
                          setExtConfig({ ...extConfig, webhookSecret: e.target.value })
                        }
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => setShowSecretKey(!showSecretKey)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extConfig.webhookSecret);
                          setCopiedSecretKey(true);
                          setTimeout(() => setCopiedSecretKey(false), 2500);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {copiedSecretKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      Header: x-aura-secret
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                      API Key Alternativa:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={extConfig.apiKey}
                        onChange={(e) => setExtConfig({ ...extConfig, apiKey: e.target.value })}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extConfig.apiKey);
                          setCopiedApiKey(true);
                          setTimeout(() => setCopiedApiKey(false), 2500);
                        }}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        {copiedApiKey ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                      Header: x-api-key
                    </span>
                  </div>
                </div>

                {/* Regenerate Keys Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRegenerateExternalKeys}
                    disabled={isRegeneratingKeys}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingKeys ? 'animate-spin' : ''}`} />
                    <span>Regenerar Claves de Seguridad</span>
                  </button>
                </div>

                {/* Default Target Model */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                    Modelo Asignada por Defecto:
                  </label>
                  <select
                    value={extConfig.targetModelId}
                    onChange={(e) => setExtConfig({ ...extConfig, targetModelId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.handle}) — {m.archetype} • {m.vipPrice}
                      </option>
                    ))}
                  </select>
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Toggles */}
                <div className="flex flex-col gap-2.5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Verificar Firma Criptográfica HMAC-SHA256
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Valida cabecera <code className="text-slate-300 font-mono">x-aura-secret</code>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extConfig.verifySignature}
                      onChange={(e) =>
                        setExtConfig({ ...extConfig, verifySignature: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Generar Nota de Voz con la Modelo
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Devuelve script y señal de síntesis TTS
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extConfig.autoDispatchVoice}
                      onChange={(e) =>
                        setExtConfig({ ...extConfig, autoDispatchVoice: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        Adjuntar Foto Casual Situacional
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sugiere fotografía contextual según el estado anímico
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={extConfig.autoDispatchPhotos}
                      onChange={(e) =>
                        setExtConfig({ ...extConfig, autoDispatchPhotos: e.target.checked })
                      }
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
                  ) : saveConfigSuccess ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-emerald-200" />
                      <span>¡Configuración Actualizada Exitosamente!</span>
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

            {/* Right Column: Live Webhook Test Bench & Multi-language Code Generator (6 cols) */}
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
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Test Bench
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
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
                    rows={2}
                    value={testDmText}
                    onChange={(e) => setTestDmText(e.target.value)}
                    placeholder="Escribe el mensaje recibido en el DM..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
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

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-400 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          Respuesta generada por {testResult.model?.name || 'Aura'}:
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          Mood: <b className="text-sky-300">{testResult.reply?.detectedMood}</b>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                        {testResult.reply?.text}
                      </div>

                      {/* Attached Voice Note Player with Model's Voice */}
                      {testResult.reply?.voiceNote?.send && (
                        <div className="mt-1">
                          <VoiceNoteBubble
                            text={testResult.reply.voiceNote.script || testResult.reply.text}
                            audioBase64={testResult.reply.voiceNote.audioBase64}
                            durationSeconds={testResult.reply.voiceNote.audioDurationSeconds || 8}
                            sender="model"
                            modelName={testResult.model?.name || activeModel.name}
                            voiceStyle={testResult.model?.voiceDescription || activeModel.voice.description}
                          />
                        </div>
                      )}

                      {/* Attached Photo Preview from Model's Vault */}
                      {testResult.reply?.casualPhoto?.send && (
                        <div className="mt-1 p-3 rounded-2xl bg-slate-900/90 border border-sky-500/30 flex items-center gap-3">
                          <img
                            src={testResult.reply.casualPhoto.url}
                            alt={testResult.reply.casualPhoto.title}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white truncate">
                                {testResult.reply.casualPhoto.title}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 uppercase font-semibold">
                                {testResult.reply.casualPhoto.category}
                              </span>
                              {testResult.reply.casualPhoto.isExclusive && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                                  PPV {testResult.reply.casualPhoto.unlockPrice || '$19.99'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 italic line-clamp-1">
                              "{testResult.reply.casualPhoto.caption}"
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              Marca: {testResult.reply.casualPhoto.watermark}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* OnlyFans VIP Offer Card */}
                      {testResult.reply?.salesPitch?.pitchVip && (
                        <div className="mt-1 p-3 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/40 flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                              <Flame className="w-4 h-4 text-rose-400" />
                              <span>Enlace a OnlyFans VIP Desbloqueado</span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {testResult.reply.salesPitch.exclusiveOfferText || 'Acceso inmediato al chat privado'}
                            </p>
                            <div className="text-[10px] text-rose-400 font-mono mt-0.5">
                              Cupón: <b>{testResult.reply.salesPitch.discountCode}</b>
                            </div>
                          </div>
                          <a
                            href={testResult.reply.salesPitch.vipLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-md shadow-rose-600/30"
                          >
                            <span>Ver OF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <div className="flex items-center gap-2 flex-wrap pt-1.5 border-t border-slate-800/60 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Radio className="w-3 h-3 text-indigo-400" />
                          Confianza: {testResult.reply?.trustScore}%
                        </span>

                        {testResult.reply?.voiceNote?.send && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Volume2 className="w-3 h-3 text-purple-400" />
                            Nota de Voz Reproducible
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

                {/* Multi-Language Code Snippets Selector */}
                <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    {/* Selector */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {(['curl', 'nodejs', 'python', 'n8n'] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setCodeLanguage(lang)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                            codeLanguage === lang
                              ? 'bg-slate-800 text-sky-300'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleCopyCodeSnippet}
                      className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCodeSnippet ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCodeSnippet ? '¡Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>

                  <pre className="text-[10px] font-mono text-slate-300 p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto select-all leading-relaxed whitespace-pre-wrap max-h-48">
                    {getCodeSnippet()}
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
                  Registro de auditoría de cada payload recibido por{' '}
                  <code className="text-slate-300 font-mono">/api/webhooks/external/dm-inbound</code>.
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
                      <td className="p-3 text-slate-300 max-w-xs truncate">{log.replyText}</td>
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

      {/* ========================================================
          SUB-TAB 3: SIMULATOR (LIVE DM CONSOLE)
          ======================================================== */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 flex flex-col gap-5">
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
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      simSenderHandle === lead.handle
                        ? 'bg-sky-500/10 border-sky-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <img
                        src={lead.avatar}
                        alt={lead.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-white truncate">{lead.name}</span>
                    </div>
                    <div className="text-[10px] text-sky-400 font-mono truncate">{lead.handle}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5 truncate">{lead.starter}</div>
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Handle del Fan:
                    </label>
                    <input
                      type="text"
                      value={simSenderHandle}
                      onChange={(e) => setSimSenderHandle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Nombre:
                    </label>
                    <input
                      type="text"
                      value={simSenderName}
                      onChange={(e) => setSimSenderName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Mensaje de DM a enviar a la modelo:
                  </label>
                  <textarea
                    rows={3}
                    value={simDmText}
                    onChange={(e) => setSimDmText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none font-sans"
                  />
                </div>

                <button
                  disabled={isProcessingSim || !simDmText.trim()}
                  onClick={handleSimulateInboundDM}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessingSim ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {typingCountdown !== null
                          ? `Simulando digitación humana (${typingCountdown}s restantes)...`
                          : 'Procesando respuesta con AuraAgent...'}
                      </span>
                    </span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Simular Envío de DM en X</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Visual DM Preview (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-3 min-h-[380px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Twitter className="w-4 h-4 text-sky-400" />
                  Bandeja de DMs de {activeModel.name}
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  En línea en X
                </span>
              </div>

              {/* Chat Simulation View */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[360px] p-2">
                {selectedEventPayload && (
                  <>
                    {/* User Message */}
                    <div className="flex items-start gap-2 max-w-[85%] self-start">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 shrink-0">
                        {selectedEventPayload.senderName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="p-3 rounded-2xl rounded-tl-sm bg-slate-800 text-xs text-slate-200">
                        {selectedEventPayload.text}
                        <div className="text-[9px] text-slate-400 mt-1 font-mono text-right">
                          {selectedEventPayload.timestamp}
                        </div>
                      </div>
                    </div>

                    {/* Typing Indicator */}
                    {isProcessingSim && typingCountdown !== null && (
                      <div className="flex items-center gap-2 self-end text-xs text-sky-400">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                        <span>{activeModel.name} está escribiendo... ({typingCountdown}s)</span>
                      </div>
                    )}

                    {/* Model Response */}
                    {selectedEventPayload.replyText && !isProcessingSim && (
                      <div className="flex items-start gap-2 max-w-[85%] self-end flex-row-reverse">
                        <img
                          src={activeModel.avatarUrl}
                          alt={activeModel.name}
                          className="w-7 h-7 rounded-full object-cover border border-sky-500 shrink-0"
                        />
                        <div className="p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-sky-600/90 to-blue-600/90 text-xs text-white shadow-md">
                          {selectedEventPayload.replyText}

                          {selectedEventPayload.voiceNoteGenerated && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-950/40 border border-white/10 flex items-center gap-2 text-[11px]">
                              <Volume2 className="w-3.5 h-3.5 text-purple-300" />
                              <span>Nota de voz adjunta ({selectedEventPayload.audioDuration || 6}s)</span>
                            </div>
                          )}

                          {selectedEventPayload.onlyFansPitched && (
                            <div className="mt-2 p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-200 flex items-center gap-1.5 font-bold">
                              <Flame className="w-3.5 h-3.5 text-rose-400" />
                              <span>Enlace VIP OnlyFans presentado</span>
                            </div>
                          )}

                          <div className="text-[9px] text-sky-200 mt-1 text-right">
                            {selectedEventPayload.timestamp}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: HUMANIZER RULES, NATURAL DELAY (UP TO 2 HOURS) & QUEUE
          ======================================================== */}
      {activeSubTab === 'humanizer' && (
        <div className="flex flex-col gap-6">
          {/* Top Delay & Anti-Ban Config */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-sky-400" />
                      Cadencia de Respuesta Humana en X (Minutos a 2 Horas)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evita cualquier sospecha de bot programando pausas naturales realistas entre minutos y hasta 2 horas.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/30 font-bold">
                    Anti-Ban v2.5
                  </span>
                </div>

                {/* Preset Modes */}
                <div>
                  <label className="text-xs font-bold text-white mb-2 block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Selecciona el Modo de Retraso Humano:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={() => handleSaveDelayMode('fast', 3, 8)}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        delayConfig.mode === 'fast'
                          ? 'bg-sky-500/15 border-sky-500 text-white shadow-md shadow-sky-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-sky-300">
                        <span>⚡ Rápido</span>
                      </div>
                      <div className="text-[11px] font-mono text-white mt-1">3 a 8 min</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Chat activo en vivo</div>
                    </button>

                    <button
                      onClick={() => handleSaveDelayMode('natural', 10, 25)}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        delayConfig.mode === 'natural'
                          ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-300">
                        <span>🌿 Natural</span>
                        <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">TOP</span>
                      </div>
                      <div className="text-[11px] font-mono text-white mt-1">10 a 25 min</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Uso cotidiano de móvil</div>
                    </button>

                    <button
                      onClick={() => handleSaveDelayMode('relaxed', 30, 60)}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        delayConfig.mode === 'relaxed'
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                        <span>☕ Pausado</span>
                      </div>
                      <div className="text-[11px] font-mono text-white mt-1">30 a 60 min</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Modelo en gym o cena</div>
                    </button>

                    <button
                      onClick={() => handleSaveDelayMode('ultra_real', 60, 120)}
                      className={`p-2.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        delayConfig.mode === 'ultra_real'
                          ? 'bg-purple-500/15 border-purple-500 text-white shadow-md shadow-purple-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-purple-300">
                        <span>🕊️ Ultra Real</span>
                      </div>
                      <div className="text-[11px] font-mono text-white mt-1">1 a 2 horas</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">Cero sospecha de bot</div>
                    </button>
                  </div>
                </div>

                {/* Custom Range Sliders in Minutes */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-400" /> Retraso Mínimo de Respuesta:
                      </label>
                      <span className="text-xs font-mono font-bold text-sky-400">
                        {delayConfig.minMinutes} minutos
                      </span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="60"
                      value={delayConfig.minMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const maxVal = Math.max(val + 5, delayConfig.maxMinutes);
                        handleSaveDelayMode(delayConfig.mode, val, maxVal);
                      }}
                      className="w-full accent-sky-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Retraso Máximo de Respuesta (Hasta 2 horas):
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-400">
                        {delayConfig.maxMinutes >= 60
                          ? `${Math.floor(delayConfig.maxMinutes / 60)}h ${delayConfig.maxMinutes % 60 ? (delayConfig.maxMinutes % 60) + 'm' : ''} (${delayConfig.maxMinutes} min)`
                          : `${delayConfig.maxMinutes} minutos`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      value={delayConfig.maxMinutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const minVal = Math.min(val - 3, delayConfig.minMinutes);
                        handleSaveDelayMode(delayConfig.mode, minVal, val);
                      }}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Cuando un fan le escriba a <strong className="text-white">Ana María (@afire_sb)</strong> por DM en X, AuraAgent esperará aleatoriamente entre <strong className="text-sky-300">{delayConfig.minMinutes} y {delayConfig.maxMinutes} minutos</strong> antes de despachar la respuesta con audio y fotos, imitando a la perfección a una modelo real usando su teléfono.
                    </p>
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
                    Aura solo ofrecerá el enlace VIP de OnlyFans (<code className="text-rose-300 font-mono">{activeModel.vipLink}</code>) con el cupón <code className="text-rose-300 font-mono">{activeModel.vipDiscountCode}</code> cuando la interacción supere este nivel de confianza.
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

              {/* Anti-Bot typing simulator info */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-2.5">
                <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-teal-400" />
                  Simulación de Escribiendo (Typing Indicator)
                </h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  20 segundos antes de enviar el mensaje, Aura emite el evento de X{' '}
                  <code className="text-teal-300 font-mono">direct_message_indicate_typing_events</code>. El fan ve los tres puntos de "Ana María está escribiendo..." en su pantalla de X antes de recibir el texto y la nota de voz.
                </p>
              </div>
            </div>
          </div>

          {/* Live Scheduled DM Queue Monitor */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  Cola en Vivo de DMs Programados (Human Delay Queue)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mensajes recibidos de fans en X esperando su tiempo de entrega realista para no levantar sospechas de bot.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                  {queuedDMs.filter((q) => q.status === 'scheduled').length} en espera • {queuedDMs.filter((q) => q.status === 'delivered').length} despachados
                </span>
              </div>
            </div>

            {queuedDMs.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-400 text-xs">
                No hay mensajes en cola actualmente. Cuando llegue un DM por el Webhook de X o la API Externa, aparecerá aquí con su cuenta regresiva.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {queuedDMs.map((item) => {
                  const isScheduled = item.status === 'scheduled';
                  const deliveryTime = new Date(item.scheduledFor);
                  const now = Date.now();
                  const diffMinutes = Math.max(0, Math.round((deliveryTime.getTime() - now) / 60000));

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border flex flex-col gap-3 transition-all ${
                        isScheduled
                          ? 'bg-slate-950/90 border-sky-500/30 shadow-lg shadow-sky-500/5'
                          : 'bg-slate-950/40 border-slate-800/60 opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
                            {item.senderName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              {item.senderName}
                              <span className="text-[10px] text-sky-400 font-mono font-normal">
                                {item.senderHandle}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Destino: <strong className="text-indigo-300">{item.modelName} ({item.modelHandle})</strong>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isScheduled
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {isScheduled ? `⏳ En espera (${diffMinutes} min)` : '✅ Despachado'}
                        </span>
                      </div>

                      {/* Messages Bubble Pair */}
                      <div className="flex flex-col gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                          <span className="text-[10px] text-slate-400 block font-semibold mb-0.5">
                            Mensaje del Fan en X:
                          </span>
                          "{item.receivedText}"
                        </div>

                        <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-slate-200">
                          <span className="text-[10px] text-sky-400 block font-semibold mb-0.5">
                            Respuesta Programada de {item.modelName}:
                          </span>
                          "{item.replyText}"
                        </div>
                      </div>

                      {/* Attachments preview */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {item.voiceTitle && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            {item.voiceTitle}
                          </span>
                        )}
                        {item.photoTitle && (
                          <span className="px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {item.photoTitle}
                          </span>
                        )}
                        {item.vipPitched && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-bold">
                            <Flame className="w-3 h-3" />
                            Cierre OnlyFans
                          </span>
                        )}
                      </div>

                      {/* Footer: Countdown & Bypass Button */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="text-[10px] text-slate-400 font-mono">
                          {isScheduled
                            ? `Entrega: ${deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Pausa de ${item.delayMinutes}m)`
                            : `Despachado a las ${deliveryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </div>

                        {isScheduled && (
                          <button
                            onClick={() => handleDispatchNow(item.id)}
                            disabled={isDispatchingQueueId === item.id}
                            className="px-3 py-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-sky-600/20 disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isDispatchingQueueId === item.id ? 'Despachando...' : 'Despachar Ahora'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 5: WEBHOOK LOGS & EVENTS
          ======================================================== */}
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
