import React, { useState, useRef, useEffect } from 'react';
import {
  ChatMessage,
  ModelProfile,
  ConfidenceMetrics,
  PlatformType,
  UserMemory,
} from '../types';
import { CASUAL_PHOTOS } from '../utils/mediaVault';
import { VoiceNoteBubble } from './VoiceNoteBubble';
import { AudioVoiceRecorder } from './AudioVoiceRecorder';
import {
  Send,
  Mic,
  Shield,
  Lock,
  CheckCheck,
  Sparkles,
  ExternalLink,
  Heart,
  Maximize2,
  X,
  Eye,
  Info,
  Brain,
  Smile,
  Frown,
  Meh,
  Flame,
  AlertTriangle,
} from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  modelProfile: ModelProfile;
  metrics: ConfidenceMetrics;
  userMemory?: UserMemory;
  onSendMessage: (text: string) => void;
  onSendAudio: (audioBase64: string, durationSeconds: number, simulatedTranscription?: string) => void;
  isModelTyping: boolean;
  platformSkin: 'X (Twitter)' | 'Web';
  onChangeSkin: (skin: 'X (Twitter)' | 'Web') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  modelProfile,
  metrics,
  userMemory,
  onSendMessage,
  onSendAudio,
  isModelTyping,
  platformSkin,
  onChangeSkin,
}) => {
  const [inputText, setInputText] = useState('');
  const [showRecorder, setShowRecorder] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [likedMessageIds, setLikedMessageIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isModelTyping]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const toggleLike = (id: string) => {
    setLikedMessageIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentMood = userMemory?.currentMood || metrics.detectedMood || 'contento';

  const quickPrompts = [
    { label: '😊 Coincidir', text: '¡Hola Valeria! Qué lindo coincidir contigo por aquí.' },
    { label: '🥺 Mal día (Triste)', text: 'Tuve un día súper pesado y me siento algo desanimado...' },
    { label: '🧊 Cortante', text: 'ok' },
    { label: '😏 Coqueto', text: 'Me encantas bombón, te ves divina en esa foto 🔥' },
    { label: '☕ Café & Gym', text: '¿También entrenas temprano y tomas café matcha?' },
    { label: '🔒 Pedir VIP', text: '¿Tienes algún sitio privado con contenido exclusivo tuyo?' },
  ];

  const isXSkin = platformSkin === 'X (Twitter)';

  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'triste':
        return '🥺 Triste';
      case 'cortante':
        return '🧊 Cortante';
      case 'coqueto':
        return '😏 Coqueto';
      case 'enojado':
        return '😤 Enojado';
      case 'serio':
        return '🧐 Serio';
      case 'timido':
        return '🙈 Tímido';
      case 'contento':
      default:
        return '😄 Contento';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div
        className={`px-4 sm:px-5 py-3 border-b flex items-center justify-between shrink-0 transition-colors ${
          isXSkin
            ? 'bg-black/95 border-slate-800 text-white'
            : 'bg-slate-900/90 border-indigo-900/40 text-white'
        }`}
      >
        {/* User Info & Model Profile */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={modelProfile.avatarUrl}
              alt={modelProfile.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 ring-1 ring-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-white tracking-tight">
                {modelProfile.name}
              </h2>
              {/* Verified Badge */}
              <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-[10px] text-white font-bold">
                ✓
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{modelProfile.handle}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">En línea</span>
            </div>
          </div>
        </div>

        {/* Emotion & Memory indicator + Skin Controls */}
        <div className="flex items-center gap-2">
          {/* Real-time Detected Emotion Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[11px] font-medium text-slate-200">
            <Brain className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline text-slate-400 text-[10px] uppercase">Ánimo:</span>
            <span className="font-semibold text-rose-300">{getMoodEmoji(currentMood)}</span>
          </div>

          {/* Skin Toggle (X vs Web) */}
          <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
            <button
              onClick={() => onChangeSkin('X (Twitter)')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                isXSkin ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              X DMs
            </button>
            <button
              onClick={() => onChangeSkin('Web')}
              className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                !isXSkin ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Web VIP
            </button>
          </div>
        </div>
      </div>

      {/* Disappearing & Encryption Notice */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-1.5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <Shield className="w-3 h-3 text-indigo-400" />
        <span>
          Chat privado protegido con encriptación de extremo a extremo. Tu privacidad es 100% anónima.
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
            <div className="relative">
              <img
                src={modelProfile.avatarUrl}
                alt={modelProfile.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center justify-center gap-1.5">
                <span>{modelProfile.name}</span>
                <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-[10px] text-white font-bold">✓</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{modelProfile.handle} • Creadora Verificada</p>
              <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
                {modelProfile.bio}
              </p>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl max-w-xs text-xs text-slate-300">
              <p className="font-semibold text-rose-300 mb-1">💬 Deslízate en sus mensajes directos</p>
              <p className="text-[11px] text-slate-400">Escribe cualquier mensaje o haz una pregunta para iniciar una conversación real sin respuestas automáticas.</p>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isModel = msg.sender === 'model';
          const isLiked = likedMessageIds[msg.id];

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl relative group ${
                  isModel
                    ? 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm'
                    : 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                }`}
              >
                {/* Voice Note Payload */}
                {msg.mediaType === 'audio' ? (
                  <div className="p-1">
                    <VoiceNoteBubble
                      text={msg.text}
                      audioBase64={msg.audioBase64}
                      durationSeconds={msg.audioDuration || 6}
                      sender={msg.sender}
                      modelName={modelProfile.name}
                      voiceStyle={modelProfile.voice.description}
                      isEncrypted={msg.isEncrypted}
                    />
                  </div>
                ) : (
                  <div className="p-3.5">
                    {/* Attached Casual Photo */}
                    {msg.photoCategory && CASUAL_PHOTOS[msg.photoCategory] && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-white/10 relative group/img shadow-lg">
                        <img
                          src={CASUAL_PHOTOS[msg.photoCategory].url}
                          alt={CASUAL_PHOTOS[msg.photoCategory].title}
                          className="w-full max-h-72 object-cover cursor-pointer hover:scale-[1.02] transition-transform"
                          onClick={() =>
                            setActivePhotoModal(CASUAL_PHOTOS[msg.photoCategory!].url)
                          }
                        />
                        {/* Expand Button */}
                        <button
                          onClick={() =>
                            setActivePhotoModal(CASUAL_PHOTOS[msg.photoCategory!].url)
                          }
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        {/* Watermark Tag */}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] text-white/80 font-mono tracking-wider">
                          🔒 {CASUAL_PHOTOS[msg.photoCategory].watermark}
                        </div>
                      </div>
                    )}

                    {/* Text Message Content */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* VIP Link Card when triggered */}
                    {msg.pitchVip && (
                      <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-purple-950/60 border border-rose-500/40 shadow-xl">
                        <div className="flex items-center gap-2 mb-2 text-rose-300 font-semibold text-xs">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Pase Exclusivo VIP OnlyFans • Acceso Íntimo</span>
                        </div>
                        <p className="text-xs text-slate-300 mb-3">
                          Contenido sin censura, sets de fotos exclusivos, audios personalizados y chat prioritario 1 a 1 directo conmigo.
                        </p>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 line-through mr-1">$29.99</span>
                            <span className="text-sm font-extrabold text-amber-400">
                              {modelProfile.vipPrice}
                            </span>
                          </div>
                          <a
                            href={msg.vipLink || modelProfile.vipLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-all transform active:scale-95"
                          >
                            <span>Desbloquear Ahora</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Time & Checks */}
                <div
                  className={`px-3 pb-2 flex items-center justify-end gap-1.5 text-[10px] ${
                    isModel ? 'text-slate-500' : 'text-indigo-200'
                  }`}
                >
                  <Lock className="w-2.5 h-2.5 opacity-60" />
                  <span>{msg.timestamp}</span>
                  {!isModel && <CheckCheck className="w-3.5 h-3.5 text-sky-300" />}
                </div>

                {/* Like reaction button on hover */}
                {isModel && (
                  <button
                    onClick={() => toggleLike(msg.id)}
                    className={`absolute -right-3 -bottom-2 p-1 rounded-full border shadow-sm transition-transform active:scale-125 cursor-pointer ${
                      isLiked
                        ? 'bg-rose-500 border-rose-400 text-white scale-110'
                        : 'bg-slate-800 border-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-rose-400'
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isModelTyping && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
            <img
              src={modelProfile.avatarUrl}
              alt=""
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
            />
            <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-2xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
              <span
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <span
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
              <span className="text-[11px] text-slate-400 ml-1">
                {modelProfile.name} está pensando...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] text-slate-500 font-semibold shrink-0">
          Sugerencias:
        </span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSendMessage(p.text)}
            title={p.text}
            className="px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition-colors cursor-pointer"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Voice Recorder Overlay */}
      {showRecorder && (
        <div className="p-3 border-t border-slate-800 bg-slate-950">
          <AudioVoiceRecorder
            onSendAudio={(audioBase64, duration, transcription) => {
              onSendAudio(audioBase64, duration, transcription);
              setShowRecorder(false);
            }}
            onCancel={() => setShowRecorder(false)}
          />
        </div>
      )}

      {/* Main Input Form */}
      {!showRecorder && (
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
        >
          {/* Toggle Voice Recorder Button */}
          <button
            type="button"
            onClick={() => setShowRecorder(true)}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            title="Grabar nota de voz"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Escribe un mensaje privado para ${modelProfile.name}...`}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-full px-4 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isModelTyping}
            className="p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}

      {/* Photo Lightbox Modal */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={activePhotoModal}
              alt="Foto ampliada"
              className="w-full rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="mt-2 text-center text-xs text-slate-400">
              🔒 Foto real de uso personal compartida en el chat • Cifrado de extremo a extremo
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
