import test from 'node:test';
import assert from 'node:assert/strict';
import { AMBIENCE_PRESETS, AmbiencePresetId } from './ambientSoundscape';

test('ambient soundscape presets have valid acoustic parameters', () => {
  const presets: AmbiencePresetId[] = [
    'room_intimate',
    'bedroom_night',
    'rain_window',
    'cafe_chill',
    'balcony_breeze',
    'studio_warm',
    'car_interior',
    'beach_waves',
    'fireplace_warm',
    'custom',
  ];

  presets.forEach((presetId) => {
    const preset = AMBIENCE_PRESETS[presetId];
    assert.ok(preset, `Preset ${presetId} must exist`);
    assert.ok(preset.name.length > 0, 'Preset must have a human-readable name');
    assert.ok(preset.emoji.length > 0, 'Preset must have an icon emoji');
    assert.ok(preset.filterFreq >= 100 && preset.filterFreq <= 800, 'Filter frequency must be within audible warmth range');
    assert.ok(preset.defaultVolume > 0 && preset.defaultVolume <= 0.3, 'Volume must be subtle and non-intrusive');
    assert.ok(['brown', 'pink', 'room_air'].includes(preset.noiseType), 'Noise type must be an acoustic organic noise');
  });
});

test('room_intimate preset provides ideal indoor acoustic presence', () => {
  const room = AMBIENCE_PRESETS.room_intimate;
  assert.equal(room.id, 'room_intimate');
  assert.equal(room.noiseType, 'room_air');
  assert.ok(room.defaultVolume >= 0.1 && room.defaultVolume <= 0.2);
});

test('extended soundscapes (car, beach, fireplace, custom) exist and have unique identifiers', () => {
  assert.ok(AMBIENCE_PRESETS.car_interior.name.includes('Coche'));
  assert.ok(AMBIENCE_PRESETS.beach_waves.name.includes('Playa'));
  assert.ok(AMBIENCE_PRESETS.fireplace_warm.name.includes('Chimenea'));
  assert.ok(AMBIENCE_PRESETS.custom.name.includes('Personalizado'));
});
