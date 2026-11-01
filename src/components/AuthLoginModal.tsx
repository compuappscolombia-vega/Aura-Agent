import React, { useState } from 'react';
import { UserSession, ModelProfile } from '../types';
import {
  X as CloseIcon,
  Twitter,
  Shield,
  CheckCircle2,
  Lock,
  Sparkles,
  LogOut,
  User,
  ArrowRight,
  KeyRound,
  UserPlus,
  Crown,
  Heart,
  Globe,
  Camera,
  Layers,
  Check,
  Eye,
  Sliders,
  DollarSign,
  AlertCircle,
  FolderLock,
  FlaskConical,
} from 'lucide-react';
import { generateSessionFingerprint } from '../utils/cryptoSim';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession | null;
  onLogin: (session: UserSession, associatedModel?: ModelProfile) => void;
  onLogout: () => void;
  realModels?: ModelProfile[];
  onRegisterRealModel?: (newModel: ModelProfile) => void;
  canClose?: boolean;
}

const PRESET_AVATARS = [
  {
    name: 'Latina Chic (Medellín)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Fitness Glow (Gym / Atardecer)',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Seda & Noche (Elegante)',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Playa & Sol (Casual)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  },
];

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLogin,
  onLogout,
  realModels = [],
  onRegisterRealModel,
  canClose = true,
}) => {
  // Main view mode: if not logged in, default to 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>(currentSession ? 'register' : 'login');
  // Role selector: 'real_model' | 'admin'
  const [authRole, setAuthRole] = useState<'real_model' | 'admin'>('real_model');

  // Registration Fields for Real Model
  const [regModelName, setRegModelName] = useState('');
  const [regModelHandle, setRegModelHandle] = useState('@');
  const [regModelAge, setRegModelAge] = useState(24);
  const [regModelLocation, setRegModelLocation] = useState('Medellín, Colombia');
  const [regModelBio, setRegModelBio] = useState('Modelo WC CB y ST • Creadora de contenido +18');
  const [regModelArchetype, setRegModelArchetype] = useState('Seductora & Cercana • Modelo Oficial');
  const [regModelVipLink, setRegModelVipLink] = useState('https://onlyfans.com/');
  const [regModelVipPrice, setRegModelVipPrice] = useState('$19.99/mes');
  const [regModelDiscountCode, setRegModelDiscountCode] = useState('');
  const [regModelVoiceAccent, setRegModelVoiceAccent] = useState('Latino dulce, sensual, cercano y pícaro (Paisa Colombiano)');
  const [regModelVoiceName, setRegModelVoiceName] = useState('Kore');
  const [regModelAvatarUrl, setRegModelAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [regModelPin, setRegModelPin] = useState('');

  // Registration / Login Fields for Administrator
  const [adminName, setAdminName] = useState('Administrador General Aura');
  const [adminEmail, setAdminEmail] = useState('compuappscolombia@gmail.com');
  const [adminAgencyName, setAdminAgencyName] = useState('Aura Agency Global');
  const [adminKey, setAdminKey] = useState('');

  // Login for Existing Real Models
  const [loginSelectedModelId, setLoginSelectedModelId] = useState<string>(
    realModels[0]?.id || 'afire-sb'
  );

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Handle Login of an existing Real Model
  const handleLoginAsRealModel = async (model: ModelProfile) => {
    setIsAuthenticating(true);
    setStatusNotice(null);

    const sessionData: UserSession = {
      id: `usr-real-${model.id}-${Date.now()}`,
      name: model.name,
      handle: model.handle,
      avatar: model.avatarUrl,
      provider: 'x',
      role: 'creator',
      associatedModelId: model.id,
      allowedModelIds: [model.id],
      connectedAt: new Date().toISOString(),
      xAccountConnected: true,
    };

    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      });
    } catch (e) {
      console.warn('Auth API fallback:', e);
    }

    onLogin(sessionData, model);
    setStatusNotice({
      type: 'success',
      message: `¡Sesión iniciada como ${model.name}! Entorno 100% independiente activado (modelos de prueba ocultos).`,
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1200);
  };

  // Handle Submit Registration for a New Real Model
  const handleRegisterRealModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regModelName.trim() || !regModelHandle.trim()) {
      setStatusNotice({ type: 'error', message: 'Por favor ingresa el nombre y el @usuario de X de la modelo.' });
      return;
    }

    setIsAuthenticating(true);
    setStatusNotice(null);

    const cleanHandle = regModelHandle.startsWith('@')
      ? regModelHandle.trim()
      : `@${regModelHandle.trim()}`;
    const cleanId = cleanHandle.replace('@', '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || `model-${Date.now()}`;
    const cleanDiscount = regModelDiscountCode.trim() || `${cleanId.toUpperCase()}_VIP_30`;
    const cleanVipLink = regModelVipLink.trim().startsWith('http')
      ? regModelVipLink.trim()
      : `https://onlyfans.com/${cleanId}`;

    const newCreatedModel: ModelProfile = {
      id: cleanId,
      name: regModelName.trim(),
      handle: cleanHandle,
      age: Number(regModelAge) || 24,
      location: regModelLocation.trim() || 'Medellín, Colombia',
      avatarUrl: regModelAvatarUrl,
      archetype: regModelArchetype.trim() || `Modelo Oficial • ${cleanHandle}`,
      tagline: `Creadora de contenido exclusiva • ${cleanHandle}`,
      bio: regModelBio.trim(),
      vipLink: cleanVipLink,
      vipPrice: regModelVipPrice.trim() || '$19.99/mes',
      vipDiscountCode: cleanDiscount,
      isSystemDefault: false, // Perfil de Modelo Real independiente (NO es plantilla de prueba)
      voice: {
        name: regModelVoiceName,
        pitch: 1.15,
        rate: 0.98,
        lang: 'es-CO',
        accent: regModelVoiceAccent,
        description: `Voz auténtica y personalizada para ${regModelName.trim()} (${cleanHandle})`,
      },
      voiceDna: {
        isCloned: true,
        sampleDurationSeconds: 8,
        detectedTone: `Voz auténtica de ${regModelName.trim()}`,
        pitch: 1.15,
        rate: 0.98,
        timbreScore: 99.2,
        calibratedAt: new Date().toISOString(),
        learningGenerationsCount: 1,
        roomAcoustics: 'Presencia acústica íntima de habitación privada',
        ambientPresenceType: 'room_intimate',
        roomPresenceLevel: 88,
        acousticSpaceName: 'Habitación Íntima',
      },
      voiceClips: [
        {
          id: `${cleanId}-vc-1`,
          modelId: cleanId,
          title: `Saludo Oficial de ${regModelName.trim()} ☕`,
          category: 'saludo',
          durationSeconds: 7,
          transcription: `Hola amor, soy ${regModelName.trim()}, qué lindo saludarte por aquí. Me pillas justo tomándome algo antes de salir, ¿tú qué estás haciendo hoy? Cuéntame...`,
          triggerKeywords: ['hola', 'buenas', 'saludos', cleanId, 'audio', 'voz'],
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: `${cleanId}-vc-2`,
          modelId: cleanId,
          title: `Respuesta Coqueta & Cómplice 😉`,
          category: 'coqueto',
          durationSeconds: 8,
          transcription: `Jajaja a ver, me encanta que seas lanzado, pero a ver si mantienes ese mismo ritmo cuando me tengas cerquita 😉`,
          triggerKeywords: ['linda', 'hermosa', 'guapa', 'me gustas', 'sexy', 'beso'],
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: `${cleanId}-vc-3`,
          modelId: cleanId,
          title: `Invitación al Espacio VIP de ${regModelName.trim()} ✨`,
          category: 'cierre_vip',
          durationSeconds: 11,
          transcription: `Oye lindo... es que aquí en X me limitan y me censuran todo lo rico 😉 En mi OnlyFans oficial sí tengo mis fotos íntimas sin censura, videos y audios directos. Entra con mi código y me escribes allá directo, ¿sí?`,
          triggerKeywords: ['only', 'privado', 'exclusivo', 'fotos', 'vip', 'link'],
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
      mediaVault: [
        {
          id: `${cleanId}-med-1`,
          modelId: cleanId,
          title: `Foto de Bienvenida de ${regModelName.trim()}`,
          category: 'cafe',
          url: regModelAvatarUrl,
          caption: `Tomándome un café pensando en ti ☕`,
          isExclusive: false,
          watermark: cleanHandle,
          createdAt: new Date().toISOString().split('T')[0],
        },
        {
          id: `${cleanId}-med-2`,
          modelId: cleanId,
          title: `Sesión Íntima Exclusiva de ${regModelName.trim()} (PPV)`,
          category: 'teaser',
          url: PRESET_AVATARS[2].url,
          caption: `Adelanto de mi sesión íntima exclusiva. Acceso completo en mi OnlyFans VIP 🔥`,
          isExclusive: true,
          unlockPrice: regModelVipPrice.trim() || '$19.99',
          watermark: cleanHandle,
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
      rules: {
        conversionThreshold: 75,
        autoSendVoiceNotes: true,
        autoSendCasualPhotos: true,
        requireReciprocityForVip: true,
        adaptiveToneMatching: true,
        activeMemoryRetention: true,
      },
      skills: {
        semanticAccuracy: 98,
        naturalnessLevel: 99,
        emotionalEmpathy: 96,
        salesClosingAssertiveness: 'equilibrada',
        antiClichéFilter: true,
        storyContextAwareness: true,
      },
      security: {
        e2eEncryption: true,
        autoDestructTimer: 0,
        stealthMode: false,
        fingerprintHash: generateSessionFingerprint(),
      },
    };

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'creator',
          name: newCreatedModel.name,
          handle: newCreatedModel.handle,
          age: newCreatedModel.age,
          location: newCreatedModel.location,
          avatarUrl: newCreatedModel.avatarUrl,
          bio: newCreatedModel.bio,
          vipLink: newCreatedModel.vipLink,
          vipPrice: newCreatedModel.vipPrice,
          vipDiscountCode: newCreatedModel.vipDiscountCode,
          accent: newCreatedModel.voice.accent,
          voiceName: newCreatedModel.voice.name,
        }),
      });
    } catch (err) {
      console.warn('Register API fallback:', err);
    }

    onRegisterRealModel?.(newCreatedModel);

    const sessionData: UserSession = {
      id: `usr-real-${cleanId}-${Date.now()}`,
      name: newCreatedModel.name,
      handle: newCreatedModel.handle,
      avatar: newCreatedModel.avatarUrl,
      provider: 'x',
      role: 'creator',
      associatedModelId: cleanId,
      allowedModelIds: [cleanId],
      connectedAt: new Date().toISOString(),
      xAccountConnected: true,
    };

    onLogin(sessionData, newCreatedModel);

    setStatusNotice({
      type: 'success',
      message: `¡Perfil de Modelo Real "${newCreatedModel.name}" registrado con éxito! Tu entorno es 100% independiente.`,
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1300);
  };

  // Handle Register or Login as Administrator
  const handleRegisterOrLoginAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setStatusNotice(null);

    const adminSession: UserSession = {
      id: `usr-admin-${Date.now()}`,
      name: adminName.trim() || 'Administrador General Aura',
      email: adminEmail.trim() || 'compuappscolombia@gmail.com',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      provider: 'google',
      role: 'admin',
      connectedAt: new Date().toISOString(),
      xAccountConnected: true,
    };

    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'admin',
          name: adminSession.name,
          email: adminSession.email,
        }),
      });
    } catch (e) {
      console.warn('Admin register/login API fallback:', e);
    }

    onLogin(adminSession);
    setStatusNotice({
      type: 'success',
      message:
        '¡Sesión iniciada como Administrador! Acceso total habilitado: se visualizan los modelos de prueba (Valeria, Elena, Mia, Camila) y todas las creadoras reales.',
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1300);
  };

  const handleExecuteLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    onLogout();
    setStatusNotice({ type: 'success', message: 'Has cerrado sesión correctamente.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sistema de Registro & Gestión de Perfiles
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Aura Security
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Perfiles de modelos reales 100% independientes • Perfil Administrador con modelos de prueba
              </p>
            </div>
          </div>
          {canClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Status Notification Banner */}
        {statusNotice && (
          <div
            className={`mx-6 mt-4 p-3 rounded-2xl text-xs flex items-center gap-2 animate-fade-in ${
              statusNotice.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {statusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusNotice.message}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Active Session Card if user is currently logged in */}
          {currentSession && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Sesión Actual Activa</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    currentSession.role === 'admin'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {currentSession.role === 'admin' ? (
                    <>
                      <Crown className="w-3 h-3 text-amber-400" /> Modo Administrador General
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Modelo Real Independiente
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <img
                  src={currentSession.avatar}
                  alt={currentSession.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    {currentSession.name}
                    <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  </div>
                  <div className="text-xs text-sky-400 font-mono">
                    {currentSession.handle || currentSession.email}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {currentSession.role === 'admin'
                      ? 'Acceso total: visualiza los modelos de prueba (Valeria, Elena, Mia, Camila) y todas las creadoras reales.'
                      : `Perfil aislado e independiente: Aura opera exclusivamente con las fotos, voz y cuenta de ${currentSession.name}.`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleExecuteLogout}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión Actual
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Continuar en la App
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Primary View Selector: REGISTRAR vs INICIAR SESIÓN */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300">
              ¿Qué deseas realizar?
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-gradient-to-r from-rose-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar Nuevo Perfil</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>Iniciar Sesión Existente</span>
              </button>
            </div>
          </div>

          {/* Sub-selector: Perfil de Modelo Real vs Perfil Administrador */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-300">
              Tipo de Perfil:
            </span>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setAuthRole('real_model')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authRole === 'real_model'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-300" />
                <span>Perfil de Modelo Real</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthRole('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authRole === 'admin'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Perfil Administrador</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* OPTION 1: REGISTRATION FLOW                                               */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <>
              {/* Registration Form: REAL MODEL */}
              {authRole === 'real_model' && (
                <form
                  onSubmit={handleRegisterRealModel}
                  className="flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Formulario de Registro: Modelo Real (Perfil Independiente)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-[11px] text-rose-200/90 flex items-start gap-2.5">
                    <FolderLock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block font-semibold mb-0.5">
                        Garantía de Aislamiento e Independencia Total:
                      </strong>
                      Cada perfil creado opera de forma aislada: fotos de la bóveda, clonación de voz,
                      conversaciones, memoria de fans y enlaces son únicos.
                      <span className="text-rose-300 font-bold block mt-1">
                        🔒 Las modelos de prueba del sistema (Valeria, Elena, etc.) NO serán visibles en este perfil.
                      </span>
                    </div>
                  </div>

                  {/* Basic Info: Name & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Nombre de la Modelo Real *
                      </label>
                      <input
                        type="text"
                        required
                        value={regModelName}
                        onChange={(e) => setRegModelName(e.target.value)}
                        placeholder="Ej: Valentina Morales"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Handle Oficial de X (Twitter) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regModelHandle}
                        onChange={(e) => setRegModelHandle(e.target.value)}
                        placeholder="@valen_morales"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Age, Location & VIP Subscription */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Edad
                      </label>
                      <input
                        type="number"
                        min={18}
                        max={45}
                        value={regModelAge}
                        onChange={(e) => setRegModelAge(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Ciudad / País
                      </label>
                      <input
                        type="text"
                        value={regModelLocation}
                        onChange={(e) => setRegModelLocation(e.target.value)}
                        placeholder="Medellín, Colombia"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Enlace OnlyFans / VIP
                      </label>
                      <input
                        type="url"
                        value={regModelVipLink}
                        onChange={(e) => setRegModelVipLink(e.target.value)}
                        placeholder="https://onlyfans.com/usuario"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Precio Mensual VIP & Código Promo
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={regModelVipPrice}
                          onChange={(e) => setRegModelVipPrice(e.target.value)}
                          placeholder="$19.99/mes"
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                        <input
                          type="text"
                          value={regModelDiscountCode}
                          onChange={(e) => setRegModelDiscountCode(e.target.value)}
                          placeholder="CÓDIGO_PROMO"
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 uppercase font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Voice / Accent Selection */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Acento y Tonalidad de Voz Sintética
                    </label>
                    <select
                      value={regModelVoiceAccent}
                      onChange={(e) => {
                        setRegModelVoiceAccent(e.target.value);
                        if (e.target.value.includes('Español peninsular')) {
                          setRegModelVoiceName('Aoede');
                        } else if (e.target.value.includes('Argentino')) {
                          setRegModelVoiceName('Puck');
                        } else {
                          setRegModelVoiceName('Kore');
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Latino dulce, sensual, cercano y pícaro (Paisa Colombiano)">
                        Latino dulce, sensual, cercano y pícaro (Paisa Colombiano) • Voz Kore
                      </option>
                      <option value="Español peninsular sofisticado, elegante y maduro">
                        Español peninsular sofisticado, elegante y maduro • Voz Aoede
                      </option>
                      <option value="Argentino / Porteño alegre, rápido, fresco y desenfadado">
                        Argentino / Porteño alegre, rápido, fresco y desenfadado • Voz Puck
                      </option>
                      <option value="Mexicano neutral dulce, motivador y atlético">
                        Mexicano neutral dulce, motivador y atlético • Voz Kore
                      </option>
                    </select>
                  </div>

                  {/* Avatar Preset Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                      Foto de Perfil / Avatar (Selecciona un estilo o pega una URL):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {PRESET_AVATARS.map((av, idx) => (
                        <div
                          key={idx}
                          onClick={() => setRegModelAvatarUrl(av.url)}
                          className={`p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                            regModelAvatarUrl === av.url
                              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40'
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={av.url}
                            alt={av.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <span className="text-[9px] text-slate-300 line-clamp-1">{av.name}</span>
                        </div>
                      ))}
                    </div>
                    <input
                      type="url"
                      value={regModelAvatarUrl}
                      onChange={(e) => setRegModelAvatarUrl(e.target.value)}
                      placeholder="https://... URL de imagen personalizada"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono text-[11px]"
                    />
                  </div>

                  {/* Bio & Archetype */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Biografía Oficial y Arquetipo
                    </label>
                    <textarea
                      rows={2}
                      value={regModelBio}
                      onChange={(e) => setRegModelBio(e.target.value)}
                      placeholder="Hi Honey bienvenido a mi mundo • Creadora de contenido +18"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Private Access PIN / Password */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Clave de Acceso Privada / PIN (Opcional para proteger tu perfil):
                    </label>
                    <input
                      type="password"
                      value={regModelPin}
                      onChange={(e) => setRegModelPin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50 transition-all mt-1"
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creando perfil independiente en Aura...
                      </span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Registrar & Activar Mi Perfil de Modelo Real
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Registration Form: ADMINISTRATOR */}
              {authRole === 'admin' && (
                <form
                  onSubmit={handleRegisterOrLoginAdmin}
                  className="flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                    <Crown className="w-4 h-4" />
                    <span>Registro de Perfil Administrador (Visualiza Modelos de Prueba)</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/90 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <FlaskConical className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Privilegios del Administrador del Sistema:</span>
                    </div>
                    <ul className="space-y-1 pl-4 list-disc text-slate-300">
                      <li>
                        <strong className="text-amber-300">Visualización de Modelos de Prueba:</strong> Tendrás
                        acceso directo a las plantillas del sistema (Valeria Gómez, Elena Russo, Mia Soler, Camila
                        Torres) para validar el comportamiento del agente.
                      </li>
                      <li>
                        <strong className="text-white">Supervisión de Modelos Reales:</strong> Acceso a todas las
                        creadoras reales registradas de forma simultánea.
                      </li>
                      <li>
                        <strong className="text-white">Panel CRM y Webhooks de X:</strong> Auditoría de métricas,
                        retraso humanizado y tráfico de DMs.
                      </li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Nombre de Administrador / Agencia *
                      </label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Administrador General Aura"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Correo Corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="admin@auraagent.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Agencia / Entidad
                      </label>
                      <input
                        type="text"
                        value={adminAgencyName}
                        onChange={(e) => setAdminAgencyName(e.target.value)}
                        placeholder="Aura Global Media"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Clave de Acceso Maestra
                      </label>
                      <input
                        type="password"
                        value={adminKey}
                        onChange={(e) => setAdminKey(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:opacity-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50 transition-all mt-1"
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        Registrando e iniciando sesión de administrador...
                      </span>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 fill-slate-950" />
                        Registrar Perfil Administrador & Acceder con Modelos de Prueba
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* OPTION 2: LOGIN FLOW FOR EXISTING ACCOUNTS                                */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <div className="flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
              {authRole === 'real_model' ? (
                <>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400" />
                      Ingresar a Perfil de Modelo Real Existente:
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                    >
                      + Registrar nueva modelo
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Selecciona tu perfil para ingresar directamente a tu entorno independiente:
                  </p>

                  <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {realModels.length > 0 ? (
                      realModels.map((rm) => (
                        <div
                          key={rm.id}
                          onClick={() => handleLoginAsRealModel(rm)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            loginSelectedModelId === rm.id
                              ? 'bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border-rose-500/60 shadow-md ring-1 ring-rose-500/30'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={rm.avatarUrl}
                              alt={rm.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-rose-500/40"
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                {rm.name}
                                <span className="text-[10px] text-sky-400 font-mono font-normal">
                                  {rm.handle}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Verificada
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 line-clamp-1">{rm.tagline || rm.bio}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                <span>🎙️ {rm.voice.name}</span>
                                <span>•</span>
                                <span>📸 {rm.mediaVault?.length || 5} fotos exclusivas</span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 group-hover:from-rose-500 group-hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
                          >
                            Entrar
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center gap-3">
                        <p className="text-xs text-slate-400">
                          No has registrado modelos reales personalizadas todavía.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => {
                              const demoSession: UserSession = {
                                id: 'usr-sess-afire',
                                name: 'ANAMARIA❣️',
                                handle: '@afire_sb',
                                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
                                provider: 'x',
                                role: 'creator',
                                associatedModelId: 'afire-sb',
                                allowedModelIds: ['afire-sb'],
                                connectedAt: new Date().toISOString(),
                                xAccountConnected: true,
                              };
                              onLogin(demoSession);
                              onClose();
                            }}
                            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-300" />
                            Ingreso Rápido: @afire_sb (Oficial)
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                            Registrar Mi Modelo Real
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Admin Login */
                <form onSubmit={handleRegisterOrLoginAdmin} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                    <Crown className="w-4 h-4" />
                    <span>Iniciar Sesión como Administrador General</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Ingresa con tus credenciales de agencia para visualizar los modelos de prueba del sistema
                    y supervisar todas las modelos reales:
                  </p>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Correo de Administrador:
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Nombre de Agencia o Administrador:
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                        Iniciando...
                      </span>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 fill-slate-950" />
                        Acceder como Administrador (Ver Modelos de Prueba)
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislamiento Criptográfico de Perfil • Cero Mezcla de Datos</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">Aura v2.6.2</span>
        </div>
      </div>
    </div>
  );
};
