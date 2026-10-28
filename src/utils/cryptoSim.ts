/**
 * Security and End-to-End Encryption simulation utilities
 */

export function generateSessionFingerprint(): string {
  const chars = '0123456789ABCDEF';
  const parts = [];
  for (let i = 0; i < 4; i++) {
    let block = '';
    for (let j = 0; j < 4; j++) {
      block += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    parts.push(block);
  }
  return `AURA-E2E-${parts.join(':')}`;
}

export function simulateEncryptedPayload(text: string): {
  cipher: string;
  iv: string;
  timestamp: number;
} {
  const encoded = btoa(unescape(encodeURIComponent(text)));
  const iv = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
  ).join('');

  return {
    cipher: `enc_${encoded.slice(0, 16)}...${encoded.slice(-8)}`,
    iv,
    timestamp: Date.now(),
  };
}
