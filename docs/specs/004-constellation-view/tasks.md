# Tasks: Constellation View

**Feature ID:** 004-constellation-view
**Plan:** ./plan.md
**Created:** 2026-05-06

## Phase 1 — Foundations

- [x] T001 `constellationX/Y/Seed` fields on idea — `packages/core/src/models.ts`, `packages/db/src/migrations.ts`
- [x] T002 [P] `StarNode` component — `packages/ui/src/components/StarNode.tsx`
- [x] T003 [P] `StarLink` component (confidence-driven) — `packages/ui/src/components/StarLink.tsx`
- [x] T004 [P] `CosmicBackground` — `apps/mobile/components/CosmicBackground.tsx`

## Phase 2 — Core implementation

- [x] T005 Safe-area coordinate mapping (PADDING=60, modulo) — `apps/mobile/app/(app)/(tabs)/constellation.tsx`
- [x] T006 Link rendering guarded to co-present endpoints
- [x] T007 Refresh action reloading ideas + links

## Phase 3 — UI / integration

- [x] T008 Star tap → `/develop/[id]` navigation
- [x] T009 Make Constellation the default landing tab — `apps/mobile/app/(app)/(tabs)/_layout.tsx`
- [x] T010 Scattered ↔ Clustered layout modes with animated transition
- [x] T011 Capture FAB entry point

## Phase 4 — Verification

- [x] T012 Validate against acceptance criteria in `spec.md`

## Dependency notes

- T010 consumes cluster output from 005. T001 must precede T005 (coordinates).
- Pan/zoom and force-directed layout intentionally deferred (see spec §6).
