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
                  Definición de AuraAgent v2.5
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong>AuraAgent</strong> no es un bot genérico ni un asistente corporativo. Es un <strong>sistema agéntico autónomo de interacción íntima, seducción psicológica y conversión automatizada</strong> concebido para modelos webcam reales (ej. perfil oficial de <strong>ANAMARIA❣️ @afire_sb</strong>) y agencias de gestión de talentos VIP (OnlyFans / Fanvue).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Cero Clichés de Bot & Fluidez
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Tiene terminantemente prohibido saludar como bot de soporte. Mantiene la memoria de contexto activo en conversaciones multi-turno y replica la naturalidad, picardía y alta autoestima de una creadora real.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" /> Clonación de Voz & Bóveda Casual
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sintetiza audios hiperrealistas modulados con risitas y respiración orgánica (Gemini TTS), respaldados por fotos de bóveda casual protegidas con marcas de agua.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Aislamiento Seguro de Roles
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    El perfil de modelo webcam real opera en un entorno privado sin acceso a herramientas administrativas ni selectores de otras creadoras. La administración comercial y la subida de foto de perfil pertenecen exclusivamente al Administrador General.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-white font-bold text-xs mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Menú de Módulos Unificado
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Barra superior organizada mediante un menú desplegable de módulos tipo Herramientas, responsive, con el logo oficial de 𝕏 y acceso rápido a instaladores de Windows y app móvil Android.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                <strong>💡 Principio de Oro:</strong> La venta no se presiona; se suscita. El seguidor siente que se está ganando la atención y complicidad de la modelo tras construir confianza y afinidad.
              </div>
            </div>
          )}

          {activeSection === 'why' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-2">El Problema de la Venta Precipitada</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En OnlyFans el 80% de los ingresos ocurre por DMs privados. Sin embargo, los bots genéricos cometen el grave error de <strong>ofrecer el enlace VIP en los primeros mensajes</strong>, provocando rechazo inmediato. AuraAgent implementa un ritmo conversacional orgánico donde dos personas se conocen primero antes de cualquier pitch.
                </p>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
                El Embudo Psicológico de Pacing Orgánico:
              </h4>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border-l-4 border-l-rose-500 border border-slate-800">
                  <div className="text-xs font-bold text-white mb-1">
                    Fase 1: Gancho y Espejo (Trust &lt; 45%) — Simetría de Estatus
                  </div>
                  <p className="text-xs text-slate-400">
                    Responde con chispa y picardía al contexto específico del fan (story de café o gym). Bromea y reta al usuario con humor. Cero mención a OnlyFans ni enlaces de pago.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border-l-4 border-l-indigo-500 border border-slate-800">
                  <div className="text-xs font-bold text-white mb-1">
                    Fase 2: Micro-Intimidad (Trust 45% - 74%) — Apego & Bóveda Casual
                  </div>
                  <p className="text-xs text-slate-400">
                    Comparte anécdotas de su rutina diaria, envía notas de voz y fotografías casuales de bóveda. Siembra curiosidad sobre contenido íntimo exclusivo no apto para redes públicas.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border-l-4 border-l-emerald-500 border border-slate-800">
                  <div className="text-xs font-bold text-white mb-1">
                    Fase 3: Cierre Asertivo VIP (Trust &ge; 75% y &ge; 6 Interacciones)
                  </div>
                  <p className="text-xs text-slate-400">
                    Habiendo intercambiado fotos/audios y alcanzado alta afinidad, explica con naturalidad que en 𝕏 la censuran y la limitan. Invita al fan a su OnlyFans con enlace directo y beneficio exclusivo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'features' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">1. Operaciones en Vivo Multi-Turno</div>
                  <p className="text-slate-400">
                    Bandeja de DMs con memoria de conversación contextual continua, puntos de entrada y fotos/audios casuales.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">2. Medidor de Confianza Anti-Prematuro</div>
                  <p className="text-slate-400">
                    Cálculo en vivo de Confianza (0-100%), reciprocidad y umbral estricto que bloquea ventas antes de tiempo.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">3. Detección Emocional Neural</div>
                  <p className="text-slate-400">
                    Detecta 6 estados anímicos (🥺 Triste, 🧊 Cortante, 😏 Coqueto, 🧐 Serio, 😤 Molesto, 😄 Contento) y modula la empatía.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">4. Integración Oficial con 𝕏 (Twitter)</div>
                  <p className="text-slate-400">
                    Account Activity API de 𝕏 con desafío CRC HMAC-SHA256, firma criptográfica y endpoint REST para webhooks externos.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">5. Laboratorio de Voz & A/B Testing</div>
                  <p className="text-slate-400">
                    Comparación lado a lado de modelos de voz, calibración de timbre, respiración orgánica y reverberación de sala.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="font-bold text-white mb-1 text-xs">6. Panel CRM & Descargas Win64/APK</div>
                  <p className="text-slate-400">
                    Pipeline de suscriptores, MRR proyectado e instaladores para computador Windows y móvil Android (WebAPK/PWA).
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
                  <div className="text-xs font-bold text-white">Seleccionar la Creadora o Modelo</div>
                  <p className="text-xs text-slate-400">En el menú de creadoras (disponible solo en sesión admin), selecciona a la modelo activa (ej. ANAMARIA❣️ @afire_sb).</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <div className="text-xs font-bold text-white">Entrenar Voz y Calibrar Reglas en Training Lab</div>
                  <p className="text-xs text-slate-400">Compara los modelos de voz mediante A/B Testing, afina la respiración y sala, y fija el umbral de cierre (recomendado &ge; 75%).</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <div className="text-xs font-bold text-white">Probar Diálogo en Operaciones en Vivo</div>
                  <p className="text-xs text-slate-400">Chatea con Aura para comprobar la continuidad conversacional, notas de voz hiperrealistas y adaptación emocional sin respuestas desfasadas.</p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="w-6 h-6 rounded-full bg-rose-600/30 text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">4</span>
                <div>
                  <div className="text-xs font-bold text-white">Personalizar Avatar Admin e Instalar App</div>
                  <p className="text-xs text-slate-400">Sube tu foto de perfil desde el menú de Administrador y descarga el instalador Windows 64-bit o la app PWA en tu celular.</p>
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
                    1. Operaciones en Vivo (Chat Multi-Turno & 𝕏 DMs)
                  </div>
                  <img src="/manual_assets/01_live_ops_chat.png" alt="Chat" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    2. Medidor de Confianza Anti-Prematuro & Gatillo VIP
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
                    4. Hub de Integración Oficial con 𝕏 & Webhooks
                  </div>
                  <img src="/manual_assets/04_twitter_hub.png" alt="Twitter Hub" className="w-full h-auto object-cover" />
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <div className="p-2 bg-slate-900 text-[11px] font-bold text-slate-300">
                    5. Laboratorio de Entrenamiento (Voz Hiperrealista & A/B)
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
                    7. Catálogo Multimodelo & Gestión de Perfiles
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
