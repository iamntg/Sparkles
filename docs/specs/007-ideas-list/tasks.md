# Tasks: Ideas List (The Stream)

**Feature ID:** 007-ideas-list
**Plan:** ./plan.md
**Created:** 2026-05-10

## Phase 1 — Foundations

- [x] T001 `fetchAllIdeas` newest-first, non-deleted — `apps/mobile/services/ideaService.ts`
- [x] T002 [P] `fetchAllLinks` — `apps/mobile/services/linkService.ts`

## Phase 2 — Core implementation

- [x] T003 Reload on tab focus via `useFocusEffect` — `apps/mobile/app/(app)/(tabs)/inbox.tsx`
- [x] T004 Memoised per-idea link counts (from/to tally)
- [x] T005 `timeAgo` relative-time formatter
- [x] T006 Search + All/Linked/Recent filter pipeline (memoised)

## Phase 3 — UI / integration

- [x] T007 `FlatList` rows: preview fallback, timestamp, link badge
- [x] T008 Row tap → `/develop/[id]` navigation
- [x] T009 Search bar with clear affordance
- [x] T010 Distinct empty-vault and no-results states

## Phase 4 — Verification

- [x] T011 Validate against acceptance criteria in `spec.md`

## Dependency notes

- Read-only surface: depends on capture (001) for content, linking (003) for the
  counts, and routes into Develop (002). Tags intentionally absent post-redesign.
