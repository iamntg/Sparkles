# Feature Specification: Constellation View

**Feature ID:** 004-constellation-view
**Status:** Shipped
**Created:** 2026-05-06
**Input:** "When I open the app I want to see my ideas as a night sky — stars for thoughts, lines for connections — and be able to switch between a free scatter and clean thematic clusters."

## 1. Goal & Context

The constellation is Sparkles' visual identity and, since v1.1, its default
landing surface. It reframes the idea vault from a list to be managed into a
landscape to be explored (Article III). Each idea is a star, each link a glowing
thread. It offers two spatial modes — a free scatter and an animated
cluster-grouped layout — so the same ideas can be felt as either an open sky or
organised constellations.

## 2. User Experience

### User Flow

1. User opens the app and lands on the Constellation tab.
2. Ideas and links load from the local database.
3. Ideas render as stars at their persisted coordinates; links draw between them.
4. User taps a star to open its Develop screen.
5. User toggles between **Scattered** and **Clustered** layout; stars animate
   smoothly between positions.
6. User taps the FAB (+) to capture a new idea; on return it appears as a new star.

### Edge Cases

- **Empty vault:** a calm, near-empty sky rather than an error.
- **Idea without coordinates:** a coordinate is derived deterministically so the
  star is always placed within the safe area.
- **Link to an off-screen/absent idea:** the link is skipped, not drawn dangling.
- **Orientation change:** coordinates remap to the new viewport.

## 3. Requirements

- **FR-1:** The system MUST render each idea as a star mapped into the current
  viewport within a safe-area padding.
- **FR-2:** The system MUST draw a link only when both endpoints are present in
  the current view.
- **FR-3:** Link visual intensity MUST reflect its `confidence`.
- **FR-4:** Tapping a star MUST navigate to that idea's Develop screen.
- **FR-5:** The system MUST offer Scattered and Clustered layout modes with an
  animated transition between them.
- **FR-6:** A refresh action MUST reload ideas and links, surfacing new stars.
- **FR-7:** The constellation MUST be the default landing surface.

## 4. Business Rules & Constraints

- All nodes render inside a safe area (`PADDING = 60`) to avoid edge clipping.
- Coordinates map via modulo: `(coord % (limit - 2*PADDING)) + PADDING`.
- Deterministic placement uses `constellationSeed` so a star's position is stable
  across sessions.
- Motion is subtle: soft pulse, gentle link fade, no game-like flicker
  (Article III).

## 5. Acceptance Criteria

- [ ] The Constellation tab shows a dark space background and is the default tab.
- [ ] Ideas render as stars at their assigned/derived coordinates.
- [ ] Links draw only between co-present ideas, with confidence-based intensity.
- [ ] Tapping a star navigates to the correct `/develop/[id]`.
- [ ] Toggling layout animates stars between scattered and clustered positions.
- [ ] Refresh reflects newly added ideas and links.
- [ ] Rotating the device remaps nodes into the new viewport without clipping.

## 6. Out of Scope

- Pan and pinch-zoom navigation (backlog).
- Physics/force-directed layout (backlog; current placement is deterministic).
- The clustering computation itself (owned by 005; this view consumes its output).
