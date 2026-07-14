# Feature Specification: Linking Ideas

**Feature ID:** 003-linking-ideas
**Status:** Shipped
**Created:** 2026-05-06
**Input:** "When I'm developing an idea, show me which other ideas it relates to so I can connect them — and let me connect several at once."

## 1. Goal & Context

Sparkles' value compounds when ideas connect. This feature turns a flat list of
ideas into a web by suggesting relevant connections (via on-device text
similarity) and letting the user confirm them. Links are the edges the
constellation (004) draws and the raw material clustering (005) reasons over.
Crucially, suggestion runs locally — connection-making must work offline
(Article I).

## 2. User Experience

### User Flow

1. From an idea's Develop screen, user taps **Link another**.
2. The system ranks all other ideas by similarity to the current one.
3. A picker opens: AI-suggested matches first, then the rest most-recent-first.
4. User selects one or more ideas.
5. User confirms; the links are created and the Related section updates at once.

### Edge Cases

- **No other ideas exist:** show a clear empty state.
- **Already linked:** already-linked ideas are excluded from suggestions.
- **Self:** the current idea can never appear in its own picker.
- **Duplicate:** re-linking an existing pair is prevented.

## 3. Requirements

- **FR-1:** The system MUST rank candidate ideas by text similarity to the
  current idea, computed on-device.
- **FR-2:** The picker MUST exclude the current idea and already-linked ideas.
- **FR-3:** The system MUST support selecting multiple ideas and linking them in
  one confirm action.
- **FR-4:** Creating a link MUST write a `links` row and refresh the Related
  section immediately.
- **FR-5:** The system MUST prevent duplicate links between the same pair.
- **FR-6:** Suggestions MUST fall back to reverse-chronological order when
  similarity is uninformative.

## 4. Business Rules & Constraints

- No self-links; no duplicate pairs.
- Links are stored directionally (`fromIdeaId` → `toIdeaId`) but are treated as
  symmetric everywhere in the UI.
- Similarity is a local utility (token overlap / Jaccard-style) — no network.
- `confidence` may be stored to describe suggestion strength.

## 5. Acceptance Criteria

- [ ] "Link another" opens a picker of non-linked, non-self ideas.
- [ ] Suggestions are ordered by similarity, then recency.
- [ ] Multiple ideas can be selected and linked in a single confirm.
- [ ] Confirming creates one `links` row per selection.
- [ ] The Related section refreshes immediately after linking.
- [ ] Attempting to duplicate an existing link is a no-op.
- [ ] An empty candidate set shows a clear message.

## 6. Out of Scope

- Displaying a numeric confidence score in the UI (backlog).
- Server-side / embedding-based similarity (local heuristic only for now).
