import React, { useState } from 'react';
import { ModelProfile, LeadItem } from '../types';
import { CASUAL_PHOTOS, VIP_TEASERS } from '../utils/mediaVault';
import {
  Users,
  DollarSign,
  TrendingUp,
  Sparkles,
  Sliders,
  Shield,
  Key,
  Lock,
  Eye,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Clock,
  Save,
  Twitter,
  Image,
  Mic,
  AlertCircle,
} from 'lucide-react';

interface CRMSubscriptionsProps {
  modelProfile: ModelProfile;
  leads: LeadItem[];
  onUpdateProfile: (updated: ModelProfile) => void;
  onSelectLeadForChat?: (lead: LeadItem) => void;
}

export const CRMSubscriptions: React.FC<CRMSubscriptionsProps> = ({
  modelProfile,
  leads,
  onUpdateProfile,
  onSelectLeadForChat,
}) => {
  const [activeTab, setActiveTab] = useState<'funnel' | 'profile' | 'vault' | 'security'>('funnel');
  const [profileForm, setProfileForm] = useState<ModelProfile>(modelProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [leadFilter, setLeadFilter] = useState<string>('all');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const filteredLeads = leads.filter((lead) => {
    if (leadFilter === 'all') return true;
    if (leadFilter === 'vip') return lead.stage === 'vip_ready' || lead.stage === 'converted';
    return lead.stage === leadFilter;
  });

  const totalVipRevenue = leads
    .filter((l) => l.unlockedVip || l.stage === 'converted')
    .length * 19.99 + 4250;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
      {/* Top Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Panel de Control & CRM de Suscripciones</span>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono font-medium">
              AuraAgent Pro
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Administración centralizada de prospectos de X (Twitter), perfil de la modelo y tasas de conversión.
          </p>
        </div>

        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('funnel')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'funnel'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Embudo & Leads ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Perfil & Voz de la Modelo</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'vault'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>Bóveda de Medios</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Seguridad & Privacidad</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FUNNEL & LEADS PIPELINE */}
      {activeTab === 'funnel' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Ingresos Recurrentes (MRR)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white">${totalVipRevenue.toLocaleString()}</div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                <TrendingUp className="w-3 h-3" /> +24.8% este mes
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Tasa de Conversión</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">22.4%</div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                7x más alta que enlaces directos
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Mensajes Promedio al Cierre</span>
                <MessageSquare className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">6.8 msgs</div>
              <span className="text-[11px] text-indigo-400 mt-1 block">
                Punto de confianza óptimo
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Integración X (Twitter)</span>
                <Twitter className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white">Activa</div>
              <span className="text-[11px] text-sky-400 mt-1 block font-mono">
                Webhook /api/webhooks/twitter-x
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 mr-1 font-semibold">Filtrar por fase:</span>
              {['all', 'cold', 'rapport', 'warm', 'vip'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setLeadFilter(filter)}
                  className={`px-3 py-1 rounded-xl capitalize transition-colors cursor-pointer ${
                    leadFilter === filter
                      ? 'bg-slate-800 text-white border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'all'
                    ? 'Todos'
                    : filter === 'cold'
                    ? 'Contacto Inicial'
                    : filter === 'rapport'
                    ? 'En Conexión'
                    : filter === 'warm'
                    ? 'Alta Confianza'
                    : 'Listos para VIP'}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Usuario / Plataforma</th>
                  <th className="py-3 px-4">Ánimo & Memoria</th>
                  <th className="py-3 px-4">Nivel Confianza</th>
                  <th className="py-3 px-4">Reciprocidad</th>
                  <th className="py-3 px-4">Último Mensaje</th>
                  <th className="py-3 px-4">Estado VIP</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm">{lead.username}</div>
                      <span className="text-[10px] text-sky-400 font-medium">
                        {lead.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.memory?.currentMood ? (
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                            {lead.memory.currentMood === 'triste' ? '🥺 Triste' :
                             lead.memory.currentMood === 'cortante' ? '🧊 Cortante' :
                             lead.memory.currentMood === 'coqueto' ? '😏 Coqueto' :
                             lead.memory.currentMood === 'enojado' ? '😤 Enojado' :
                             lead.memory.currentMood === 'serio' ? '🧐 Serio' : '😄 Contento'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {lead.memory.keyFacts.length} hechos aprendidos
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Analizando</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{lead.trustScore}%</span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              lead.trustScore >= 75
                                ? 'bg-rose-500'
                                : lead.trustScore >= 40
                                ? 'bg-amber-400'
                                : 'bg-sky-400'
                            }`}
                            style={{ width: `${lead.trustScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {lead.reciprocity}%
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      "{lead.lastMessage}"
                    </td>
                    <td className="py-3 px-4">
                      {lead.unlockedVip || lead.stage === 'converted' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> Suscrito VIP
                        </span>
                      ) : lead.stage === 'vip_ready' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> Listo para Enlace
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">En conversación</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onSelectLeadForChat && (
                        <button
                          onClick={() => onSelectLeadForChat(lead)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs rounded-lg transition-colors cursor-pointer font-medium"
                        >
                          Abrir Chat
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE & VOICE TUNER */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Settings */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Identidad de la Modelo
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Handle de X / Redes</label>
                  <input
                    type="text"
                    value={profileForm.handle}
                    onChange={(e) => setProfileForm({ ...profileForm, handle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Edad & Ciudad</label>
                  <input
                    type="text"
                    value={`${profileForm.age} años, ${profileForm.location}`}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Biografía & Personalidad</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Enlace a OnlyFans / VIP</label>
                <input
                  type="text"
                  value={profileForm.vipLink}
                  onChange={(e) => setProfileForm({ ...profileForm, vipLink: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Precio Promocional</label>
                  <input
                    type="text"
                    value={profileForm.vipPrice}
                    onChange={(e) => setProfileForm({ ...profileForm, vipPrice: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Código de Descuento</label>
                  <input
                    type="text"
                    value={profileForm.vipDiscountCode}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, vipDiscountCode: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Voice & Synthesis Tuning */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400" />
                Configuración de Síntesis de Voz (TTS)
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Voz Base (Modelo Gemini TTS)
                </label>
                <select
                  value={profileForm.voice.name}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      voice: { ...profileForm.voice, name: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                >
                  <option value="Kore">Kore (Cálida, dulce, femenina - Recomendada)</option>
                  <option value="Zephyr">Zephyr (Suave, relajada, íntima)</option>
                  <option value="Aoede">Aoede (Expresiva, juvenil, brillante)</option>
                  <option value="Puck">Puck (Espontánea, juguetona)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Acento & Modulación</label>
                <input
                  type="text"
                  value={profileForm.voice.accent}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      voice: { ...profileForm.voice, accent: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Directiva de Estilo de Voz (Prompt TTS)
                </label>
                <textarea
                  rows={2}
                  value={profileForm.voice.description}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      voice: { ...profileForm.voice, description: e.target.value },
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Conversion Threshold */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-300">
                    Umbral de Confianza Requerido para VIP:
                  </span>
                  <span className="font-bold text-amber-400">
                    {profileForm.rules.conversionThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={profileForm.rules.conversionThreshold}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      rules: {
                        ...profileForm.rules,
                        conversionThreshold: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Solo cuando el usuario alcance este porcentaje de confianza y reciprocidad, el
                  agente recomendará el enlace VIP.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-4 h-4" /> ¡Perfil actualizado exitosamente!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Cambios
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: MEDIA VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Fotos Cotidianas Reales (Para Generar Interés No Explícito)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Fotos normales del día a día enviadas estratégicamente por el bot para generar química y credibilidad real.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.values(CASUAL_PHOTOS).map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group shadow-md"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-white/90 font-mono">
                      {photo.watermark}
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-xs text-white">{photo.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{photo.caption}</p>
                    <span className="inline-block mt-2 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">
                      ✓ Aprobada para Chat Casual
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-sm font-bold text-white mb-1">
              Catálogo de Teasers VIP Bloqueados (OnlyFans / Portal Privado)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Packs que el agente utiliza como gancho cuando la confianza supera el umbral.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VIP_TEASERS.map((teaser) => (
                <div
                  key={teaser.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center"
                >
                  <div className="w-20 h-24 rounded-xl overflow-hidden relative shrink-0">
                    <img
                      src={teaser.blurUrl}
                      alt=""
                      className="w-full h-full object-cover blur-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-rose-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-xs text-white">{teaser.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1">{teaser.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold text-amber-400">{teaser.price}</span>
                      {teaser.tags.map((t, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & PRIVACY */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Protocolos de Seguridad y Encriptación Extremo a Extremo
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cumplimiento estricto de privacidad del usuario. Las fotos se sirven con marcas de agua dinámicas antifiltraciones y las sesiones cuentan con cifrado criptográfico.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
                    <Key className="w-4 h-4 text-amber-400" />
                    Huella de Sesión Cifrada
                  </div>
                  <span className="text-xs font-mono text-indigo-400 break-all block mt-1">
                    {modelProfile.security.fingerprintHash}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 mt-3 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Verificación SHA-256 Activa
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Protección Antifiltración
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Marcas de agua invisibles y visibles con hash de usuario para evitar redistribución no autorizada.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 mt-3 font-semibold">
                  100% Protegido
                </span>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-white mb-1">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Anonimato Total del Usuario
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    No se requiere KYC ni número telefónico del visitante para chatear.
                  </p>
                </div>
                <span className="text-[10px] text-indigo-400 mt-3 font-semibold">
                  Modo Sigilo Habilitado
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
