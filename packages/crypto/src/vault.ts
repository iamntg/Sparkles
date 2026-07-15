import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { VaultManifest } from '@sparkles/core';
import { gcm } from '@noble/ciphers/aes';
import { bytesToUtf8, utf8ToBytes, bytesToHex, hexToBytes } from '@noble/ciphers/utils';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';

// Real client-side vault encryption. Nothing here is a mock:
//   • key derivation:  PBKDF2-HMAC-SHA256 (100k iterations) → 256-bit key
//   • encryption:      AES-256-GCM (authenticated, random 96-bit IV per backup)
// The libraries are pure-JS, so this runs identically on iOS, Android and web
// (including Expo Go) without any native module.

const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256-bit AES key
const SALT_LENGTH = 16; // 128-bit salt
const IV_LENGTH = 12; // 96-bit nonce, the recommended size for GCM

async function randomBytes(length: number): Promise<Uint8Array> {
    return Crypto.getRandomBytesAsync(length);
}

// ─── Base64 <-> bytes (btoa/atob are available on Hermes and web) ─────────────
function bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export async function generateSalt(): Promise<string> {
    return bytesToHex(await randomBytes(SALT_LENGTH));
}

/**
 * Derive a 256-bit AES key from a passphrase using PBKDF2-HMAC-SHA256.
 * Returns the raw key bytes (not a string) so it can be fed straight into AES.
 */
export async function deriveKeyFromPassphrase(
    passphrase: string,
    salt: string,
    iterations: number = PBKDF2_ITERATIONS
): Promise<Uint8Array> {
    return pbkdf2Async(sha256, utf8ToBytes(passphrase), hexToBytes(salt), {
        c: iterations,
        dkLen: KEY_LENGTH,
    });
}

/**
 * Encrypt UTF-8 data with AES-256-GCM. A fresh random IV is generated for every
 * call and prepended to the ciphertext so the payload is self-describing.
 * Output: base64( iv[12] || ciphertext || gcmTag ).
 */
export async function encryptVault(data: string, key: Uint8Array): Promise<string> {
    const iv = await randomBytes(IV_LENGTH);
    const ciphertext = gcm(key, iv).encrypt(utf8ToBytes(data));

    const combined = new Uint8Array(iv.length + ciphertext.length);
    combined.set(iv, 0);
    combined.set(ciphertext, iv.length);
    return bytesToBase64(combined);
}

/**
 * Decrypt a payload produced by {@link encryptVault}. GCM verifies the auth tag,
 * so a wrong key or tampered ciphertext throws instead of returning garbage.
 */
export async function decryptVault(blob: string, key: Uint8Array): Promise<string> {
    const combined = base64ToBytes(blob);
    const iv = combined.slice(0, IV_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH);
    const plaintext = gcm(key, iv).decrypt(ciphertext);
    return bytesToUtf8(plaintext);
}

export async function createVaultBackup(data: string, passphrase: string): Promise<string> {
    const salt = await generateSalt();
    const key = await deriveKeyFromPassphrase(passphrase, salt);
    const encrypted = await encryptVault(data, key);

    const manifest: VaultManifest = {
        version: 2,
        createdAt: Date.now(),
        kdf: { salt, iterations: PBKDF2_ITERATIONS },
        encryption: { algorithm: 'AES-256-GCM' },
    };

    const vault = JSON.stringify({ manifest, payload: encrypted });

    // On Web, documentDirectory is null/undefined.
    const docDir = (FileSystem as any).documentDirectory;
    if (!docDir) {
        console.warn('Local file system not available on web. Skipping local write.');
        return 'memory://sparkles_backup.json';
    }

    const backupPath = docDir + 'sparkles_backup.json';
    await FileSystem.writeAsStringAsync(backupPath, vault);
    return backupPath;
}

export async function restoreVaultBackup(filePath: string, passphrase: string): Promise<string> {
    if (!(FileSystem as any).documentDirectory && !filePath.startsWith('memory://')) {
        throw new Error('Local file system not available on web.');
    }
    const vaultJson = await FileSystem.readAsStringAsync(filePath);
    const vault = JSON.parse(vaultJson);
    const key = await deriveKeyFromPassphrase(
        passphrase,
        vault.manifest.kdf.salt,
        vault.manifest.kdf.iterations
    );
    return decryptVault(vault.payload, key);
}
