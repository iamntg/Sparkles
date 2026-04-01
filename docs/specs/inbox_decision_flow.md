# Feature: Inbox List View

## Goal
Allow users to browse and access previously captured ideas for further development.

## User Flow
1. User opens the Inbox tab
2. System loads ideas from local database
3. Ideas are displayed in a list (most recent first)
4. User taps an idea
5. System navigates to Develop screen

## Inputs
- Fetch request triggered on screen load or manual refresh

## Outputs
- Rendered list of ideas
- Navigation to `/develop/[id]`

## Data Model Usage
Table: `ideas`
Fields:
- id
- text
- updatedAt
- deletedAt

Constraints:
- Only ideas where `deletedAt IS NULL`
- Sorted by `updatedAt DESC`

## Rules
- Display preview of idea text (first 1–2 lines)
- If text is missing, fallback to "Empty Idea"
- Entire dataset is loaded into memory

## State Transitions
- No state transition in this feature

## Edge Cases
- Empty dataset → no explicit empty state UI
- Large dataset → performance risk due to full load
- Missing text → fallback string used

## Gaps / TODOs
- No filtering by status (INBOX / CONSTELLATION / DEVELOPING)
- No delete/archive actions
- No search functionality
- No pagination or lazy loading

## Future Direction
- Add filtering by idea status
- Implement search and tagging
- Add swipe actions (delete/archive)
- Introduce pagination for scalability