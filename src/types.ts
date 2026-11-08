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
  photoCategory?: 'cafe' | 'gym' | 'cozy' | 'beach' | 'teaser' | 'exclusive_ppv';
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
  isXSynced?: boolean;
  xDmId?: string;
  xDeliveryStatus?: string;
}

export interface AgentSkillSettings {
  semanticAccuracy: number; // 1 - 100: Capacidad de interpretar dobles sentidos, sarcasmo y subtexto
  naturalnessLevel: number; // 1 - 100: Cero frases de robot, cadencia y modismos humanos
  emotionalEmpathy: number; // 1 - 100: Detección y acompañamiento al estado anímico
  salesClosingAssertiveness: 'suave' | 'equilibrada' | 'audaz'; // Estilo de cierre comercial
  antiClichéFilter: boolean; // Prohibir estrictamente saludos genéricos de bot
  storyContextAwareness: boolean; // Capacidad de vincular stories/tweets al diálogo
}

export interface ModelVoiceClip {
  id: string;
  modelId: string;
  title: string;
  category: 'saludo' | 'coqueto' | 'gym' | 'cafe' | 'cierre_vip' | 'susurro' | 'personalizado';
  audioBase64?: string;
  audioUrl?: string;
  durationSeconds: number;
  transcription: string;
  triggerKeywords: string[];
  createdAt: string;
  isCustomUploaded?: boolean;
}

export interface ModelMediaItem {
  id: string;
  modelId: string;
  title: string;
  category: 'cafe' | 'gym' | 'cozy' | 'beach' | 'teaser' | 'exclusive_ppv';
  url: string;
  caption: string;
  isExclusive: boolean;
  unlockPrice?: string;
  watermark?: string;
  createdAt: string;
}

export interface RawAudioSample {
  id: string;
  modelId: string;
  name: string;
  audioUrl: string;
  audioBase64?: string;
  durationSeconds: number;
  fileSizeBytes?: number;
  uploadedAt: string;
  // Natural acoustic signatures extracted directly without text transcription
  signatures: {
    f0PitchHz: number; // e.g. 215 Hz
    harmonicWarmth: number; // 0 - 100
    spectralPurity: number; // 0 - 100
    breathinessRatio: number; // 0 - 100
    cadenceRate: number; // e.g. 0.98x
    roomNoiseFloorDb: number; // e.g. -38 dB
    roomReverbEstimate: string; // e.g. "Acústica de habitación seca / micro-reverberación de 0.4s"
    recommendedAmbience?: string;
  };
}

export interface VoiceLearningIteration {
  id: string;
  generation: number;
  timestamp: string;
  source: 'microfono_en_vivo' | 'subida_archivo' | 'auto_perfeccionamiento' | 'calibracion_admin';
  f0PitchHz: number;
  harmonicWarmth: number;
  breathinessRatio: number;
  cadenceRate: number;
  accentDialect: string;
  learnedTrait: string;
  similarityScore: number; // 0 - 100%
}

export interface ModelVoiceDNA {
  isCloned: boolean;
  sampleDurationSeconds: number;
  sampleAudioUrl?: string;
  sampleAudioBase64?: string;
  sampleTranscription?: string;
  detectedTone: string;
  pitch: number;
  rate: number;
  timbreScore: number;
  calibratedAt?: string;
  learningGenerationsCount: number;
  similarityScore?: number; // e.g. 99.4% identica a la modelo
  accentDialect?: string;
  breathiness?: number;
  learningHistory?: VoiceLearningIteration[];
  // Fine-Grained Timbre & Breathiness Acoustics (Hiperrealismo de Voz)
  formantResonance?: number; // 80 - 100% (Resonancia de formantes y cavidad vocal)
  chestWarmth?: number; // 0 - 100% (Calidez y cuerpo de pecho)
  harmonicAirClarity?: number; // 0 - 100% (Brillo armónico y presencia)
  vocalFryTexture?: number; // 0 - 100% (Textura de cuerdas vocales íntima)
  preInhaleDelayMs?: number; // 0 - 500ms (Micro-respiración previa al habla)
  glottalTrailOff?: number; // 0 - 100% (Descompresión glotal y decaimiento de aire)
  deEssingFilter?: number; // 0 - 100% (Filtro anti-siseo orgánico)
  // Acoustic Room Presence & Environment (Anti-Digital Silence)
  roomAcoustics?: string;
  ambientPresenceType?:
    | 'room_intimate'
    | 'bedroom_night'
    | 'rain_window'
    | 'cafe_chill'
    | 'balcony_breeze'
    | 'studio_warm'
    | 'car_interior'
    | 'beach_waves'
    | 'fireplace_warm'
    | 'gym_fitness'
    | 'custom';
  roomPresenceLevel?: number; // 0 - 100
  acousticSpaceName?: string;
  // Raw Audio Samples (Zero Transcription Required)
  rawAcousticSamples?: RawAudioSample[];
  customAmbienceAudioUrl?: string;
  customAmbienceName?: string;
  ambienceVolumeMultiplier?: number;
  ambienceDuckingEnabled?: boolean;
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
  isSystemDefault?: boolean; // True for system demo models (Valeria, Elena, etc.), False for Real Models (ANAMARIA @afire_sb, etc.)
  creatorOwnerId?: string;
  voice: {
    name: string; // e.g. 'Kore' | 'Aoede' | 'Puck' | 'Charon' | 'Fenrir'
    pitch: number;
    rate: number;
    lang?: string; // e.g. 'es-CO' | 'es-ES' | 'es-AR' | 'es-MX'
    accent: string;
    description: string;
  };
  voiceDna?: ModelVoiceDNA;
  xProfileMetrics?: {
    followers: number;
    following: number;
    tweets: number;
    isVerified: boolean;
    bannerUrl?: string;
    restId?: string;
    lastSyncedAt?: string;
    liveFromX?: boolean;
  };
  voiceClips?: ModelVoiceClip[];
  mediaVault?: ModelMediaItem[];
  rawAudioSamples?: RawAudioSample[];
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
  // Aura AI Autonomous Prospecting & Lead Hunter Fields
  purchasePropensity?: number; // 0 - 100% (Calculado mediante análisis estadístico de Aura)
  estimatedSpendPower?: 'Tier Diamante ($$$)' | 'Tier Oro ($$)' | 'High Ticket ($$$$)';
  conversionReadiness?: 'Alta Probabilidad' | 'Muy Alta Probabilidad' | 'VIP Calificado';
  statisticalSignals?: string[];
  suggestedIcebreaker?: string;
  conversionStrategy?: string;
  scoutedAt?: string;
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
  updatedAt?: string;
  xAccountConnected?: boolean;
  associatedModelId?: string; // Links this real creator account to her isolated model profile
  allowedModelIds?: string[];
  preferences?: {
    theme?: string;
    activeModelId?: string;
    ambientSoundEnabled?: boolean;
    activeUsername?: string;
    volume?: number;
    platformSkin?: 'X (Twitter)' | 'Web';
    [key: string]: any;
  };
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

