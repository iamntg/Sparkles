# Implementation Plan: Develop Idea

**Feature ID:** 002-develop-idea
**Spec:** ./spec.md
**Created:** 2026-05-06

## Constitution Check

| Article | Relevant? | How this plan complies |
| ------- | --------- | ---------------------- |
| I — Local-first | Yes | All reads/writes and playback are local; no network required. |
| II — User's data | Yes | Nothing leaves the device on this screen. |
| III — Calm by default | Yes | Paper-card layout, warm neutrals, progressive disclosure of controls. |
| IV — Shared core | Yes | `Idea`/`Link` from core; reads/writes via `packages/db` repositories. |
| V — Cross-platform | Yes | Repository split; screen uses `@sparkles/ui` primitives. |

## Technical Context

- **Language / runtime:** TypeScript, Expo Router (`develop/[id].tsx` dynamic route).
- **Primary dependencies:** `expo-audio` (playback), `@sparkles/ui` (`PaperCard`,
  `ConfirmModal`, theme).
- **Storage:** `ideas`, `links`.
- **Platforms:** mobile + web.

## Architecture

```
develop/[id].tsx
   ├─ ideaRepository.get(id) / update(id, {...})        (packages/db)
   ├─ linkRepository.listFor(id) / delete(linkId)       (packages/db)
   ├─ audioService.play(uri) / stop()                   (services)
   └─ linkService.suggest(idea)                          (services, see 003)
```

## Data Model

- `ideas.rawText` — primary editable content on this screen.
- `ideas.audioLocalPath` — gates the Listen control.
- `links.fromIdeaId`, `links.toIdeaId` — bidirectional traversal to build the
  Related list; deletion cleans both sides.

## Contracts

- `ideaRepository.update(id, patch): Promise<void>`
- `ideaRepository.softDelete(id) | delete(id): Promise<void>` — cascades link cleanup.
- `linkRepository.listForIdea(ideaId): Promise<Link[]>`
- `linkRepository.delete(linkId): Promise<void>`
- `audioService.play(uri) / stop()`

## Approach

1. Load idea + links + linked-idea content on mount.
2. Editable text bound to `rawText`; save patches the row and bumps `updatedAt`.
3. Conditionally render Listen; wire play/stop via `audioService`.
4. Render Related section; inline-edit linked ideas through the same repository.
5. Unlink → `linkRepository.delete`; refresh Related.
6. Delete → `ConfirmModal` → delete idea + cascade links → navigate back.

## Risks & Trade-offs

- Last-write-wins is acceptable for a single-user, single-device app; revisit if
  multi-device live sync is ever added.
- Cascade cleanup lives in the repository so every caller inherits integrity.
