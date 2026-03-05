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
    // Mock encryption
    return Buffer.from(data).toString('base64');
}

export async function decryptVault(blob: string, passphrase: string): Promise<string> {
    // Mock decryption
    return Buffer.from(blob, 'base64').toString('utf8');
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
    const backupPath = FileSystem.documentDirectory + 'sparkles_backup.json';
    await FileSystem.writeAsStringAsync(backupPath, vault);
    return backupPath;
}

export async function restoreVaultBackup(filePath: string, passphrase: string): Promise<string> {
    const vaultJson = await FileSystem.readAsStringAsync(filePath);
    const vault = JSON.parse(vaultJson);
    const decrypted = await decryptVault(vault.payload, passphrase);
    return decrypted;
}
