# Tasks: Linking Ideas

**Feature ID:** 003-linking-ideas
**Plan:** ./plan.md
**Created:** 2026-05-06

## Phase 1 — Foundations

- [x] T001 `links` schema with `confidence` — `packages/db/src/migrations.ts`
- [x] T002 [P] `linkRepository.upsert` idempotent on pair — `packages/db/src/linkRepository*.ts`

## Phase 2 — Core implementation

- [x] T003 On-device similarity utility — `apps/mobile/services/linkService.ts`
- [x] T004 `linkService.suggest` filter (self, linked) + rank (similarity, recency)

## Phase 3 — UI / integration

- [x] T005 Suggestion picker modal with "AI Recommended" grouping — `apps/mobile/app/(app)/develop/[id].tsx`
- [x] T006 Multi-select + single confirm creating N links
- [x] T007 Immediate Related-section refresh after linking
- [x] T008 Empty-state message when no candidates

## Phase 4 — Verification

- [x] T009 Validate against acceptance criteria in `spec.md`

## Dependency notes

- T005–T007 build on the Develop screen from 002. T002's pair-idempotency
  satisfies FR-5 without extra UI checks.
