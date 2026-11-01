import { test } from 'node:test';
import assert from 'node:assert/strict';

test('external webhook endpoint responds to documentation health check', async () => {
  const res = await fetch('http://localhost:3000/api/webhooks/external/dm-inbound');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'online');
  assert.equal(data.endpoint, '/api/webhooks/external/dm-inbound');
  assert.equal(data.method, 'POST');
  assert.ok(Array.isArray(data.supportedModels));
  assert.ok(data.supportedModels.length >= 4);
});

test('external webhook accepts inbound DM, routes to model, and returns agentic response with HMAC signature', async () => {
  const payload = {
    senderHandle: '@fan_vip_test',
    senderName: 'Alejandro G.',
    text: 'Hola Valeria! Me encantó tu foto en el gym, ¿dónde puedo ver más fotos íntimas o tu contenido exclusivo?',
    modelId: 'valeria-gomez',
  };

  const res = await fetch('http://localhost:3000/api/webhooks/external/dm-inbound', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-aura-secret': 'aura_whsec_77f49b102948ce6a31',
    },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 200);
  const sig = res.headers.get('x-aura-signature');
  assert.ok(sig, 'Response should contain X-Aura-Signature header');
  assert.ok(sig.startsWith('sha256='));

  const data = await res.json();
  assert.equal(data.success, true);
  assert.equal(data.processed, true);
  assert.equal(data.model.id, 'valeria-gomez');
  assert.equal(data.model.name, 'Valeria Gómez');
  assert.ok(data.reply.text.length > 10);
  assert.equal(data.reply.salesPitch.pitchVip, true, 'Should offer VIP since user asked about exclusive photos');
  assert.ok(data.reply.salesPitch.vipLink.includes('onlyfans.com'));
  assert.ok(data.executionTimeMs >= 0);
});

test('auth session endpoints allow login with X and Google', async () => {
  // Login with X
  const xRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'x',
      name: 'Valeria Gómez Creadora',
      handle: '@valeriag_official',
      role: 'creator',
    }),
  });
  const xData = await xRes.json();
  assert.equal(xData.success, true);
  assert.equal(xData.session.provider, 'x');
  assert.equal(xData.session.handle, '@valeriag_official');

  // Verify session endpoint
  const checkRes = await fetch('http://localhost:3000/api/auth/session');
  const checkData = await checkRes.json();
  assert.equal(checkData.session.handle, '@valeriag_official');

  // Login with Google
  const gRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      provider: 'google',
      name: 'Admin Aura',
      email: 'gato-284@hotmail.com',
      role: 'admin',
    }),
  });
  const gData = await gRes.json();
  assert.equal(gData.success, true);
  assert.equal(gData.session.provider, 'google');
  assert.equal(gData.session.email, 'gato-284@hotmail.com');
});

test('registration system handles real model registration and admin registration with isolation', async () => {
  // 1. Register a real model
  const regModelRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'creator',
      name: 'Valentina Real',
      handle: '@valen_real',
      age: 23,
      location: 'Medellín, Colombia',
      bio: 'Creadora independiente oficial +18',
      vipLink: 'https://onlyfans.com/valen_real',
      vipPrice: '$19.99/mes',
      accent: 'Latino dulce (Paisa)',
    }),
  });
  assert.equal(regModelRes.status, 200);
  const regModelData = await regModelRes.json();
  assert.equal(regModelData.success, true);
  assert.equal(regModelData.session.role, 'creator');
  assert.equal(regModelData.session.handle, '@valen_real');
  assert.equal(regModelData.model.isRealModel, true);
  assert.equal(regModelData.model.isSystemDefault, false);

  // 2. Query models as creator: should only receive isolated profile
  const creatorModelsRes = await fetch('http://localhost:3000/api/models?role=creator&modelId=valen_real');
  const creatorModelsData = await creatorModelsRes.json();
  assert.equal(creatorModelsData.success, true);
  assert.equal(creatorModelsData.role, 'creator');
  assert.equal(creatorModelsData.models.length, 1);
  assert.equal(creatorModelsData.models[0].id, 'valen_real');

  // 3. Register / login as Administrator: should view both test models and real models
  const adminRegRes = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'admin',
      name: 'Admin Global Agencia',
      email: 'admin@auraagency.com',
    }),
  });
  const adminRegData = await adminRegRes.json();
  assert.equal(adminRegData.success, true);
  assert.equal(adminRegData.session.role, 'admin');

  // 4. Query models as admin: should see all models (test models + real models)
  const adminModelsRes = await fetch('http://localhost:3000/api/models?role=admin');
  const adminModelsData = await adminModelsRes.json();
  assert.equal(adminModelsData.success, true);
  assert.equal(adminModelsData.role, 'admin');
  assert.ok(adminModelsData.testModelsCount >= 4, 'Admin must see at least 4 test models');
  assert.ok(adminModelsData.realModelsCount >= 2, 'Admin must see registered real models');
});
