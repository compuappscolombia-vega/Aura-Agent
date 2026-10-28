import React, { useState } from 'react';
import { ModelProfile, AgentSkillSettings } from '../types';
import {
  Brain,
  Sliders,
  Sparkles,
  Zap,
  Target,
  ShieldAlert,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Flame,
  Volume2,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface AgentTrainingLabProps {
  modelProfile: ModelProfile;
  onUpdateSkills: (skills: AgentSkillSettings) => void;
  onRunTestPrompt: (promptText: string) => void;
}

export const AgentTrainingLab: React.FC<AgentTrainingLabProps> = ({
  modelProfile,
  onUpdateSkills,
  onRunTestPrompt,
}) => {
  const [skills, setSkills] = useState<AgentSkillSettings>(modelProfile.skills);
  const [hasSaved, setHasSaved] = useState(false);

  const handleSliderChange = (key: keyof AgentSkillSettings, value: any) => {
    const updated = { ...skills, [key]: value };
    setSkills(updated);
    onUpdateSkills(updated);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2000);
  };

  const testCases = [
    {
      title: 'Prueba de Escepticismo ("¿Eres un bot?")',
      prompt: 'Jaja a ver, seguro eres un bot o una IA respondiéndome en automático.',
      badge: 'Verificar Humanidad',
      category: 'humanity',
    },
    {
      title: 'Prueba de Cierre Directo ("¿Dónde veo tu contenido privado?")',
      prompt: 'Me encantas Valeria, ¿dónde puedo ver tus fotos sin censura y tus videos más íntimos?',
      badge: 'Concreción VIP',
      category: 'sales',
    },
    {
      title: 'Prueba de Monosílabos ("ok")',
      prompt: 'ok',
      badge: 'Manejo de Frialdad',
      category: 'brevity',
    },
    {
      title: 'Prueba de Desahogo Emocional (Tristeza)',
      prompt: 'Hoy fue uno de los peores días del año en mi trabajo, me siento muy solo...',
      badge: 'Empatía Genuina',
      category: 'empathy',
    },
    {
      title: 'Prueba de Complicidad Cotidiana (Story Matcha)',
      prompt: 'Qué rico ese café matcha, ¿en qué lugar te lo tomaste? Se ve increíble.',
      badge: 'Contexto de Vida',
      category: 'story',
    },
  ];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Entrenamiento Continuo
            </span>
            <span className="text-xs text-slate-400">
              Aprendizaje Automatizado para {modelProfile.name}
            </span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            Laboratorio de Habilidades y Calibración de Aura
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Aura es un agente 100% operativo y funcional. Este módulo permite entrenar y verificar sus habilidades lingüísticas, psicológicas y comerciales para asegurar que nunca suene a sistema y concrete ventas con naturalidad.
          </p>
        </div>

        {hasSaved && (
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> Parámetros de Aura actualizados
          </span>
        )}
      </div>

      {/* Grid: Skill Calibrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill 1: Interpretación Semántica y Subtexto */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Interpretación Semántica & Subtexto</h4>
                <p className="text-[11px] text-slate-400">Captar dobles sentidos, tono implícito y lectura entre líneas</p>
              </div>
            </div>
            <span className="text-sm font-black text-indigo-400">{skills.semanticAccuracy}%</span>
          </div>

          <input
            type="range"
            min="60"
            max="100"
            value={skills.semanticAccuracy}
            onChange={(e) => handleSliderChange('semanticAccuracy', parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
          />

          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            Aura no solo procesa palabras literales; interpreta si el cliente busca validación, coqueteo velado, si tiene dudas o si está listo para comprar.
          </div>
        </div>

        {/* Skill 2: Naturalidad Radical & Anti-Clichés */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Naturalidad Humana & Anti-Clichés</h4>
                <p className="text-[11px] text-slate-400">Cero saludos de bot, modismos orgánicos y espontaneidad</p>
              </div>
            </div>
            <span className="text-sm font-black text-rose-400">{skills.naturalnessLevel}%</span>
          </div>

          <input
            type="range"
            min="70"
            max="100"
            value={skills.naturalnessLevel}
            onChange={(e) => handleSliderChange('naturalnessLevel', parseInt(e.target.value, 10))}
            className="w-full accent-rose-500 cursor-pointer"
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300 font-semibold">Filtro Estricto Anti-Clichés de Chatbot</span>
            <button
              onClick={() => handleSliderChange('antiClichéFilter', !skills.antiClichéFilter)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                skills.antiClichéFilter
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {skills.antiClichéFilter ? '✓ Activado (Cero Bot)' : 'Desactivado'}
            </button>
          </div>
        </div>

        {/* Skill 3: Estrategia de Cierre Comercial (Venta VIP) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Asertividad en Cierre a OnlyFans</h4>
                <p className="text-[11px] text-slate-400">Estilo para concretar suscripciones con seguridad</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {skills.salesClosingAssertiveness}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['suave', 'equilibrada', 'audaz'] as const).map((style) => (
              <button
                key={style}
                onClick={() => handleSliderChange('salesClosingAssertiveness', style)}
                className={`py-2 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                  skills.salesClosingAssertiveness === style
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400">
            {skills.salesClosingAssertiveness === 'audaz'
              ? 'Cierre directo, magnético y pícaro: invita a su OnlyFans con firmeza destacando que en X no puede compartir su intimidad.'
              : skills.salesClosingAssertiveness === 'equilibrada'
              ? 'Equilibrado: genera complicidad y comparte fotos cotidianas antes de soltar el enlace VIP de forma irresistible.'
              : 'Suave: prioriza charlas más largas antes de insinuar su espacio de suscripción.'}
          </p>
        </div>

        {/* Skill 4: Conexión con Stories y Vida Real */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Anclaje a Vida Real & Stories</h4>
                <p className="text-[11px] text-slate-400">Reaccionar a publicaciones, café, rutinas y viajes</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-400">
              {skills.storyContextAwareness ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300 font-semibold">
              Anclar conversación a Stories de X/Instagram
            </span>
            <button
              onClick={() =>
                handleSliderChange('storyContextAwareness', !skills.storyContextAwareness)
              }
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                skills.storyContextAwareness
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {skills.storyContextAwareness ? 'Activado' : 'Desactivado'}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            Permite que el usuario inicie diciendo algo sobre su última foto o story de la modelo (ej: matcha, gimnasio, playa) y Aura responde con recuerdos vívidos de ese momento exacto.
          </p>
        </div>
      </div>

      {/* Verification Benchmark Suite (Batería de Pruebas Rápidas) */}
      <div className="border-t border-slate-800 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              Banco de Verificación de Habilidades en Vivo
            </h3>
            <p className="text-xs text-slate-400">
              Haz clic en cualquiera de estos escenarios para probar cómo Aura interpreta y responde al instante en el chat operativo:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {testCases.map((tc, idx) => (
            <button
              key={idx}
              onClick={() => onRunTestPrompt(tc.prompt)}
              className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl text-left transition-all group cursor-pointer flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-2 py-0.5 rounded">
                    {tc.badge}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
                <h5 className="font-bold text-xs text-white group-hover:text-rose-200 transition-colors">
                  {tc.title}
                </h5>
              </div>
              <p className="text-[11px] text-slate-400 italic bg-black/30 p-2 rounded-lg border border-white/5 line-clamp-2">
                "{tc.prompt}"
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
