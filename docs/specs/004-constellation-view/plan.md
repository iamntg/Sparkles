# Implementation Plan: Constellation View

**Feature ID:** 004-constellation-view
**Spec:** ./spec.md
**Created:** 2026-05-06

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | Renders entirely from local `ideas`/`links`; no network to draw the sky. |
| II — User's data | Yes | Nothing leaves the device. |
| III — Calm by default | Yes | Deep-space gradient, soft glow, subtle transitions; the hero surface. |
| IV — Shared core | Yes | `StarNode`/`StarLink` in `@sparkles/ui`; data via `packages/db`. |
| V — Cross-platform | Yes | Components render on both; repository split underneath. |

## Technical Context

- **Language / runtime:** TypeScript, Expo Router tab, React Native Reanimated
  (layout transition).
- **Primary dependencies:** `@sparkles/ui` (`StarNode`, `StarLink`),
  `CosmicBackground` component.
- **Storage:** reads `ideas` (coords/seed) and `links` (confidence).
- **Platforms:** mobile + web.

## Architecture

```
(tabs)/constellation.tsx
   ├─ ideaRepository.listActive()         → stars
   ├─ linkRepository.listAll()            → threads
   ├─ layout mode: scattered | clustered  (consumes 005 clusters)
   ├─ maps coords → viewport (safe-area modulo)
   └─ renders CosmicBackground + StarNode[] + StarLink[]
```

## Data Model

- `ideas.constellationX/Y` — persisted coordinates.
- `ideas.constellationSeed` — deterministic fallback placement.
- `links.confidence` — drives `StarLink` opacity/thickness.

## Contracts

- `StarNode` props: `{ x, y, title, onPress }`.
- `StarLink` props: `{ from: {x,y}, to: {x,y}, confidence }`.
- Coordinate map: `place(coord, limit) = (coord % (limit - 2*PADDING)) + PADDING`,
  `PADDING = 60`.
- Layout toggle drives an animated position interpolation between scatter and
  cluster centroids.

## Approach

1. Build `CosmicBackground` (deep-space gradient + subtle texture).
2. Load ideas + links; compute viewport-mapped coordinates.
3. Render `StarNode` per idea (tap → `/develop/[id]`), `StarLink` per valid link.
4. Add layout-mode state; compute clustered positions from 005's output.
5. Animate transitions with Reanimated; guard links to co-present endpoints.
6. Make Constellation the default tab; add capture FAB.

## Risks & Trade-offs

- Deterministic (non-physics) layout can crowd dense graphs; safe-area modulo
  spreads nodes adequately for now. Force-directed layout is a tracked backlog
  item behind the same StarNode/StarLink contract.
