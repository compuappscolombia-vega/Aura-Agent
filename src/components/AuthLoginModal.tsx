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
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLogin,
  onLogout,
  realModels = [],
  onRegisterRealModel,
}) => {
  const [authRole, setAuthRole] = useState<'real_model' | 'admin'>('real_model');
  const [selectedRealModelId, setSelectedRealModelId] = useState<string>(
    realModels[0]?.id || 'afire-sb'
  );
  const [isRegisteringNew, setIsRegisteringNew] = useState(false);

  // New Real Model Registration Fields
  const [newModelName, setNewModelName] = useState('');
  const [newModelHandle, setNewModelHandle] = useState('@');
  const [newModelBio, setNewModelBio] = useState('Creadora de contenido +18 • Modelo Oficial');
  const [newModelVipLink, setNewModelVipLink] = useState('https://onlyfans.com/');
  const [newModelVipPrice, setNewModelVipPrice] = useState('$19.99/mes');
  const [newModelAvatarUrl, setNewModelAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  );

  // Admin Login Fields
  const [adminEmail, setAdminEmail] = useState('compuappscolombia@gmail.com');
  const [adminName, setAdminName] = useState('Administrador General Aura');

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLoginAsRealModel = async (model: ModelProfile) => {
    setIsAuthenticating(true);
    setAuthSuccessNotice(null);

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
    setAuthSuccessNotice(
      `¡Bienvenida ${model.name}! Has iniciado sesión en tu perfil exclusivo e independiente. Aura está sincronizada con tus fotos, voz y cuenta ${model.handle}.`
    );
    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1100);
  };

  const handleCreateAndLoginNewRealModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModelName.trim() || !newModelHandle.trim()) return;

    const cleanHandle = newModelHandle.startsWith('@')
      ? newModelHandle.trim()
      : `@${newModelHandle.trim()}`;
    const cleanId = cleanHandle.replace('@', '').toLowerCase();

    const createdModel: ModelProfile = {
      id: cleanId,
      name: newModelName.trim(),
      handle: cleanHandle,
      age: 24,
      location: 'Medellín / Latinoamérica',
      avatarUrl: newModelAvatarUrl,
      archetype: `Modelo Oficial • ${cleanHandle}`,
      tagline: `Creadora de contenido exclusiva • ${cleanHandle}`,
      bio: newModelBio.trim(),
      vipLink: newModelVipLink.trim(),
      vipPrice: newModelVipPrice.trim(),
      vipDiscountCode: `${cleanId.toUpperCase()}_VIP`,
      isSystemDefault: false, // Perfil de Modelo Real independiente
      voice: {
        name: 'Kore',
        pitch: 1.15,
        rate: 0.98,
        lang: 'es-CO',
        accent: 'Latino dulce, natural, cercano y sensual',
        description: `Voz natural y personalizada para ${newModelName.trim()} (${cleanHandle})`,
      },
      voiceDna: {
        isCloned: true,
        sampleDurationSeconds: 8,
        detectedTone: `Voz auténtica de ${newModelName.trim()}`,
        pitch: 1.15,
        rate: 0.98,
        timbreScore: 99.0,
        calibratedAt: new Date().toISOString(),
        learningGenerationsCount: 1,
        roomAcoustics: 'Presencia acústica íntima de habitación privada',
        ambientPresenceType: 'room_intimate',
        roomPresenceLevel: 85,
        acousticSpaceName: 'Habitación Íntima',
      },
      voiceClips: [
        {
          id: `${cleanId}-vc-1`,
          modelId: cleanId,
          title: `Saludo Oficial de ${newModelName.trim()}`,
          category: 'saludo',
          durationSeconds: 7,
          transcription: `Hola amor, soy ${newModelName.trim()}, qué lindo leerte por aquí. Me pillas justo tomándome un momento para saludarte, ¿cómo estás?`,
          triggerKeywords: ['hola', 'buenas', 'saludos', cleanId],
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
      mediaVault: [
        {
          id: `${cleanId}-med-1`,
          modelId: cleanId,
          title: `Foto de Bienvenida de ${newModelName.trim()}`,
          category: 'cozy',
          url: newModelAvatarUrl,
          caption: `Lista para consentirte por aquí ✨`,
          isExclusive: false,
          watermark: `${cleanHandle} / EXCLUSIVE_OFFICIAL`,
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
        semanticAccuracy: 96,
        naturalnessLevel: 98,
        emotionalEmpathy: 95,
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

    onRegisterRealModel?.(createdModel);
    handleLoginAsRealModel(createdModel);
  };

  const handleLoginAsAdmin = async () => {
    setIsAuthenticating(true);
    setAuthSuccessNotice(null);

    const adminSession: UserSession = {
      id: `usr-admin-${Date.now()}`,
      name: adminName,
      email: adminEmail,
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
      provider: 'google',
      role: 'admin',
      connectedAt: new Date().toISOString(),
      xAccountConnected: true,
    };

    try {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminSession),
      });
    } catch (e) {
      console.warn('Admin login API fallback:', e);
    }

    onLogin(adminSession);
    setAuthSuccessNotice(
      '¡Sesión iniciada como Administrador! Tienes acceso a todas las modelos del sistema y creadoras reales.'
    );
    setTimeout(() => {
      setIsAuthenticating(false);
      onClose();
    }, 1100);
  };

  const handleExecuteLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    onLogout();
    setAuthSuccessNotice('Has cerrado sesión correctamente.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Panel de Inicio de Sesión & Aislamiento de Perfiles
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Aura Security
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cada modelo opera con perfil 100% independiente (fotos, clonación de voz y cuenta de X)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice Banner */}
        {authSuccessNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{authSuccessNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Active Session Display if logged in */}
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
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Modelo Real Aislada
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
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {currentSession.role === 'admin'
                      ? 'Supervisión de todo el catálogo (modelos del sistema + creadoras reales)'
                      : `Perfil aislado 100% exclusivo: Aura solo opera con las propiedades de ${currentSession.name}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleExecuteLogout}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar Sesión
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Continuar
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Role Switching Selector */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300">
              {currentSession ? 'O cambia el perfil de acceso:' : 'Selecciona cómo deseas ingresar:'}
            </span>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
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

          {/* Tab 1: Real Model Access */}
          {authRole === 'real_model' && (
            <div className="flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    Acceso para Creadoras / Modelos Reales
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Las modelos del sistema (plantillas de prueba) quedan ocultas. Solo verás y usarás tu
                    propio perfil con tus fotos, audios y credenciales de X.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRegisteringNew(!isRegisteringNew)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 shrink-0 cursor-pointer font-medium"
                >
                  {isRegisteringNew ? (
                    '← Volver a lista'
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" /> + Registrar Nueva
                    </>
                  )}
                </button>
              </div>

              {!isRegisteringNew ? (
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-semibold text-slate-300">
                    Modelos Reales Disponibles en el Sistema:
                  </span>

                  {realModels.length > 0 ? (
                    realModels.map((rm) => (
                      <div
                        key={rm.id}
                        onClick={() => handleLoginAsRealModel(rm)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedRealModelId === rm.id
                            ? 'bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-slate-900 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
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
                                Oficial X
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{rm.tagline}</p>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                              <span>🎙️ {rm.voice.description.split('(')[0]}</span>
                              <span>•</span>
                              <span>📸 {rm.mediaVault?.length || 5} fotos exclusivas</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
                        >
                          Entrar
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-400">
                      No hay modelos reales registradas aún. Haz clic en "+ Registrar Nueva".
                    </div>
                  )}

                  <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Garantía de Aislamiento: Aura solo adoptará la voz, fotos y enlaces de la modelo
                      que selecciones. Cero mezcla con plantillas.
                    </span>
                  </div>
                </div>
              ) : (
                /* Form to Register a New Real Model */
                <form onSubmit={handleCreateAndLoginNewRealModel} className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Nombre de la Modelo Real:
                      </label>
                      <input
                        type="text"
                        required
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="Ej: Sofia Gómez"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Handle en X (Twitter):
                      </label>
                      <input
                        type="text"
                        required
                        value={newModelHandle}
                        onChange={(e) => setNewModelHandle(e.target.value)}
                        placeholder="@sofi_real"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Enlace OnlyFans / VIP:
                      </label>
                      <input
                        type="url"
                        value={newModelVipLink}
                        onChange={(e) => setNewModelVipLink(e.target.value)}
                        placeholder="https://onlyfans.com/..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Precio Mensual VIP:
                      </label>
                      <input
                        type="text"
                        value={newModelVipPrice}
                        onChange={(e) => setNewModelVipPrice(e.target.value)}
                        placeholder="$19.99/mes"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      URL de Avatar o Foto de Perfil:
                    </label>
                    <input
                      type="url"
                      value={newModelAvatarUrl}
                      onChange={(e) => setNewModelAvatarUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Biografía y Arquetipo:
                    </label>
                    <textarea
                      rows={2}
                      value={newModelBio}
                      onChange={(e) => setNewModelBio(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Registrar Perfil & Entrar Directo
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Admin Access */}
          {authRole === 'admin' && (
            <div className="flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Acceso Administrativo y Auditoría Global de Agencia</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Correo del Administrador:
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nombre de Agencia / Administrador:
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/90 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Permisos de Administrador:</span>
                </div>
                <p>
                  • Visualización de las modelos del sistema (Valeria, Elena, Mia, Camila).
                </p>
                <p>
                  • Visualización y gestión de todas las creadoras y modelos reales registradas.
                </p>
                <p>
                  • Acceso al CRM consolidado, estadísticas y configuración de webhooks en X.
                </p>
              </div>

              <button
                disabled={isAuthenticating}
                onClick={handleLoginAsAdmin}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    Iniciando Sesión de Administrador...
                  </span>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-slate-950" />
                    Iniciar Sesión como Administrador del Sistema
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aislamiento de Entorno Activo • Encriptación TLS 1.3</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">Aura v2.6.0-prod</span>
        </div>
      </div>
    </div>
  );
};
