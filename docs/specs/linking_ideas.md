# Feature: AI-Assisted Link Suggestions

## 1. Goal & Context
Suggest meaningful connections between ideas using text similarity to help users build a dense knowledge web and discover non-obvious relationships.

## 2. User Experience (UX)
### User Flow
1. User navigates to the **Develop** screen for a specific idea.
2. User taps **"Link another"**.
3. **AI Analysis**: System analyzes the current idea's text against all other ideas in the vault.
4. **Suggestions List**: System displays a modal with a list of potential ideas to link, sorted by relevance (AI-suggested first, then most recent).
5. **Selection**: User selects an idea from the list.
6. **Creation**: User taps **"Link Selected"** to create the relationship.

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Current Idea object, list of all existing Ideas, existing links for the current idea.
- **Outputs**: New row in `links` table, updated "Linked Ideas" section in the UI.

### Data Model Usage
- **Table**: `links`
- **Fields**: `id`, `fromIdeaId`, `toIdeaId`, `confidence` (optional).
- **Relational Logic**: Bidirectional traversal is handled by checking both `fromIdeaId` and `toIdeaId` against the target Idea ID.

### External Services
- **Local AI Utility**: A text similarity algorithm (e.g., Jaccard or Cosine similarity) running within the app.

## 4. Business Rules & Constraints
- **Uniqueness**: No duplicate links between the same pair of ideas.
- **Self-Reference**: An idea cannot be linked to itself.
- **Ordering**: Suggestions are ranked by similarity score; fallback is chronological.
- **Directionality**: Links are stored with a source and target but are functionally symmetric in the UI.

## 5. Acceptance Criteria
- [ ] Tapping "Link another" opens a modal containing a list of non-linked ideas.
- [ ] Suggestions are correctly filtered to exclude the current idea.
- [ ] Selecting an idea from the list and confirming creates a new link record.
- [ ] The "Linked Ideas" section on the Develop screen refreshes immediately after a new link is added.
- [ ] Modal shows an "AI Recommended" badge or priority for high-similarity matches.
- [ ] System handles empty states (no other ideas available) with a clear message.

## 6. Implementation Status
- [x] Link suggestion algorithm (Similarity based)
- [x] Modal-based suggestion UI
- [x] Selection and confirmation flow
- [x] Duplicate link prevention
- [x] Real-time UI update after linking
- [ ] Confidence scoring display
- [ ] Multi-select linking