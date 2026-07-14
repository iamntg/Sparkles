# Tasks: Capture Idea

**Feature ID:** 001-capture-idea
**Plan:** ./plan.md
**Created:** 2026-05-06

## Phase 1 — Foundations

- [x] T001 Define `Idea` type and `IdeaStatus` enum — `packages/core/src/models.ts`
- [x] T002 Create `ideas` table + indexes in migrations — `packages/db/src/migrations.ts`
- [x] T003 [P] Implement `ideaRepository` insert/get (native + web) — `packages/db/src/ideaRepository*.ts`

## Phase 2 — Core implementation

- [x] T004 `ideaService.createIdea` orchestration — `apps/mobile/services/ideaService.ts`
- [x] T005 [P] `audioService` record/stop + local file save — `apps/mobile/services/audioService.ts`
- [x] T006 [P] `transcriptionService.transcribe` client — `apps/mobile/services/transcriptionService.ts`
- [x] T007 Transcription HTTP endpoint — `apps/transcription/src/index.ts`

## Phase 3 — UI / integration

- [x] T008 Capture screen: auto-focus input, optional title, Save — `apps/mobile/app/(app)/add.tsx`
- [x] T009 Record/Stop control wired to audio + transcription flow — `apps/mobile/app/(app)/add.tsx`
- [x] T010 Disable Save on empty input

## Phase 4 — Verification

- [x] T011 Validate against acceptance criteria in `spec.md`

## Dependency notes

- T004 depends on T001–T003. T009 depends on T005–T007. T004 must create the row
  before T006 returns (FR-4), so transcription patches an existing record.
