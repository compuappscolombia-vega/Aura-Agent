import React, { useState } from 'react';
import { ModelProfile } from '../types';
import {
  Users,
  Check,
  Plus,
  Volume2,
  Sparkles,
  Flame,
  Globe,
  DollarSign,
  X,
  Sliders,
  Play,
  Heart,
  Crown,
  Edit3,
} from 'lucide-react';
import valeriaImg from '../assets/images/model_cafe_selfie_1793159131949.jpg';
import elenaImg from '../assets/images/elena_russo_avatar_1793188805781.jpg';
import miaImg from '../assets/images/mia_soler_avatar_1793188821717.jpg';
import camilaImg from '../assets/images/camila_torres_av_1793188837305.jpg';
import { generateSessionFingerprint } from '../utils/cryptoSim';

interface ModelCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelProfile[];
  activeModel: ModelProfile;
  onSelectModel: (model: ModelProfile) => void;
  onAddModel: (newModel: ModelProfile) => void;
  onUpdateModel: (updatedModel: ModelProfile) => void;
}

export const ModelCatalogModal: React.FC<ModelCatalogModalProps> = ({
  isOpen,
  onClose,
  models,
  activeModel,
  onSelectModel,
  onAddModel,
  onUpdateModel,
}) => {
  const [view, setView] = useState<'catalog' | 'create' | 'edit'>('catalog');
  const [editingModel, setEditingModel] = useState<ModelProfile | null>(null);

  // New model form state
  const [newModel, setNewModel] = useState<Partial<ModelProfile>>({
    name: '',
    handle: '@',
    age: 23,
    location: 'Madrid, España',
    avatarUrl: valeriaImg,
    archetype: 'Seductora & Cercana',
    tagline: 'Charlas cómplices, vida nocturna y contenido exclusivo',
    bio: 'Creadora de contenido y modelo. Hablando contigo por primera vez ✨',
    vipLink: 'https://onlyfans.com/nueva_modelo',
    vipPrice: '$19.99/mes',
    vipDiscountCode: 'VIP_PASS_30',
    voice: {
      name: 'Kore',
      pitch: 1.15,
      rate: 0.98,
      accent: 'Latino suave y dulce',
      description: 'Tono cercano, femenino, dulce y cálido',
    },
    rules: {
      conversionThreshold: 75,
      autoSendVoiceNotes: true,
      autoSendCasualPhotos: true,
      requireReciprocityForVip: true,
      adaptiveToneMatching: true,
      activeMemoryRetention: true,
    },
    skills: {
      semanticAccuracy: 95,
      naturalnessLevel: 98,
      emotionalEmpathy: 94,
      salesClosingAssertiveness: 'equilibrada',
      antiClichéFilter: true,
      storyContextAwareness: true,
    },
  });

  const [testingVoiceId, setTestingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestVoice = async (model: ModelProfile) => {
    setTestingVoiceId(model.id);
    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Hola, soy ${model.name}. Me encanta que hablemos por aquí, cuéntame qué planes tienes para hoy 😉`,
          voiceName: model.voice.name,
          stylePrompt: model.voice.description,
        }),
      });
      const data = await res.json();
      if (data?.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audio.play();
      } else if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(
          `Hola, soy ${model.name}. Me encanta que hablemos por aquí.`
        );
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // ignore
    } finally {
      setTimeout(() => setTestingVoiceId(null), 1200);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name || !newModel.handle) return;

    const created: ModelProfile = {
      id: `model-${Date.now()}`,
      name: newModel.name || 'Nueva Modelo',
      handle: newModel.handle?.startsWith('@') ? newModel.handle : `@${newModel.handle}`,
      age: newModel.age || 23,
      location: newModel.location || 'Miami, FL',
      avatarUrl: newModel.avatarUrl || valeriaImg,
      archetype: newModel.archetype || 'Seductora & Cercana',
      tagline: newModel.tagline || 'Exclusividad y complicidad',
      bio: newModel.bio || 'Creadora de contenido oficial',
      vipLink: newModel.vipLink || 'https://onlyfans.com',
      vipPrice: newModel.vipPrice || '$19.99/mes',
      vipDiscountCode: newModel.vipDiscountCode || 'VIP_AURA_20',
      voice: newModel.voice || {
        name: 'Kore',
        pitch: 1.15,
        rate: 0.98,
        accent: 'Latino suave',
        description: 'Voz femenina dulce y cercana',
      },
      rules: newModel.rules || {
        conversionThreshold: 75,
        autoSendVoiceNotes: true,
        autoSendCasualPhotos: true,
        requireReciprocityForVip: true,
        adaptiveToneMatching: true,
        activeMemoryRetention: true,
      },
      skills: newModel.skills || {
        semanticAccuracy: 95,
        naturalnessLevel: 98,
        emotionalEmpathy: 94,
        salesClosingAssertiveness: 'equilibrada',
        antiClichéFilter: true,
        storyContextAwareness: true,
      },
      security: {
        e2eEncryption: true,
        autoDestructTimer: 0,
        stealthMode: false,
        fingerprintHash: generateSessionFingerprint(),
      },
    };

    onAddModel(created);
    onSelectModel(created);
    setView('catalog');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Gestión de Modelos & Personalidades Reales
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  MULTI-MODELO AURA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cada modelo tiene su propia personalidad, acento de voz, enlaces de OnlyFans y cuenta de X
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === 'catalog' ? (
              <button
                onClick={() => setView('create')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nueva Modelo</span>
              </button>
            ) : (
              <button
                onClick={() => setView('catalog')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Volver al Catálogo
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          {view === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => {
                const isActive = activeModel.id === model.id;
                return (
                  <div
                    key={model.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col justify-between relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/80 shadow-xl shadow-indigo-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {!model.isSystemDefault ? (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-black flex items-center gap-1 z-10 shadow">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300" /> MODELO REAL INDEPENDIENTE
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/80 text-[9px] font-medium flex items-center gap-1 z-10 shadow">
                        Plantilla del Sistema
                      </div>
                    )}

                    {isActive && (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVA AHORA
                      </div>
                    )}

                    {/* Top Info */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={model.avatarUrl}
                        alt={model.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shrink-0 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">{model.name}</h4>
                          <span className="text-[11px] text-slate-400 font-mono">({model.age} años)</span>
                        </div>
                        <div className="text-xs text-sky-400 font-mono font-medium">
                          {model.handle}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{model.location}</span>
                        </div>
                        <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-bold">
                          {model.archetype}
                        </div>
                      </div>
                    </div>

                    {/* Tagline / Bio excerpt */}
                    <p className="text-xs text-slate-300 italic mt-3 line-clamp-2">
                      "{model.tagline || model.bio}"
                    </p>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/70 text-[11px]">
                      <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Voz Sintética:</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-indigo-400 font-semibold">{model.voice.name}</span>
                          <button
                            onClick={() => handleTestVoice(model)}
                            disabled={testingVoiceId === model.id}
                            className="p-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors cursor-pointer"
                            title="Escuchar muestra de voz"
                          >
                            <Volume2 className={`w-3.5 h-3.5 ${testingVoiceId === model.id ? 'animate-bounce' : ''}`} />
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-400 truncate block mt-0.5">
                          {model.voice.accent}
                        </span>
                      </div>

                      <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Suscripción OnlyFans:</span>
                        <div className="text-rose-400 font-bold mt-0.5">{model.vipPrice}</div>
                        <span className="text-[9px] text-slate-400 truncate block mt-0.5">
                          Umbral: {model.rules.conversionThreshold}% confianza
                        </span>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-4 flex items-center gap-2">
                      <button
                        onClick={() => {
                          onSelectModel(model);
                          onClose();
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-slate-800 text-slate-300 cursor-default'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Seleccionada
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            Activar para Chat & DMs de X
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === 'create' && (
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white">
                  Crear Nueva Modelo & Personalidad en Aura
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Añade a una nueva modelo real con su tono de comunicación, voz personalizada y cuenta de X.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Nombre Real:</label>
                  <input
                    type="text"
                    required
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    placeholder="Ej: Sofía Herrera"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Handle en X (Twitter):</label>
                  <input
                    type="text"
                    required
                    value={newModel.handle}
                    onChange={(e) => setNewModel({ ...newModel, handle: e.target.value })}
                    placeholder="@sofia_vip"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-sky-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Edad & Ubicación:</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newModel.age}
                      onChange={(e) => setNewModel({ ...newModel, age: parseInt(e.target.value) })}
                      className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white text-center focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newModel.location}
                      onChange={(e) => setNewModel({ ...newModel, location: e.target.value })}
                      placeholder="Madrid / CDMX"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Archetype & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Arquetipo de Personalidad:
                  </label>
                  <select
                    value={newModel.archetype}
                    onChange={(e) => setNewModel({ ...newModel, archetype: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Seductora & Cercana">Seductora & Cercana</option>
                    <option value="Elegante & Provocativa">Elegante & Provocativa</option>
                    <option value="Extrovertida & Fiestera">Extrovertida & Fiestera</option>
                    <option value="Fitness & Sweet Atrevida">Fitness & Sweet Atrevida</option>
                    <option value="Intelectual & Misteriosa">Intelectual & Misteriosa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">
                    Lema o Frase Distintiva:
                  </label>
                  <input
                    type="text"
                    value={newModel.tagline}
                    onChange={(e) => setNewModel({ ...newModel, tagline: e.target.value })}
                    placeholder="Ej: Noches de fiesta, fotos íntimas y risas compartidas"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Biografía Contextual (para el motor agentico):
                </label>
                <textarea
                  rows={2}
                  value={newModel.bio}
                  onChange={(e) => setNewModel({ ...newModel, bio: e.target.value })}
                  placeholder="Detalla cómo es la vida de la modelo, qué cosas le gustan para que Aura las cite de forma 100% natural..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Voice & OnlyFans */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                  <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    Voz Sintética TTS:
                  </div>
                  <div className="flex gap-2 mb-2">
                    {['Kore', 'Aoede', 'Puck'].map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() =>
                          setNewModel({
                            ...newModel,
                            voice: {
                              ...newModel.voice!,
                              name: v,
                            },
                          })
                        }
                        className={`flex-1 py-1 text-xs rounded-lg font-medium border transition-colors cursor-pointer ${
                          newModel.voice?.name === v
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newModel.voice?.accent}
                    onChange={(e) =>
                      setNewModel({
                        ...newModel,
                        voice: { ...newModel.voice!, accent: e.target.value },
                      })
                    }
                    placeholder="Acento / Modismos"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                  />
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3">
                  <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    Monetización OnlyFans:
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newModel.vipLink}
                      onChange={(e) => setNewModel({ ...newModel, vipLink: e.target.value })}
                      placeholder="https://onlyfans.com/..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono"
                    />
                    <input
                      type="text"
                      value={newModel.vipPrice}
                      onChange={(e) => setNewModel({ ...newModel, vipPrice: e.target.value })}
                      placeholder="$19.99/mes"
                      className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Umbral de cierre comercial:</span>
                    <span className="font-mono text-emerald-400">
                      {newModel.rules?.conversionThreshold}% confianza
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setView('catalog')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
                >
                  Guardar y Activar Modelo en Aura
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
