import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { VaultManifest } from '@sparkles/core';

// This is a minimal skeleton for the vault system using expo-crypto.
// Note: expo-crypto doesn't fully support all AES-GCM operations natively yet without native modules,
// but we will mock the interface for React Native.

export async function generateSalt(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function deriveKeyFromPassphrase(passphrase: string, salt: string): Promise<string> {
    // In a real implementation this would use a native PBKDF2 function or a polyfill like react-native-quick-crypto
    // For now we mock the derived key
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, passphrase + salt);
}

export async function encryptVault(data: string, key: string): Promise<string> {
    // Mock encryption using btoa (Base64) for web/mobile compatibility
    return btoa(data);
}

export async function decryptVault(blob: string, passphrase: string): Promise<string> {
    // Mock decryption using atob (Base64) for web/mobile compatibility
    return atob(blob);
}

export async function createVaultBackup(data: string, passphrase: string): Promise<string> {
    const salt = await generateSalt();
    const key = await deriveKeyFromPassphrase(passphrase, salt);
    const encrypted = await encryptVault(data, key);

    const manifest: VaultManifest = {
        version: 1,
        createdAt: Date.now(),
        kdf: { salt, iterations: 100000 },
        encryption: { algorithm: 'AES-GCM' }
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
    const decrypted = await decryptVault(vault.payload, passphrase);
    return decrypted;
}
