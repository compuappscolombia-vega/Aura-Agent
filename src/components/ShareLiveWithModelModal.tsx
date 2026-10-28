import React, { useState } from 'react';
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
} from 'lucide-react';

interface ShareLiveWithModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: ModelProfile;
}

export const ShareLiveWithModelModal: React.FC<ShareLiveWithModelModalProps> = ({
  isOpen,
  onClose,
  model,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'specs'>('link');

  if (!isOpen) return null;

  // Use the pre-configured shared app URL or fall back to window.location.origin
  const sharedUrl =
    typeof window !== 'undefined' && window.location.origin.includes('ais-dev')
      ? window.location.origin.replace('ais-dev', 'ais-pre')
      : typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-lokv3iokjsaaw7piecrjod-227172514263.us-east1.run.app';

  const modelLiveUrl = `${sharedUrl}?model=${model.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(modelLiveUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const whatsappMessage = encodeURIComponent(
    `¡Hola ${model.name.split(' ')[0]}! ✨ Aquí tienes el enlace de AuraAgent para que veas el sistema operando en vivo en directo con tu personalidad, tus fotos de bóveda y el medidor de ventas VIP:\n\n${modelLiveUrl}`
  );

  const telegramMessage = encodeURIComponent(
    `¡Hola ${model.name.split(' ')[0]}! Accede a AuraAgent en vivo: ${modelLiveUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
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
                La modelo podrá ver el agente operando, interactuar y evaluar sus respuestas en tiempo real
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

        {/* Model Snapshot Card */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={model.avatarUrl}
              alt={model.name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-indigo-500/50 shadow-md"
            />
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {model.name}
                <span className="text-xs font-mono text-sky-400">{model.handle}</span>
              </div>
              <p className="text-xs text-slate-400">
                Arquetipo: <span className="text-indigo-300 font-medium">{model.archetype}</span> • OnlyFans VIP: {model.vipPrice}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              Agente Activo
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
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
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'qr'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Código QR Móvil
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
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
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enlace de Acceso Seguro para la Modelo (Vista en Vivo):
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
                        <Copy className="w-4 h-4" /> Copiar Enlace
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Social Send Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
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

              <div className="pt-2">
                <a
                  href={modelLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4 text-indigo-400" />
                  Abrir Vista en Directo en Nueva Pestaña
                </a>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> ¿Qué podrá ver la modelo al abrir este enlace?
                </div>
                <p>
                  • La modelo verá a <strong>AuraAgent</strong> chateando con su voz, fotos y estilo.
                </p>
                <p>
                  • Podrá probar ella misma enviando mensajes y audios para confirmar que el agente suena 100% como ella.
                </p>
                <p>
                  • Verá cómo el <em>Medidor de Confianza (Trust Meter)</em> se eleva antes de ofrecer su suscripción a OnlyFans.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-slate-300">
                Escanea este código con la cámara del celular de la modelo para abrir el agente inmediatamente:
              </p>
              
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    modelLiveUrl
                  )}`}
                  alt="QR Code AuraAgent"
                  className="w-44 h-44 mx-auto"
                />
              </div>

              <p className="text-[11px] font-mono text-slate-400 truncate max-w-sm mx-auto">
                {modelLiveUrl}
              </p>
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
                  Para agencias y creadoras que operan alto volumen de DMs diarios, la versión de escritorio está optimizada con aceleración por hardware:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-indigo-400" /> Pantalla Completa Doble
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Visualización paralela del Chat en Vivo y la Telemetría del Cerebro sin necesidad de cambiar de pestaña.
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
          <span className="text-xs text-slate-400">
            Enlace verificado y cifrado con protocolo TLS 1.3
          </span>
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
