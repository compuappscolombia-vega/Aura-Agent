import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Terminal,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  X,
  Sparkles,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface InstallersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallersModal: React.FC<InstallersModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'win64' | 'apk' | 'ios' | 'server'>('win64');
  const [copiedScript, setCopiedScript] = useState(false);
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleDownloadWin64 = () => {
    const a = document.createElement('a');
    a.href = '/AuraAgent_Windows_x64.bat';
    a.download = 'AuraAgent_Windows_x64.bat';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadPS1 = () => {
    const a = document.createElement('a');
    a.href = '/AuraAgent_Instalador_Win64.ps1';
    a.download = 'AuraAgent_Instalador_Win64.ps1';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('git clone https://github.com/compuappscolombia-vega/Aura-Agent.git && cd Aura-Agent && AuraAgent_Windows_x64.bat');
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Instaladores & Ejecutores AuraAgent</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Win64 / APK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ejecuta AuraAgent en tu computador Windows 64 bits o instálalo como app en tu celular
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 sm:px-5 pt-3 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('win64')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'win64'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            Windows 64 bits (.bat)
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            App Celular / APK Android
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ios'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            iPhone / iPad (iOS)
          </button>

          <button
            onClick={() => setActiveTab('server')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'server'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Comandos de Consola
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'win64' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/30">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-sm mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Ejecutador Local Automático para Windows 64-bits
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Descarga el lanzador <code>.bat</code> oficial. Al ejecutarlo en tu PC con Windows 64 bits, verificará Node.js, instalará dependencias e iniciará AuraAgent automáticamente en <code>http://localhost:3000</code> abriendo tu navegador.
                </p>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleDownloadWin64}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar AuraAgent_Windows_x64.bat
                </button>

                <button
                  onClick={handleDownloadPS1}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Descargar Script PowerShell (.ps1)
                </button>
              </div>

              {/* Instructions steps */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5">
                <div className="text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pasos de instalación en Windows 64 bits:
                </div>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                  <li>Descarga el archivo <code>AuraAgent_Windows_x64.bat</code> y colócalo en la carpeta de tu proyecto.</li>
                  <li>Haz doble clic sobre <code>AuraAgent_Windows_x64.bat</code>.</li>
                  <li>Si Windows SmartScreen muestra una advertencia, haz clic en <em>Más información</em> &rarr; <em>Ejecutar de todas formas</em>.</li>
                  <li>El sistema abrirá automáticamente la consola negra y cargará <code>http://localhost:3000</code> en Google Chrome o Edge.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-1">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  Instalación como App / APK en Celular Android
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  AuraAgent cumple 100% con los estándares PWA (Progressive Web App) y WebAPK de Android, permitiendo instalarse directamente en la pantalla de inicio de tu celular sin pasar por Play Store, con soporte para cámara, fotos y audio.
                </p>
              </div>

              {/* Native Install Button if browser supports beforeinstallprompt */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center gap-3">
                {isInstalled ? (
                  <div className="text-emerald-400 font-bold text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ¡AuraAgent ya está instalado como app en este dispositivo!
                  </div>
                ) : (
                  <>
                    <button
                      onClick={install}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      📱 Instalar AuraAgent en Celular (Android APK Web)
                    </button>
                    <p className="text-[11px] text-slate-400 max-w-sm">
                      Al presionar este botón, tu navegador (Chrome / Brave / Edge en Android) instalará el acceso directo independiente como aplicación nativa.
                    </p>
                  </>
                )}
              </div>

              {/* Android Manual Guide */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Pasos manuales para Android:
                </div>
                <ol className="list-decimal pl-5 space-y-1 text-slate-400">
                  <li>Abre el enlace de AuraAgent en <strong>Google Chrome</strong> en tu celular.</li>
                  <li>Toca el menú de tres puntos verticales (<strong>⋮</strong>) en la esquina superior derecha.</li>
                  <li>Selecciona <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.</li>
                  <li>Se creará el icono de <em>AuraAgent</em> en el menú de aplicaciones de tu Android.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/30">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-sm mb-1">
                  <Smartphone className="w-4 h-4 text-sky-400" />
                  Instalar en iPhone / iPad (iOS Safari)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  En iOS (Apple), las aplicaciones web se instalan sin cables directamente desde Safari:
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">1</span>
                  <p className="text-slate-300">
                    Abre el enlace de AuraAgent en el navegador <strong>Safari</strong> de tu iPhone.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">2</span>
                  <p className="text-slate-300">
                    Toca el botón <strong>Compartir</strong> (icono de cuadrado con una flecha hacia arriba) en la barra inferior de Safari.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">3</span>
                  <p className="text-slate-300">
                    Desplázate hacia abajo y selecciona <strong>&quot;Añadir a pantalla de inicio&quot;</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0">4</span>
                  <p className="text-slate-300">
                    Toca <strong>&quot;Añadir&quot;</strong> en la esquina superior derecha. AuraAgent se abrirá a pantalla completa como una app nativa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'server' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-400" />
                    Comando rápido para clonar y ejecutar en terminal:
                  </span>
                  <button
                    onClick={handleCopyCmd}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto">
git clone https://github.com/compuappscolombia-vega/Aura-Agent.git
cd Aura-Agent
npm install
npm run dev
                </pre>

                <p className="text-xs text-slate-400">
                  El servidor se iniciará en el puerto <code>3000</code> y sincronizará la síntesis de voz hiperrealista y los endpoints de X API v2.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            AuraAgent v2.5 • Windows x64 & PWA Android Multiplataforma
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
