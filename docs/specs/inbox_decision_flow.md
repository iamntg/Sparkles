# Feature: Inbox List View

## 1. Goal & Context
Browse and manage captured ideas, with quick access to AI-driven clustering and development.

## 2. User Experience (UX)
### User Flow
1. User opens the Inbox tab.
2. System loads all ideas (most recent first).
3. **Idea Display**: Each item shows its **Title** (if available) or a snippet of its **Text**.
4. **AI Clustering**: User can tap the "AI Cluster" button to view ideas grouped by theme.
5. **Quick Capture**: User can add new ideas directly from the top input area (includes title and tag support).
6. **Navigation**: Tapping an idea navigates to the Develop screen.

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Database query on screen focus, User interaction (tap, scroll, type).
- **Outputs**: Rendered list of idea cards, navigation to `/develop/[id]` or `/clusters`.

### Data Model Usage
- **Table**: `ideas`
- **Fields**: `id`, `title`, `text`, `tags`, `updatedAt`
- **Constraints**: Sorted by `updatedAt DESC`.

### External Services
- **Navigation**: Expo Router for screen transitions.

## 4. Business Rules & Constraints
- **Title Fallback**: If an idea has no title, the list item displays the first two lines of `text`.
- **Sorting**: Newest or most recently updated ideas always appear at the top.
- **Tagging**: Typing `#` triggers a suggestion UI based on existing tags.
- **Dataset Size**: Currently loads all records; pagination may be required for large datasets.

## 5. Acceptance Criteria
- [ ] List displays all non-deleted ideas sorted by `updatedAt` descending.
- [ ] Tapping an idea navigates correctly to `/develop/[id]`.
- [ ] "AI Cluster" button navigates to the Clusters screen.
- [ ] Tag suggestions appear when typing `#` in the input field.
- [ ] Idea cards show Title or Text preview based on availability.
- [ ] Pull-to-refresh or manual refresh button reloads the list from the database.

## 6. Implementation Status
- [x] List view with Title/Text fallback
- [x] AI Cluster entry point (button in header)
- [x] Integrated Idea Input (with Title/Tags)
- [x] Tag suggestions UI
- [x] Refresh functionality
- [x] Modernized UI (PaperCard, Ionicons)