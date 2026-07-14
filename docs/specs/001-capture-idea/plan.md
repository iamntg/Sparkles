# Implementation Plan: Capture Idea

**Feature ID:** 001-capture-idea
**Spec:** ./spec.md
**Created:** 2026-05-06

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | Save writes straight to SQLite; no network on the capture path. |
| II — User's data | Yes | Audio stays on-device; transcription sends audio to a service but persists nothing there. |
| III — Calm by default | Yes | Single centred input, auto-focus, one primary action. |
| IV — Shared core | Yes | `Idea` type from `packages/core`; writes via `packages/db` repository. |
| V — Cross-platform | Yes | Repository has `.native`/`.web` variants with one surface. |

## Technical Context

- **Language / runtime:** TypeScript, Expo SDK (React Native), Expo Router.
- **Primary dependencies:** `expo-audio` (recording/playback), `expo-file-system`
  (local audio storage), the transcription service (`apps/transcription`).
- **Storage:** `ideas` table (`packages/db`).
- **Platforms:** mobile (primary), web (text capture; audio best-effort).

## Architecture

```
add.tsx (screen)
   │ calls
   ▼
ideaService.ts ──────────► ideaRepository (packages/db) ──► SQLite `ideas`
   │ (audio path)
   ├─► audioService.ts ──► expo-audio + expo-file-system (local file)
   └─► transcriptionService.ts ──► POST apps/transcription /transcribe
```

The screen holds no persistence logic. `ideaService` orchestrates: create the
row, kick off audio save + transcription, patch the row when the transcript
returns.

## Data Model

`ideas` (subset relevant here):

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | TEXT (uuid) | PK |
| `createdAt` / `updatedAt` | INTEGER | epoch ms |
| `sourceType` | TEXT | `text` \| `audio` |
| `text` | TEXT | body or transcript |
| `title` | TEXT | optional |
| `status` | TEXT | starts at draft (`IdeaStatus.DRAFT`) |
| `transcriptStatus` | TEXT | `DONE` \| `FAILED` for audio sources |
| `audioLocalPath` | TEXT | local file URI |

## Contracts

- `ideaService.createIdea({ text, title?, sourceType, audioLocalPath? }): Promise<Idea>`
- `transcriptionService.transcribe(uri): Promise<{ text: string }>`
  — `POST /transcribe` (multipart audio) on `apps/transcription`, returns text.
- `audioService.startRecording() / stopRecording(): Promise<{ uri: string }>`

## Approach

1. Build `add.tsx` with auto-focused input, optional title, Save + Record.
2. Wire Save → `ideaService.createIdea` (text path).
3. Implement `audioService` record/stop; persist file via `expo-file-system`.
4. On stop, create the idea (audio path) immediately, then call
   `transcriptionService.transcribe` and patch `text` + `transcriptStatus`.
5. Guard empty input; wrap transcription in try/catch → `FAILED`.

## Risks & Trade-offs

- Transcription depends on an external service; mitigated by creating the idea
  first and marking failures for retry (Article I).
- Web audio support varies by browser; text capture is the guaranteed path.
