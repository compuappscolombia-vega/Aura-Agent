import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanTextForSpeech } from './speechSanitizer';

test('removes action annotations in asterisks, parentheses, and brackets', () => {
  const raw = '*se ríe* Jajajaja hola amor (pensando en ti) [pausa] ¿cómo estás? *susurra dulcemente*';
  const cleaned = cleanTextForSpeech(raw);
  assert.ok(!cleaned.includes('*'));
  assert.ok(!cleaned.includes('('));
  assert.ok(!cleaned.includes(')'));
  assert.ok(!cleaned.includes('['));
  assert.ok(!cleaned.includes(']'));
  assert.ok(cleaned.includes('jaja hola amor ¿cómo estás?'));
});

test('removes all unicode emojis so TTS does not read them out as words', () => {
  const raw = 'Hola hermoso ☕🔥 Me encantó tu mensaje 😉🤤🥰 Entra a verme 💋❤️';
  const cleaned = cleanTextForSpeech(raw);
  assert.ok(!/[\u{1F300}-\u{1F9FF}]/u.test(cleaned));
  assert.ok(!cleaned.includes('☕'));
  assert.ok(!cleaned.includes('🔥'));
  assert.ok(!cleaned.includes('😉'));
  assert.equal(cleaned, 'Hola hermoso Me encantó tu mensaje Entra a verme');
});

test('removes URLs and links', () => {
  const raw = 'Entra en https://onlyfans.com/afire_sb para ver mis fotos sin censura';
  const cleaned = cleanTextForSpeech(raw);
  assert.ok(!cleaned.includes('https://'));
  assert.ok(!cleaned.includes('onlyfans.com'));
  assert.equal(cleaned, 'Entra en para ver mis fotos sin censura');
});

test('expands common Spanish abbreviations and normalizes laughter', () => {
  const raw = 'q haces xfa? jajajajaja tb te extraño mucho dnd estás?';
  const cleaned = cleanTextForSpeech(raw);
  assert.ok(cleaned.includes('que haces'));
  assert.ok(cleaned.includes('por favor'));
  assert.ok(cleaned.includes('jaja'));
  assert.ok(cleaned.includes('también'));
  assert.ok(cleaned.includes('dónde'));
});

test('converts ellipsis to gentle comma pauses without reading dots', () => {
  const raw = 'Hola amor... me quedé pensando en ti... ¿nos vemos?';
  const cleaned = cleanTextForSpeech(raw);
  assert.ok(!cleaned.includes('...'));
  assert.ok(cleaned.includes('Hola amor, me quedé pensando en ti, ¿nos vemos?'));
});
