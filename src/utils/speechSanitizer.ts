/**
 * Speech Sanitizer for AuraAgent
 * Strips all written signs, emojis, markdown actions (*se ríe*, *susurra*),
 * bracketed notes, punctuation words, URLs, and formatting so the speech synthesis
 * (Gemini TTS & Web Speech) speaks ONLY natural, fluent, human-sounding words.
 */

export function cleanTextForSpeech(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // 1. Remove bracketed / asterisk-enclosed action cues or stage directions
  // e.g. *se ríe*, *susurra dulcemente*, (pensando en ti), [pausa], *sonríe pícaramente*
  cleaned = cleaned.replace(/\*[^*]+\*/g, ' ');
  cleaned = cleaned.replace(/\([^)]+\)/g, ' ');
  cleaned = cleaned.replace(/\[[^\]]+\]/g, ' ');

  // 2. Remove all URLs and web links
  cleaned = cleaned.replace(/https?:\/\/\S+/gi, ' ');
  cleaned = cleaned.replace(/www\.\S+/gi, ' ');
  cleaned = cleaned.replace(/onlyfans\.com\/\S+/gi, ' ');

  // 3. Remove all Emojis using comprehensive Unicode regex + variation selectors & ZWJ
  // Emojis cause speech engines to read "cara sonriente con ojos de corazón", "taza de café caliente", etc.
  cleaned = cleaned.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}\p{Extended_Pictographic}\u{FE00}-\u{FE0F}\u{200D}\u{200B}]/gu,
    ' '
  );

  // 4. Strip stray markdown and punctuation symbols that engines verbalize as words
  // e.g. asterisks (*), hashtags (#), underscores (_), tildes (~), backticks (`), slashes, angle brackets (< >), pipes (|)
  cleaned = cleaned.replace(/[*#_~`^|<>{}\\/@]/g, ' ');

  // 5. Replace multiple dots or dashes with gentle natural comma pauses
  cleaned = cleaned.replace(/\.{2,}/g, ', ');
  cleaned = cleaned.replace(/-{2,}/g, ', ');
  cleaned = cleaned.replace(/[—–]/g, ', ');

  // 6. Clean quotes and apostrophes
  cleaned = cleaned.replace(/["'«»“”]/g, '');

  // 7. Prevent repeated punctuation that causes weird inflection
  cleaned = cleaned.replace(/!{2,}/g, '!');
  cleaned = cleaned.replace(/\?{2,}/g, '?');

  // 8. Expand common Spanish chat abbreviations for natural spoken pronunciation
  cleaned = cleaned
    .replace(/\b(q|k)\b/gi, 'que')
    .replace(/\btmb\b/gi, 'también')
    .replace(/\btb\b/gi, 'también')
    .replace(/\bdnd\b/gi, 'dónde')
    .replace(/\bxq\b/gi, 'por qué')
    .replace(/\bxfa\b/gi, 'por favor')
    .replace(/\bmsg\b/gi, 'mensaje')
    .replace(/\bdms?\b/gi, 'mensajes');

  // 9. Normalize laughter so it doesn't sound robotic
  cleaned = cleaned.replace(/\b(jajaja+|jejeje+|jijiji+)\b/gi, 'jaja');

  // 10. Collapse multiple spaces and trim
  cleaned = cleaned
    .replace(/\s+/g, ' ')
    .replace(/\s+([,;.?!])/g, '$1')
    .trim();

  return cleaned;
}
