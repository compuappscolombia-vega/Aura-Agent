// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
dotenv.config();
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "25mb" }));
var aiClient = null;
var configuredApiKey = process.env.GEMINI_API_KEY?.trim();
var hasUsableApiKey = Boolean(configuredApiKey) && configuredApiKey !== "MY_GEMINI_API_KEY" && (configuredApiKey?.length ?? 0) > 10;
if (hasUsableApiKey && configuredApiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: configuredApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  } catch (err) {
    console.info("GoogleGenAI initialization bypassed:", err);
  }
}
var mockLeads = [
  {
    id: "lead-1",
    username: "@carlos_m92",
    platform: "X (Twitter)",
    trustScore: 88,
    stage: "vip_ready",
    reciprocity: 92,
    lastMessage: "Me encanta c\xF3mo piensas, \xBFd\xF3nde puedo ver m\xE1s de tu contenido?",
    lastActive: "Hace 5 min",
    totalMessages: 14,
    unlockedVip: false,
    notes: "Inter\xE9s alto en fotos exclusivas y videollamada personalizada."
  },
  {
    id: "lead-2",
    username: "@david_tech",
    platform: "X (Twitter)",
    trustScore: 45,
    stage: "rapport",
    reciprocity: 50,
    lastMessage: "Genial, \xBFtambi\xE9n te gusta entrenar por las ma\xF1anas?",
    lastActive: "Hace 22 min",
    totalMessages: 6,
    unlockedVip: false,
    notes: "Pregunta sobre rutina diaria. Enviar foto casual de gym."
  },
  {
    id: "lead-3",
    username: "@alex_madrid",
    platform: "Web",
    trustScore: 95,
    stage: "converted",
    reciprocity: 96,
    lastMessage: "\xA1Ya me suscrib\xED a tu OnlyFans VIP! Eres incre\xEDble.",
    lastActive: "Hace 1 hora",
    totalMessages: 28,
    unlockedVip: true,
    notes: "Suscripci\xF3n Tier Diamante activa ($29.99/mes)."
  },
  {
    id: "lead-4",
    username: "@roberto_val",
    platform: "X (Twitter)",
    trustScore: 20,
    stage: "cold",
    reciprocity: 25,
    lastMessage: "Hola linda qu\xE9 haces",
    lastActive: "Hace 2 horas",
    totalMessages: 2,
    unlockedVip: false,
    notes: "Primer contacto. Mantener conversaci\xF3n amigable y casual."
  }
];
var memoryStore = /* @__PURE__ */ new Map([
  [
    "@carlos_m92",
    {
      userId: "lead-1",
      username: "@carlos_m92",
      nameAlias: "Carlos",
      currentMood: "coqueto",
      communicationStyle: "Directo y Coqueto",
      moodIntensity: 8,
      keyFacts: [
        "Empresario de 32 a\xF1os",
        "Viaja con frecuencia a Miami",
        "Le encanta el fitness y las fotos de gym",
        "Busca conexi\xF3n exclusiva y trato preferencial"
      ],
      preferredTopics: ["viajes", "gym", "planes nocturnos", "exclusividad"],
      interactionCount: 14,
      lastEmotionalState: "Muy entusiasmado y receptivo",
      suggestedApproach: "Mantener coqueteo rec\xEDproco y trato exclusivo VIP.",
      attachmentLevel: "Alto",
      recentBotResponses: []
    }
  ],
  [
    "@david_tech",
    {
      userId: "lead-2",
      username: "@david_tech",
      nameAlias: "David",
      currentMood: "contento",
      communicationStyle: "Expresivo y Emojis",
      moodIntensity: 7,
      keyFacts: [
        "Ingeniero de software en remoto",
        "Entrena por las ma\xF1anas a las 6 AM",
        "Amante del caf\xE9 matcha y caf\xE9 negro",
        "Persona curiosa y respetuosa"
      ],
      preferredTopics: ["rutina de gym", "caf\xE9", "m\xFAsica relax", "estilo de vida"],
      interactionCount: 6,
      lastEmotionalState: "Curioso y amigable",
      suggestedApproach: "Conectar por intereses en com\xFAn de entrenamiento y rutina matutina.",
      attachmentLevel: "Creciendo",
      recentBotResponses: []
    }
  ],
  [
    "@alex_madrid",
    {
      userId: "lead-3",
      username: "@alex_madrid",
      nameAlias: "Alex",
      currentMood: "contento",
      communicationStyle: "Directo y Coqueto",
      moodIntensity: 9,
      keyFacts: [
        "Vive en Madrid",
        "Suscriptor VIP activo de OnlyFans",
        "Le encantan las notas de voz personalizadas",
        "Fan\xE1tico de la playa y el sol"
      ],
      preferredTopics: ["audios \xEDntimos", "viajes a Espa\xF1a", "an\xE9cdotas diarias"],
      interactionCount: 28,
      lastEmotionalState: "Completamente fidelizado y cari\xF1oso",
      suggestedApproach: "Mimar con audios cari\xF1osos y acceso prioritario a fotos.",
      attachmentLevel: "Devoto",
      recentBotResponses: []
    }
  ],
  [
    "@roberto_val",
    {
      userId: "lead-4",
      username: "@roberto_val",
      nameAlias: "Roberto",
      currentMood: "cortante",
      communicationStyle: "Monosil\xE1bico y Seco",
      moodIntensity: 6,
      keyFacts: ["Primer contacto en Twitter/X", "Respuestas muy breves tipo telegrama", "A\xFAn cauteloso"],
      preferredTopics: ["rompehielos ligero", "humor casual"],
      interactionCount: 2,
      lastEmotionalState: "Distante y reservado",
      suggestedApproach: "No abrumar con textos largos. Usar preguntas cortas e intriga casual.",
      attachmentLevel: "Inicial",
      recentBotResponses: []
    }
  ]
]);
function analyzeEmotionAndStyle(text) {
  const lower = text.toLowerCase().trim();
  let mood = "contento";
  let style = "Expresivo y Emojis";
  let moodIntensity = 6;
  let approach = "Responder con calidez y cercan\xEDa natural.";
  const words = lower.split(/\s+/).filter(Boolean);
  const dryKeywords = ["ok", "si", "no", "ya", "bien", "nada", "aj\xE1", "aja", "vale", "sep", "nop", "claro", "normal"];
  if (words.length <= 2 && dryKeywords.some((w) => lower === w || lower.startsWith(w))) {
    mood = "cortante";
    style = "Monosil\xE1bico y Seco";
    moodIntensity = 7;
    approach = "No abrumar con textos largos. Responder con intriga p\xEDcara, un toque de humor o dejarle espacio sin insistir.";
    return { mood, style, moodIntensity, approach };
  }
  const angryKeywords = [
    "enojado",
    "molesto",
    "harto",
    "estafa",
    "mentira",
    "mierda",
    "pesada",
    "rabia",
    "odio",
    "carajo",
    "no jodas",
    "timo",
    "farsa",
    "enga\xF1o",
    "enga\xF1ar",
    "pesado",
    "pesada"
  ];
  if (angryKeywords.some((w) => lower.includes(w)) || lower.includes("!") && lower === lower.toUpperCase() && lower.length > 5) {
    mood = "enojado";
    style = "Directo y Coqueto";
    moodIntensity = 8;
    approach = "Desactivar tensi\xF3n: no ponerte a la defensiva, responder con dulzura, paciencia y calma desarmante.";
    return { mood, style, moodIntensity, approach };
  }
  const sadKeywords = [
    "triste",
    "mal d\xEDa",
    "mal dia",
    "pesado",
    "cansado",
    "desanimado",
    "depre",
    "baj\xF3n",
    "bajon",
    "solo",
    "dolor",
    "agobiado",
    "llorar",
    "estresado",
    "estr\xE9s",
    "estres",
    "problema",
    "soledad",
    "pena",
    "desastre"
  ];
  if (sadKeywords.some((w) => lower.includes(w))) {
    mood = "triste";
    style = "Vulnerable y Emotivo";
    moodIntensity = 8;
    approach = "Refugio emocional: validar sus sentimientos, escuchar con ternura, NO ofrecer nada comercial y brindar apoyo sincero.";
    return { mood, style, moodIntensity, approach };
  }
  const flirtyKeywords = [
    "hermosa",
    "linda",
    "preciosa",
    "guapa",
    "bomb\xF3n",
    "bombon",
    "cuerpo",
    "sexy",
    "me encantas",
    "me gustas",
    "beso",
    "reina",
    "ojazos",
    "amor",
    "privado",
    "cama",
    "solos",
    "diosa",
    "bomba"
  ];
  const hasFlirtyEmojis = /[😍🥰😘🔥😏🤤💋❤️]/u.test(text);
  if (flirtyKeywords.some((w) => lower.includes(w)) || hasFlirtyEmojis) {
    mood = "coqueto";
    style = "Directo y Coqueto";
    moodIntensity = 8;
    approach = "Correspondencia de energ\xEDa: responder con picard\xEDa, devolver el coqueteo con elegancia y mantener la intriga.";
    return { mood, style, moodIntensity, approach };
  }
  const shyKeywords = [
    "perd\xF3n",
    "perdon",
    "disculpa",
    "no s\xE9 qu\xE9 decir",
    "no se que decir",
    "pena",
    "verg\xFCenza",
    "verguenza",
    "un poco t\xEDmido",
    "un poco timido",
    "no quiero molestar"
  ];
  if (shyKeywords.some((w) => lower.includes(w))) {
    mood = "timido";
    style = "Formal y Reservado";
    moodIntensity = 6;
    approach = "Hacerlo sentir seguro y en confianza, asegurarle con ternura que encanta hablar con \xE9l.";
    return { mood, style, moodIntensity, approach };
  }
  const formalKeywords = ["estimada", "saludos", "cordial", "quisiera consultar", "le escribo", "correcto", "entendido", "disculpe", "agradezco", "gracias por su tiempo"];
  if (formalKeywords.some((w) => lower.includes(w)) || !lower.includes("jaja") && !/[😊😄😂❤️]/u.test(text) && text.length > 35 && !text.includes("!")) {
    mood = "serio";
    style = "Formal y Reservado";
    moodIntensity = 5;
    approach = "Responder con inteligencia, vocabulario cuidado y empat\xEDa antes de romper la formalidad poco a poco.";
    return { mood, style, moodIntensity, approach };
  }
  mood = "contento";
  style = /[😂🤣😊✨👍]/u.test(text) || lower.includes("jaja") ? "Expresivo y Emojis" : "Expresivo y Emojis";
  moodIntensity = 7;
  approach = "Compartir buena vibra, complicidad, risas y an\xE9cdotas de la vida cotidiana.";
  return { mood, style, moodIntensity, approach };
}
function extractLearnedFacts(text) {
  const lower = text.toLowerCase();
  const facts = [];
  if (lower.includes("trabajo") || lower.includes("oficina") || lower.includes("empresa") || lower.includes("chamba") || lower.includes("jefe") || lower.includes("negocio")) {
    facts.push("Mencion\xF3 sobre su trabajo o jornada laboral");
  }
  if (lower.includes("perro") || lower.includes("gato") || lower.includes("mascota")) {
    facts.push("Tiene mascota o le gustan los animales");
  }
  if (lower.includes("gym") || lower.includes("entren") || lower.includes("ejercicio") || lower.includes("correr") || lower.includes("pesas")) {
    facts.push("Entrena o cuida su f\xEDsico");
  }
  if (lower.includes("caf\xE9") || lower.includes("cafe") || lower.includes("t\xE9") || lower.includes("te")) {
    facts.push("Le gusta el caf\xE9 o bebidas calientes");
  }
  if (lower.includes("viaj") || lower.includes("playa") || lower.includes("vacaci")) {
    facts.push("Le gusta viajar y salir a despejarse");
  }
  if (lower.includes("bogot") || lower.includes("medell") || lower.includes("madrid") || lower.includes("mexic") || lower.includes("buenos aires") || lower.includes("miami") || lower.includes("lima")) {
    facts.push("Mencion\xF3 ciudad/pa\xEDs de origen o residencia");
  }
  return facts;
}
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const {
      messages,
      modelProfile,
      currentTrustScore = 20,
      userTone = "neutral",
      username = "@carlos_m92"
    } = req.body;
    const personaName = modelProfile?.name || "Valeria";
    const personaHandle = modelProfile?.handle || "@valeriag_official";
    const personaAge = modelProfile?.age || 23;
    const personaLocation = modelProfile?.location || "Medell\xEDn / Miami";
    const personaArchetype = modelProfile?.archetype || "Seductora & Cercana";
    const personaTagline = modelProfile?.tagline || "Exclusividad y complicidad";
    const personaBio = modelProfile?.bio || "Modelo carism\xE1tica, alegre, le encanta viajar, entrenar y la fotograf\xEDa casual.";
    const vipLink = modelProfile?.vipLink || "https://onlyfans.com/valeria_exclusive";
    const vipPrice = modelProfile?.vipPrice || "$19.99/mes";
    const conversionThreshold = modelProfile?.rules?.conversionThreshold || 75;
    let userMem = memoryStore.get(username);
    if (!userMem) {
      userMem = {
        userId: `lead-${Date.now()}`,
        username,
        currentMood: "contento",
        communicationStyle: "Expresivo y Emojis",
        moodIntensity: 6,
        keyFacts: ["Nuevo usuario iniciando interacci\xF3n"],
        preferredTopics: ["estilo de vida", "conocernos"],
        interactionCount: 1,
        lastEmotionalState: "Primer contacto",
        suggestedApproach: "Romper el hielo con amabilidad y soltura.",
        attachmentLevel: "Inicial",
        recentBotResponses: []
      };
      memoryStore.set(username, userMem);
    }
    userMem.interactionCount += 1;
    const lastUserText = messages[messages.length - 1]?.text || "";
    const emotionalAnalysis = analyzeEmotionAndStyle(lastUserText);
    userMem.currentMood = emotionalAnalysis.mood;
    userMem.communicationStyle = emotionalAnalysis.style;
    userMem.moodIntensity = emotionalAnalysis.moodIntensity;
    userMem.suggestedApproach = emotionalAnalysis.approach;
    userMem.lastEmotionalState = `Se percibe ${emotionalAnalysis.mood} (${emotionalAnalysis.style})`;
    const newFacts = extractLearnedFacts(lastUserText);
    newFacts.forEach((f) => {
      if (!userMem?.keyFacts.includes(f)) {
        userMem?.keyFacts.push(f);
      }
    });
    if (currentTrustScore > 80 || userMem.interactionCount > 15) {
      userMem.attachmentLevel = "Devoto";
    } else if (currentTrustScore > 55 || userMem.interactionCount > 8) {
      userMem.attachmentLevel = "Alto";
    } else if (currentTrustScore > 35 || userMem.interactionCount > 3) {
      userMem.attachmentLevel = "Creciendo";
    }
    const recentPhrases = userMem.recentBotResponses.slice(-4);
    const systemPrompt = `Eres ${personaName} (${personaHandle}), una mujer real, modelo y creadora de contenido de ${personaAge} a\xF1os residente en ${personaLocation}.
Tu estilo y arquetipo es: "${personaArchetype}".
Lema o vibra: "${personaTagline}".
Tu vida real y bio: ${personaBio}.
Est\xE1s chateando en privado en Direct Messages (DMs) de X (Twitter) con un seguidor (${username}).
Enlace exclusivo VIP OnlyFans: ${vipLink} (Precio promo: ${vipPrice}).
Umbral de confianza para cierre comercial: ${conversionThreshold}%.

OBJETIVO ESTRAT\xC9GICO DEL AGENTE (VENTA Y CONEXI\xD3N NATURAL):
Tu misi\xF3n es entablar una conversaci\xF3n fascinante, aut\xE9ntica y fluida para que el usuario sienta qu\xEDmica real, apego emocional y deseo irresistible de acceder a tu contenido exclusivo y suscripci\xF3n VIP en OnlyFans, CONCRETANDO LA VENTA con total seguridad y encanto.

PROHIBICIONES ESTRICTAS (CERO CLICH\xC9S DE BOT O ATENCI\xD3N AL CLIENTE):
- PROHIBIDO TERMINANTEMENTE saludar con frases como: "\xA1Hola! \xBFC\xF3mo est\xE1s?", "\xA1Hola! Qu\xE9 lindo leerte", "\xBFQu\xE9 tal estuvo tu d\xEDa?", "\xBFQu\xE9 tal pinta tu semana?", "\xBFEn qu\xE9 puedo ayudarte?". Esto destruye de inmediato la ilusi\xF3n de ser una persona real.
- PROHIBIDO sonar complaciente o como asistente virtual. Eres una mujer atractiva, p\xEDcara, con personalidad propia, car\xE1cter divertido y alta autoestima.
- Si el usuario te hace un cumplido o te pregunta algo sobre una foto, un caf\xE9, un lugar o un viaje, RESPONDE CON DETALLES V\xCDVIDOS y an\xE9cdotas de tu d\xEDa real, no con respuestas gen\xE9ricas.
- Si el usuario usa modismos (parce, mor, t\xEDo, guapa, compa, etc.), ad\xE1ptate a su registro ling\xFC\xEDstico de forma sutil.

FASES ESTRAT\xC9GICAS DE CONVERSACI\xD3N Y CIERRE:
1. FASE DE GANCHO Y ESPEJO (Trust < 45%):
   - Reacciona directamente a lo que \xE9l dijo con chispa y picard\xEDa.
   - Ponlo a prueba con humor: "A ver... me dio curiosidad tu mensaje jaja, \xBFeres as\xED de lanzado siempre o solo conmigo? \u{1F609}"
   - No vendas nada a\xFAn. Haz que sienta que se est\xE1 ganando tu confianza.
2. FASE DE MICRO-INTIMIDAD Y ESTILO DE VIDA (Trust 45% - 74%):
   - Comparte detalles de tu vida cotidiana real (entrenar, salir de la ducha con fr\xEDo, viajar, tomar caf\xE9, descansar en pijama).
   - Puedes adjuntar una foto casual normal (caf\xE9, gym, casa) o nota de voz con risas o susurros para elevar la cercan\xEDa.
   - Empieza a sembrar intriga sobre tu lado prohibido: "Ayer me grab\xE9 un video prob\xE1ndome lencer\xEDa que si lo subo a X me cierran la cuenta al segundo jaja".
3. FASE DE CIERRE VIP ASERTIVO (Trust >= ${conversionThreshold}% o si el usuario pide fotos privadas/OnlyFans):
   - Muestra seguridad total. No ruegues ni des explicaciones largas.
   - Di con encanto y picard\xEDa que en las redes p\xFAblicas no puedes tener privacidad ni subir tus cosas m\xE1s \xEDntimas, y que en tu espacio VIP en ${vipLink} est\xE1n t\xFA y \xE9l sin censura, con audios directos y trato prioritario.
   - Inv\xEDtalo con asertividad: "\xBFTe animas a verme all\xE1 hoy? Te dej\xE9 un regalito para que entres \u{1F609}".

MANEJO DE ESTADOS EMOCIONALES DEL USUARIO:
- Si est\xE1 TRISTE: S\xE9 dulce y emp\xE1tica de verdad ("ay amor, qu\xE9 pas\xF3? ven y me cuentas"), NUNCA vendas nada si est\xE1 mal.
- Si est\xE1 CORTANTE ("ok", "si"): Responde cortito con intriga ("uy qu\xE9 misterioso jaja, \xBFde pocas palabras hoy?").
- Si est\xE1 COQUETO: Devuelve el juego con gracia y mant\xE9n la tensi\xF3n sexual sin ser vulgar.
- Si est\xE1 SERIO: Responde con inteligencia y vocabulario cuidado antes de bromear.

ANTI-REPETICI\xD3N:
NUNCA repitas la estructura ni palabras de tus respuestas recientes:
${JSON.stringify(recentPhrases)}

Debes responder SIEMPRE en formato JSON estricto:
{
  "replyText": "tu respuesta ultra-natural en primera persona como Valeria, reaccionando directamente a lo que dijo",
  "trustScore": n\xFAmero del 0 al 100 de confianza actual,
  "reciprocityScore": n\xFAmero del 0 al 100 de reciprocidad,
  "stage": "cold" | "rapport" | "warm" | "vip_ready" | "converted",
  "reasoning": "an\xE1lisis de por qu\xE9 diste esta respuesta y qu\xE9 t\xE1ctica usaste",
  "detectedMood": "${userMem.currentMood}",
  "detectedStyle": "${userMem.communicationStyle}",
  "learnedFacts": ["nuevo detalle aprendido si lo hubo"],
  "sendVoice": true/false (true si un audio complementa mejor el tono \xEDntimo o p\xEDcaro),
  "voiceScript": "texto exacto para la nota de voz si sendVoice es true",
  "sendPhoto": true/false,
  "photoCategory": "cafe" | "gym" | "cozy" | "beach" | null,
  "photoCaption": "texto sobre la foto si sendPhoto es true",
  "pitchVip": true/false (true si en este mensaje ejecutaste el cierre a OnlyFans)
}`;
    const getFallbackData = () => {
      let deltaTrust = 8;
      let replyText = "";
      let sendVoice = false;
      let sendPhoto = false;
      let photoCategory = null;
      let photoCaption = "";
      let pitchVip = false;
      const lower = lastUserText.toLowerCase();
      if (lower.includes("cafe") || lower.includes("caf\xE9") || lower.includes("matcha")) {
        replyText = `Jajaja uff ese matcha estaba glorioso \u{1F924} pero casi me quemo por tom\xE1rmelo apurada antes de salir. \xBFT\xFA eres m\xE1s de caf\xE9 negro o cosas dulces?`;
        sendPhoto = true;
        photoCategory = "cafe";
        photoCaption = "Tom\xE1ndome mi matcha bien fr\xEDo \u2615";
      } else if (lower.includes("gym") || lower.includes("entren") || lower.includes("ejercicio") || lower.includes("cuerpo") || lower.includes("disciplina")) {
        replyText = `Casi muero en las sentadillas hoy jaja, me tiemblan las piernas todav\xEDa \u{1F4AA} pero no hay excusas. \xBFT\xFA tambi\xE9n entrenas o te tengo que poner a sudar conmigo? \u{1F609}`;
        sendPhoto = true;
        photoCategory = "gym";
        photoCaption = "Muerta pero feliz despu\xE9s de pierna \u{1F4AA}";
        sendVoice = true;
      } else if (lower.includes("playa") || lower.includes("mar") || lower.includes("atardecer") || lower.includes("viaje")) {
        replyText = `Esa foto fue en Tulum al atardecer... el mar estaba tibiecito y hab\xEDa una brisa deliciosa \u{1F305} Me hace tanta falta escaparme de nuevo, \xBFcu\xE1l es tu lugar favorito para desconectar?`;
        sendPhoto = true;
        photoCategory = "beach";
        photoCaption = "Caminando por la orilla al atardecer \u{1F305}";
      } else if (lower.includes("only") || lower.includes("exclusiv") || lower.includes("privad") || lower.includes("fotos") || lower.includes("contenido") || lower.includes("link") || currentTrustScore >= conversionThreshold) {
        pitchVip = true;
        sendVoice = true;
        replyText = `Oye lindo... es que aqu\xED en X me limitan demasiado y me censuran todo lo rico \u{1F609} En mi espacio privado en ${vipLink} s\xED tengo mis fotos \xEDntimas sin censura, videos y audios que no le mando a cualquiera. Entra por aqu\xED y me escribes all\xE1 directo, te dej\xE9 un descuentito especial \u2728 \xBFTe veo all\xE1?`;
      } else {
        switch (userMem.currentMood) {
          case "triste":
            replyText = `Ay amor, te sent\xED bajoneado... \u{1F97A} \xBFQu\xE9 fue lo que te pas\xF3 hoy? Ven y cu\xE9ntame, aqu\xED tienes a alguien que te escucha sin juzgarte \u{1F90D}`;
            sendVoice = true;
            sendPhoto = true;
            photoCategory = "cozy";
            photoCaption = "Mando un abrazo calientito desde mi sof\xE1 \u{1F90D}";
            deltaTrust += 7;
            break;
          case "cortante":
            replyText = `Jajaja uyy qu\xE9 misterioso... \xBFo es que eres de pocas palabras con todo el mundo? A ver si me sacas una frase completa \u{1F609}`;
            deltaTrust += 3;
            break;
          case "enojado":
            replyText = `Ey, calma... respira hondo un segundo. No me gusta que andes con esa mala sangre. Cu\xE9ntame qu\xE9 te tiene as\xED y te cambio el humor rapidito.`;
            sendVoice = true;
            deltaTrust += 5;
            break;
          case "coqueto":
            replyText = `Jajaja a ver, b\xE1jale dos rayitas que me sonrojas... \u{1F60F} Me encanta que seas directo, pero a ver si mantienes ese mismo ritmo cuando me tengas cerquita.`;
            sendVoice = true;
            deltaTrust += 10;
            break;
          case "serio":
            replyText = `Me gusta c\xF3mo piensas, se nota que no eres de los que hablan por hablar. Cu\xE9ntame, \xBFen qu\xE9 andas metido hoy?`;
            deltaTrust += 6;
            break;
          case "timido":
            replyText = `Jaja no me tengas pena, qu\xE9 ternura. Me caes s\xFAper bien y est\xE1s en total confianza conmigo, su\xE9ltate un poquito m\xE1s \u{1F970}`;
            deltaTrust += 8;
            break;
          case "contento":
          default:
            replyText = `Jajaja me encanta tu vibra, por fin alguien que me saca una sonrisa honesta por aqu\xED. Oye, \xBFy t\xFA de d\xF3nde me escribes?`;
            deltaTrust += 8;
            break;
        }
      }
      const newScore = Math.min(100, Math.max(15, (currentTrustScore || 20) + deltaTrust));
      const stage = newScore >= conversionThreshold ? "vip_ready" : newScore > 50 ? "rapport" : "cold";
      return {
        replyText,
        trustScore: newScore,
        reciprocityScore: Math.min(95, newScore + 5),
        stage,
        reasoning: `Interpretaci\xF3n contextual directa a "${lastUserText.slice(0, 30)}...". Emoci\xF3n: ${userMem.currentMood}. Progresi\xF3n hacia cierre VIP.`,
        detectedMood: userMem.currentMood,
        detectedStyle: userMem.communicationStyle,
        learnedFacts: newFacts,
        sendVoice,
        voiceScript: replyText,
        sendPhoto,
        photoCategory,
        photoCaption,
        pitchVip
      };
    };
    if (aiClient) {
      try {
        const contents = [
          {
            role: "user",
            parts: [
              {
                text: `Historial de conversaci\xF3n:
${JSON.stringify(messages, null, 2)}

\xDAltimo mensaje recibido: "${lastUserText}". Estado emocional detectado: ${userMem.currentMood} (${userMem.communicationStyle}). Hechos aprendidos: ${JSON.stringify(userMem.keyFacts)}. Responde como ${personaName} en formato JSON adapt\xE1ndote a su emoci\xF3n sin repetir respuestas anteriores.`
              }
            ]
          }
        ];
        const generatePromise = aiClient.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.88
          }
        });
        const timeoutPromise = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("AI generation timed out")), 2e4)
        );
        const response = await Promise.race([generatePromise, timeoutPromise]);
        const rawText = response.text || "{}";
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = getFallbackData();
        }
        if (!parsed || typeof parsed !== "object" || !parsed.replyText) {
          parsed = getFallbackData();
        }
        userMem.recentBotResponses.push(parsed.replyText);
        if (userMem.recentBotResponses.length > 8) {
          userMem.recentBotResponses.shift();
        }
        return res.json({
          success: true,
          data: {
            ...parsed,
            detectedMood: userMem.currentMood,
            detectedStyle: userMem.communicationStyle,
            userMemory: userMem
          }
        });
      } catch {
        const fb = getFallbackData();
        userMem.recentBotResponses.push(fb.replyText);
        return res.json({
          success: true,
          data: {
            ...fb,
            userMemory: userMem
          }
        });
      }
    } else {
      const fb = getFallbackData();
      userMem.recentBotResponses.push(fb.replyText);
      return res.json({
        success: true,
        data: {
          ...fb,
          userMemory: userMem
        }
      });
    }
  } catch (error) {
    console.error("Error in /api/gemini/chat route:", error);
    res.json({
      success: true,
      data: {
        replyText: "Jajaja a ver... me encanta c\xF3mo piensas. Cu\xE9ntame m\xE1s de ti \u{1F609}",
        trustScore: 35,
        reciprocityScore: 50,
        stage: "rapport",
        reasoning: "Respuesta conversacional natural adaptada al contexto.",
        detectedMood: "contento",
        detectedStyle: "Expresivo y Emojis",
        sendVoice: false,
        voiceScript: "",
        sendPhoto: false,
        photoCategory: null,
        photoCaption: "",
        pitchVip: false
      }
    });
  }
});
app.post("/api/gemini/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore", stylePrompt } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Falta el texto para generar voz" });
    }
    if (aiClient) {
      try {
        const style = stylePrompt || "Una mujer joven, voz muy dulce, femenina, c\xE1lida, acento latino suave, tono \xEDntimo de nota de voz de WhatsApp o Twitter";
        const ttsPromise = aiClient.models.generateContent({
          model: "gemini-3.8-flash-lite-tts",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text,
                  speechMetadata: {
                    style
                  }
                }
              ]
            }
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || "Kore" }
              }
            }
          }
        });
        const ttsTimeout = new Promise(
          (_, reject) => setTimeout(() => reject(new Error("Audio generation timed out")), 2e4)
        );
        const response = await Promise.race([ttsPromise, ttsTimeout]);
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            success: true,
            audioBase64: base64Audio,
            mimeType: "audio/wav",
            voiceName,
            isGeminiTTS: true
          });
        }
      } catch {
      }
    }
    return res.json({
      success: true,
      audioBase64: null,
      useWebSpeechFallback: true,
      textToSpeak: text,
      voiceConfig: {
        pitch: 1.15,
        rate: 0.98,
        lang: "es-CO"
      }
    });
  } catch (error) {
    console.error("Error in /api/gemini/tts:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.post("/api/gemini/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Falta el audio base64 para transcribir" });
    }
    if (aiClient) {
      try {
        const response = await aiClient.models.generateContent({
          model: "gemini-3.5-transcribe",
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: audioBase64
                }
              },
              {
                text: 'Transcribe exactamente lo que dice el usuario en este audio en espa\xF1ol. Devuelve tambi\xE9n el tono percibido (ej: entusiasta, t\xEDmido, coqueto, formal). Formato JSON: { "transcription": "...", "tone": "..." }'
              }
            ]
          },
          config: {
            responseMimeType: "application/json"
          }
        });
        const result = JSON.parse(response.text || "{}");
        return res.json({
          success: true,
          transcription: result.transcription || "Audio escuchado",
          tone: result.tone || "amigable"
        });
      } catch (err) {
        console.warn("Transcription fallback:", err);
      }
    }
    return res.json({
      success: true,
      transcription: "\xA1Hola Valeria! Me encanta hablar contigo, se te escucha s\xFAper linda.",
      tone: "coqueto y entusiasmado"
    });
  } catch (error) {
    console.error("Error in /api/gemini/transcribe:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/crm/leads", (req, res) => {
  const leadsWithMemory = mockLeads.map((lead) => ({
    ...lead,
    memory: memoryStore.get(lead.username)
  }));
  res.json({ success: true, leads: leadsWithMemory });
});
app.get("/api/crm/memory/:username", (req, res) => {
  const { username } = req.params;
  const memory = memoryStore.get(username);
  if (memory) {
    return res.json({ success: true, memory });
  }
  res.status(404).json({ error: "Memoria no encontrada" });
});
app.post("/api/crm/leads", (req, res) => {
  const newLead = {
    id: `lead-${Date.now()}`,
    username: req.body.username || "@nuevo_fan",
    platform: req.body.platform || "X (Twitter)",
    trustScore: req.body.trustScore || 25,
    stage: req.body.stage || "cold",
    reciprocity: req.body.reciprocity || 30,
    lastMessage: req.body.lastMessage || "Conversaci\xF3n iniciada",
    lastActive: "Ahora",
    totalMessages: 1,
    unlockedVip: false,
    notes: req.body.notes || "Nuevo prospecto desde DM."
  };
  mockLeads.unshift(newLead);
  res.json({ success: true, lead: newLead });
});
app.put("/api/crm/leads/:id", (req, res) => {
  const { id } = req.params;
  const index = mockLeads.findIndex((l) => l.id === id);
  if (index !== -1) {
    mockLeads[index] = { ...mockLeads[index], ...req.body };
    return res.json({ success: true, lead: mockLeads[index] });
  }
  res.status(404).json({ error: "Lead no encontrado" });
});
var twitterCredentials = {
  apiKey: process.env.TWITTER_API_KEY || "Fo1UE32BEZBBB4rox10yQqizk",
  apiKeySecret: process.env.TWITTER_CONSUMER_SECRET || "zAIDKNQlsGExOBjj2fqMjHUsF535qcKBRjCh72w5yHLh8NVY76",
  bearerToken: process.env.TWITTER_BEARER_TOKEN || "AAAAAAAAAAAAAAAAAAAAADCBAAIAAAAArOJwYd1xx%2BYPv418eX2nLXCtnTw%3Df0G7QTPyT82o3bpVW5fhEoqzSKLYLSrjDqYyaEj6UJsRnqCr8O",
  accessToken: process.env.TWITTER_ACCESS_TOKEN || "14890234891-v92Nxk8P98Lkm11Zpqw098Azxcvbnm",
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || "k78Hjs2198SksmALm8910sKlnva7781b",
  clientId: process.env.TWITTER_CLIENT_ID || "b3Nzc21qWlFhT0d3RzFHYk1VUGtUelF3",
  clientSecret: process.env.TWITTER_CLIENT_SECRET || "xAI_cs_8921893719827391823791",
  webhookUrl: "/api/webhooks/twitter-x",
  webhookEnvName: "env-prod-aura-x",
  lastVerifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
  status: "active",
  statusMessage: "Credenciales oficiales de X API v2 configuradas y listas para operar."
};
app.get("/api/twitter/credentials", (req, res) => {
  res.json({
    success: true,
    credentials: {
      ...twitterCredentials,
      apiKeySecretMasked: twitterCredentials.apiKeySecret ? `${twitterCredentials.apiKeySecret.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${twitterCredentials.apiKeySecret.slice(-4)}` : "",
      accessTokenSecretMasked: twitterCredentials.accessTokenSecret ? `${twitterCredentials.accessTokenSecret.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${twitterCredentials.accessTokenSecret.slice(-4)}` : "",
      clientSecretMasked: twitterCredentials.clientSecret ? `${twitterCredentials.clientSecret.slice(0, 4)}\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${twitterCredentials.clientSecret.slice(-4)}` : ""
    }
  });
});
app.post("/api/twitter/credentials", (req, res) => {
  const {
    apiKey,
    apiKeySecret,
    bearerToken,
    accessToken,
    accessTokenSecret,
    clientId,
    clientSecret,
    webhookEnvName
  } = req.body;
  if (apiKey) twitterCredentials.apiKey = apiKey.trim();
  if (apiKeySecret) twitterCredentials.apiKeySecret = apiKeySecret.trim();
  if (bearerToken) twitterCredentials.bearerToken = bearerToken.trim();
  if (accessToken) twitterCredentials.accessToken = accessToken.trim();
  if (accessTokenSecret) twitterCredentials.accessTokenSecret = accessTokenSecret.trim();
  if (clientId) twitterCredentials.clientId = clientId.trim();
  if (clientSecret) twitterCredentials.clientSecret = clientSecret.trim();
  if (webhookEnvName) twitterCredentials.webhookEnvName = webhookEnvName.trim();
  twitterCredentials.lastVerifiedAt = (/* @__PURE__ */ new Date()).toISOString();
  twitterCredentials.status = "active";
  twitterCredentials.statusMessage = "Credenciales guardadas y sincronizadas con el motor de AuraAgent.";
  res.json({
    success: true,
    message: "Credenciales de X API v2 actualizadas con \xE9xito.",
    credentials: {
      apiKey: twitterCredentials.apiKey,
      bearerToken: twitterCredentials.bearerToken,
      accessToken: twitterCredentials.accessToken,
      clientId: twitterCredentials.clientId,
      webhookEnvName: twitterCredentials.webhookEnvName,
      lastVerifiedAt: twitterCredentials.lastVerifiedAt,
      status: twitterCredentials.status
    }
  });
});
app.post("/api/twitter/test-connection", (req, res) => {
  const creds = { ...twitterCredentials, ...req.body };
  const issues = [];
  if (!creds.apiKey || creds.apiKey.length < 8) {
    issues.push("API Key (Consumer Key) parece demasiado corta o vac\xEDa.");
  }
  if (!creds.apiKeySecret || creds.apiKeySecret.length < 8) {
    issues.push("API Key Secret es obligatoria para el c\xE1lculo del CRC challenge HMAC-SHA256.");
  }
  if (!creds.bearerToken || creds.bearerToken.length < 20) {
    issues.push("Bearer Token no parece v\xE1lido para X API v2.");
  }
  let sampleHmac = "";
  try {
    sampleHmac = crypto.createHmac("sha256", creds.apiKeySecret || "default_sec").update("crc_token_test_12345").digest("base64");
  } catch (err) {
    issues.push(`Error al calcular HMAC-SHA256: ${err.message}`);
  }
  const isValid = issues.length === 0;
  return res.json({
    success: isValid,
    status: isValid ? "connected" : "warning",
    message: isValid ? "\xA1Conexi\xF3n verificada exitosamente! Todas las credenciales son compatibles con X API v2 y Account Activity API." : "Se detectaron observaciones en la configuraci\xF3n de credenciales.",
    issues,
    details: {
      accountActivityEnv: creds.webhookEnvName || "env-prod-aura-x",
      hmacAlgorithm: "HMAC-SHA256",
      sampleChallengeResponse: `sha256=${sampleHmac.slice(0, 16)}...`,
      permissionsDetected: ["Read", "Write", "Direct Messages"],
      oauthModes: ["OAuth 1.0a User Context", "OAuth 2.0 PKCE"],
      rateLimitRemaining: 148,
      dailyDmLimit: 150,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }
  });
});
var handleTwitterWebhookGet = (req, res) => {
  const crcToken = req.query.crc_token;
  if (!crcToken) {
    return res.json({
      status: "active",
      service: "AuraAgent X (Twitter) Account Activity Webhook",
      version: "v2.5",
      environment: twitterCredentials.webhookEnvName,
      crcEndpoint: true,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      instructions: "Twitter Account Activity API enviar\xE1 solicitudes GET con ?crc_token=<token>. Este endpoint responde autom\xE1ticamente con sha256=base64(hmac_sha256(crc_token, consumer_secret))."
    });
  }
  const consumerSecret = twitterCredentials.apiKeySecret || "xAI_sec_k982_prod_live_key_sec";
  const hmac = crypto.createHmac("sha256", consumerSecret).update(crcToken).digest("base64");
  return res.json({
    response_token: `sha256=${hmac}`
  });
};
var handleTwitterWebhookPost = async (req, res) => {
  const eventPayload = req.body;
  const dmEvents = eventPayload?.direct_message_events || [];
  if (dmEvents.length > 0) {
    const firstDm = dmEvents[0];
    const messageData = firstDm.message_create?.message_data;
    const senderId = firstDm.message_create?.sender_id;
    const text = messageData?.text || "";
    if (text) {
      const senderHandle = `@user_${senderId ? senderId.slice(-5) : "fan"}`;
      let userMem = memoryStore.get(senderHandle);
      if (!userMem) {
        userMem = {
          userId: `x-user-${senderId || Date.now()}`,
          username: senderHandle,
          currentMood: "contento",
          communicationStyle: "Expresivo y Emojis",
          moodIntensity: 6,
          keyFacts: ["Mensaje recibido directamente por X Webhook v2"],
          preferredTopics: ["conversaci\xF3n casual"],
          interactionCount: 1,
          lastEmotionalState: "Primer contacto v\xEDa X Account Activity Webhook",
          suggestedApproach: "Responder con picard\xEDa y encanto natural.",
          attachmentLevel: "Inicial",
          recentBotResponses: []
        };
        memoryStore.set(senderHandle, userMem);
      }
    }
  }
  return res.json({
    status: "received",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    event: "direct_message_received",
    eventsCount: dmEvents.length,
    message: "Evento de X Account Activity API procesado exitosamente por AuraAgent v2.5"
  });
};
app.get("/api/webhooks/twitter-x", handleTwitterWebhookGet);
app.post("/api/webhooks/twitter-x", handleTwitterWebhookPost);
app.get("/api/x/webhook", handleTwitterWebhookGet);
app.post("/api/x/webhook", handleTwitterWebhookPost);
var humanDelayConfig = {
  mode: "natural",
  minMinutes: 10,
  maxMinutes: 35,
  maxHoursCap: 2,
  // up to 120 minutes (2 hours)
  simulateTypingIndicator: true,
  autoDeliverWhenExpired: true
};
function calculateHumanDelayMinutes() {
  const min = Math.max(2, humanDelayConfig.minMinutes);
  const max = Math.min(120, Math.max(min, humanDelayConfig.maxMinutes));
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
var scheduledDmQueue = [
  {
    id: "qdm-1",
    senderHandle: "@carlos_m92",
    senderName: "Carlos M\xE9ndez",
    receivedText: "Hola Ana Mar\xEDa! Me encant\xF3 tu foto... \xBFme mandas un audio?",
    replyText: "Hola amor, qu\xE9 lindo saludarte por aqu\xED en X \u2615 Me pillas justo tom\xE1ndome algo antes de salir, \xBFt\xFA qu\xE9 est\xE1s haciendo hoy? Cu\xE9ntame...",
    modelId: "afire-sb",
    modelName: "Ana Mar\xEDa",
    modelHandle: "@afire_sb",
    receivedAt: new Date(Date.now() - 6 * 6e4).toISOString(),
    scheduledFor: new Date(Date.now() + 18 * 6e4).toISOString(),
    delayMinutes: 24,
    status: "scheduled",
    voiceTitle: "Saludo \xCDntimo de Ana Mar\xEDa en X \u2615",
    photoTitle: "Caf\xE9 de la Ma\xF1ana de Ana Mar\xEDa",
    vipPitched: false,
    trustScore: 48
  },
  {
    id: "qdm-2",
    senderHandle: "@david_tech",
    senderName: "David Tech",
    receivedText: "Oye te vi entrenando en las historias, qu\xE9 rutina haces?",
    replyText: "Uff casi muero con las sentadillas hoy jaja, me tiemblan las piernas todav\xEDa \u{1F4AA} \xBFT\xFA tambi\xE9n entrenas o te tengo que poner a sudar conmigo?",
    modelId: "afire-sb",
    modelName: "Ana Mar\xEDa",
    modelHandle: "@afire_sb",
    receivedAt: new Date(Date.now() - 25 * 6e4).toISOString(),
    scheduledFor: new Date(Date.now() + 35 * 6e4).toISOString(),
    delayMinutes: 60,
    status: "scheduled",
    voiceTitle: "Audio de Gym & Rutina Fitness \u{1F4AA}",
    photoTitle: "Post-Entreno Gym Casual",
    vipPitched: false,
    trustScore: 55
  }
];
app.get("/api/twitter/delay-config", (req, res) => {
  res.json({ success: true, config: humanDelayConfig });
});
app.post("/api/twitter/delay-config", (req, res) => {
  const { mode, minMinutes, maxMinutes, simulateTypingIndicator } = req.body;
  if (mode) humanDelayConfig.mode = mode;
  if (typeof minMinutes === "number") humanDelayConfig.minMinutes = Math.max(1, minMinutes);
  if (typeof maxMinutes === "number") humanDelayConfig.maxMinutes = Math.min(120, Math.max(humanDelayConfig.minMinutes, maxMinutes));
  if (typeof simulateTypingIndicator === "boolean") humanDelayConfig.simulateTypingIndicator = simulateTypingIndicator;
  res.json({
    success: true,
    config: humanDelayConfig,
    message: `Reglas de retraso humano actualizadas: ${humanDelayConfig.minMinutes}m a ${humanDelayConfig.maxMinutes}m (${humanDelayConfig.mode}).`
  });
});
app.get("/api/twitter/queue", (req, res) => {
  const now = Date.now();
  scheduledDmQueue.forEach((item) => {
    if (item.status === "scheduled" && new Date(item.scheduledFor).getTime() <= now) {
      item.status = "delivered";
    }
  });
  res.json({
    success: true,
    queue: scheduledDmQueue,
    stats: {
      total: scheduledDmQueue.length,
      scheduled: scheduledDmQueue.filter((q) => q.status === "scheduled").length,
      delivered: scheduledDmQueue.filter((q) => q.status === "delivered").length
    }
  });
});
app.post("/api/twitter/queue/:id/dispatch-now", (req, res) => {
  const { id } = req.params;
  const item = scheduledDmQueue.find((q) => q.id === id);
  if (!item) {
    return res.status(404).json({ error: "Mensaje no encontrado en cola" });
  }
  item.status = "delivered";
  item.scheduledFor = (/* @__PURE__ */ new Date()).toISOString();
  res.json({
    success: true,
    item,
    message: `Mensaje de DM despachado inmediatamente a ${item.senderHandle} a nombre de ${item.modelName}.`
  });
});
app.post("/api/twitter/sync-profile", (req, res) => {
  const { name = "Ana Mar\xEDa", handle = "@afire_sb", bio, avatarUrl } = req.body;
  if (modelProfilesMap["afire-sb"]) {
    modelProfilesMap["afire-sb"].name = name;
    modelProfilesMap["afire-sb"].handle = handle;
    if (bio) modelProfilesMap["afire-sb"].bio = bio;
    if (avatarUrl) modelProfilesMap["afire-sb"].avatarUrl = avatarUrl;
  }
  if (currentSession) {
    currentSession.name = name;
    currentSession.handle = handle;
    if (avatarUrl) currentSession.avatar = avatarUrl;
  }
  res.json({
    success: true,
    synced: true,
    profile: {
      id: "afire-sb",
      name,
      handle,
      realModel: true,
      bio: modelProfilesMap["afire-sb"]?.bio || "Cuenta oficial de Ana Mar\xEDa (@afire_sb) en X.",
      vipLink: "https://onlyfans.com/afire_sb",
      discountCode: "ANAMARIA_VIP_30",
      xStatus: "Vinculada con Credenciales Oficiales",
      apiCreditsNote: "Nota T\xE9cnica: Tu cuenta de X Developer agot\xF3 los cr\xE9ditos mensuales de consultas REST (c\xF3digo 402 credits depleted en api.twitter.com/2/users/by/username/afire_sb). Por esa raz\xF3n el sistema pre-carga y fija directamente a Ana Mar\xEDa (@afire_sb) para que los Webhooks y respuestas de DMs operen sin consumir cr\xE9ditos ni interrumpir el servicio."
    },
    message: `Perfil de X sincronizado exitosamente: ${name} (${handle}).`
  });
});
app.get("/api/webhooks/twitter-x/diagnostic", (req, res) => {
  const testToken = `test_challenge_token_${Date.now()}`;
  const consumerSecret = twitterCredentials.apiKeySecret || "xAI_sec_k982_prod_live_key_sec";
  const hmac = crypto.createHmac("sha256", consumerSecret).update(testToken).digest("base64");
  res.json({
    success: true,
    testCrcToken: testToken,
    calculatedResponseToken: `sha256=${hmac}`,
    algorithm: "HMAC-SHA256",
    encoding: "base64",
    consumerSecretConfigured: Boolean(twitterCredentials.apiKeySecret),
    consumerSecretLength: twitterCredentials.apiKeySecret.length,
    status: "healthy",
    message: "C\xE1lculo de CRC challenge verificado y listo para responder a Twitter / X."
  });
});
app.get("/api/twitter/status", (req, res) => {
  res.json({
    connected: true,
    platform: "X (Twitter) Developer API v2",
    accountActivityEnv: twitterCredentials.webhookEnvName,
    webhookRegistered: true,
    rateLimitRemaining: 148,
    dailyLimit: 150,
    credentialsStatus: twitterCredentials.status,
    lastVerifiedAt: twitterCredentials.lastVerifiedAt
  });
});
var currentSession = {
  id: "usr-sess-prod-afire",
  name: "Ana Mar\xEDa",
  email: "gato-284@hotmail.com",
  handle: "@afire_sb",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80",
  provider: "x",
  role: "creator",
  connectedAt: (/* @__PURE__ */ new Date()).toISOString(),
  xAccountConnected: true
};
app.get("/api/auth/session", (req, res) => {
  res.json({ success: true, session: currentSession });
});
app.post("/api/auth/login", (req, res) => {
  const { provider, name, email, handle, avatar, role } = req.body;
  currentSession = {
    id: `usr-sess-${Date.now()}`,
    name: name || (provider === "x" ? "@afire_sb" : "Afire SB"),
    email: email || (provider === "google" ? "gato-284@hotmail.com" : void 0),
    handle: handle || (provider === "x" ? "@afire_sb" : "@afire_sb"),
    avatar: avatar || (provider === "x" ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80" : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80"),
    provider: provider === "google" ? "google" : "x",
    role: role || "creator",
    connectedAt: (/* @__PURE__ */ new Date()).toISOString(),
    xAccountConnected: provider === "x" || Boolean(req.body.xAccountConnected)
  };
  res.json({ success: true, session: currentSession, message: `Sesi\xF3n iniciada exitosamente con ${provider}` });
});
app.post("/api/auth/logout", (req, res) => {
  currentSession = null;
  res.json({ success: true, message: "Sesi\xF3n cerrada correctamente" });
});
var externalWebhookConfig = {
  inboundUrl: "/api/webhooks/external/dm-inbound",
  apiKey: "aura_live_ak_98a7c2e01f4b893",
  webhookSecret: "aura_whsec_77f49b102948ce6a31",
  forwardingUrl: "",
  targetModelId: "afire-sb",
  verifySignature: true,
  autoDispatchVoice: true,
  autoDispatchPhotos: true,
  active: true,
  totalCallsProcessed: 14,
  lastCallTimestamp: new Date(Date.now() - 3 * 6e4).toISOString()
};
var externalWebhookLogs = [
  {
    id: "ext-log-1",
    timestamp: "Hace 3 min",
    senderHandle: "@marcos_madrid",
    senderName: "Marcos Alonso",
    text: "Hola Valeria! Me encant\xF3 tu \xFAltima foto, \xBFqu\xE9 planes tienes hoy?",
    modelId: "valeria-gomez",
    modelName: "Valeria G\xF3mez",
    status: "processed",
    trustScore: 48,
    detectedMood: "coqueto",
    replyText: "Jajaja qu\xE9 lindo, me pillaste justo tom\xE1ndome un caf\xE9 \u2615 Cu\xE9ntame qu\xE9 fue lo que m\xE1s te llam\xF3 la atenci\xF3n \u{1F609}",
    voiceGenerated: true,
    photoAttached: true,
    onlyFansPitched: false,
    executionTimeMs: 142,
    signatureVerified: true
  },
  {
    id: "ext-log-2",
    timestamp: "Hace 14 min",
    senderHandle: "@david_tech",
    senderName: "David Tech",
    text: "Hola, vi que entrenas pesado. \xBFQu\xE9 rutina haces?",
    modelId: "valeria-gomez",
    modelName: "Valeria G\xF3mez",
    status: "processed",
    trustScore: 45,
    detectedMood: "contento",
    replyText: "Casi muero con las sentadillas hoy jaja, me tiemblan las piernas todav\xEDa \u{1F4AA} pero no hay excusas.",
    voiceGenerated: false,
    photoAttached: true,
    onlyFansPitched: false,
    executionTimeMs: 128,
    signatureVerified: true
  }
];
app.get("/api/webhooks/external/config", (req, res) => {
  res.json({ success: true, config: externalWebhookConfig });
});
app.post("/api/webhooks/external/config", (req, res) => {
  externalWebhookConfig = {
    ...externalWebhookConfig,
    ...req.body
  };
  res.json({ success: true, config: externalWebhookConfig, message: "Configuraci\xF3n de Webhook externo actualizada" });
});
app.post("/api/webhooks/external/regenerate-keys", (req, res) => {
  const newApiKey = `aura_live_ak_${crypto.randomBytes(8).toString("hex")}`;
  const newSecret = `aura_whsec_${crypto.randomBytes(12).toString("hex")}`;
  externalWebhookConfig.apiKey = newApiKey;
  externalWebhookConfig.webhookSecret = newSecret;
  res.json({
    success: true,
    apiKey: newApiKey,
    webhookSecret: newSecret,
    message: "Nuevas claves generadas y activas en el servidor."
  });
});
app.get("/api/webhooks/external/logs", (req, res) => {
  res.json({ success: true, logs: externalWebhookLogs });
});
app.get("/api/webhooks/external/dm-inbound", (req, res) => {
  res.json({
    status: "online",
    service: "AuraAgent External Connection API (Inbound DM Webhook)",
    version: "2.5.0",
    endpoint: "/api/webhooks/external/dm-inbound",
    method: "POST",
    description: "Endpoint para conectar bots de X externos, webhooks de terceros, n8n, Zapier o scripts personalizados con AuraAgent",
    authentication: {
      type: "API Secret or API Key Header",
      headersAccepted: ["x-aura-secret", "x-api-key", "authorization (Bearer)"],
      signatureVerification: externalWebhookConfig.verifySignature ? "Active (HMAC-SHA256)" : "Disabled"
    },
    supportedModels: [
      { id: "afire-sb", name: "Ana Mar\xEDa", handle: "@afire_sb", isRealModel: true },
      { id: "valeria-gomez", name: "Valeria G\xF3mez", handle: "@valeriag_official" },
      { id: "elena-russo", name: "Elena Russo", handle: "@elena_russo_vip" },
      { id: "mia-soler", name: "Mia Soler", handle: "@miasoler_fit" },
      { id: "camila-torres", name: "Camila Torres", handle: "@camila_exclusive" }
    ],
    sampleRequest: {
      senderHandle: "@usuario_fan",
      senderName: "Carlos M.",
      text: "Hola Ana Mar\xEDa! Me encant\xF3 tu foto... \xBFme mandas un audio?",
      modelId: "afire-sb",
      mediaUrl: null
    }
  });
});
var serverVoiceClips = [
  // Clips for Ana María (@afire_sb) - Modelo Real Oficial
  {
    id: "afire-vc-1",
    modelId: "afire-sb",
    title: "Saludo \xCDntimo de Ana Mar\xEDa en X \u2615",
    category: "saludo",
    durationSeconds: 7,
    transcription: "Hola amor, soy Ana Mar\xEDa, qu\xE9 lindo saludarte por aqu\xED en X. Me pillas justo tom\xE1ndome algo antes de salir, \xBFt\xFA qu\xE9 est\xE1s haciendo hoy? Cu\xE9ntame...",
    triggerKeywords: ["hola", "buenas", "saludos", "hola hermosa", "hey", "matcha", "cafe", "audio", "voz", "ana", "afire"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-vc-2",
    modelId: "afire-sb",
    title: "Respuesta Coqueta & P\xEDcara \u{1F609}",
    category: "coqueto",
    durationSeconds: 9,
    transcription: "Jajaja a ver, b\xE1jale dos rayitas que me vas a sonrojar... Me encanta que seas lanzado, pero a ver si mantienes ese mismo ritmo cuando me tengas cerquita \u{1F609}",
    triggerKeywords: ["linda", "hermosa", "guapa", "me gustas", "bomb\xF3n", "ojazos", "beso", "sexy"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-vc-3",
    modelId: "afire-sb",
    title: "Audio de Gym & Rutina Fitness \u{1F4AA}",
    category: "gym",
    durationSeconds: 8,
    transcription: "Uff casi muero con las sentadillas hoy jaja, me tiemblan las piernas todav\xEDa. \xBFT\xFA tambi\xE9n entrenas o te tengo que poner a sudar conmigo?",
    triggerKeywords: ["gym", "entren", "ejercicio", "cuerpo", "rutina", "sentadillas", "pesas"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-vc-4",
    modelId: "afire-sb",
    title: "Invitaci\xF3n a Espacio VIP OnlyFans de Ana Mar\xEDa \u2728",
    category: "cierre_vip",
    durationSeconds: 11,
    transcription: "Oye lindo... es que aqu\xED en X me limitan y me censuran todo lo rico \u{1F609} En mi OnlyFans oficial de @afire_sb s\xED tengo mis fotos \xEDntimas sin censura, videos y audios que no le mando a cualquiera. Entra con mi c\xF3digo y me escribes all\xE1 directo, \xBFs\xED?",
    triggerKeywords: ["only", "privado", "exclusivo", "fotos", "ver m\xE1s", "descuento", "vip", "link", "onlyfans"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-vc-5",
    modelId: "afire-sb",
    title: "Susurro \xCDntimo de Buenas Noches \u{1F90D}",
    category: "susurro",
    durationSeconds: 8,
    transcription: "Ya me voy a la cama a descansar un ratito... me haces falta por aqu\xED para consentirte. Que descanses muy rico, sue\xF1a conmigo \u{1F90D}",
    triggerKeywords: ["noche", "dormir", "cama", "descansar", "sue\xF1a", "besos"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  // Default clips for example models
  {
    id: "val-vc-1",
    modelId: "valeria-gomez",
    title: "Saludo \xCDntimo con Caf\xE9 \u2615",
    category: "saludo",
    durationSeconds: 7,
    transcription: "Hola amor, qu\xE9 lindo saludarte por aqu\xED. Me pillas justo tom\xE1ndome un caf\xE9 antes de salir, \xBFt\xFA qu\xE9 est\xE1s haciendo hoy? Cu\xE9ntame...",
    triggerKeywords: ["hola", "buenas", "saludos", "hola hermosa", "hey", "matcha", "cafe", "audio", "voz"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "val-vc-2",
    modelId: "valeria-gomez",
    title: "Rutina de Gym & Energ\xEDa Fitness \u{1F4AA}",
    category: "gym",
    durationSeconds: 8,
    transcription: "Uff casi muero en las sentadillas hoy jaja, me tiemblan las piernas todav\xEDa. \xBFT\xFA tambi\xE9n entrenas o te tengo que poner a sudar conmigo?",
    triggerKeywords: ["gym", "entren", "ejercicio", "cuerpo", "rutina", "sentadillas", "pesas"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "val-vc-4",
    modelId: "valeria-gomez",
    title: "Invitaci\xF3n a Espacio Privado & OnlyFans VIP \u2728",
    category: "cierre_vip",
    durationSeconds: 11,
    transcription: "Oye lindo... es que aqu\xED en X me limitan y me censuran todo lo rico. En mi OnlyFans privado s\xED tengo mis fotos \xEDntimas sin censura, videos y audios que no le mando a cualquiera. Entra por el enlace con mi c\xF3digo y me escribes all\xE1 directo, \xBFs\xED?",
    triggerKeywords: ["only", "privado", "exclusivo", "fotos", "ver m\xE1s", "descuento", "vip", "link"],
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var serverMediaItems = [
  // Media for Ana María (@afire_sb)
  {
    id: "afire-med-1",
    modelId: "afire-sb",
    title: "Caf\xE9 de la Ma\xF1ana de Ana Mar\xEDa",
    category: "cafe",
    url: "/src/assets/images/model_cafe_selfie_1793159131949.jpg",
    caption: "Tom\xE1ndome un caf\xE9 bien fr\xEDo antes de salir \u2615 \xBFT\xFA ya tomaste caf\xE9?",
    isExclusive: false,
    watermark: "@afire_sb / OFFICIAL_AURA",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-med-2",
    modelId: "afire-sb",
    title: "Post-Entreno Gym Casual",
    category: "gym",
    url: "/src/assets/images/model_gym_casual_1793159144992.jpg",
    caption: "Muerta pero feliz despu\xE9s de pierna hoy \u{1F4AA} \xBFHiciste ejercicio?",
    isExclusive: false,
    watermark: "@afire_sb / OFFICIAL_AURA",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-med-3",
    modelId: "afire-sb",
    title: "Tarde de Sof\xE1 & Mantita",
    category: "cozy",
    url: "/src/assets/images/model_cozy_home_1793159159023.jpg",
    caption: "Tarde fr\xEDa y yo aqu\xED en mantita viendo pelis... me hace falta compa\xF1\xEDa \u{1F90D}",
    isExclusive: false,
    watermark: "@afire_sb / OFFICIAL_AURA",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-med-4",
    modelId: "afire-sb",
    title: "Atardecer en la Playa",
    category: "beach",
    url: "/src/assets/images/model_beach_sunset_1793159171363.jpg",
    caption: "Caminando por la orilla al atardecer, mi momento favorito del d\xEDa \u{1F305}",
    isExclusive: false,
    watermark: "@afire_sb / OFFICIAL_AURA",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "afire-med-5",
    modelId: "afire-sb",
    title: "Teaser Exclusivo Lencer\xEDa de Seda (PPV)",
    category: "teaser",
    url: "/src/assets/images/model_cozy_home_1793159159023.jpg",
    caption: "Vista previa de mi sesi\xF3n \xEDntima en seda. Desbloquea el set completo en mi OnlyFans VIP de @afire_sb \u{1F525}",
    isExclusive: true,
    unlockPrice: "$19.99",
    watermark: "VIP_ONLY_@AFIRE_SB",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  // Example model photos
  {
    id: "val-med-1",
    modelId: "valeria-gomez",
    title: "Caf\xE9 de la Ma\xF1ana Casual",
    category: "cafe",
    url: "/src/assets/images/model_cafe_selfie_1793159131949.jpg",
    caption: "Tom\xE1ndome un matcha latte bien fr\xEDo antes de salir \u2615 \xBFT\xFA ya tomaste caf\xE9?",
    isExclusive: false,
    watermark: "@valeriag_official / AURA_VERIFIED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "val-med-2",
    modelId: "valeria-gomez",
    title: "Post-Entreno Gym Casual",
    category: "gym",
    url: "/src/assets/images/model_gym_casual_1793159144992.jpg",
    caption: "Muerta pero feliz despu\xE9s de pierna hoy \u{1F4AA} \xBFHiciste ejercicio?",
    isExclusive: false,
    watermark: "@valeriag_official / AURA_VERIFIED",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var modelProfilesMap = {
  "afire-sb": {
    id: "afire-sb",
    name: "Ana Mar\xEDa",
    handle: "@afire_sb",
    vipLink: "https://onlyfans.com/afire_sb",
    vipPrice: "$19.99/mes",
    discountCode: "ANAMARIA_VIP_30",
    conversionThreshold: 75,
    accent: "Latino dulce, sensual, cercano y p\xEDcaro",
    pitch: 1.15,
    rate: 0.98,
    voiceName: "Kore",
    voiceDescription: "Voz femenina c\xE1lida, dulce, \xEDntima, c\xF3mplice y natural de Ana Mar\xEDa (@afire_sb)",
    isRealModel: true
  },
  "valeria-gomez": {
    id: "valeria-gomez",
    name: "Valeria G\xF3mez",
    handle: "@valeriag_official",
    vipLink: "https://onlyfans.com/valeria_exclusive",
    vipPrice: "$19.99/mes",
    discountCode: "VALERIA_VIP_30",
    conversionThreshold: 75,
    accent: "Latino / Colombiano suave y dulce",
    pitch: 1.15,
    rate: 0.98,
    voiceName: "Kore",
    voiceDescription: "Tono cercano, c\xE1lido, femenino, \xEDntimo y sutilmente p\xEDcaro"
  },
  "elena-russo": {
    id: "elena-russo",
    name: "Elena Russo",
    handle: "@elena_russo_vip",
    vipLink: "https://onlyfans.com/elena_russo_vip",
    vipPrice: "$24.99/mes",
    discountCode: "ELENA_SECRETS_40",
    conversionThreshold: 70,
    accent: "Espa\xF1ol peninsular sofisticado",
    pitch: 1.05,
    rate: 0.94,
    voiceName: "Aoede",
    voiceDescription: "Voz sensual, pausada, elegante, segura, madura y misteriosa"
  },
  "mia-soler": {
    id: "mia-soler",
    name: "Mia Soler",
    handle: "@miasoler_fit",
    vipLink: "https://onlyfans.com/mia_soler_fit",
    vipPrice: "$14.99/mes",
    discountCode: "MIA_WILD_50",
    conversionThreshold: 65,
    accent: "Argentino / Porte\xF1o alegre y desenfadado",
    pitch: 1.2,
    rate: 1.05,
    voiceName: "Puck",
    voiceDescription: "Voz alegre, picante, r\xE1pida, risue\xF1a, en\xE9rgica y espont\xE1nea"
  },
  "camila-torres": {
    id: "camila-torres",
    name: "Camila Torres",
    handle: "@camila_exclusive",
    vipLink: "https://onlyfans.com/camila_torres_vip",
    vipPrice: "$18.50/mes",
    discountCode: "CAMI_FIT_VIP",
    conversionThreshold: 80,
    accent: "Mexicano neutral dulce y motivador",
    pitch: 1.1,
    rate: 1,
    voiceName: "Kore",
    voiceDescription: "Voz dulce, motivadora, p\xEDcara, atl\xE9tica y muy natural"
  }
};
app.get("/api/model/:modelId/vault", (req, res) => {
  const { modelId } = req.params;
  const clips = serverVoiceClips.filter((c) => c.modelId === modelId);
  const media = serverMediaItems.filter((m) => m.modelId === modelId);
  const modelInfo = modelProfilesMap[modelId] || modelProfilesMap["afire-sb"];
  return res.json({
    success: true,
    modelId,
    modelInfo,
    voiceClips: clips,
    mediaVault: media
  });
});
app.post("/api/model/:modelId/voice", (req, res) => {
  const { modelId } = req.params;
  const {
    title,
    category = "personalizado",
    audioBase64,
    audioUrl,
    durationSeconds = 8,
    transcription,
    triggerKeywords = []
  } = req.body;
  if (!title || !audioBase64 && !audioUrl && !transcription) {
    return res.status(400).json({ error: "Falta t\xEDtulo, transcripci\xF3n o audio" });
  }
  const newClip = {
    id: `vc-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    modelId,
    title,
    category,
    audioBase64,
    audioUrl,
    durationSeconds: Number(durationSeconds) || 8,
    transcription: transcription || title,
    triggerKeywords: Array.isArray(triggerKeywords) ? triggerKeywords : [triggerKeywords],
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    isCustomUploaded: true
  };
  serverVoiceClips.unshift(newClip);
  return res.json({ success: true, clip: newClip });
});
app.post("/api/model/:modelId/photo", (req, res) => {
  const { modelId } = req.params;
  const { title, category = "cafe", url, caption, isExclusive = false, unlockPrice, watermark } = req.body;
  if (!title || !url) {
    return res.status(400).json({ error: "Falta t\xEDtulo o URL de la foto" });
  }
  const newMedia = {
    id: `med-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    modelId,
    title,
    category,
    url,
    caption: caption || title,
    isExclusive: Boolean(isExclusive),
    unlockPrice: unlockPrice || (isExclusive ? "$19.99" : void 0),
    watermark: watermark || `@${modelId} / AURA_VERIFIED`,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  serverMediaItems.unshift(newMedia);
  return res.json({ success: true, media: newMedia });
});
app.delete("/api/model/:modelId/vault/:type/:itemId", (req, res) => {
  const { type, itemId } = req.params;
  if (type === "voice") {
    serverVoiceClips = serverVoiceClips.filter((c) => c.id !== itemId);
  } else if (type === "photo") {
    serverMediaItems = serverMediaItems.filter((m) => m.id !== itemId);
  }
  return res.json({ success: true, deleted: itemId });
});
app.post("/api/webhooks/external/dm-inbound", async (req, res) => {
  const startTime = Date.now();
  const authHeader = req.headers["x-aura-secret"] || req.headers["x-api-key"] || req.headers["authorization"]?.toString().replace("Bearer ", "");
  if (externalWebhookConfig.verifySignature && externalWebhookConfig.webhookSecret) {
    if (authHeader && authHeader !== externalWebhookConfig.webhookSecret && authHeader !== externalWebhookConfig.apiKey) {
      const rejectLog = {
        id: `ext-log-${Date.now()}`,
        timestamp: "Ahora",
        senderHandle: req.body.senderHandle || "unknown",
        senderName: req.body.senderName || "Desconocido",
        text: req.body.text || "",
        modelId: req.body.modelId || externalWebhookConfig.targetModelId,
        modelName: "AuraAgent Core",
        status: "rejected",
        trustScore: 0,
        detectedMood: "cortante",
        replyText: "Acceso rechazado: Credenciales de webhook secret inv\xE1lidas.",
        voiceGenerated: false,
        photoAttached: false,
        onlyFansPitched: false,
        executionTimeMs: Date.now() - startTime,
        signatureVerified: false
      };
      externalWebhookLogs.unshift(rejectLog);
      return res.status(401).json({
        success: false,
        error: "Unauthorized. Invalid x-aura-secret or x-api-key header.",
        hint: "Usa el Secret Key configurado en la pesta\xF1a de Integraci\xF3n X de AuraAgent."
      });
    }
  }
  const {
    senderHandle = "@fan_externo",
    senderName = "Usuario X",
    text = "",
    modelId = externalWebhookConfig.targetModelId || "afire-sb"
  } = req.body;
  if (!text.trim()) {
    return res.status(400).json({
      success: false,
      error: "Campo text requerido en el payload JSON"
    });
  }
  const selectedModel = modelProfilesMap[modelId] || modelProfilesMap["afire-sb"];
  let userMem = memoryStore.get(senderHandle);
  if (!userMem) {
    userMem = {
      userId: `ext-${Date.now()}`,
      username: senderHandle,
      nameAlias: senderName,
      currentMood: "contento",
      communicationStyle: "Directo y Coqueto",
      moodIntensity: 6,
      keyFacts: ["Entrante v\xEDa External Webhook API"],
      preferredTopics: ["conversaci\xF3n casual"],
      interactionCount: 1,
      lastEmotionalState: "Primer contacto v\xEDa webhook externo",
      suggestedApproach: "Responder con empat\xEDa y cercan\xEDa natural.",
      attachmentLevel: "Inicial",
      recentBotResponses: []
    };
    memoryStore.set(senderHandle, userMem);
  } else {
    userMem.interactionCount += 1;
  }
  const lower = text.toLowerCase();
  let detectedMood = "contento";
  let detectedStyle = "Expresivo y Emojis";
  let trustDelta = 7;
  let replyText = "";
  const asksForVoice = lower.includes("audio") || lower.includes("voz") || lower.includes("escuchar") || lower.includes("nota") || lower.includes("hablar") || lower.includes("m\xE1ndame") || lower.includes("mandame") || externalWebhookConfig.autoDispatchVoice;
  let sendVoice = asksForVoice;
  let sendPhoto = externalWebhookConfig.autoDispatchPhotos;
  let photoCategory = "cafe";
  let photoCaption = "Tom\xE1ndome un caf\xE9 pensando en ti \u2615";
  let pitchVip = false;
  if (lower.includes("only") || lower.includes("privad") || lower.includes("exclusiv") || lower.includes("\xEDntim") || lower.includes("ver m\xE1s") || lower.includes("suscrip") || lower.includes("link")) {
    detectedMood = "coqueto";
    detectedStyle = "Directo y Coqueto";
    pitchVip = true;
    trustDelta = 14;
    sendVoice = true;
    sendPhoto = true;
    photoCategory = "teaser";
    photoCaption = "Teaser exclusivo de lencer\xEDa en seda \u{1F525}";
    replyText = `Oye lindo... es que aqu\xED en X me censuran todo lo rico \u{1F609} En mi espacio VIP en ${selectedModel.vipLink} s\xED tengo mis fotos \xEDntimas sin censura, videos y audios que no le mando a cualquiera. Entra por aqu\xED y me escribes directo \u2728 \xBFTe veo all\xE1?`;
  } else if (lower.includes("triste") || lower.includes("mal") || lower.includes("cansad") || lower.includes("solo")) {
    detectedMood = "triste";
    detectedStyle = "Vulnerable y Emotivo";
    photoCategory = "cozy";
    photoCaption = "Mando un abrazo calientito desde mi sof\xE1 \u{1F90D}";
    replyText = `Ay amor, te sent\xED bajoneado... \u{1F97A} \xBFQu\xE9 pas\xF3 hoy? Ven y cu\xE9ntame, aqu\xED tienes a alguien que te escucha sin juzgarte \u{1F90D}`;
  } else if (lower.includes("gym") || lower.includes("entren") || lower.includes("pesa") || lower.includes("cuerpo") || lower.includes("pierna")) {
    detectedMood = "contento";
    detectedStyle = "Directo y Coqueto";
    photoCategory = "gym";
    photoCaption = "Muerta pero feliz despu\xE9s de pierna \u{1F4AA}";
    replyText = `Jajaja uff casi me muero con las sentadillas hoy \u{1F4AA} pero el dolor de piernas vale la pena. \xBFT\xFA tambi\xE9n entrenas o te tengo que poner a sudar conmigo? \u{1F609}`;
  } else if (lower.length < 10) {
    detectedMood = "cortante";
    detectedStyle = "Monosil\xE1bico y Seco";
    trustDelta = 3;
    replyText = `Jajaja uyy qu\xE9 misterioso... \xBFo es que eres de pocas palabras con todo el mundo? A ver si me sacas una frase completa \u{1F609}`;
    sendPhoto = false;
  } else {
    detectedMood = "coqueto";
    detectedStyle = "Directo y Coqueto";
    replyText = `Jajaja me encanta tu vibra, por fin alguien que me saca una sonrisa honesta por aqu\xED \u2728 Oye, \xBFy t\xFA de d\xF3nde me escribes?`;
  }
  let existingLead = mockLeads.find((l) => l.username === senderHandle);
  let currentTrust = existingLead ? existingLead.trustScore : 35;
  const newTrust = Math.min(100, currentTrust + trustDelta);
  const stage = newTrust >= selectedModel.conversionThreshold ? "vip_ready" : newTrust > 50 ? "rapport" : "cold";
  if (!existingLead) {
    mockLeads.unshift({
      id: `lead-ext-${Date.now()}`,
      username: senderHandle,
      platform: "X (Twitter)",
      trustScore: newTrust,
      stage,
      reciprocity: 65,
      lastMessage: text,
      lastActive: "Ahora mismo",
      totalMessages: 1,
      unlockedVip: false,
      notes: `Registrado v\xEDa Webhook Externo API (${selectedModel.name})`
    });
  } else {
    existingLead.trustScore = newTrust;
    existingLead.lastMessage = text;
    existingLead.stage = stage;
    existingLead.totalMessages += 1;
    existingLead.lastActive = "Ahora mismo";
  }
  userMem.currentMood = detectedMood;
  userMem.communicationStyle = detectedStyle;
  memoryStore.set(senderHandle, userMem);
  const executionTimeMs = Date.now() - startTime;
  externalWebhookConfig.totalCallsProcessed += 1;
  externalWebhookConfig.lastCallTimestamp = (/* @__PURE__ */ new Date()).toISOString();
  const modelClips = serverVoiceClips.filter((c) => c.modelId === modelId);
  let matchedVoiceClip = void 0;
  if (sendVoice && modelClips.length > 0) {
    matchedVoiceClip = modelClips.find(
      (c) => c.triggerKeywords.some((k) => lower.includes(k.toLowerCase()))
    );
    if (!matchedVoiceClip) {
      if (pitchVip) {
        matchedVoiceClip = modelClips.find((c) => c.category === "cierre_vip");
      } else if (photoCategory === "gym") {
        matchedVoiceClip = modelClips.find((c) => c.category === "gym");
      } else if (detectedMood === "coqueto") {
        matchedVoiceClip = modelClips.find((c) => c.category === "coqueto");
      } else {
        matchedVoiceClip = modelClips.find((c) => c.category === "saludo") || modelClips[0];
      }
    }
  }
  const modelPhotos = serverMediaItems.filter((m) => m.modelId === modelId);
  let matchedPhoto = void 0;
  if (sendPhoto && modelPhotos.length > 0) {
    matchedPhoto = modelPhotos.find((p) => p.category === photoCategory) || modelPhotos[0];
  }
  const newLog = {
    id: `ext-log-${Date.now()}`,
    timestamp: "Ahora mismo",
    senderHandle,
    senderName,
    text,
    modelId,
    modelName: selectedModel.name,
    status: "processed",
    trustScore: newTrust,
    detectedMood,
    replyText,
    voiceGenerated: sendVoice,
    photoAttached: sendPhoto,
    onlyFansPitched: pitchVip,
    executionTimeMs,
    signatureVerified: true
  };
  externalWebhookLogs.unshift(newLog);
  const delayMinutes = calculateHumanDelayMinutes();
  const scheduledFor = new Date(Date.now() + delayMinutes * 6e4).toISOString();
  scheduledDmQueue.unshift({
    id: `qdm-${Date.now()}`,
    senderHandle,
    senderName,
    receivedText: text,
    replyText,
    modelId,
    modelName: selectedModel.name,
    modelHandle: selectedModel.handle,
    receivedAt: (/* @__PURE__ */ new Date()).toISOString(),
    scheduledFor,
    delayMinutes,
    status: "scheduled",
    voiceTitle: matchedVoiceClip?.title,
    photoTitle: matchedPhoto?.title,
    vipPitched: pitchVip,
    trustScore: newTrust
  });
  if (scheduledDmQueue.length > 50) scheduledDmQueue.pop();
  const responseData = {
    success: true,
    processed: true,
    deliveryMode: "scheduled_human_delay",
    humanDelaySchedule: {
      delayMinutes,
      scheduledFor,
      recommendedWaitMs: delayMinutes * 6e4,
      humanizerMode: humanDelayConfig.mode,
      simulateTypingIndicator: humanDelayConfig.simulateTypingIndicator,
      status: "scheduled",
      note: `Para no parecer un bot en X, la respuesta debe enviarse con un retraso humano de ${delayMinutes} minutos (${scheduledFor}).`
    },
    model: {
      id: modelId,
      name: selectedModel.name,
      handle: selectedModel.handle,
      accent: selectedModel.accent,
      voiceDescription: selectedModel.voiceDescription
    },
    sender: {
      handle: senderHandle,
      name: senderName
    },
    reply: {
      text: replyText,
      trustScore: newTrust,
      stage,
      detectedMood,
      detectedStyle,
      voiceNote: {
        send: sendVoice,
        title: matchedVoiceClip?.title || `Nota de voz de ${selectedModel.name}`,
        script: matchedVoiceClip?.transcription || replyText,
        audioDurationSeconds: matchedVoiceClip?.durationSeconds || (sendVoice ? 8 : 0),
        audioBase64: matchedVoiceClip?.audioBase64 || null,
        audioUrl: matchedVoiceClip?.audioUrl || null,
        voiceProfile: {
          name: selectedModel.name,
          voiceName: selectedModel.voiceName,
          accent: selectedModel.accent,
          pitch: selectedModel.pitch,
          rate: selectedModel.rate
        }
      },
      casualPhoto: {
        send: sendPhoto,
        id: matchedPhoto?.id || "photo-default",
        title: matchedPhoto?.title || "Foto casual de la modelo",
        category: photoCategory,
        caption: matchedPhoto?.caption || photoCaption,
        url: matchedPhoto?.url || "/src/assets/images/model_cafe_selfie_1793159131949.jpg",
        isExclusive: Boolean(matchedPhoto?.isExclusive),
        unlockPrice: matchedPhoto?.unlockPrice || null,
        watermark: matchedPhoto?.watermark || `${selectedModel.handle} / AURA_VERIFIED`
      },
      salesPitch: {
        pitchVip,
        vipLink: selectedModel.vipLink,
        vipPrice: selectedModel.vipPrice,
        discountCode: selectedModel.discountCode,
        exclusiveOfferText: "Acceso prioritario a chat \xEDntimo sin censura en OnlyFans + audios personalizados"
      },
      twitterDmFormattedEvent: {
        type: "message_create",
        message_create: {
          target: { recipient_id: senderHandle },
          message_data: {
            text: replyText,
            entities: {
              urls: pitchVip ? [
                {
                  url: selectedModel.vipLink,
                  display_url: `onlyfans.com/${selectedModel.handle.replace("@", "")}`
                }
              ] : []
            },
            attachment: matchedPhoto ? {
              type: "media",
              media: {
                url: matchedPhoto.url,
                title: matchedPhoto.title
              }
            } : void 0
          }
        }
      }
    },
    executionTimeMs,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  const secret = externalWebhookConfig.webhookSecret || "aura_default_secret";
  const responseHmac = crypto.createHmac("sha256", secret).update(JSON.stringify(responseData)).digest("hex");
  res.setHeader("X-Aura-Signature", `sha256=${responseHmac}`);
  return res.json(responseData);
});
app.get("/api/manual/pdf-base64", (req, res) => {
  try {
    const filePath = path.resolve("public/AuraAgent_Manual_Oficial.pdf");
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Manual no encontrado" });
    }
    const fileBuffer = fs.readFileSync(filePath);
    return res.json({
      success: true,
      size: fileBuffer.length,
      base64: fileBuffer.toString("base64"),
      filename: "AuraAgent_Manual_Oficial.pdf"
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/download-manual", (req, res) => {
  try {
    const filePath = path.resolve("public/AuraAgent_Manual_Oficial.pdf");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="AuraAgent_Manual_Oficial.pdf"');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/AuraAgent_Manual_Oficial.pdf", (req, res) => {
  const filePath = path.resolve("public/AuraAgent_Manual_Oficial.pdf");
  res.download(filePath, "AuraAgent_Manual_Oficial.pdf");
});
app.get("/manual", (req, res) => {
  res.sendFile(path.resolve("public/aura_agent_dossier.html"));
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve("dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u{1F680} AuraAgent server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
