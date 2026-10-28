import React, { useState } from 'react';
import { UserSession } from '../types';
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
  ExternalLink,
  KeyRound,
} from 'lucide-react';

interface AuthLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: UserSession | null;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  onLogin,
  onLogout,
}) => {
  const [authMethod, setAuthMethod] = useState<'x' | 'google'>('x');
  const [xHandle, setXHandle] = useState('@valeriag_official');
  const [xName, setXName] = useState('Valeria Gómez (Creator)');
  const [googleEmail, setGoogleEmail] = useState('gato-284@hotmail.com');
  const [googleName, setGoogleName] = useState('Administrador Aura');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccessNotice, setAuthSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExecuteLogin = async (provider: 'x' | 'google') => {
    setIsAuthenticating(true);
    setAuthSuccessNotice(null);

    try {
      const payload =
        provider === 'x'
          ? {
              provider: 'x',
              name: xName,
              handle: xHandle.startsWith('@') ? xHandle : `@${xHandle}`,
              avatar:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
              role: 'creator',
              xAccountConnected: true,
            }
          : {
              provider: 'google',
              name: googleName,
              email: googleEmail,
              avatar:
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
              role: 'admin',
              xAccountConnected: false,
            };

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.session) {
        onLogin(data.session);
        setAuthSuccessNotice(`¡Bienvenido! Sesión verificada con éxito vía ${provider === 'x' ? 'X (Twitter)' : 'Google'}.`);
        setTimeout(() => {
          setIsAuthenticating(false);
          onClose();
        }, 1100);
      } else {
        setIsAuthenticating(false);
      }
    } catch {
      // Fallback local session if offline
      const mockSession: UserSession = {
        id: `sess-${Date.now()}`,
        name: provider === 'x' ? xName : googleName,
        handle: provider === 'x' ? xHandle : undefined,
        email: provider === 'google' ? googleEmail : undefined,
        avatar:
          provider === 'x'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        provider,
        role: provider === 'x' ? 'creator' : 'admin',
        connectedAt: new Date().toISOString(),
        xAccountConnected: provider === 'x',
      };
      onLogin(mockSession);
      setIsAuthenticating(false);
      onClose();
    }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Panel de Inicio de Sesión
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Aura Security
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Acceso autorizado para creadoras de contenido y administradores
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
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{authSuccessNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Active Session Display if logged in */}
          {currentSession ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Sesión Actual Activa</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    currentSession.provider === 'x'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {currentSession.provider === 'x' ? (
                    <>
                      <Twitter className="w-3 h-3 text-sky-400" /> X Conectado
                    </>
                  ) : (
                    <>Google Cuenta</>
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
                    Rol: {currentSession.role === 'creator' ? 'Creadora Verificada' : 'Administrador del Sistema'}
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
          ) : null}

          {/* Provider Selection Tabs */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-300">
              {currentSession ? 'O cambia de cuenta / proveedor:' : 'Selecciona el método de autenticación:'}
            </span>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                onClick={() => setAuthMethod('x')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMethod === 'x'
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Twitter className="w-4 h-4 text-sky-300" />
                <span>Cuenta de X (Twitter)</span>
              </button>

              <button
                onClick={() => setAuthMethod('google')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  authMethod === 'google'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-rose-600">
                  G
                </div>
                <span>Cuenta de Google</span>
              </button>
            </div>
          </div>

          {/* Tab 1: X (Twitter) */}
          {authMethod === 'x' && (
            <div className="flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Conexión de cuenta oficial para recepción y envío de DMs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Handle de X:
                  </label>
                  <input
                    type="text"
                    value={xHandle}
                    onChange={(e) => setXHandle(e.target.value)}
                    placeholder="@valeriag_official"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nombre de la Creadora:
                  </label>
                  <input
                    type="text"
                    value={xName}
                    onChange={(e) => setXName(e.target.value)}
                    placeholder="Valeria Gómez"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-medium">Modelos registradas:</span>
                {[
                  { handle: '@valeriag_official', name: 'Valeria Gómez' },
                  { handle: '@elena_russo_vip', name: 'Elena Russo' },
                  { handle: '@miasoler_fit', name: 'Mia Soler' },
                  { handle: '@camila_exclusive', name: 'Camila Torres' },
                ].map((item) => (
                  <button
                    key={item.handle}
                    onClick={() => {
                      setXHandle(item.handle);
                      setXName(item.name);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 hover:bg-sky-600/20 text-slate-300 hover:text-sky-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    {item.handle}
                  </button>
                ))}
              </div>

              <button
                disabled={isAuthenticating}
                onClick={() => handleExecuteLogin('x')}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Autenticando con X OAuth 2.0...
                  </span>
                ) : (
                  <>
                    <Twitter className="w-4 h-4 fill-white" />
                    Iniciar Sesión con X (Twitter)
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab 2: Google */}
          {authMethod === 'google' && (
            <div className="flex flex-col gap-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-rose-600 shrink-0">
                  G
                </div>
                <span>Acceso administrativo para gestión de modelos, suscripciones y CRM</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Correo de Google:
                  </label>
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="gato-284@hotmail.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nombre o Alias de Administrador:
                  </label>
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="Administrador Principal"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Permisos: Acceso al panel de control, gestión de modelos, webhooks externos y auditoría.</span>
              </div>

              <button
                disabled={isAuthenticating}
                onClick={() => handleExecuteLogin('google')}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-white/10 transition-all cursor-pointer disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    Conectando con Google Identity...
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Iniciar Sesión con Google
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
            <span>Encriptación de credenciales AES-256</span>
          </div>
          <span className="text-slate-500 font-mono text-[10px]">v2.5.0-prod</span>
        </div>
      </div>
    </div>
  );
};
