# Feature Specification: Develop Idea

**Feature ID:** 002-develop-idea
**Status:** Shipped
**Created:** 2026-05-06
**Input:** "Open a captured spark and grow it — reread it, listen to the recording, tweak the words, and see what it connects to."

## 1. Goal & Context

Capture is fast and shallow by design; Develop is where an idea deepens. This is
the "slow exploration" half of the product loop. From one focused screen a user
can edit the idea, play back its audio source, edit the ideas it links to, add
or remove links, and delete it. It is the hub the constellation and lists
navigate into.

## 2. User Experience

### User Flow

1. User arrives at the Develop screen for a specific idea (from a list or a star).
2. The idea, its links, and the linked ideas' content load.
3. User edits the main text; changes persist on save.
4. If the idea has audio, user taps **Listen** to play, and again to stop.
5. User can edit a linked idea inline without leaving the screen.
6. User taps **Link another** to add a connection (see 003).
7. User can unlink a connection, or delete the idea entirely.

### Edge Cases

- **No audio source:** the Listen control is absent, not disabled.
- **No links yet:** the Related section shows a calm empty state.
- **Delete:** requires confirmation; must not leave orphaned links behind.
- **Concurrent edits:** last save wins (no real-time collaboration).

## 3. Requirements

- **FR-1:** The system MUST load and display the idea's editable text.
- **FR-2:** Edits to the main text MUST persist to the idea record on save.
- **FR-3:** The system MUST show a playback control only when `audioLocalPath`
  is present, and MUST support play and stop.
- **FR-4:** The system MUST list linked ideas and allow inline editing of them.
- **FR-5:** The system MUST allow removing a link without deleting either idea.
- **FR-6:** Deleting an idea MUST also remove all links referencing it.
- **FR-7:** Deletion MUST be confirmed before it happens.

## 4. Business Rules & Constraints

- Playback visibility is bound strictly to audio availability.
- Unlinking is non-destructive to the connected ideas.
- Deleting an idea must clean up `links` on both `fromIdeaId` and `toIdeaId`
  sides to prevent orphans (Article IV integrity).
- Editing uses the `rawText` field as the primary editable content.

## 5. Acceptance Criteria

- [ ] Main text edits persist to the `ideas` table after save.
- [ ] Listen plays the recording and Stop halts it correctly.
- [ ] The Related section reflects current links and updates after link changes.
- [ ] A linked idea can be edited and saved inline without navigation.
- [ ] Removing a link deletes only the `links` row, not the ideas.
- [ ] Deleting an idea removes its `links` rows and asks for confirmation first.

## 6. Out of Scope

- The similarity algorithm and link-picker UI (specified in 003).
- Spatial placement of the idea (specified in 004).
