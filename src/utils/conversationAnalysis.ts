/**
 * Pure analytical engine for emotional resonance, communication styles,
 * fact extraction, and VIP conversion readiness metrics.
 */

export type DetectedMood = 'contento' | 'triste' | 'serio' | 'cortante' | 'enojado' | 'coqueto' | 'timido';

export type DetectedStyle =
  | 'Expresivo y Emojis'
  | 'Monosilábico y Seco'
  | 'Directo y Coqueto'
  | 'Formal y Reservado'
  | 'Vulnerable y Emotivo';

export interface EmotionAnalysisResult {
  mood: DetectedMood;
  style: DetectedStyle;
  moodIntensity: number;
  approach: string;
}

export function analyzeEmotionAndStyle(text: string): EmotionAnalysisResult {
  const lower = text.toLowerCase().trim();
  let mood: DetectedMood = 'contento';
  let style: DetectedStyle = 'Expresivo y Emojis';
  let moodIntensity = 6;
  let approach = 'Responder con calidez y cercanía natural.';

  // 1. Check cortante (dry, monosyllabic, minimal effort)
  const words = lower.split(/\s+/).filter(Boolean);
  const dryKeywords = ['ok', 'si', 'no', 'ya', 'bien', 'nada', 'ajá', 'aja', 'vale', 'sep', 'nop', 'claro', 'normal'];
  if (words.length <= 2 && dryKeywords.some((w) => lower === w || lower.startsWith(w))) {
    return {
      mood: 'cortante',
      style: 'Monosilábico y Seco',
      moodIntensity: 7,
      approach: 'No abrumar con textos largos. Responder con intriga pícara, un toque de humor o dejarle espacio sin insistir.',
    };
  }

  // 2. Check enojado / molesto / suspicaz
  const angryKeywords = [
    'enojado', 'molesto', 'harto', 'estafa', 'mentira', 'mierda', 'pesada', 'rabia', 'odio',
    'carajo', 'no jodas', 'timo', 'farsa', 'engaño', 'engañar', 'pesado'
  ];
  if (angryKeywords.some((w) => lower.includes(w)) || (lower.includes('!') && lower === lower.toUpperCase() && lower.length > 5)) {
    return {
      mood: 'enojado',
      style: 'Directo y Coqueto',
      moodIntensity: 8,
      approach: 'Desactivar tensión: no ponerte a la defensiva, responder con dulzura, paciencia y calma desarmante.',
    };
  }

  // 3. Check triste / vulnerable / desanimado
  const sadKeywords = [
    'triste', 'mal día', 'mal dia', 'pesado', 'cansado', 'desanimado', 'depre', 'bajón', 'bajon',
    'solo', 'dolor', 'agobiado', 'llorar', 'estresado', 'estrés', 'estres', 'problema', 'soledad', 'pena', 'desastre'
  ];
  if (sadKeywords.some((w) => lower.includes(w))) {
    return {
      mood: 'triste',
      style: 'Vulnerable y Emotivo',
      moodIntensity: 8,
      approach: 'Refugio emocional: validar sus sentimientos, escuchar con ternura, NO ofrecer nada comercial y brindar apoyo sincero.',
    };
  }

  // 4. Check coqueto / seductor
  const flirtyKeywords = [
    'hermosa', 'linda', 'preciosa', 'guapa', 'bombón', 'bombon', 'cuerpo', 'sexy', 'me encantas',
    'me gustas', 'beso', 'reina', 'ojazos', 'amor', 'privado', 'cama', 'solos', 'diosa', 'bomba'
  ];
  const hasFlirtyEmojis = /[😍🥰😘🔥😏🤤💋❤️]/u.test(text);
  if (flirtyKeywords.some((w) => lower.includes(w)) || hasFlirtyEmojis) {
    return {
      mood: 'coqueto',
      style: 'Directo y Coqueto',
      moodIntensity: 8,
      approach: 'Correspondencia de energía: responder con picardía, devolver el coqueteo con elegancia y mantener la intriga.',
    };
  }

  // 5. Check tímido
  const shyKeywords = [
    'perdón', 'perdon', 'disculpa', 'no sé qué decir', 'no se que decir', 'pena', 'vergüenza',
    'verguenza', 'un poco tímido', 'un poco timido', 'no quiero molestar'
  ];
  if (shyKeywords.some((w) => lower.includes(w))) {
    return {
      mood: 'timido',
      style: 'Formal y Reservado',
      moodIntensity: 6,
      approach: 'Hacerlo sentir seguro y en confianza, asegurarle con ternura que encanta hablar con él.',
    };
  }

  // 6. Check serio / formal
  const formalKeywords = ['estimada', 'saludos', 'cordial', 'quisiera consultar', 'le escribo', 'correcto', 'entendido', 'disculpe', 'agradezco', 'gracias por su tiempo'];
  if (formalKeywords.some((w) => lower.includes(w)) || (!lower.includes('jaja') && !/[😊😄😂❤️]/u.test(text) && text.length > 35 && !text.includes('!'))) {
    return {
      mood: 'serio',
      style: 'Formal y Reservado',
      moodIntensity: 5,
      approach: 'Responder con inteligencia, vocabulario cuidado y empatía antes de romper la formalidad poco a poco.',
    };
  }

  // Default: Contento / Casual
  return {
    mood: 'contento',
    style: 'Expresivo y Emojis',
    moodIntensity: 7,
    approach: 'Compartir buena vibra, complicidad, risas y anécdotas de la vida cotidiana.',
  };
}

export function extractLearnedFacts(text: string): string[] {
  const lower = text.toLowerCase();
  const facts: string[] = [];

  if (lower.includes('trabajo') || lower.includes('oficina') || lower.includes('empresa') || lower.includes('chamba') || lower.includes('jefe') || lower.includes('negocio')) {
    facts.push('Mencionó sobre su trabajo o jornada laboral');
  }
  if (lower.includes('perro') || lower.includes('gato') || lower.includes('mascota')) {
    facts.push('Tiene mascota o le gustan los animales');
  }
  if (lower.includes('gym') || lower.includes('entren') || lower.includes('ejercicio') || lower.includes('correr') || lower.includes('pesas')) {
    facts.push('Entrena o cuida su físico');
  }
  if (lower.includes('café') || lower.includes('cafe') || lower.includes('té') || lower.includes('te')) {
    facts.push('Le gusta el café o bebidas calientes');
  }
  if (lower.includes('viaj') || lower.includes('vuelo') || lower.includes('playa') || lower.includes('vacaci')) {
    facts.push('Le gusta viajar o tiene planes de vacaciones');
  }
  if (lower.includes('solo') || lower.includes('soltero') || lower.includes('aburrido')) {
    facts.push('Busca compañía o momentos de desconexión íntima');
  }

  return facts;
}

export function calculateTrustMetrics(params: {
  currentTrust: number;
  messageText: string;
  mood: DetectedMood;
  isReciprocal: boolean;
  vipThreshold?: number;
}): {
  newTrustScore: number;
  stage: 'cold' | 'rapport' | 'intimacy' | 'vip_ready';
  isVipReady: boolean;
} {
  const { currentTrust, messageText, mood, isReciprocal, vipThreshold = 75 } = params;
  let delta = 0;

  if (mood === 'coqueto') delta += 6;
  else if (mood === 'contento') delta += 5;
  else if (mood === 'triste') delta += 3; // Empathy connection
  else if (mood === 'timido') delta += 4;
  else if (mood === 'cortante') delta -= 1; // Needs gentle warming up
  else if (mood === 'enojado') delta -= 3;

  if (isReciprocal && messageText.length > 20) {
    delta += 3;
  }

  const newTrustScore = Math.min(100, Math.max(10, currentTrust + delta));

  let stage: 'cold' | 'rapport' | 'intimacy' | 'vip_ready' = 'cold';
  if (newTrustScore >= vipThreshold) {
    stage = 'vip_ready';
  } else if (newTrustScore >= 60) {
    stage = 'intimacy';
  } else if (newTrustScore >= 35) {
    stage = 'rapport';
  }

  return {
    newTrustScore,
    stage,
    isVipReady: newTrustScore >= vipThreshold,
  };
}
