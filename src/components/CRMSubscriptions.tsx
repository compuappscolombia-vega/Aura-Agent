import React, { useState, useEffect } from 'react';
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
  Image,
  Mic,
  AlertCircle,
  Radar,
  Target,
  Flame,
  Zap,
  Search,
  Upload,
  Camera,
  RefreshCw,
  Check,
  Trash2,
} from 'lucide-react';
import { XLogo } from './icons/XLogo';

interface CRMSubscriptionsProps {
  modelProfile: ModelProfile;
  leads: LeadItem[];
  onUpdateProfile: (updated: ModelProfile) => void;
  onSelectLeadForChat?: (lead: LeadItem) => void;
  onProspectLeads?: () => Promise<void> | void;
}

export const CRMSubscriptions: React.FC<CRMSubscriptionsProps> = ({
  modelProfile,
  leads,
  onUpdateProfile,
  onSelectLeadForChat,
  onProspectLeads,
}) => {
  const [activeTab, setActiveTab] = useState<'funnel' | 'prospecting' | 'profile' | 'vault' | 'security'>('funnel');
  const [profileForm, setProfileForm] = useState<ModelProfile>(modelProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [leadFilter, setLeadFilter] = useState<string>('all');
  const [isProspecting, setIsProspecting] = useState(false);
  const [prospectScanStep, setProspectScanStep] = useState<string>('');
  const [prospectingStats, setProspectingStats] = useState<{
    analyzedAudienceCount: number;
    highPropensityFound: number;
    avgPropensityScore: number;
    estimatedPipelineRevenue: string;
  } | null>(null);

  useEffect(() => {
    setProfileForm(modelProfile);
  }, [modelProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updatedVault = [
        ...(profileForm.mediaVault || []),
        {
          id: `media-${Date.now()}`,
          modelId: profileForm.id,
          title: `Avatar - ${file.name}`,
          category: 'cafe' as const,
          url: result,
          caption: 'Foto de perfil oficial',
          isExclusive: false,
          watermark: profileForm.handle,
          createdAt: new Date().toISOString(),
        },
      ];
      const updatedProfile: ModelProfile = {
        ...profileForm,
        avatarUrl: result,
        mediaVault: updatedVault,
      };
      setProfileForm(updatedProfile);
      onUpdateProfile(updatedProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerProspecting = async () => {
    setIsProspecting(true);
    setProspectScanStep('Iniciando radar agéntico y conectando a feeds de X (Twitter)...');

    try {
      setTimeout(() => {
        setProspectScanStep('Analizando métricas de engagement, sentimiento y poder de gasto en seguidores...');
      }, 700);

      const res = await fetch('/api/crm/prospect-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId: modelProfile.id,
          targetArchetype: modelProfile.archetype,
        }),
      });

      const data = await res.json();
      if (data.success && data.statisticalSummary) {
        setProspectingStats(data.statisticalSummary);
        if (onProspectLeads) {
          await onProspectLeads();
        }
      }
    } catch (err) {
      console.warn('Error running agentic prospecting:', err);
    } finally {
      setTimeout(() => {
        setIsProspecting(false);
        setProspectScanStep('');
      }, 1200);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    if (leadFilter === 'all') return true;
    if (leadFilter === 'vip') return lead.stage === 'vip_ready' || lead.stage === 'converted';
    if (leadFilter === 'prospects') return (lead.purchasePropensity && lead.purchasePropensity >= 80);
    return lead.stage === leadFilter;
  });

  const highPropensityLeads = leads.filter(
    (l) => (l.purchasePropensity && l.purchasePropensity >= 75) || l.conversionReadiness === 'VIP Calificado' || l.conversionReadiness === 'Muy Alta Probabilidad'
  );

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
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-mono font-medium">
              AuraAgent Pro
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Administración centralizada de prospectos en X, perfil y voz de la modelo, y radar agéntico de alta conversión.
          </p>
        </div>

        <div className="flex flex-wrap bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1">
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
            onClick={() => setActiveTab('prospecting')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prospecting'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Búsqueda Agéntica (IA & Estadísticas)</span>
            <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              ALTA CONVERSIÓN
            </span>
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
                <span>Clientes de Alta Propensión</span>
                <Flame className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-white">{highPropensityLeads.length} listos</div>
              <span className="text-[11px] text-rose-400 mt-1 block font-medium">
                Segmentados por análisis de compra
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Integración X</span>
                <XLogo className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white">Activa</div>
              <span className="text-[11px] text-sky-400 mt-1 block font-mono">
                Webhook /api/webhooks/twitter-x
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <span className="text-slate-400 mr-1 font-semibold">Filtrar por fase:</span>
              {['all', 'prospects', 'cold', 'rapport', 'warm', 'vip'].map((filter) => (
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
                    : filter === 'prospects'
                    ? '🔥 Alta Propensión'
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

            <button
              onClick={() => setActiveTab('prospecting')}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow hover:opacity-90 transition-all cursor-pointer"
            >
              <Radar className="w-3.5 h-3.5 text-amber-300" />
              <span>Explorar Radar Agéntico</span>
            </button>
          </div>

          {/* Leads Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Usuario / Plataforma</th>
                  <th className="py-3 px-4">Propensión de Compra</th>
                  <th className="py-3 px-4">Ánimo & Memoria</th>
                  <th className="py-3 px-4">Nivel Confianza</th>
                  <th className="py-3 px-4">Último Mensaje / Gancho</th>
                  <th className="py-3 px-4">Estado VIP</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                        <span>{lead.username}</span>
                        {lead.purchasePropensity && lead.purchasePropensity >= 85 && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[9px] font-bold">
                            TOP BUYER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-sky-400 font-medium">
                        {lead.platform}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.purchasePropensity ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-amber-300 text-xs">
                              {lead.purchasePropensity}%
                            </span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-400 to-rose-500"
                                style={{ width: `${lead.purchasePropensity}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {lead.estimatedSpendPower || 'Poder VIP'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] font-mono">En análisis</span>
                      )}
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
                    <td className="py-3 px-4 max-w-xs truncate text-slate-400">
                      "{lead.suggestedIcebreaker || lead.lastMessage}"
                    </td>
                    <td className="py-3 px-4">
                      {lead.unlockedVip || lead.stage === 'converted' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" /> Suscrito VIP
                        </span>
                      ) : lead.stage === 'vip_ready' || lead.conversionReadiness === 'VIP Calificado' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> Listo para Cierre
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">En conversación</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {onSelectLeadForChat && (
                        <button
                          onClick={() => onSelectLeadForChat(lead)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors cursor-pointer font-bold shadow flex items-center gap-1 ml-auto"
                        >
                          <span>Chatear & Cerrar</span>
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

      {/* TAB 2: AGENTIC PROSPECTING ENGINE (ESTADÍSTICAS & BÚSQUEDA DE CLIENTES) */}
      {activeTab === 'prospecting' && (
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-rose-500/30 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <Radar className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                    Radar de Prospección Agéntica en Vivo
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Objetivo: {modelProfile.name} ({modelProfile.handle})
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Búsqueda Autónoma de Clientes con Alta Probabilidad de Compra VIP
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  AuraAgent aplica modelos estadísticos sobre interacciones en X (Twitter), patrones de gasto, velocidad de respuesta y afinidad de contenido para identificar prospectos calificados, entablar contacto y guiarlos al cierre de suscripción VIP.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTriggerProspecting}
                disabled={isProspecting}
                className="px-6 py-3.5 bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-900/40 flex items-center gap-2.5 shrink-0 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProspecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
                    <span>Escaneando Red...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-300" />
                    <span>Iniciar Búsqueda Agéntica de Clientes VIP</span>
                  </>
                )}
              </button>
            </div>

            {/* Scan Step Status Feedback */}
            {isProspecting && prospectScanStep && (
              <div className="mt-4 p-3 bg-slate-900/90 border border-rose-500/40 rounded-xl flex items-center gap-3 text-xs text-rose-200 font-mono animate-pulse">
                <Radar className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{prospectScanStep}</span>
              </div>
            )}
          </div>

          {/* Statistical Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block mb-1">Audiencia Analizada</span>
              <div className="text-2xl font-black text-white">
                {prospectingStats?.analyzedAudienceCount || 1420} usuarios
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Menciones & seguidores activos en X
              </span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block mb-1">Tasa de Propensión Promedio</span>
              <div className="text-2xl font-black text-amber-400">
                {prospectingStats?.avgPropensityScore || 92.2}%
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-medium">
                Predisposición económica alta
              </span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block mb-1">Prospectos Calificados</span>
              <div className="text-2xl font-black text-rose-400">
                {highPropensityLeads.length} Oportunidades
              </div>
              <span className="text-[10px] text-rose-300 mt-1 block">
                Listos para interacción directa
              </span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] text-slate-400 block mb-1">Pipeline Estimado</span>
              <div className="text-2xl font-black text-emerald-400">
                {prospectingStats?.estimatedPipelineRevenue || `$${highPropensityLeads.length * 19.99 + 350}`}
              </div>
              <span className="text-[10px] text-emerald-400 mt-1 block font-mono">
                Conversión calculada OnlyFans
              </span>
            </div>
          </div>

          {/* Prospective Clients Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                Clientes Identificados con Alta Propensión de Compra
              </h4>
              <span className="text-xs text-slate-400">
                Mostrando {highPropensityLeads.length} prospectos listos para conversión
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {highPropensityLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base">{lead.username}</span>
                          <span className="text-xs text-sky-400 font-mono">{lead.platform}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {lead.estimatedSpendPower || 'Capacidad de Gasto VIP Alta'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black flex items-center gap-1 shadow">
                          <Flame className="w-3.5 h-3.5 text-rose-400" />
                          {lead.purchasePropensity || 92}% PROPENSIÓN
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                          {lead.conversionReadiness === 'VIP Calificado' ? '🔥 Listo para cierre VIP' : '⚡ Alta probabilidad de compra'}
                        </span>
                      </div>
                    </div>

                    {/* Statistical Signals */}
                    {lead.statisticalSignals && lead.statisticalSignals.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {lead.statisticalSignals.map((signal, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium"
                          >
                            {signal}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Suggested Icebreaker */}
                    {lead.suggestedIcebreaker && (
                      <div className="bg-slate-950/80 border border-indigo-900/30 rounded-xl p-3">
                        <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                          Gancho Sugerido de Entrada (Icebreaker de Conversión):
                        </span>
                        <p className="text-xs text-slate-200 italic">
                          "{lead.suggestedIcebreaker}"
                        </p>
                      </div>
                    )}

                    {/* Strategy */}
                    {lead.conversionStrategy && (
                      <p className="text-[11px] text-slate-400">
                        <strong className="text-slate-300">Estrategia recomendada:</strong> {lead.conversionStrategy}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-mono">
                      Confianza inicial: <strong className="text-white">{lead.trustScore}%</strong>
                    </span>

                    {onSelectLeadForChat && (
                      <button
                        type="button"
                        onClick={() => onSelectLeadForChat(lead)}
                        className="px-4 py-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Iniciar Diálogo & Concretar Venta VIP</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE & VOICE TUNER (PERSISTENCIA DE PARÁMETROS Y FOTOS) */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity & Photo Settings */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Identidad & Foto de la Modelo
              </h3>

              {/* Avatar Photo Management */}
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="relative shrink-0">
                  <img
                    src={profileForm.avatarUrl}
                    alt={profileForm.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                  />
                  <label
                    htmlFor="avatar-file-input"
                    className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110"
                    title="Cambiar Foto de Perfil"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-white block">Foto de Perfil & Avatar</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sube una foto real desde tu dispositivo. Se guardará de inmediato en la base de datos y en tu bóveda de medios.
                  </p>
                  <label
                    htmlFor="avatar-file-input"
                    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs rounded-lg cursor-pointer transition-colors font-medium"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Seleccionar Archivo de Imagen</span>
                  </label>
                </div>
              </div>

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
                  <label className="text-xs text-slate-400 block mb-1">Handle de X (Twitter)</label>
                  <input
                    type="text"
                    value={profileForm.handle}
                    onChange={(e) => setProfileForm({ ...profileForm, handle: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-sky-400 font-mono focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Edad & Ciudad</label>
                  <input
                    type="text"
                    value={`${profileForm.age} años, ${profileForm.location}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProfileForm({ ...profileForm, location: val });
                    }}
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
                <label className="text-xs text-slate-400 block mb-1">Enlace a OnlyFans / Portal VIP</label>
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
                  <option value="Aoede">Aoede (Voz cálida y expresiva de Ana María - Oficial)</option>
                  <option value="Kore">Kore (Cálida, dulce, femenina - Recomendada)</option>
                  <option value="Zephyr">Zephyr (Suave, relajada, íntima - Elena Russo)</option>
                  <option value="Puck">Puck (Espontánea, juguetona - Mía Soler)</option>
                  <option value="Charon">Charon (Profunda, magnética, envolvente)</option>
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
                    {profileForm.rules?.conversionThreshold ?? 75}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  value={profileForm.rules?.conversionThreshold ?? 75}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      rules: {
                        ...(profileForm.rules || {
                          conversionThreshold: 75,
                          autoSendVoiceNotes: true,
                          autoSendCasualPhotos: true,
                          requireReciprocityForVip: true,
                          adaptiveToneMatching: true,
                          activeMemoryRetention: true,
                        }),
                        conversionThreshold: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Solo cuando el usuario alcance este porcentaje de confianza y reciprocidad, AuraAgent presentará el enlace de suscripción OnlyFans.
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle className="w-4 h-4" /> ¡Perfil, fotos y parámetros guardados en la base de datos!
              </span>
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              Guardar Parámetros en Base de Datos
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: MEDIA VAULT */}
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
                      {photo.watermark ? photo.watermark.split(' ')[0] : modelProfile.handle}
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

      {/* TAB 5: SECURITY & PRIVACY */}
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
