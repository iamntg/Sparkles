# Feature Specification: Ideas List (The Stream)

**Feature ID:** 007-ideas-list
**Status:** Shipped
**Created:** 2026-05-10
**Input:** "Give me a plain reverse-chronological list of everything I've captured — searchable, filterable — for when I want to read rather than explore."

## 1. Goal & Context

The constellation (004) is for exploration; the Stream is for reading. It is the
linear, legible counterpart — every spark newest-first, with search and light
filters — for the moments a user wants to scan their thoughts as text rather than
stars. It is a pure read-and-navigate surface: it never mutates ideas, it routes
into Develop (002) for that.

## 2. User Experience

### User Flow

1. User opens the **Ideas** tab.
2. All ideas load, newest first, each showing a text/title preview, a relative
   timestamp, and its link count.
3. User types in **Search** to narrow by title or text.
4. User taps a filter chip — **All**, **Linked**, or **Recent** — to scope the list.
5. User taps an item to open its Develop screen.

### Edge Cases

- **Empty vault:** a calm "the stream is quiet" empty state, not a bare list.
- **Search/filter yields nothing:** a distinct "no sparks match" message
  (different from the empty-vault state).
- **Idea with no text:** falls back to title, then to an "Empty spark" placeholder.
- **Return to tab:** the list refreshes on focus so newly captured ideas appear.

## 3. Requirements

- **FR-1:** The system MUST list all non-deleted ideas, newest first.
- **FR-2:** Each row MUST show a text-or-title preview (≤2 lines), a relative
  timestamp, and a link count when > 0.
- **FR-3:** Search MUST filter case-insensitively across title and text.
- **FR-4:** Filters MUST scope the list: **All** (everything), **Linked** (has ≥1
  link), **Recent** (captured within the last 24h).
- **FR-5:** Tapping a row MUST navigate to that idea's Develop screen.
- **FR-6:** The list MUST reload when the tab regains focus.
- **FR-7:** Empty-vault and no-results states MUST be visually distinct.

## 4. Business Rules & Constraints

- Read-only surface: no create/edit/delete happens here (capture is 001, editing
  is 002).
- Preview fallback order: `text` → `title` → "Empty spark".
- Link count is derived by tallying both `fromIdeaId` and `toIdeaId` occurrences.
- Sort is strictly reverse-chronological by capture time.
- No tag UI — the tag subsystem was removed in the v1.2 redesign (see
  constitution amendment 1.2.0).

## 5. Acceptance Criteria

- [ ] The Ideas tab lists all non-deleted ideas newest-first.
- [ ] Each row shows preview, relative time, and link count when present.
- [ ] Search narrows the list by title/text, case-insensitively.
- [ ] Linked shows only ideas with ≥1 link; Recent shows only last-24h captures.
- [ ] Tapping a row opens the correct `/develop/[id]`.
- [ ] Returning to the tab surfaces newly captured ideas.
- [ ] Empty vault and empty search results show different messages.

## 6. Out of Scope

- Editing, linking, or deleting ideas from this screen (owned by 002/003).
- The AI clustering entry point (owned by 005; not surfaced on this screen).
- Pagination (currently loads all ideas; revisit at scale).
