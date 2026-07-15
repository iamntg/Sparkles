import { describe, it, expect, vi } from 'vitest';
import { randomBytes as nodeRandomBytes } from 'node:crypto';

// expo-crypto / expo-file-system are native modules; stub the only pieces the
// vault touches. The PBKDF2 + AES-GCM under test (from @noble) runs for real.
vi.mock('expo-crypto', () => ({
    getRandomBytesAsync: async (n: number) => new Uint8Array(nodeRandomBytes(n)),
}));
vi.mock('expo-file-system', () => ({ documentDirectory: null }));

import {
    generateSalt,
    deriveKeyFromPassphrase,
    encryptVault,
    decryptVault,
} from './vault';

describe('generateSalt', () => {
    it('returns 16 random bytes as a 32-char hex string', async () => {
        const salt = await generateSalt();
        expect(salt).toMatch(/^[0-9a-f]{32}$/);
    });

    it('is different on every call', async () => {
        expect(await generateSalt()).not.toBe(await generateSalt());
    });
});

describe('deriveKeyFromPassphrase', () => {
    it('is deterministic for the same passphrase + salt', async () => {
        const salt = await generateSalt();
        const a = await deriveKeyFromPassphrase('correct horse', salt);
        const b = await deriveKeyFromPassphrase('correct horse', salt);
        expect([...a]).toEqual([...b]);
        expect(a).toHaveLength(32); // 256-bit AES key
    });

    it('produces a different key for a different passphrase', async () => {
        const salt = await generateSalt();
        const a = await deriveKeyFromPassphrase('correct horse', salt);
        const b = await deriveKeyFromPassphrase('wrong horse', salt);
        expect([...a]).not.toEqual([...b]);
    });
});

describe('encryptVault / decryptVault', () => {
    const secret = JSON.stringify({ ideas: ['a private thought'], v: 1 });

    it('round-trips data back to the original', async () => {
        const key = await deriveKeyFromPassphrase('pass', await generateSalt());
        const blob = await encryptVault(secret, key);
        expect(await decryptVault(blob, key)).toBe(secret);
    });

    it('does not leak the plaintext into the ciphertext', async () => {
        const key = await deriveKeyFromPassphrase('pass', await generateSalt());
        const blob = await encryptVault(secret, key);
        const decoded = Buffer.from(blob, 'base64').toString('binary');
        expect(decoded).not.toContain('private thought');
    });

    it('uses a fresh IV, so the same input encrypts differently each time', async () => {
        const key = await deriveKeyFromPassphrase('pass', await generateSalt());
        expect(await encryptVault(secret, key)).not.toBe(await encryptVault(secret, key));
    });

    it('rejects decryption with the wrong key (GCM auth tag)', async () => {
        const salt = await generateSalt();
        const key = await deriveKeyFromPassphrase('right', salt);
        const wrongKey = await deriveKeyFromPassphrase('wrong', salt);
        const blob = await encryptVault(secret, key);
        await expect(decryptVault(blob, wrongKey)).rejects.toThrow();
    });

    it('rejects tampered ciphertext', async () => {
        const key = await deriveKeyFromPassphrase('pass', await generateSalt());
        const blob = await encryptVault(secret, key);
        const bytes = Buffer.from(blob, 'base64');
        bytes[bytes.length - 1] ^= 0xff; // flip the last byte of the auth tag
        await expect(decryptVault(bytes.toString('base64'), key)).rejects.toThrow();
    });
});
