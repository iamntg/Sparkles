# Implementation Plan: Backup & Restore

**Feature ID:** 006-backup-restore
**Spec:** ./spec.md
**Created:** 2026-05-06

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | Backup is an enhancement over the device-of-record; the app runs fully without it. |
| II — User's data | Yes | Client-side AES-GCM; storage is the user's own Drive AppData; no key/passphrase ever transmitted. |
| III — Calm by default | Yes | Minimal Settings list; sync is a deliberate, clearly-stated action. |
| IV — Shared core | Yes | Serialises `Idea`/`Link` from core; crypto in `packages/crypto`. |
| V — Cross-platform | Yes | Auth/Drive services expose one surface across platforms. |

## Technical Context

- **Language / runtime:** TypeScript, Expo. `expo-secure-store` for tokens.
- **Primary dependencies:** Google OAuth2, Google Drive API (AppData scope),
  `packages/crypto` (PBKDF2 + AES-GCM).
- **Storage:** local `ideas` + `links`; remote `sparkles_backup.json` in Drive
  AppData.
- **Platforms:** mobile + web.

## Architecture

```
settings.tsx
   ├─ googleAuthService  → OAuth2 flow, secure token persistence, sign-out
   ├─ backupService      → serialise(ideas+links) → vaultService.encrypt → upload
   │                        download → vaultService.decrypt → apply to DB
   ├─ vaultService       → packages/crypto (PBKDF2 key, AES-GCM encrypt/decrypt)
   └─ googleDriveService → Drive AppData upload/download/list
```

## Data Model

- **Serialised payload:** `{ ideas: Idea[], links: Link[] }` → JSON → encrypted
  blob → `sparkles_backup.json`.
- **Vault manifest** (`packages/core` `VaultManifest`): version, `kdf` (salt,
  iterations), `encryption` (algorithm) — describes how to decrypt.
- **Local apply:** upsert ideas and links via `packages/db` repositories.

## Contracts

- `googleAuthService.signIn() / signOut() / getSession()`
- `backupService.backup(): Promise<void>` — serialise → encrypt → upload.
- `backupService.restore(): Promise<void>` — download → decrypt → apply.
- `googleDriveService.uploadAppData(name, bytes) / downloadAppData(name) / list()`
- `vaultService.encrypt(json) / decrypt(blob)` (delegates to `packages/crypto`).

## Approach

1. Implement OAuth2 + secure token persistence + sign-out in `googleAuthService`.
2. `googleDriveService` for AppData upload/download/list.
3. `packages/crypto` vault: PBKDF2 key derivation, AES-GCM encrypt/decrypt,
   `VaultManifest`.
4. `backupService` orchestration for both directions.
5. Settings UI: gate actions on session + connectivity; wire Backup/Restore;
   disable with alert when offline.

## Risks & Trade-offs

- Whole-file overwrite is simple and safe for a single-device user but cannot
  merge concurrent edits from two devices — explicitly out of scope until
  multi-device sync is specified.
- Losing the key material means losing the ability to decrypt a backup; this is
  the deliberate cost of Article II (no server-side key escrow).
