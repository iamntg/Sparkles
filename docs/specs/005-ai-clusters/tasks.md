# Tasks: AI Clusters

**Feature ID:** 005-ai-clusters
**Plan:** ./plan.md
**Created:** 2026-05-06

## Phase 1 — Foundations

- [x] T001 `AIProvider` + `ClusterResult`/`ClusterItem` types — `packages/ai/src/types.ts`
- [x] T002 Clustering prompt — `packages/ai/src/prompts.ts`
- [x] T003 [P] `OpenAIProvider.clusterIdeas` — `packages/ai/src/providers/openaiProvider.ts`
- [x] T004 [P] `ClaudeProvider.clusterIdeas` — `packages/ai/src/providers/claudeProvider.ts`
- [x] T005 `getAIProvider` factory (AI_PROVIDER env) — `packages/ai/src/providerFactory.ts`

## Phase 2 — Core implementation

- [x] T006 `/cluster` endpoint — `apps/ai-service/src/index.ts`
- [x] T007 Google-auth requirement on AI routes (x-user-id)
- [x] T008 Per-user rate limiter (10 / 24h) → `429`

## Phase 3 — UI / integration

- [x] T009 AI Cluster entry point with auth gate — mobile ideas surface
- [x] T010 Cluster cards (title + items) with loading state
- [x] T011 Item tap → `/develop/[id]` navigation
- [x] T012 `429` "daily limit reached" + offline error/retry states

## Phase 4 — Verification

- [x] T013 Validate against acceptance criteria in `spec.md`

## Backlog (deferred)

- [ ] Persist cluster results across runs
- [ ] Multi-select subset of ideas to cluster

## Dependency notes

- T007/T009 depend on the Google auth from 006. T010 feeds 004's clustered layout.
