import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractRawAcousticSignatures,
  createRawAudioSample,
} from './rawAudioAnalyzer';

test('extracts raw acoustic signatures without requiring text transcription', () => {
  const result = extractRawAcousticSignatures('clean_voice_note_bedroom.wav', 12, 450000);

  // F0 fundamental pitch within female natural voice range
  assert.ok(result.f0PitchHz >= 180 && result.f0PitchHz <= 260, `f0PitchHz was ${result.f0PitchHz}`);

  // Harmonic warmth high fidelity
  assert.ok(result.harmonicWarmth >= 85 && result.harmonicWarmth <= 100);

  // Purity and breathiness
  assert.ok(result.spectralPurity >= 90 && result.spectralPurity <= 100);
  assert.ok(result.breathinessRatio >= 15 && result.breathinessRatio <= 50);

  // Cadence rate
  assert.ok(result.cadenceRate >= 0.88 && result.cadenceRate <= 1.15);

  // Acoustic noise floor and reverb
  assert.ok(result.roomNoiseFloorDb <= -30 && result.roomNoiseFloorDb >= -55);
  assert.ok(result.roomReverbEstimate.length > 0);
  assert.ok(result.recommendedAmbience.length > 0);
});

test('creates valid RawAudioSample with clean acoustic parameters', () => {
  const sample = createRawAudioSample(
    'afire-sb',
    'ana_maria_audio_crudo_whatsapp.mp3',
    'data:audio/mp3;base64,SUQzBAAAAAAA...',
    undefined,
    9,
    320000
  );

  assert.equal(sample.modelId, 'afire-sb');
  assert.equal(sample.name, 'ana_maria_audio_crudo_whatsapp');
  assert.equal(sample.durationSeconds, 9);
  assert.ok(sample.id.startsWith('raw-aud-'));
  assert.ok(sample.signatures.f0PitchHz > 0);
  assert.ok(sample.signatures.recommendedAmbience);
});
