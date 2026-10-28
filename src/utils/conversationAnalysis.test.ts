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
