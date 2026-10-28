import React from 'react';
import { ConfidenceMetrics, ModelProfile } from '../types';
import { Brain, Cpu, ShieldCheck, Zap, Image, Mic, Sparkles, Sliders, ExternalLink } from 'lucide-react';

interface AgentBrainHUDProps {
  metrics: ConfidenceMetrics;
  modelProfile: ModelProfile;
  lastDecisionReasoning: string;
  onForcePhoto: (category: 'cafe' | 'gym' | 'cozy' | 'beach') => void;
  onForceVoiceNote: () => void;
  onForceVipPitch: () => void;
  onUpdateThreshold: (newVal: number) => void;
  isSimulatingResponse: boolean;
}

export const AgentBrainHUD: React.FC<AgentBrainHUDProps> = ({
  metrics,
  modelProfile,
  lastDecisionReasoning,
  onForcePhoto,
  onForceVoiceNote,
  onForceVipPitch,
  onUpdateThreshold,
  isSimulatingResponse,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              Cerebro del Agente IA
              <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono">
                AUTONOMOUS V2
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Gestor inteligente de conversión y ventas naturales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSimulatingResponse ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
            }`}
          />
          <span className="text-xs text-slate-400">
            {isSimulatingResponse ? 'Analizando...' : 'En vivo'}
          </span>
        </div>
      </div>

      {/* Internal Agent Reasoning Stream */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
          <span className="flex items-center gap-1.5 text-purple-400">
            <Cpu className="w-3.5 h-3.5" />
            Cadena de Pensamiento Agentico
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans italic bg-purple-950/20 p-2.5 rounded-lg border border-purple-900/30">
          "{lastDecisionReasoning || 'Inicializando monitoreo del diálogo. Evaluando perfil psicológico, afinidad y tiempo de permanencia del prospecto.'}"
        </p>
      </div>

      {/* Real-time Voice & Tone Tuning Stats */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
        <span className="text-xs font-semibold text-slate-300 mb-2 block flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          Modulación de Voz de la Modelo
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Voz Seleccionada</span>
            <span className="font-semibold text-white">{modelProfile.voice.name} (Gemini TTS)</span>
          </div>
          <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Acento & Calidez</span>
            <span className="font-semibold text-rose-300">{modelProfile.voice.accent}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {modelProfile.voice.description}
        </p>
      </div>

      {/* Conversion Threshold Slider */}
      <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3">
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Umbral de Confianza para Enlace VIP:
          </span>
          <span className="font-bold text-amber-400 text-sm">
            {modelProfile.rules.conversionThreshold}%
          </span>
        </div>
        <input
          type="range"
          min="40"
          max="95"
          value={modelProfile.rules.conversionThreshold}
          onChange={(e) => onUpdateThreshold(parseInt(e.target.value, 10))}
          className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>40% (Venta Rápida)</span>
          <span>75% (Equilibrado y Seguro)</span>
          <span>95% (Máxima Conexión)</span>
        </div>
      </div>

      {/* Creator Overrides & Test Triggers */}
      <div>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Acciones y Pruebas Manuales
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onForcePhoto('cafe')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Image className="w-3.5 h-3.5 text-sky-400" />
            Foto Café ☕
          </button>
          <button
            onClick={() => onForcePhoto('gym')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Image className="w-3.5 h-3.5 text-emerald-400" />
            Foto Gym 💪
          </button>
          <button
            onClick={onForceVoiceNote}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            Enviar Nota de Voz
          </button>
          <button
            onClick={onForceVipPitch}
            className="p-2 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Lanzar Enlace VIP
          </button>
        </div>
      </div>

      {/* Target VIP Link preview */}
      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
        <div className="truncate mr-2">
          <span className="text-[10px] text-slate-500 block">Enlace configurado</span>
          <span className="text-slate-300 truncate font-mono">{modelProfile.vipLink}</span>
        </div>
        <a
          href={modelProfile.vipLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0"
        >
          <span>Abrir</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
