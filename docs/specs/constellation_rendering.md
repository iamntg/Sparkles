# Feature: Constellation View

## 1. Goal & Context
Provide a spatial visualization of ideas and their relationships to help users explore connections intuitively in a "starry sky" interface.

## 2. User Experience (UX)
### User Flow
1. User navigates to the **Constellation** tab.
2. System fetches all ideas and links from the local database.
3. **Spatial Mapping**: System maps each idea's `constellationX/Y` coordinates to the current screen dimensions.
4. **Rendering**:
   - Ideas appear as **StarNode** components.
   - Links appear as **StarLink** components connecting the stars.
5. **Navigation**: User taps a star to navigate to its Develop screen.
6. **Refresh**: User can tap the refresh button to reload the constellation.

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Array of Ideas (with `constellationX/Y`), array of Links, viewport dimensions (width/height).
- **Outputs**: Interactive SVG-like star field, navigation to `/develop/[id]`.

### Data Model Usage
- **Tables**: `ideas`, `links`
- **Fields**:
  - `ideas.constellationX`, `ideas.constellationY`: Persistent spatial coordinates.
  - `links.fromIdeaId`, `links.toIdeaId`: Relationship identifiers.
  - `links.confidence`: Determines link visual intensity (opacity/thickness).

### External Services
- **UI Components**: Custom `StarNode` and `StarLink` components from `@sparkles/ui`.

## 4. Business Rules & Constraints
- **Safe Area**: All nodes must be rendered within a safe area (PADDING = 60) to avoid clipping by screen edges or UI elements.
- **Adaptive Layout**: Coordinates are mapped using modulo logic: `(coord % (limit - 2*PADDING)) + PADDING`.
- **Link Rendering**: A link is only drawn if both the source and target ideas are present in the current view.
- **Interactivity**: Every StarNode must be tappable and linked to its specific Develop screen.

## 5. Acceptance Criteria
- [ ] Navigating to the Constellation tab displays a dark "space" background.
- [ ] Ideas are rendered as distinct stars at their assigned (or calculated) coordinates.
- [ ] Links are drawn between connected ideas with varying intensity based on confidence.
- [ ] Tapping a StarNode triggers navigation to the correct `/develop/[id]` route.
- [ ] Tapping the Refresh button updates the view with any newly added ideas or links.
- [ ] The layout adjusts correctly when the device orientation changes (viewport dimensions update).

## 6. Implementation Status
- [x] Custom StarNode and StarLink components (@sparkles/ui)
- [x] Screen-adaptive coordinate mapping
- [x] Confidence-based link rendering
- [x] Refresh functionality
- [x] Background "Space" styling
- [ ] Pan and Zoom support
- [ ] Physics-based layout (Force-directed)