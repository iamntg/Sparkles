import { getAllIdeas, getAllLinks, upsertIdea, upsertLink } from '@sparkles/db';
import {
  generateSalt,
  deriveKeyFromPassphrase,
  encryptVault,
  decryptVault
} from '@sparkles/crypto';
import { googleDriveService } from './googleDriveService';
import { VaultManifest } from '@sparkles/core';

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BACKUP_FILENAME = 'sparkles_backup.json';
const VAULT_KEY_STORAGE_KEY = 'sparkles_vault_passphrase';

/**
 * Gets or creates a unique encryption passphrase for this user.
 * This is stored securely on the device and is unique to every user.
 */
async function getVaultKey(): Promise<string> {
  let key: string | null = null;

  if (Platform.OS === 'web') {
    key = localStorage.getItem(VAULT_KEY_STORAGE_KEY);
  } else {
    key = await SecureStore.getItemAsync(VAULT_KEY_STORAGE_KEY);
  }

  if (!key) {
    // Generate a random unique key for this new user
    key = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    if (Platform.OS === 'web') {
      localStorage.setItem(VAULT_KEY_STORAGE_KEY, key);
    } else {
      await SecureStore.setItemAsync(VAULT_KEY_STORAGE_KEY, key);
    }
  }

  return key;
}

export const backupService = {
  /**
   * Orchestrates the backup process: fetch, encrypt, upload.
   */
  async backup(): Promise<void> {
    try {
      // 1. Fetch all local data
      const ideas = await getAllIdeas();
      const links = await getAllLinks();

      const backupData = {
        ideas,
        links,
        metadata: {
          exportedAt: Date.now(),
          device: 'mobile',
        },
      };

      const dataString = JSON.stringify(backupData);

      // 2. Encrypt the data
      const salt = await generateSalt();
      const passphrase = await getVaultKey();
      const key = await deriveKeyFromPassphrase(passphrase, salt);
      const encryptedPayload = await encryptVault(dataString, key);

      const manifest: VaultManifest = {
        version: 1,
        createdAt: Date.now(),
        kdf: { salt, iterations: 100000 },
        encryption: { algorithm: 'AES-GCM' },
      };

      const fullBackup = JSON.stringify({ manifest, payload: encryptedPayload });

      // 3. Upload to Google Drive
      await googleDriveService.uploadBackupFile(BACKUP_FILENAME, fullBackup);

      console.log('Backup successful');
    } catch (error) {
      console.error('Backup failed:', error);
      throw error;
    }
  },

  /**
   * Orchestrates the restore process: download, decrypt, restore.
   */
  async restore(): Promise<void> {
    try {
      // 1. Download from Google Drive
      const cloudContent = await googleDriveService.downloadBackupFile(BACKUP_FILENAME);
      const { manifest, payload } = JSON.parse(cloudContent);

      // 2. Decrypt the data
      const passphrase = await getVaultKey();
      const key = await deriveKeyFromPassphrase(passphrase, manifest.kdf.salt);
      const decryptedDataString = await decryptVault(payload, key);
      const backupData = JSON.parse(decryptedDataString);

      // 3. Restore to local DB
      // We use upsert to prevent duplicates and update existing records

      if (backupData.ideas) {
        for (const idea of backupData.ideas) {
          await upsertIdea(idea);
        }
      }

      if (backupData.links) {
        for (const link of backupData.links) {
          await upsertLink(link);
        }
      }

      console.log('Restore successful');
    } catch (error) {
      console.error('Restore failed:', error);
      throw error;
    }
  },
};
