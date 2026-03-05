import { createVaultBackup as cryptoCreateVaultBackup, restoreVaultBackup as cryptoRestoreVaultBackup } from '@sparkles/crypto';

export async function createVaultBackup(data: string, passphrase: string): Promise<string> {
    // Call crypto package
    return cryptoCreateVaultBackup(data, passphrase);
}

export async function restoreVaultBackup(filePath: string, passphrase: string): Promise<string> {
    // Call crypto package
    return cryptoRestoreVaultBackup(filePath, passphrase);
}
