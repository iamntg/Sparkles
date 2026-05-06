# Feature: Develop Details

## 1. Goal & Context
Allow users to refine an idea, listen to its audio source, and manage its relationships using AI-assisted linking.

## 2. User Experience (UX)
### User Flow
1. User navigates to Develop screen via an idea.
2. System loads the idea, its links, and related idea content.
3. **Audio Playback**: If the idea has an audio source, user can tap "Listen" to play/stop the recording.
4. **Text Editing**: User can edit the main idea text (updates `rawText`).
5. **Inline Editing**: User can edit linked ideas directly from this screen.
6. **AI-Assisted Linking**:
   - User taps "Link another".
   - System suggests related ideas based on text similarity.
   - User selects an idea to create a new link.
7. **Unlinking**: User can remove links between ideas.
8. **Deletion**: User can delete the main idea (removes associated links).

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Text updates (Main and Linked ideas), Interaction events (Play Audio, Link another, Unlink, Delete, Save).
- **Outputs**: Updated idea rows in database, new/removed links in `links` table, audio playback.

### Data Model Usage
- **Tables**: `ideas`, `links`
- **Fields**:
  - `ideas.rawText`: The primary content field.
  - `ideas.audioLocalPath`: Path to the local audio file.
  - `links.fromIdeaId`, `links.toIdeaId`: Relationship identifiers.

### External Services
- **AI Linker**: Local algorithm for suggesting related ideas based on text similarity.

## 4. Business Rules & Constraints
- **Audio availability**: Playback button only visible if `audioLocalPath` is non-null.
- **Link Integrity**: Deleting an idea must clean up all associated links to prevent orphans.
- **Concurrency**: Last save wins; no current support for real-time collaborative editing.
- **Non-Destructive Unlinking**: Removing a link does not delete the connected ideas.

## 5. Acceptance Criteria
- [ ] Main idea text updates persist in the `ideas` table after saving.
- [ ] Audio playback triggers device audio player and handles "Stop" correctly.
- [ ] AI suggestions exclude the current idea and already linked ideas.
- [ ] Deleting an main idea removes its entries from the `links` table.
- [ ] Confirmation modal appears before any deletion.
- [ ] Linked ideas can be edited and saved inline without navigating away.

## 6. Implementation Status
- [x] Text editing (rawText support)
- [x] Inline linked idea editing
- [x] Audio playback (Listen button)
- [x] AI-assisted linking (Link another)
- [x] Delete with link cleanup
- [x] Modernized UI (PaperCard, Theme-based)