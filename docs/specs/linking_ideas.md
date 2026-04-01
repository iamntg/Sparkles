# Feature: Link Suggestion (Local AI)

## Goal
Suggest meaningful connections between ideas to help users build relationships.

## User Flow
1. User taps "Suggest Links"
2. System analyzes all ideas
3. System generates candidate suggestions
4. User selects a suggestion
5. System creates a link

## Inputs
- Current idea
- List of all ideas

## Outputs
- New row in `links` table

## Data Model Usage
Table:
- `links`

Fields:
- fromIdeaId
- toIdeaId
- createdAt

## Rules
- Self-linking is not allowed
- Existing links are excluded
- Links are directional (fromIdeaId → toIdeaId)
- UI may treat links as bidirectional visually

## State Transitions
- No state transition in this feature

## Edge Cases
- No suggestions → show empty state
- No selection → block confirmation
- Large dataset → performance issues

## Gaps / TODOs
- Runs on main thread (performance issue)
- No confidence scoring
- No link type classification

## Future Direction
- Move computation off main thread
- Use embeddings for semantic similarity
- Add confidence and relationship types