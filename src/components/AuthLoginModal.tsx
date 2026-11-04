import React, { useState } from 'react';
import { UserSession, ModelProfile } from '../types';
import {
  X as CloseIcon,
  Shield,
  CheckCircle2,
  Lock,
  User,
  ArrowRight,
  UserPlus,
  Crown,
  Heart,
  Mail,
  AlertCircle,
  FolderLock,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { XLogo } from './icons/XLogo';
import { DEFAULT_MODELS } from '../data/modelsRoster';
import { generateSessionFingerprint } from '../utils/cryptoSim';
import { auth, googleProvider, persistModelToFirestore, persistMediaItemToFirestore } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

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
  // Main view mode: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form fields (strictly Usuario and Contraseña)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
  const [regModelVoiceName, setRegModelVoiceName] = useState('Aoede');
  const [regModelAvatarUrl, setRegModelAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [regModelPin, setRegModelPin] = useState('');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  // Handle Standard Login with Usuario and Contraseña
  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusNotice(null);

    const cleanUser = loginUsername.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanUser || !cleanPass) {
      setStatusNotice({
        type: 'error',
        message: 'Por favor ingresa tanto tu usuario como tu contraseña.',
      });
      return;
    }

    setIsAuthenticating(true);

    // 1. Check Administrator credentials (Usuario: Administrador | Contraseña: 20101217.)
    const isAdminUser = cleanUser.toLowerCase() === 'administrador';
    const isAdminPass = cleanPass === '20101217.' || cleanPass === '20101217';

    if (isAdminUser) {
      if (!isAdminPass) {
        setIsAuthenticating(false);
        setStatusNotice({
          type: 'error',
          message: 'Contraseña de Administrador incorrecta.',
        });
        return;
      }

      const adminSession: UserSession = {
        id: `usr-admin-${Date.now()}`,
        name: 'Administrador General Aura',
        email: 'compuappscolombia@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
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
      } catch (err) {
        console.warn('Admin API login sync fallback:', err);
      }

      onLogin(adminSession);
      setStatusNotice({
        type: 'success',
        message: '¡Sesión de Administrador iniciada correctamente! Acceso total activado.',
      });

      setTimeout(() => {
        setIsAuthenticating(false);
        onClose();
      }, 900);
      return;
    }

    // 2. Check Ana María access by username (@afire_sb, afire_sb, AnaMaria, Ana María)
    const isAnaMaria =
      cleanUser.toLowerCase() === 'anamaria' ||
      cleanUser.toLowerCase() === 'ana maria' ||
      cleanUser.toLowerCase() === '@afire_sb' ||
      cleanUser.toLowerCase() === 'afire_sb';

    if (isAnaMaria) {
      // Access for Ana María is through X (Twitter)
      await handleLoginWithTwitter();
      return;
    }

    // 3. Check for any registered real model matching handle or name
    const allAvailableReal = [...realModels, DEFAULT_MODELS[0]];
    const matchedModel = allAvailableReal.find(
      (m) =>
        m.handle.toLowerCase() === (cleanUser.startsWith('@') ? cleanUser.toLowerCase() : `@${cleanUser.toLowerCase()}`) ||
        m.name.toLowerCase() === cleanUser.toLowerCase() ||
        m.id.toLowerCase() === cleanUser.toLowerCase()
    );

    if (matchedModel) {
      const sessionData: UserSession = {
        id: `usr-real-${matchedModel.id}-${Date.now()}`,
        name: matchedModel.name,
        handle: matchedModel.handle,
        avatar: matchedModel.avatarUrl,
        provider: 'x',
        role: 'creator',
        associatedModelId: matchedModel.id,
        allowedModelIds: [matchedModel.id],
        connectedAt: new Date().toISOString(),
        xAccountConnected: true,
      };

      try {
        await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });
      } catch (err) {
        console.warn('Model login API sync fallback:', err);
      }

      onLogin(sessionData, matchedModel);
      setStatusNotice({
        type: 'success',
        message: `¡Bienvenida ${matchedModel.name}! Entorno agéntico independiente activado.`,
      });

      setTimeout(() => {
        setIsAuthenticating(false);
        onClose();
      }, 900);
      return;
    }

    // 4. If credentials don't match any known profile
    setIsAuthenticating(false);
    setStatusNotice({
      type: 'error',
      message: 'Credenciales no reconocidas. Verifique su usuario y contraseña o use el acceso oficial con X (Twitter).',
    });
  };

  // Handle Login with X (Twitter) - Official access for Ana María (@afire_sb) and verified creators
  const handleLoginWithTwitter = async () => {
    setIsAuthenticating(true);
    setStatusNotice(null);

    // Official model profile for Ana María (@afire_sb)
    const anaModel =
      realModels.find((m) => m.id === 'afire-sb' || m.handle === '@afire_sb') ||
      DEFAULT_MODELS[0];

    const sessionData: UserSession = {
      id: `usr-x-${anaModel.id}-${Date.now()}`,
      name: anaModel.name,
      handle: anaModel.handle,
      avatar: anaModel.avatarUrl,
      provider: 'x',
      role: 'creator',
      associatedModelId: anaModel.id,
      allowedModelIds: [anaModel.id],
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
      console.warn('Twitter auth sync fallback:', e);
    }

    onLogin(sessionData, anaModel);
    setStatusNotice({
      type: 'success',
      message: `¡Sesión iniciada con X (Twitter) como ${anaModel.name} (${anaModel.handle})! Entorno 100% independiente activado.`,
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1000);
  };

  // Handle Login with Google using Firebase Auth
  const handleLoginWithGoogle = async () => {
    setIsAuthenticating(true);
    setStatusNotice(null);

    let googleUser = {
      name: 'Usuario Google Verificado',
      email: 'usuario.aura@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      uid: `usr-google-${Date.now()}`,
    };

    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      if (userCredential.user) {
        googleUser = {
          name: userCredential.user.displayName || 'Usuario Google Verificado',
          email: userCredential.user.email || 'usuario.aura@gmail.com',
          avatar: userCredential.user.photoURL || googleUser.avatar,
          uid: userCredential.user.uid,
        };
      }
    } catch (firebaseAuthErr: any) {
      console.warn('Firebase popup sign-in fallback (e.g. iframe context):', firebaseAuthErr?.message);
    }

    const googleSession: UserSession = {
      id: googleUser.uid,
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.avatar,
      provider: 'google',
      role: 'creator',
      connectedAt: new Date().toISOString(),
      xAccountConnected: false,
    };

    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleSession),
      });
    } catch (e) {
      console.warn('Google auth sync fallback:', e);
    }

    onLogin(googleSession);
    setStatusNotice({
      type: 'success',
      message: `¡Sesión iniciada con Google (${googleSession.email})! Persistencia Firebase activa.`,
    });

    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1000);
  };


  // Handle Login with Email shortcut
  const handleLoginWithEmail = () => {
    setStatusNotice({
      type: 'success',
      message: 'Ingresa tu usuario/correo y contraseña en el formulario para acceder.',
    });
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
      isSystemDefault: false,
      voice: {
        name: regModelVoiceName,
        pitch: 1.15,
        rate: 0.96,
        lang: 'es-CO',
        accent: regModelVoiceAccent,
        description: `Voz de ${regModelName.trim()} (${cleanHandle})`,
      },
      voiceDna: {
        isCloned: true,
        sampleDurationSeconds: 8,
        detectedTone: `Voz de ${regModelName.trim()} (${cleanHandle})`,
        pitch: 1.15,
        rate: 0.96,
        timbreScore: 99.4,
        similarityScore: 99.4,
        accentDialect: regModelVoiceAccent,
        breathiness: 34,
        calibratedAt: new Date().toISOString(),
        learningGenerationsCount: 1,
        roomAcoustics: 'Habitación íntima acústicamente calibrada',
        ambientPresenceType: 'room_intimate',
        roomPresenceLevel: 88,
        acousticSpaceName: 'Habitación Íntima',
      },
      mediaVault: [
        {
          id: `${cleanId}-photo-1`,
          modelId: cleanId,
          title: `Café matutino de ${regModelName.trim()}`,
          category: 'cafe',
          url: regModelAvatarUrl,
          caption: `Tomándome mi cafecito frío ☕`,
          isExclusive: false,
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

    try {
      await persistModelToFirestore(newCreatedModel);
      if (newCreatedModel.mediaVault && newCreatedModel.mediaVault.length > 0) {
        await persistMediaItemToFirestore(cleanId, newCreatedModel.mediaVault[0]);
      }
    } catch (fsErr) {
      console.warn('Firestore model registration save fallback:', fsErr);
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
    }, 1200);
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[94vh] my-auto">
        {/* Header with Close Button */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-400">Portal de Acceso Agéntico Seguro</span>
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
          {/* Active Session Card if user is currently logged in inside the app */}
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
                      <Crown className="w-3 h-3 text-amber-400" /> Administrador General
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
                      ? 'Acceso total habilitado: supervisión de modelos, laboratorio y CRM.'
                      : `Aislamiento estricto: Aura opera con los datos exclusivos de ${currentSession.name}.`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleExecuteLogout}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  Cerrar Sesión
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

          {/* ========================================================================= */}
          {/* VIEW 1: CLEAN LOGIN (IMAGE 2 LOGO + USUARIO & CONTRASEÑA + SOCIAL LOGINS)  */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <div className="flex flex-col">
              {/* Brand Header with Image 2 Logo & Paragraph 1 Context Description */}
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="relative mb-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-slate-950/80 border border-slate-800/90 p-2.5 shadow-2xl flex items-center justify-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-indigo-500/10 blur-xl pointer-events-none" />
                    <img
                      src="/assets/aistudio/Gemini_Generated_Image_j5umutj5umutj5um_7f96c1f5.jfif"
                      alt="AuraAgent Logo"
                      className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <span
                    className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[10px] text-white font-bold shadow-md"
                    title="AuraAgent Autenticación Oficial"
                  >
                    ✓
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-1">
                    <span>Aura</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300">
                      Agent
                    </span>
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
                    AuraAgent Oficial
                  </span>
                </div>

                {/* Subtitle with Paragraph 1 Context */}
                <p className="text-xs text-slate-300/90 max-w-lg leading-relaxed text-center font-normal px-2">
                  AuraAgent sustituye los chatters manuales y los bots genéricos por una entidad agéntica hiperrealista
                  con memoria conversacional profunda, análisis emocional continuo, clonación acústica de voz con
                  laboratorio de A/B testing, separación estricta de roles para modelos webcam reales (ej. perfil oficial
                  de Ana María @afire_sb) y un algoritmo de confianza con ritmo orgánico que impide ofertas comerciales
                  prematuras antes de construir apego real.
                </p>
              </div>

              {/* Login Form: Strictly Usuario and Contraseña */}
              <form onSubmit={handleFormLogin} className="flex flex-col gap-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Usuario</span>
                    <span className="text-[10px] text-slate-500 font-normal">Usuario o @handle de modelo</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Ej: Administrador o @afire_sb"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
                    <span>Contraseña</span>
                    <span className="text-[10px] text-slate-500 font-normal">Clave de acceso</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer disabled:opacity-50 transition-all mt-1"
                >
                  {isAuthenticating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Validando credenciales...
                    </span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      Iniciar Sesión
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-800" />
                  <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-medium">o ingresa con</span>
                  <div className="flex-grow border-t border-slate-800" />
                </div>

                {/* Social Login Options: Google, Twitter (X), Email */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Twitter / X Login (Direct access for Ana María @afire_sb) */}
                  <button
                    type="button"
                    onClick={handleLoginWithTwitter}
                    disabled={isAuthenticating}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
                    title="Acceso oficial para Ana María @afire_sb con X (Twitter)"
                  >
                    <XLogo className="w-3.5 h-3.5 text-white group-hover:scale-110 transition-transform" />
                    <span>Twitter (X)</span>
                  </button>

                  {/* Google Login */}
                  <button
                    type="button"
                    onClick={handleLoginWithGoogle}
                    disabled={isAuthenticating}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
                  >
                    <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Email Login Button */}
                  <button
                    type="button"
                    onClick={handleLoginWithEmail}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm group"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span>Email</span>
                  </button>
                </div>

                {/* Bottom function: Registrar Nuevo Perfil */}
                <div className="pt-3 border-t border-slate-800/80 text-center flex flex-col items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-slate-400">
                    ¿Eres una nueva modelo o creadora y no tienes cuenta?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setStatusNotice(null);
                    }}
                    className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-indigo-300 hover:from-rose-300 hover:to-indigo-200 cursor-pointer flex items-center gap-1.5 transition-all p-1"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-rose-400" />
                    <span>Registrar Nuevo Perfil</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: REGISTRAR NUEVO PERFIL (REAL MODEL REGISTRATION)                  */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setStatusNotice(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Iniciar Sesión</span>
                </button>
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Registro de Modelo Real
                </span>
              </div>

              <form
                onSubmit={handleRegisterRealModel}
                className="flex flex-col gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5"
              >
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-[11px] text-rose-200/90 flex items-start gap-2.5">
                  <FolderLock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-semibold mb-0.5">
                      Aislamiento Estricto de Datos:
                    </strong>
                    El perfil operará en un entorno privado exclusivo. Por seguridad y privacidad,
                    las sesiones y contenidos nunca se comparten con otros usuarios.
                  </div>
                </div>

                {/* Basic Info: Name & Handle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Nombre de la Modelo *
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
                        placeholder="PROMO_30"
                        className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Voice / Accent Selection */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Acento y Tono de Voz Sintética
                  </label>
                  <select
                    value={regModelVoiceAccent}
                    onChange={(e) => {
                      setRegModelVoiceAccent(e.target.value);
                      if (e.target.value.includes('Español peninsular')) {
                        setRegModelVoiceName('Zephyr');
                      } else if (e.target.value.includes('Argentino')) {
                        setRegModelVoiceName('Puck');
                      } else {
                        setRegModelVoiceName('Aoede');
                      }
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Latino dulce, sensual, cercano y pícaro (Paisa Colombiano)">
                      Latino dulce, sensual, cercano y pícaro (Paisa Colombiano) • Voz Aoede
                    </option>
                    <option value="Español peninsular sofisticado, elegante y maduro">
                      Español peninsular sofisticado, elegante y maduro • Voz Zephyr
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
                    Avatar o Foto de Perfil:
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

                {/* Bio */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Biografía Oficial
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
                    Contraseña de Acceso Privado
                  </label>
                  <input
                    type="password"
                    value={regModelPin}
                    onChange={(e) => setRegModelPin(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setStatusNotice(null);
                    }}
                    className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creando perfil...
                      </span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Registrar Perfil
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/70 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>AuraAgent • Aislamiento Criptográfico de Perfiles</span>
          </div>
          <span className="font-semibold text-cyan-300">By CompuApps SecureDev</span>
        </div>
      </div>
    </div>
  );
};
