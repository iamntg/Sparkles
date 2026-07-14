# Feature Specification: Backup & Restore

**Feature ID:** 006-backup-restore
**Status:** Shipped
**Created:** 2026-05-06
**Input:** "My ideas live only on my phone — let me back them up to my own Google Drive and get them back if I lose the device, without trusting anyone else's server."

## 1. Goal & Context

Local-first (Article I) means the device is the only copy — which is a data-loss
risk. This feature closes that risk without compromising Article II: the entire
vault (ideas + links) is serialised, encrypted client-side, and stored in the
user's own Google Drive AppData folder. No Sparkles-operated server ever sees the
data or the key. It is the safety net that makes local-first responsible.

## 2. User Experience

### User Flow

1. User opens **Settings**.
2. User signs in with Google (if not already authenticated).
3. **Backup:** user taps **Sync to Google Drive**; the app serialises all ideas
   and links and writes/updates `sparkles_backup.json` in the AppData folder.
4. **Restore:** user taps **Restore from Google Drive**; the app downloads the
   latest backup and applies it to the local database.

### Edge Cases

- **Not signed in:** Sync/Restore are disabled until a valid Google session
  exists.
- **Offline:** sync actions are disabled with an explanatory alert.
- **No backup present on restore:** clear "nothing to restore" message.
- **Sign-out:** session and tokens are cleared; remote actions disable again.

## 3. Requirements

- **FR-1:** The system MUST authenticate with Google before any remote sync.
- **FR-2:** Backup MUST serialise all ideas and their links to JSON.
- **FR-3:** Backup MUST write/update `sparkles_backup.json` in the Drive AppData
  (hidden) scope.
- **FR-4:** Restore MUST download the latest backup and update the local database.
- **FR-5:** Backup contents MUST be encrypted client-side (PBKDF2 key derivation,
  AES-GCM encryption); no passphrase or key leaves the device.
- **FR-6:** Offline / no-session states MUST disable sync actions with a clear
  message.
- **FR-7:** Sign-out MUST clear the persisted session securely.

## 4. Business Rules & Constraints

- Backups live in the hidden AppData folder — invisible in the normal Drive UI.
- No intermediary server: sync is device ↔ Google Drive only (Article II).
- Encryption uses `packages/crypto` (PBKDF2 + AES-GCM); the device holds key
  material only, never a server.
- Conflict policy is coarse for now: full **Backup** overwrites remote; full
  **Restore** overwrites local ("remote wins" / "local wins" per action).

## 5. Acceptance Criteria

- [ ] Signing in with Google enables the Sync and Restore actions.
- [ ] Sync writes `sparkles_backup.json` to the AppData folder.
- [ ] The backup includes every idea and all of its links.
- [ ] Restore downloads the file and updates the local database.
- [ ] Backup content is encrypted; no passphrase/key is transmitted or stored
      server-side.
- [ ] With no network, sync actions are disabled and an alert is shown.
- [ ] Sign-out clears the session and re-disables remote actions.

## 6. Out of Scope

- Automatic sync-on-change (backlog; currently manual trigger).
- Field-level conflict resolution / merge UI (backlog; whole-file policy for now).
- Multi-device live sync.
