import React from 'react';
import { ConfidenceMetrics } from '../types';
import { ShieldCheck, Sparkles, HeartHandshake, Zap, Smile, Lock, Unlock, ArrowRight } from 'lucide-react';

interface TrustConfidenceMeterProps {
  metrics: ConfidenceMetrics;
  threshold?: number;
  totalMessages: number;
  onForceVipPitch?: () => void;
  compact?: boolean;
}

export const TrustConfidenceMeter: React.FC<TrustConfidenceMeterProps> = ({
  metrics,
  threshold = 75,
  totalMessages,
  onForceVipPitch,
  compact = false,
}) => {
  const { trustScore, reciprocity, responseFluency, positiveSentiment, stage, isVipReady, reasoning } =
    metrics;

  const getStageColor = (s: string) => {
    switch (s) {
      case 'cold':
        return 'from-sky-500 to-blue-600';
      case 'rapport':
        return 'from-emerald-500 to-teal-600';
      case 'warm':
        return 'from-amber-500 to-orange-500';
      case 'vip_ready':
      case 'converted':
        return 'from-rose-500 to-fuchsia-600';
      default:
        return 'from-indigo-500 to-purple-600';
    }
  };

  const getStageLabel = (s: string) => {
    switch (s) {
      case 'cold':
        return 'Fase 1: Rompehielos (Conociéndose)';
      case 'rapport':
        return 'Fase 2: Conexión Cotidiana y Fotos Casuales';
      case 'warm':
        return 'Fase 3: Alta Afinidad y Notas de Voz';
      case 'vip_ready':
        return 'Fase 4: Momento Óptimo para Enlace VIP';
      case 'converted':
        return 'Fase 5: Suscriptor VIP Convertido 🎉';
      default:
        return 'Analizando interacción';
    }
  };

  if (compact) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isVipReady ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Confianza & Fluidez
            </span>
          </div>
          <span className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">
            {trustScore}%
          </span>
        </div>

        {/* Mini Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative mb-2">
          <div
            className={`h-full bg-gradient-to-r ${getStageColor(
              stage
            )} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(5, trustScore))}%` }}
          />
          {/* Threshold marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-10"
            style={{ left: `${threshold}%` }}
            title={`Umbral VIP: ${threshold}%`}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>{getStageLabel(stage)}</span>
          <span className={isVipReady ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
            {isVipReady ? '🔓 VIP Listo' : `Faltan ${Math.max(0, threshold - trustScore)}%`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background glow based on score */}
      <div
        className={`absolute -top-20 -right-20 w-52 h-52 bg-gradient-to-br ${getStageColor(
          stage
        )} opacity-15 blur-3xl pointer-events-none rounded-full`}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Módulo de Inteligencia Agentica
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Evaluador de Ventas
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Análisis de Confianza & Fluidez
          </h3>
          <p className="text-xs text-slate-400">
            Monitoreo en tiempo real para determinar el momento natural de conversión a OnlyFans.
          </p>
        </div>

        {/* Global Score Big Badge */}
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-3xl font-extrabold text-white tracking-tighter">
              {trustScore}
            </span>
            <span className="text-sm font-semibold text-slate-400">/100</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400">
            {trustScore >= threshold ? 'Nivel Alto' : trustScore >= 40 ? 'Nivel Medio' : 'Nivel Inicial'}
          </span>
        </div>
      </div>

      {/* Main Gauge Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs font-medium mb-1.5 text-slate-300">
          <span className="flex items-center gap-1">
            <span>{getStageLabel(stage)}</span>
          </span>
          <span className="text-xs text-amber-400 font-semibold">
            Meta de Conversión: {threshold}%
          </span>
        </div>

        <div className="w-full bg-slate-800/80 h-3 rounded-full overflow-hidden relative p-0.5 border border-slate-700/50">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getStageColor(
              stage
            )} transition-all duration-700 ease-out shadow-sm`}
            style={{ width: `${Math.min(100, Math.max(5, trustScore))}%` }}
          />
          {/* Target marker */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10 rounded-full"
            style={{ left: `${threshold}%` }}
          />
        </div>
      </div>

      {/* Sub-metrics breakdown */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {/* Reciprocity */}
        <div className="bg-slate-800/50 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              Reciprocidad
            </span>
            <span className="font-bold text-white">{reciprocity}%</span>
          </div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${reciprocity}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Preguntas e interés</span>
        </div>

        {/* Fluency / Response time */}
        <div className="bg-slate-800/50 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Fluidez & Ritmo
            </span>
            <span className="font-bold text-white">{responseFluency}%</span>
          </div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${responseFluency}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Cadencia del chat</span>
        </div>

        {/* Positive sentiment */}
        <div className="bg-slate-800/50 border border-slate-800/80 rounded-xl p-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-teal-400" />
              Química Positiva
            </span>
            <span className="font-bold text-white">{positiveSentiment}%</span>
          </div>
          <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${positiveSentiment}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Halagos y calidez</span>
        </div>
      </div>

      {/* Decision Status Box */}
      <div
        className={`p-3 rounded-xl border transition-all ${
          isVipReady
            ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            : 'bg-slate-800/40 border-slate-700/50 text-slate-300'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isVipReady ? (
              <Unlock className="w-4 h-4 text-rose-400 animate-pulse" />
            ) : (
              <Lock className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-xs font-semibold">
              {isVipReady
                ? '¡Umbral Alcanzado! Enlace VIP habilitado'
                : `Conversando en confianza (${totalMessages} mensajes)`}
            </span>
          </div>
          {onForceVipPitch && !isVipReady && (
            <button
              onClick={onForceVipPitch}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              Forzar pitch VIP
            </button>
          )}
        </div>
        <p className="text-xs leading-relaxed opacity-90">
          {reasoning ||
            (isVipReady
              ? 'El usuario demostró alta afinidad e interés mutuo. El agente considera oportuno sugerir su OnlyFans VIP de forma elegante y personal.'
              : 'El agente prioriza conocer a la persona, enviar fotos casuales y notas de voz para evitar que el usuario sienta una venta prematura.')}
        </p>
      </div>
    </div>
  );
};
