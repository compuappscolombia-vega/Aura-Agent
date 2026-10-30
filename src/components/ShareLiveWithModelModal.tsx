import React, { useState, useEffect } from 'react';
import { ModelProfile } from '../types';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Monitor,
  Smartphone,
  Send,
  Zap,
  ShieldCheck,
  X,
  Sparkles,
  QrCode,
  Radio,
  Globe,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Users,
} from 'lucide-react';

interface ShareLiveWithModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelProfile;
  models?: ModelProfile[];
  onSelectModel?: (model: ModelProfile) => void;
}

export const ShareLiveWithModelModal: React.FC<ShareLiveWithModelModalProps> = ({
  isOpen,
  onClose,
  model,
  models = [],
  onSelectModel,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'specs' | 'troubleshoot'>('link');

  // Deployment targets
  const realSharedAppUrl = 'https://ais-pre-kkrofx6pydlonw3h5chh4c-227172514263.us-east1.run.app';
  const realDevAppUrl = 'https://ais-dev-kkrofx6pydlonw3h5chh4c-227172514263.us-east1.run.app';

  // URL mode selection
  const [urlMode, setUrlMode] = useState<'shared' | 'dev' | 'local' | 'custom'>('shared');
  const [customDomain, setCustomDomain] = useState<string>(() => {
    return localStorage.getItem('aura_custom_shared_domain') || '';
  });

  const [activeModel, setActiveModel] = useState<ModelProfile>(model);

  useEffect(() => {
    setActiveModel(model);
  }, [model]);

  // Determine base URL according to mode
  const getBaseUrl = (): string => {
    if (urlMode === 'custom' && customDomain.trim()) {
      return customDomain.trim().replace(/\/+$/, '');
    }
    if (urlMode === 'dev') {
      return realDevAppUrl;
    }
    if (urlMode === 'local' && typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Default: official shared URL (ais-pre)
    return realSharedAppUrl;
  };

  const currentBaseUrl = getBaseUrl();
  const modelLiveUrl = `${currentBaseUrl}/?model=${activeModel.id}&view=model`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(modelLiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveCustomDomain = (val: string) => {
    setCustomDomain(val);
    localStorage.setItem('aura_custom_shared_domain', val.trim());
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola ${activeModel.name.split(' ')[0]}! ✨ Aquí tienes el enlace de AuraAgent para que veas el sistema operando en vivo en directo con tu personalidad, tus fotos de bóveda y el medidor de ventas VIP:\n\n${modelLiveUrl}`
  );

  const telegramMessage = encodeURIComponent(
    `¡Hola ${activeModel.name.split(' ')[0]}! Accede a AuraAgent en vivo: ${modelLiveUrl}`
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Compartir Sistema en Vivo con la Modelo</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" /> EN DIRECTO
                </span>
              </div>
              <p className="text-xs text-slate-400">
                La modelo podrá interactuar con el agente en tiempo real, escuchar su voz y validar su cierre VIP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Snapshot Card & Selector */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={activeModel.avatarUrl}
              alt={activeModel.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/50 shadow-md"
            />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {activeModel.name}
                <span className="text-xs font-mono text-sky-400">{activeModel.handle}</span>
              </div>
              <p className="text-xs text-slate-400">
                Arquetipo: <span className="text-indigo-300 font-medium">{activeModel.archetype}</span> • OnlyFans VIP:{' '}
                {activeModel.vipPrice}
              </p>
            </div>
          </div>

          {models.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Modelo:</span>
              <select
                value={activeModel.id}
                onChange={(e) => {
                  const m = models.find((mod) => mod.id === e.target.value);
                  if (m) {
                    setActiveModel(m);
                    if (onSelectModel) onSelectModel(m);
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {models.map((mod) => (
                  <option key={mod.id} value={mod.id}>
                    {mod.name} ({mod.handle})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'link'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Enlace Directo
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Código QR Móvil
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'troubleshoot'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Solución de Servidor (404 / Acceso)
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Rendimiento en PC
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* Target Server Mode Selector */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    Seleccionar Servidor de Destino para el Enlace:
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Modo de Conexión</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setUrlMode('shared')}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      urlMode === 'shared'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Público (ais-pre)</div>
                    <div className="text-[10px] opacity-70">Para WhatsApp / Celular</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrlMode('local')}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      urlMode === 'local'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Este Navegador</div>
                    <div className="text-[10px] opacity-70">Ventana actual directa</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrlMode('dev')}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      urlMode === 'dev'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Dev (ais-dev)</div>
                    <div className="text-[10px] opacity-70">Con sesión Google</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrlMode('custom')}
                    className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                      urlMode === 'custom'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-bold">Dominio / Túnel</div>
                    <div className="text-[10px] opacity-70">ngrok / propio</div>
                  </button>
                </div>

                {urlMode === 'custom' && (
                  <div className="pt-2 animate-fadeIn">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Ingresa la URL de tu túnel o dominio (ej: <code>https://mi-agencia.ngrok-free.app</code>):
                    </label>
                    <input
                      type="url"
                      placeholder="https://su-dominio.com o https://xxxx.ngrok-free.app"
                      value={customDomain}
                      onChange={(e) => handleSaveCustomDomain(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-indigo-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}
              </div>

              {/* Main Link Display & Copy */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Enlace Generado para la Modelo:</span>
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Listo para enviar
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 truncate select-all">
                    {modelLiveUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Direct Instant Action Test Button */}
              <div className="pt-1">
                <a
                  href={`${typeof window !== 'undefined' ? window.location.origin : ''}/?model=${activeModel.id}&view=model`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  🚀 Probar en Vivo Ahora Mismo en Este Navegador (Nueva Pestaña)
                </a>
              </div>

              {/* Instant Social Send Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold transition-all"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  Enviar por WhatsApp
                </a>

                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(modelLiveUrl)}&text=${telegramMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 text-sky-300 hover:text-white flex items-center justify-center gap-2 text-xs font-bold transition-all"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  Enviar por Telegram
                </a>
              </div>

              {/* What will the model see card */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> ¿Qué experimentará la modelo al ingresar?
                </div>
                <p>
                  • Verá una pantalla de validación exclusiva configurada con su perfil (<strong>{activeModel.name}</strong>).
                </p>
                <p>
                  • Podrá conversar y enviar audios para escuchar su síntesis de voz (voz <em>{activeModel.voice.name}</em>, acento{' '}
                  <em>{activeModel.voice.accent}</em>).
                </p>
                <p>
                  • Evaluará el comportamiento del Medidor de Confianza y cómo el agente introduce su enlace de OnlyFans VIP (
                  <strong>{activeModel.vipPrice}</strong>).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-slate-300">
                Escanea este código con la cámara del celular de la modelo (<strong>{activeModel.name}</strong>) para abrir el agente en vivo:
              </p>

              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    modelLiveUrl
                  )}`}
                  alt="QR Code AuraAgent"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <p className="text-[11px] font-mono text-indigo-300 truncate bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                  {modelLiveUrl}
                </p>
                <p className="text-[11px] text-slate-500">
                  Apunta la cámara del smartphone para abrir la vista interactiva de la modelo.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-300 text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Diagnóstico: ¿Por qué el enlace en el servidor daba 404 o no abría?
                </div>
                <p className="leading-relaxed">
                  En el entorno de <strong>Google AI Studio</strong> existen dos dominios distintos:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>
                    <strong className="text-white">Dominio ais-pre (Pre-release / Compartido):</strong> Es el enlace público oficial. Si arroja 404, significa que el contenedor de Cloud Run aún no se ha publicado públicamente. Para publicarlo, pulsa el botón <strong>&quot;Share&quot;</strong> en la barra superior de AI Studio.
                  </li>
                  <li>
                    <strong className="text-white">Dominio ais-dev (Desarrollo):</strong> Es el contenedor activo pero requiere estar autenticado con la cuenta Google del desarrollador (rechaza a usuarios externos).
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2.5">
                <div className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  Soluciones Inmediatas Garantizadas:
                </div>

                <div className="space-y-2 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-indigo-300">Opción 1 (Prueba Directa sin Servidor Externo):</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Haz clic en el botón verde <strong>&quot;Probar en Vivo Ahora Mismo en Este Navegador&quot;</strong> en la pestaña &quot;Enlace Directo&quot;. Esto abre inmediatamente la vista de la modelo en una pestaña nueva 100% funcional.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-indigo-300">Opción 2 (Túnel ngrok para Celular de la Modelo):</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Si ejecutas la app localmente o en tu servidor, puedes exponer el puerto 3000 con <code>ngrok http 3000</code> y pegar la URL resultante en la opción <strong>&quot;Dominio / Túnel&quot;</strong> arriba. El QR y WhatsApp se actualizarán de inmediato.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <strong className="text-indigo-300">Opción 3 (Publicar en AI Studio):</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      En la esquina superior derecha de AI Studio, haz clic en el botón <strong>&quot;Share&quot;</strong> para habilitar el acceso público sin restricciones al enlace <code>ais-pre</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-indigo-500/30">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Rendimiento Máximo en Computador / Escritorio
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para agencias y creadoras que operan alto volumen de DMs diarios, la versión de escritorio está optimizada
                  con aceleración por hardware:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-indigo-400" /> Pantalla Completa Doble
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Visualización paralela del Chat en Vivo y la Telemetría del Cerebro sin cambiar de pestaña.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Latencia Menor a 200ms
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Procesamiento de peticiones sin estrangulamiento de CPU o ahorro de batería de navegadores móviles.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" /> Control Multi-Ventana
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Supervisión simultánea del CRM de leads, el hub de Twitter y el entrenamiento de directivas.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Atajos de Teclado
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    <code>Alt+1</code> Operaciones, <code>Alt+2</code> X Hub, <code>Alt+3</code> Training, <code>Alt+4</code> CRM.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Enlace cifrado con protocolo TLS 1.3 • Modelo: {activeModel.name}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
