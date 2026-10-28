import React, { useState } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  X,
  Sparkles,
  Check,
  Brain,
  ShieldCheck,
  Flame,
  Radio,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';

interface ManualViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualViewerModal: React.FC<ManualViewerModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'what' | 'why' | 'features' | 'how' | 'gallery'>('what');
  const [downloading, setDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      // Direct in-memory fetch via /api/manual/pdf-base64 (bypasses any Cloud Run cookie redirects)
      const res = await fetch('/api/manual/pdf-base64');
      if (res.ok) {
        const data = await res.json();
        if (data.base64) {
          const byteCharacters = atob(data.base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'AuraAgent_Manual_Oficial.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => window.URL.revokeObjectURL(url), 2000);
          return;
        }
      }
      window.location.href = '/api/download-manual';
    } catch (err) {
      console.warn('Fallback direct download:', err);
      window.location.href = '/api/download-manual';
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Manual Oficial & Dossier Ejecutivo</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  DOCUMENTO OFICIAL v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AuraAgent: Arquitectura, Psicología de Conversión, Operación y Rendimiento en Computador
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              title="Descargar archivo PDF completo a tu computador"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Descargando...' : 'Descargar PDF'}</span>
            </button>

            <a
              href="/manual"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              title="Abrir vista imprimible en pestaña nueva"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2.5 gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveSection('what')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'what'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            1. ¿Qué es AuraAgent?
          </button>
          <button
            onClick={() => setActiveSection('why')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'why'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            2. Objetivos & Embudo VIP
          </button>
          <button
            onClick={() => setActiveSection('features')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'features'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            3. Funciones Principales
          </button>
          <button
            onClick={() => setActiveSection('how')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'how'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            4. ¿Cómo se Usa?
          </button>
          <button
            onClick={() => setActiveSection('gallery')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'gallery'
                ? 'border-rose-500 text-rose-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            5. Capturas de Pantalla (7)
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-200 text-sm leading-relaxed">
          {activeSection === 'what' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/20">
                <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  Definición de AuraAgent
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>AuraAgent</strong> no es un chatbot tradicional de soporte al cliente. Es un <strong>sistema agéntico autónomo de interacción íntima, seducción psicológica y conversión automatizada</strong> concebido específicamente para el mercado de creadoras de contenido exclusivo y agencias de gestión de talentos (OnlyFans / Fanvue).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Cero Clichés de Bot
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tiene terminantemente prohibido saludar con frases como: <em>"¡Hola! ¿Cómo estás? ¿En qué te ayudo hoy?"</em>. El agente responde con anécdotas, picardía y alta autoestima como una mujer real.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" /> Notas de Voz y Bóveda Casual
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sintetiza audios íntimos con risitas y modulación cálida, y envía fotografías casuales de bóveda (café matutino, descanso en el gimnasio, relax en sofá) protegidas con cifrado y marcas de agua.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                <strong>💡 Principio de Oro:</strong> La venta no se presiona; se suscita. El seguidor siente que se está ganando la atención y complicidad de la creadora.
              </div>
            </div>
          )}

          {activeSection === 'why' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">El Problema de la Industria</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  El 80% de los ingresos de OnlyFans ocurre por DMs privados. Sin embargo, las modelos sufren <strong>burnout</strong> por contestar cientos de mensajes diarios y los chatters humanos tradicionales cometen errores o suenan robóticos, destruyendo la ilusión de intimidad.
                </p>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
                El Embudo Psicológico en 3 Fases:
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border-l-4 border-l-rose-500 border border-slate-800">
                  <div className="text-xs font-bold text-white mb-1">
                    Fase 1: Gancho y Espejo (Trust &lt; 45%) — Simetría de Estatus
                  </div>
                  <p className="text-xs text-slate-400">
                    Responde al contexto específico del fan (una historia de café o gym). Bromea y reta al usuario con humor. Cero mención a OnlyFans.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border-l-4 border-l-indigo-500 border border-slate-800">
                  <div className="text-xs font-bold text-white mb-1">
                    Fase 2: Micro-Intimidad (Trust 45% - 74%) — Construcción de Apego
                  </div>
                  <p className="text-xs text-slate-400">
                    Comparte fotos casuales y audios de su vida cotidiana. Siembra intriga sobre su contenido sin censura que no puede subir a redes públicas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border-l-4 border-l-emerald-500 border border-slate-800">
                  <div className="text-xs font-bold text-white mb-1">
                    Fase 3: Cierre Asertivo VIP (Trust &ge; 75%) — Monetización
                  </div>
                  <p className="text-xs text-slate-400">
                    Explica que en Twitter/X la censuran y le restringen privacidad. Invita al fan a su OnlyFans VIP con enlace directo y descuento exclusivo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">1. Operaciones en Vivo</div>
                  <p className="text-slate-400">
                    Bandeja de DMs con puntos de entrada en historias de X, envío de fotos de bóveda y notas de voz íntimas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">2. Medidor de Confianza (Trust Meter)</div>
                  <p className="text-slate-400">
                    Cálculo en vivo de Confianza (0-100%), Reciprocidad, Fluidez y umbral para autorizar el cierre VIP.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">3. Detección Emocional Neural</div>
                  <p className="text-slate-400">
                    Detecta 6 estados anímicos (🥺 Triste, 🧊 Cortante, 😏 Coqueto, 🧐 Serio, 😤 Molesto, 😄 Contento) y adapta la respuesta al instante.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">4. Integración X (Twitter) & Webhooks</div>
                  <p className="text-slate-400">
                    Account Activity API de Twitter con desafío CRC HMAC-SHA256 y endpoint REST abierto para n8n/Make/Zapier.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">5. Laboratorio de Entrenamiento</div>
                  <p className="text-slate-400">
                    Configuración de reglas comerciales, precio VIP, enlace de OnlyFans y tono de personalidad.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">6. Panel CRM & Pipeline de Suscriptores</div>
                  <p className="text-slate-400">
                    Gestión de leads clasificados por etapas de venta y métricas de ingresos mensuales recurrentes (MRR).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'how' && (
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <div className="text-xs font-bold text-white">Seleccionar la Modelo</div>
                  <p className="text-xs text-slate-400">Escoge la creadora activa en el botón de modelos en la barra superior (ej: Valeria Gómez, Elena Russo).</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <div className="text-xs font-bold text-white">Fijar Enlace OnlyFans y Umbral</div>
                  <p className="text-xs text-slate-400">En la pestaña <em>Entrenar Habilidades</em>, ingresa el enlace de suscripción de la modelo y el umbral de cierre (75%).</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <div className="text-xs font-bold text-white">Probar Diálogo en Vivo</div>
                  <p className="text-xs text-slate-400">Interactúa en <em>Operaciones en Vivo</em> enviando mensajes, notas de voz o usando los botones de emoción rápida.</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">4</span>
                <div>
                  <div className="text-xs font-bold text-white">Compartir con la Modelo</div>
                  <p className="text-xs text-slate-400">Haz clic en el botón verde <strong>Compartir con la Modelo</strong> para enviarle el link por WhatsApp o escanear el QR.</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'gallery' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Capturas de pantalla auténticas de cada módulo de la plataforma incluidas en el documento oficial:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    1. Operaciones en Vivo (Chat & DMs)
                  </div>
                  <img src="/manual_assets/01_live_ops_chat.png" alt="Chat" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    2. Medidor de Confianza & Gatillo VIP
                  </div>
                  <img src="/manual_assets/02_trust_meter.png" alt="Trust" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    3. HUD del Cerebro Agéntico & Telemetría
                  </div>
                  <img src="/manual_assets/03_brain_hud.png" alt="Brain HUD" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    4. Hub de Integración X (Twitter) & Webhooks
                  </div>
                  <img src="/manual_assets/04_twitter_hub.png" alt="Twitter Hub" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    5. Laboratorio de Entrenamiento (Training Lab)
                  </div>
                  <img src="/manual_assets/05_training_lab.png" alt="Training Lab" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    6. Panel CRM & Pipeline de Suscriptores
                  </div>
                  <img src="/manual_assets/06_crm_subscriptions.png" alt="CRM" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 md:col-span-2">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    7. Catálogo Multimodelo de la Agencia
                  </div>
                  <img src="/manual_assets/07_model_catalog.png" alt="Models Catalog" className="w-full h-auto object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Documento disponible en disco en <code>/AuraAgent_Manual_Oficial.pdf</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Descargar PDF
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
