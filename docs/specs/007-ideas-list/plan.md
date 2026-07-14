# Implementation Plan: Ideas List (The Stream)

**Feature ID:** 007-ideas-list
**Spec:** ./spec.md
**Created:** 2026-05-10

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | Reads entirely from local `ideas`/`links`; no network. |
| II — User's data | Yes | Nothing leaves the device. |
| III — Calm by default | Yes | Cosmic background, generous spacing, distinct calm empty states. |
| IV — Shared core | Yes | `Idea`/`Link` from core; reads via `ideaService`/`linkService`. |
| V — Cross-platform | Yes | Repository split underneath the services. |

## Technical Context

- **Language / runtime:** TypeScript, Expo Router tab, React Native `FlatList`.
- **Primary dependencies:** `@sparkles/ui` theme, `CosmicBackground`,
  `@expo/vector-icons`, `expo-router` `useFocusEffect`.
- **Storage:** reads `ideas` + `links` (no writes).
- **Platforms:** mobile + web.

## Architecture

```
(tabs)/inbox.tsx
   ├─ useFocusEffect → fetchAllIdeas() + fetchAllLinks()   (services → packages/db)
   ├─ linkCounts = tally(from/to) over links               (useMemo)
   ├─ filtered = ideas |> search(q) |> filter(All|Linked|Recent)  (useMemo)
   └─ FlatList rows → router.push(/develop/[id])
```

Derivations (`linkCounts`, `filtered`) are memoised so re-renders on keystrokes
stay cheap. All logic is view-local; the screen owns no persistence.

## Data Model

- `ideas`: `id`, `title`, `text`, `createdAt` — preview, timestamp, sort key.
- `links`: `fromIdeaId`, `toIdeaId` — tallied into per-idea link counts.

## Contracts

- `ideaService.fetchAllIdeas(): Promise<Idea[]>` — newest-first, non-deleted.
- `linkService.fetchAllLinks(): Promise<Link[]>`
- `timeAgo(ts): string` — relative-time formatter (JUST NOW / N HRS AGO /
  YESTERDAY / N DAYS AGO / short date).
- Filter predicate: `All` → true; `Linked` → `linkCount > 0`;
  `Recent` → `now - createdAt < 24h`.

## Approach

1. Load ideas + links on focus via the services.
2. Memoise link counts and the search/filter pipeline.
3. Render `FlatList` with preview (text→title→"Empty spark"), `timeAgo`, and a
   link badge when count > 0.
4. Add the search bar and All/Linked/Recent chips.
5. Provide two distinct empty states: empty vault vs. no-results.

## Risks & Trade-offs

- Loads the full dataset into memory; fine at personal-vault scale, but
  pagination/virtualised windowing is the escape hatch if vaults grow large.
- Client-side substring search is adequate here; a DB-backed FTS index is a
  future upgrade behind the same `fetchAllIdeas` contract.
