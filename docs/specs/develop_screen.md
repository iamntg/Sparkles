# Feature: Develop Details

## Goal
Allow users to edit an idea and manage its relationships with other ideas.

## User Flow
1. User navigates to Develop screen via idea selection
2. System loads the selected idea and its linked ideas
3. User edits the main idea text
4. User optionally edits linked idea text inline
5. User saves changes
6. User can unlink related ideas
7. User can delete the idea

## Inputs
- Text updates from user input
- Interaction events (save, unlink, delete)

## Outputs
- Updated idea rows in database
- Updated links (if unlinking)
- Navigation back after deletion

## Data Model Usage
Tables:
- `ideas`
- `links`

Fields:
- ideas.text
- ideas.updatedAt
- ideas.deletedAt

## Rules
- Only modified ideas are updated (delta save)
- Deleting an idea removes all associated links
- Unlink removes only the link, not the ideas
- Any edit updates `updatedAt`

## State Transitions
- DRAFT → DEVELOPED (when user edits and saves)

## Edge Cases
- Data loading state handled with fallback UI
- Orphaned links handled gracefully
- Concurrent edits are not handled

## Gaps / TODOs
- No metadata editing (tags, title)
- No undo functionality
- No conflict resolution
- Review Ideas button is not implemented

## Future Direction
- Support rich text editing
- Add tagging and metadata
- Introduce version history or undo system