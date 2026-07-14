# Tasks: Backup & Restore

**Feature ID:** 006-backup-restore
**Plan:** ./plan.md
**Created:** 2026-05-06

## Phase 1 — Foundations

- [x] T001 `VaultManifest` type — `packages/core/src/models.ts`
- [x] T002 Vault crypto: PBKDF2 key + AES-GCM encrypt/decrypt — `packages/crypto/src/vault.ts`
- [x] T003 [P] `linkRepository.upsert` for restore apply — `packages/db/src/linkRepository*.ts`

## Phase 2 — Core implementation

- [x] T004 Google OAuth2 + secure token persistence — `apps/mobile/services/googleAuthService.ts`
- [x] T005 [P] Drive AppData upload/download/list — `apps/mobile/services/googleDriveService.ts`
- [x] T006 [P] Device-specific vault key storage — `apps/mobile/services/vaultService.ts`
- [x] T007 `backupService` serialise/encrypt/upload + download/decrypt/apply — `apps/mobile/services/backupService.ts`

## Phase 3 — UI / integration

- [x] T008 Settings: Google sign-in / sign-out — `apps/mobile/app/(app)/(tabs)/settings.tsx`
- [x] T009 Sync (Backup) and Restore actions
- [x] T010 Disable sync + alert when offline / signed out
- [x] T011 Cross-platform auth-state management

## Phase 4 — Verification

- [x] T012 Validate against acceptance criteria in `spec.md`

## Backlog (deferred)

- [ ] Auto-sync on change
- [ ] Conflict-resolution UI

## Dependency notes

- T007 depends on T002, T005, T006. Restore (T009) reuses the same repositories
  as capture (001) and linking (003) to apply data — one write path, Article IV.
