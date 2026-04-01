# Feature: Constellation View

## Goal
Provide a spatial visualization of ideas and their relationships to help users explore connections intuitively.

## User Flow
1. User navigates to the Constellation tab
2. System fetches ideas and links from local database
3. System renders nodes (ideas) and edges (links)
4. User taps a node
5. System navigates to Develop screen

## Inputs
- Array of ideas
- Array of links
- Viewport dimensions

## Outputs
- Rendered nodes (StarNode)
- Rendered edges (StarLink)
- Navigation to `/develop/[id]`

## Data Model Usage
Tables:
- `ideas`
- `links`

Fields:
- ideas.id
- ideas.constellationX
- ideas.constellationY
- links.fromIdeaId
- links.toIdeaId
- links.confidence

## Rules
- Only ideas with valid coordinates should be rendered
- If coordinates are missing, fallback positioning must be applied
- Coordinates are mapped within viewport bounds using modulo logic
- Links are rendered only if both nodes exist
- Nodes are interactive and trigger navigation

## State Transitions
- No state transition in this feature

## Edge Cases
- Missing coordinates → nodes overlap at fallback position
- Dense graphs → overlapping nodes and unreadable layout
- Missing linked ideas → links are ignored safely

## Gaps / TODOs
- No panning or zooming support
- No collision avoidance or layout system
- Static positioning leads to poor scalability
- No clustering or grouping logic

## Future Direction
- Introduce zoom and pan interactions
- Implement physics-based or force-directed layout
- Add clustering visualization based on link density