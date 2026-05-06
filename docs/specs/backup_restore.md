# Feature: Google Drive Backup & Sync

## 1. Goal & Context
Allow users to securely backup and restore their entire idea vault using their personal Google Drive storage.

## 2. User Experience (UX)
### User Flow
1. User navigates to Settings.
2. User taps "Login with Google" (if not authenticated).
3. **Backup**:
   - User taps "Sync to Google Drive".
   - System fetches all ideas and links from the local database.
   - System creates/updates a `sparkles_backup.json` file in the user's Google Drive (App Data folder).
4. **Restore**:
   - User taps "Restore from Google Drive".
   - System downloads the latest backup file.
   - System merges or replaces local data with remote data.

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Google OAuth credentials, local database content (ideas + links), remote backup file from Google Drive.
- **Outputs**: `sparkles_backup.json` file stored in Google Drive, updated local database after restore.

### Data Model Usage
- **Tables**: `ideas`, `links`
- **Serialization**: JSON format containing all fields (tags, audio paths, linked relationships).

### External Services
- **googleAuthService**: Handles OAuth2 flow and session management.
- **googleDriveService**: Handles file upload, download, and listing in the "AppData" scope.
- **backupService**: Orchestrates the serialization and synchronization logic.

## 4. Business Rules & Constraints
- **Security**: Backups are stored in a hidden "App Data" folder, inaccessible to users via the standard GDrive UI.
- **Authentication**: A valid Google session is required for any remote sync operation.
- **Privacy**: No data is stored on any intermediary server; sync is direct between device and Google Drive.
- **Conflict Policy**: Current policy is "Remote Wins" (Full Restore) or "Local Overwrite" (Full Backup).

## 5. Acceptance Criteria
- [ ] Successfully logging in with Google enables the "Sync" and "Restore" buttons.
- [ ] Tapping "Sync" creates a `sparkles_backup.json` file in the AppData folder.
- [ ] Tapping "Restore" downloads the file and updates the local database.
- [ ] Backup includes all associated links for each idea.
- [ ] System handles "No Network" state by disabling sync actions and showing an alert.
- [ ] Tokens are securely managed and persisted for background sync (if implemented).

## 6. Implementation Status
- [x] Google OAuth integration
- [x] Google Drive AppData folder support
- [x] JSON serialization of ideas and links
- [x] Manual trigger for Sync (Backup)
- [x] Manual trigger for Restore
- [ ] Auto-sync on change
- [ ] Conflict resolution UI