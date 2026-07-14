# Implementation Plan: Linking Ideas

**Feature ID:** 003-linking-ideas
**Spec:** ./spec.md
**Created:** 2026-05-06

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | Similarity runs on-device; linking needs no network. |
| II — User's data | Yes | Idea text is compared locally, never uploaded. |
| III — Calm by default | Yes | Suggestions offered in a modal, opt-in, ranked to reduce choice load. |
| IV — Shared core | Yes | `Link` from core; writes via `linkRepository`. |
| V — Cross-platform | Yes | `linkRepository` native/web variants; shared `linkService`. |

## Technical Context

- **Language / runtime:** TypeScript, Expo Router modal.
- **Primary dependencies:** local similarity utility (no external libs required).
- **Storage:** `links` (+ reads across `ideas`).
- **Platforms:** mobile + web.

## Architecture

```
develop/[id].tsx  ── "Link another" ─►  suggestion modal
        │
        ▼
linkService.suggest(current, allIdeas, existingLinks) ─► ranked candidates
        │ (on confirm, per selection)
        ▼
linkRepository.upsert({ fromIdeaId, toIdeaId, confidence }) ─► SQLite `links`
```

## Data Model

`links`:

| Field | Type | Notes |
| ----- | ---- | ----- |
| `id` | TEXT | PK |
| `fromIdeaId` | TEXT | source |
| `toIdeaId` | TEXT | target |
| `type` | TEXT | relationship kind |
| `confidence` | REAL | suggestion strength |
| `createdAt` | INTEGER | epoch ms |

Bidirectional traversal checks both `fromIdeaId` and `toIdeaId` against a target
id, so link direction never affects display.

## Contracts

- `linkService.suggest(idea, allIdeas, existingLinks): RankedIdea[]`
  — excludes self + already-linked; sorts by similarity then recency.
- `linkRepository.upsert(link): Promise<Link>` — idempotent on the pair (FR-5).
- `linkRepository.listForIdea(id): Promise<Link[]>`

## Approach

1. Implement the similarity utility (token-overlap score in `linkService`).
2. `linkService.suggest` filters + ranks candidates.
3. Build the multi-select picker modal; AI-suggested group pinned on top.
4. On confirm, iterate selections → `linkRepository.upsert` (dedupe by pair).
5. Refresh Related on the Develop screen from `listForIdea`.

## Risks & Trade-offs

- Token-overlap similarity is cheap and offline but coarse; acceptable given the
  user confirms every link. Embeddings are a future upgrade behind the same
  `suggest` contract.
