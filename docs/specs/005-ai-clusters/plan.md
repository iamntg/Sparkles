# Implementation Plan: AI Clusters

**Feature ID:** 005-ai-clusters
**Spec:** ./spec.md
**Created:** 2026-05-06

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | Clustering is an enhancement; the app is fully usable without it and degrades gracefully offline. |
| II — User's data | Yes | Idea text processed in-memory; service persists nothing; auth scopes usage to the user. |
| III — Calm by default | Yes | Opt-in button, honest "Thinking…" and error/retry states. |
| IV — Shared core | Yes | Cluster logic in `packages/ai`; app consumes typed results. |
| V — Cross-platform | Yes | Same HTTP contract from mobile and web. |

## Technical Context

- **Language / runtime:** TypeScript; Node/Express AI service (`apps/ai-service`).
- **Primary dependencies:** `packages/ai` (provider abstraction, prompts),
  LLM providers (OpenAI `gpt-4o-mini` default, Claude selectable), Google auth.
- **Storage:** none server-side; results held in memory / app state.
- **Platforms:** mobile + web clients; standalone service backend.

## Architecture

```
client (AI Cluster button)
   │  requires Google session
   ▼
POST /cluster  (x-user-id header)         apps/ai-service
   ├─ rate-limit gate: 10 / user / 24h  → 429 if exceeded
   ├─ getAIProvider() (AI_PROVIDER env)  packages/ai/providerFactory
   │     ├─ OpenAIProvider
   │     └─ ClaudeProvider
   └─ provider.clusterIdeas(ideas) → { clusters: [{ title, items }] }
```

## Data Model

- **Request:** `{ ideas: Idea[] }` + header `x-user-id`.
- **Response:** `ClusterResult = { clusters: ClusterItem[] }`,
  `ClusterItem = { title: string; items: string[] }` (`packages/ai/src/types.ts`).
- No persistence; `review_sessions` may optionally cache digest-style runs but
  cluster results are ephemeral by design.

## Contracts

- `POST /cluster` → `200 { clusters }` | `401` (no auth) | `429` (rate limited)
  | `5xx` (provider/service error).
- `AIProvider.clusterIdeas(ideas): Promise<ClusterResult>` — the seam every
  provider implements (`packages/ai/src/types.ts`).
- `getAIProvider(): AIProvider` — selects by `AI_PROVIDER`, defaults to OpenAI.

## Approach

1. Define `AIProvider` + `ClusterResult` types in `packages/ai`.
2. Implement OpenAI and Claude providers behind the factory.
3. Stand up `apps/ai-service` with `/cluster`, auth check, and the rate limiter.
4. Client: gate on Google session (feature 006 auth), call `/cluster`, render
   cluster cards, wire item → Develop navigation.
5. Handle loading, `429`, and offline/error states with retry.

## Risks & Trade-offs

- Ephemeral results mean re-computation cost per view; acceptable under the 10/day
  cap and keeps Article II simple (nothing to store).
- LLM latency/variability is masked by the "Thinking…" state and honest errors.
