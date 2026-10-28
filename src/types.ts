export type PlatformType = 'X (Twitter)' | 'Web' | 'Telegram';

export type FunnelStage = 'cold' | 'rapport' | 'warm' | 'vip_ready' | 'converted';

export type UserMood =
  | 'contento'
  | 'triste'
  | 'serio'
  | 'cortante'
  | 'enojado'
  | 'coqueto'
  | 'timido';

export type CommunicationStyle =
  | 'Expresivo y Emojis'
  | 'Monosilábico y Seco'
  | 'Directo y Coqueto'
  | 'Formal y Reservado'
  | 'Vulnerable y Emotivo';

export interface UserMemory {
  userId: string;
  username: string;
  nameAlias?: string;
  currentMood: UserMood;
  communicationStyle: CommunicationStyle;
  moodIntensity: number; // 1 to 10
  keyFacts: string[]; // Learned facts about this user
  preferredTopics: string[];
  interactionCount: number;
  lastEmotionalState: string;
  suggestedApproach: string;
  attachmentLevel: 'Inicial' | 'Creciendo' | 'Alto' | 'Devoto';
}

export interface ConfidenceMetrics {
  trustScore: number; // 0 - 100
  reciprocity: number; // 0 - 100
  responseFluency: number; // 0 - 100
  positiveSentiment: number; // 0 - 100
  stage: FunnelStage;
  threshold: number; // usually 75%
  isVipReady: boolean;
  reasoning: string;
  detectedMood?: UserMood;
  detectedStyle?: CommunicationStyle;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
  timestamp: string;
  mediaType?: 'image' | 'audio';
  mediaUrl?: string;
  photoCategory?: 'cafe' | 'gym' | 'cozy' | 'beach';
  photoCaption?: string;
  audioDuration?: number; // in seconds
  audioBase64?: string;
  confidenceSnapshot?: ConfidenceMetrics;
  userMoodSnapshot?: UserMood;
  userMemorySnapshot?: Partial<UserMemory>;
  pitchVip?: boolean;
  vipLink?: string;
  vipPrice?: string;
  isEncrypted?: boolean;
  transcription?: string; // if user sent audio
}

export interface AgentSkillSettings {
  semanticAccuracy: number; // 1 - 100: Capacidad de interpretar dobles sentidos, sarcasmo y subtexto
  naturalnessLevel: number; // 1 - 100: Cero frases de robot, cadencia y modismos humanos
  emotionalEmpathy: number; // 1 - 100: Detección y acompañamiento al estado anímico
  salesClosingAssertiveness: 'suave' | 'equilibrada' | 'audaz'; // Estilo de cierre comercial
  antiClichéFilter: boolean; // Prohibir estrictamente saludos genéricos de bot
  storyContextAwareness: boolean; // Capacidad de vincular stories/tweets al diálogo
}

export interface ModelProfile {
  id: string;
  name: string;
  handle: string;
  age: number;
  location: string;
  avatarUrl: string;
  archetype: string;
  tagline: string;
  bio: string;
  vipLink: string;
  vipPrice: string;
  vipDiscountCode: string;
  voice: {
    name: string; // e.g. 'Kore' | 'Aoede' | 'Puck' | 'Charon' | 'Fenrir'
    pitch: number;
    rate: number;
    accent: string;
    description: string;
  };
  rules: {
    conversionThreshold: number; // default 75
    autoSendVoiceNotes: boolean;
    autoSendCasualPhotos: boolean;
    requireReciprocityForVip: boolean;
    adaptiveToneMatching: boolean;
    activeMemoryRetention: boolean;
  };
  skills: AgentSkillSettings;
  security: {
    e2eEncryption: boolean;
    autoDestructTimer: number; // in minutes (0 = disabled)
    stealthMode: boolean;
    fingerprintHash: string;
  };
}

export interface TwitterIntegrationConfig {
  apiKey: string;
  apiKeySecret: string;
  bearerToken: string;
  accessToken: string;
  accessTokenSecret: string;
  clientId: string;
  clientSecret: string;
  webhookUrl: string;
  webhookEnvName: string;
  isConnected: boolean;
  crcVerified: boolean;
  lastCrcCheck?: string;
  subscribedEvents: string[];
  humanDelaySeconds: { min: number; max: number };
  autoReplyEnabled: boolean;
  salesPitchThreshold: number;
  dailyDmLimit: number;
  dmsSentToday: number;
  rateLimitRemaining: number;
  antiSpamProtection: boolean;
}

export interface TwitterDMEvent {
  id: string;
  senderId: string;
  senderHandle: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientHandle: string;
  text: string;
  timestamp: string;
  status: 'received' | 'analyzing' | 'drafted' | 'delivered';
  replyText?: string;
  trustScore?: number;
  detectedMood?: UserMood;
  detectedStyle?: CommunicationStyle;
  voiceNoteGenerated?: boolean;
  audioDuration?: number;
  onlyFansPitched?: boolean;
  delayAppliedSeconds?: number;
  rawPayload?: any;
}

export interface LeadItem {
  id: string;
  username: string;
  platform: PlatformType;
  trustScore: number;
  stage: FunnelStage;
  reciprocity: number;
  lastMessage: string;
  lastActive: string;
  totalMessages: number;
  unlockedVip: boolean;
  notes: string;
  memory?: UserMemory;
}

export interface UserSession {
  id: string;
  name: string;
  email?: string;
  handle?: string;
  avatar: string;
  provider: 'x' | 'google';
  role: 'creator' | 'admin' | 'agency_manager';
  connectedAt: string;
  xAccountConnected?: boolean;
}

export interface ExternalWebhookConfig {
  inboundUrl: string;
  apiKey: string;
  webhookSecret: string;
  forwardingUrl: string;
  targetModelId: string;
  verifySignature: boolean;
  autoDispatchVoice: boolean;
  autoDispatchPhotos: boolean;
  active: boolean;
  totalCallsProcessed: number;
  lastCallTimestamp?: string;
}

export interface ExternalWebhookLog {
  id: string;
  timestamp: string;
  senderHandle: string;
  senderName: string;
  text: string;
  modelId: string;
  modelName: string;
  status: 'processed' | 'rejected' | 'forwarded';
  trustScore: number;
  detectedMood: UserMood;
  replyText: string;
  voiceGenerated: boolean;
  photoAttached: boolean;
  onlyFansPitched: boolean;
  executionTimeMs: number;
  signatureVerified: boolean;
}

