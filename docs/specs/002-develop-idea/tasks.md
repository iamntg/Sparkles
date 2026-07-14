# Tasks: Develop Idea

**Feature ID:** 002-develop-idea
**Plan:** ./plan.md
**Created:** 2026-05-06

## Phase 1 — Foundations

- [x] T001 `links` table + from/to indexes — `packages/db/src/migrations.ts`
- [x] T002 [P] `linkRepository` list/delete (native + web) — `packages/db/src/linkRepository*.ts`
- [x] T003 [P] `ideaRepository` update + cascade delete — `packages/db/src/ideaRepository*.ts`

## Phase 2 — Core implementation

- [x] T004 `rawText` column + editable-content support — `packages/db/src/migrations.ts`, `packages/core/src/models.ts`
- [x] T005 Audio playback in `audioService` (play/stop) — `apps/mobile/services/audioService.ts`

## Phase 3 — UI / integration

- [x] T006 Develop screen scaffold with `PaperCard` layout — `apps/mobile/app/(app)/develop/[id].tsx`
- [x] T007 Editable main text with save
- [x] T008 Conditional Listen control bound to `audioLocalPath`
- [x] T009 Related section: list, inline-edit, unlink
- [x] T010 Delete with `ConfirmModal` + link cascade — `@sparkles/ui` ConfirmModal

## Phase 4 — Verification

- [x] T011 Validate against acceptance criteria in `spec.md`

## Dependency notes

- T009/T010 depend on 003 for the "Link another" picker but function
  independently for listing and unlinking.
