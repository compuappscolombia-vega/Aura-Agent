import React, { useState } from 'react';
import { UserMemory, UserMood, CommunicationStyle } from '../types';
import {
  Brain,
  Smile,
  Frown,
  Meh,
  Flame,
  AlertTriangle,
  Heart,
  HelpCircle,
  Tag,
  CheckCircle2,
  Sparkles,
  Plus,
  Compass,
} from 'lucide-react';

interface UserMemoryInspectorProps {
  memory: UserMemory;
  onUpdateMemory?: (updated: UserMemory) => void;
  onSimulateMoodMessage?: (text: string, moodHint: UserMood) => void;
}

export const UserMemoryInspector: React.FC<UserMemoryInspectorProps> = ({
  memory,
  onUpdateMemory,
  onSimulateMoodMessage,
}) => {
  const [newFact, setNewFact] = useState('');

  const getMoodBadge = (mood: UserMood) => {
    switch (mood) {
      case 'contento':
        return {
          label: 'Contento / Alegre',
          icon: Smile,
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          emoji: '😄',
          bgGlow: 'from-emerald-500/20 to-teal-500/10',
        };
      case 'triste':
        return {
          label: 'Triste / Desanimado',
          icon: Frown,
          color: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
          emoji: '🥺',
          bgGlow: 'from-sky-500/20 to-blue-500/10',
        };
      case 'cortante':
        return {
          label: 'Cortante / Seco',
          icon: Meh,
          color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          emoji: '🧊',
          bgGlow: 'from-cyan-500/20 to-slate-500/10',
        };
      case 'enojado':
        return {
          label: 'Enojado / Molesto',
          icon: AlertTriangle,
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          emoji: '😤',
          bgGlow: 'from-rose-500/20 to-orange-500/10',
        };
      case 'coqueto':
        return {
          label: 'Coqueto / Seductor',
          icon: Flame,
          color: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
          emoji: '😏',
          bgGlow: 'from-pink-500/20 to-purple-500/10',
        };
      case 'serio':
        return {
          label: 'Serio / Formal',
          icon: Compass,
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          emoji: '🧐',
          bgGlow: 'from-indigo-500/20 to-slate-500/10',
        };
      case 'timido':
        return {
          label: 'Tímido / Cauto',
          icon: HelpCircle,
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          emoji: '🙈',
          bgGlow: 'from-purple-500/20 to-indigo-500/10',
        };
      default:
        return {
          label: 'Neutral',
          icon: Smile,
          color: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
          emoji: '🙂',
          bgGlow: 'from-slate-500/20 to-slate-800/10',
        };
    }
  };

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    if (onUpdateMemory) {
      onUpdateMemory({
        ...memory,
        keyFacts: [...memory.keyFacts, newFact.trim()],
      });
    }
    setNewFact('');
  };

  const moodBadge = getMoodBadge(memory.currentMood);
  const MoodIcon = moodBadge.icon;

  const moodPresets = [
    {
      mood: 'triste' as UserMood,
      label: '🥺 Triste / Bajón',
      text: 'Hoy tuve un día súper pesado en la oficina y me siento bastante desanimado...',
    },
    {
      mood: 'cortante' as UserMood,
      label: '🧊 Cortante / Seco',
      text: 'ok',
    },
    {
      mood: 'coqueto' as UserMood,
      label: '😏 Coqueto / Fuego',
      text: 'Qué hermosa estás bombón, me encantas demasiado 🔥',
    },
    {
      mood: 'serio' as UserMood,
      label: '🧐 Serio / Formal',
      text: 'Buenas tardes. Me gustaría consultar detalles acerca de tu suscripción privada.',
    },
    {
      mood: 'enojado' as UserMood,
      label: '😤 Enojado / Molesto',
      text: 'Estoy harto de perder el tiempo con respuestas automáticas.',
    },
    {
      mood: 'contento' as UserMood,
      label: '😄 Contento / Risas',
      text: '¡Jajaja qué risa tu mensaje! Tienes una vibra increíble de verdad 😊',
    },
  ];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
      {/* Background ambient glow */}
      <div
        className={`absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br ${moodBadge.bgGlow} opacity-20 blur-3xl pointer-events-none rounded-full`}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Memoria & Análisis Emocional</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono font-medium">
                ADAPTIVE LEARNING
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Perfil psicológico aprendido del usuario: <span className="text-white font-semibold">{memory.username}</span>
            </p>
          </div>
        </div>

        {/* Attachment level chip */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
          <span className="text-[11px] text-slate-300">
            Apego: <strong className="text-white">{memory.attachmentLevel}</strong>
          </span>
        </div>
      </div>

      {/* Emotion & Communication Style Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Mood Card */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Estado Emocional Detectado
          </span>
          <div className="flex items-center gap-2 my-1.5">
            <span className="text-2xl">{moodBadge.emoji}</span>
            <div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${moodBadge.color}`}>
                <MoodIcon className="w-3 h-3" />
                {moodBadge.label}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Intensidad: {memory.moodIntensity}/10
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug italic bg-black/30 p-2 rounded-lg border border-white/5">
            "{memory.lastEmotionalState}"
          </p>
        </div>

        {/* Style Card */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
            Estilo de Comunicación
          </span>
          <div className="my-1.5">
            <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 inline-block">
              {memory.communicationStyle}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Mensajes procesados: {memory.interactionCount}
            </span>
          </div>
          <div className="text-[11px] text-emerald-400/90 bg-emerald-950/20 p-2 rounded-lg border border-emerald-900/30 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{memory.suggestedApproach}</span>
          </div>
        </div>
      </div>

      {/* Learned Facts & Long-term Memory Section */}
      <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            Hechos & Preferencias Recordadas ({memory.keyFacts.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Retención Activa</span>
        </div>

        {/* Facts Chips */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {memory.keyFacts.map((fact, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-indigo-400 shrink-0" />
              <span>{fact}</span>
            </span>
          ))}
        </div>

        {/* Add Fact Form */}
        <form onSubmit={handleAddFact} className="flex gap-2">
          <input
            type="text"
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            placeholder="Añadir detalle recordado (ej: 'Trabaja en diseño', 'Vive solo')..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Recordar
          </button>
        </form>
      </div>

      {/* Emotion Simulator Testing Toolbar */}
      {onSimulateMoodMessage && (
        <div className="border-t border-slate-800/80 pt-3">
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Probar adaptación inmediata con estados emocionales:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {moodPresets.map((preset, i) => (
              <button
                key={i}
                onClick={() => onSimulateMoodMessage(preset.text, preset.mood)}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium border border-slate-800 text-left transition-colors cursor-pointer flex items-center gap-1 truncate"
                title={preset.text}
              >
                <span className="truncate">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
