import { googleAuthService } from './googleAuthService';

const DRIVE_API_URL = process.env.EXPO_PUBLIC_GOOGLE_DRIVE_API_URL || 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_URL = process.env.EXPO_PUBLIC_GOOGLE_UPLOAD_API_URL || 'https://www.googleapis.com/upload/drive/v3';

export const googleDriveService = {
  /**
   * List files in the appDataFolder with a specific name.
   */
  async listBackupFiles(filename: string): Promise<any[]> {
    const token = googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const q = encodeURIComponent(`name='${filename}' and 'appDataFolder' in parents`);
    const url = `${DRIVE_API_URL}/files?q=${q}&spaces=appDataFolder&fields=files(id, name, modifiedTime)`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to list files: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  },

  /**
   * Upload (create or update) a file to the appDataFolder.
   */
  async uploadBackupFile(filename: string, content: string): Promise<void> {
    const token = googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    // 1. Check if file exists to determine if we should POST (create) or PATCH (update)
    const existingFiles = await this.listBackupFiles(filename);
    const fileId = existingFiles.length > 0 ? existingFiles[0].id : null;

    const metadata = {
      name: filename,
      parents: ['appDataFolder'],
    };

    const boundary = 'foo_bar_baz';
    const multipartBody = 
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      `${content}\r\n` +
      `--${boundary}--`;

    const url = fileId 
      ? `${UPLOAD_API_URL}/files/${fileId}?uploadType=multipart`
      : `${UPLOAD_API_URL}/files?uploadType=multipart`;

    const method = fileId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to upload file: ${error.error?.message || response.statusText}`);
    }
  },

  /**
   * Download the content of a file by name.
   */
  async downloadBackupFile(filename: string): Promise<string> {
    const token = googleAuthService.getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const existingFiles = await this.listBackupFiles(filename);
    if (existingFiles.length === 0) {
      throw new Error(`Backup file '${filename}' not found on Google Drive.`);
    }

    const fileId = existingFiles[0].id;
    const url = `${DRIVE_API_URL}/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to download file: ${error.error?.message || response.statusText}`);
    }

    return await response.text();
  },
};
