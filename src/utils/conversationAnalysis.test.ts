import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeEmotionAndStyle,
  extractLearnedFacts,
  calculateTrustMetrics,
} from './conversationAnalysis';

test('detects cortante / monosyllabic communication correctly', () => {
  const res1 = analyzeEmotionAndStyle('ok');
  assert.equal(res1.mood, 'cortante');
  assert.equal(res1.style, 'Monosilábico y Seco');

  const res2 = analyzeEmotionAndStyle('ya');
  assert.equal(res2.mood, 'cortante');
});

test('detects coqueto / flirtatious mood with keywords and emojis', () => {
  const res1 = analyzeEmotionAndStyle('Hola hermosa, qué ojazos tienes 😍');
  assert.equal(res1.mood, 'coqueto');
  assert.equal(res1.style, 'Directo y Coqueto');

  const res2 = analyzeEmotionAndStyle('me encantas bombón 🔥');
  assert.equal(res2.mood, 'coqueto');
});

test('detects triste / vulnerable mood and prescribes emotional haven approach', () => {
  const res = analyzeEmotionAndStyle('Hoy fue un mal día en el trabajo, estoy muy cansado y agobiado');
  assert.equal(res.mood, 'triste');
  assert.equal(res.style, 'Vulnerable y Emotivo');
  assert.match(res.approach, /Refugio emocional/);
});

test('detects enojado / molesto mood', () => {
  const res = analyzeEmotionAndStyle('Esto es una estafa o qué? pura mentira');
  assert.equal(res.mood, 'enojado');
});

test('extracts key facts about user life and habits', () => {
  const facts1 = extractLearnedFacts('Salí tarde de la oficina y ahora voy directo al gym');
  assert.ok(facts1.some((f) => f.includes('trabajo')));
  assert.ok(facts1.some((f) => f.includes('Entrena')));

  const facts2 = extractLearnedFacts('Tomando un café con mi perro antes de salir');
  assert.ok(facts2.some((f) => f.includes('mascota')));
  assert.ok(facts2.some((f) => f.includes('café')));
});

test('calculates trust score progression towards VIP threshold', () => {
  const coldState = calculateTrustMetrics({
    currentTrust: 30,
    messageText: 'Qué linda estás en tu historia',
    mood: 'coqueto',
    isReciprocal: true,
    vipThreshold: 75,
  });
  assert.ok(coldState.newTrustScore > 30);
  assert.equal(coldState.isVipReady, false);

  const vipReadyState = calculateTrustMetrics({
    currentTrust: 72,
    messageText: 'Me fascina tu vibra Valeria, pásame tu link exclusivo para verte más íntimo',
    mood: 'coqueto',
    isReciprocal: true,
    vipThreshold: 75,
  });
  assert.ok(vipReadyState.newTrustScore >= 75);
  assert.equal(vipReadyState.isVipReady, true);
  assert.equal(vipReadyState.stage, 'vip_ready');
});

test('strictly forbids premature VIP pitch at message 2 or without exchanged media', () => {
  // Scenario: Turn 2 where user asks for photos or private stuff
  const earlyMessage2State = calculateTrustMetrics({
    currentTrust: 32,
    messageText: '¿Me mandas una foto o link privado?',
    mood: 'coqueto',
    isReciprocal: true,
    vipThreshold: 75,
    interactionCount: 2, // Only message 2
    hasExchangedMedia: false, // No photos/audios shared yet
  });

  // Must not be vip ready under any condition at message 2!
  assert.equal(earlyMessage2State.isVipReady, false);
  assert.notEqual(earlyMessage2State.stage, 'vip_ready');

  // Scenario: 7th message with photos/audios exchanged and high trust
  const earnedVipState = calculateTrustMetrics({
    currentTrust: 74,
    messageText: 'Me encantó el audio que me mandaste amor, quiero ver más de ti',
    mood: 'coqueto',
    isReciprocal: true,
    vipThreshold: 75,
    interactionCount: 7, // 7 turns
    hasExchangedMedia: true, // Photo/audio exchanged
  });

  assert.equal(earnedVipState.isVipReady, true);
  assert.equal(earnedVipState.stage, 'vip_ready');
});

