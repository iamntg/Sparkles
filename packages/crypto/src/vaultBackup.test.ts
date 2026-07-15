import { describe, it, expect, beforeEach, vi } from 'vitest';
import { randomBytes as nodeRandomBytes } from 'node:crypto';

// A tiny in-memory filesystem so we can exercise the full write-then-read backup
// flow (manifest + salt + iterations) without touching a real device.
const { store } = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock('expo-crypto', () => ({
    getRandomBytesAsync: async (n: number) => new Uint8Array(nodeRandomBytes(n)),
}));
vi.mock('expo-file-system', () => ({
    documentDirectory: 'file:///docs/',
    writeAsStringAsync: async (path: string, data: string) => {
        store.set(path, data);
    },
    readAsStringAsync: async (path: string) => {
        if (!store.has(path)) throw new Error(`No such file: ${path}`);
        return store.get(path)!;
    },
}));

import { createVaultBackup, restoreVaultBackup } from './vault';

describe('createVaultBackup / restoreVaultBackup', () => {
    beforeEach(() => store.clear());

    it('round-trips data through an encrypted file on disk', async () => {
        const data = JSON.stringify({ ideas: [{ id: 'x', text: 'secret plan' }] });

        const path = await createVaultBackup(data, 'my-passphrase');
        expect(path).toContain('sparkles_backup.json');

        expect(await restoreVaultBackup(path, 'my-passphrase')).toBe(data);
    });

    it('writes a manifest that declares the real algorithm and KDF params', async () => {
        const path = await createVaultBackup('{"a":1}', 'pass');

        const { manifest } = JSON.parse(store.get(path)!);
        expect(manifest.version).toBe(2);
        expect(manifest.encryption.algorithm).toBe('AES-256-GCM');
        expect(manifest.kdf.iterations).toBe(100_000);
        expect(manifest.kdf.salt).toMatch(/^[0-9a-f]{32}$/);
    });

    it('never writes the plaintext to disk', async () => {
        const path = await createVaultBackup(JSON.stringify({ note: 'topsecretvalue' }), 'pass');
        expect(store.get(path)).not.toContain('topsecretvalue');
    });

    it('fails to restore with the wrong passphrase', async () => {
        const path = await createVaultBackup('{"a":1}', 'right-pass');
        await expect(restoreVaultBackup(path, 'wrong-pass')).rejects.toThrow();
    });
});
