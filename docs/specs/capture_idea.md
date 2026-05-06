# Feature: Capture Idea

## 1. Goal & Context
Allow users to quickly capture a new idea (text or audio) and store it with metadata for later development.

## 2. User Experience (UX)
### User Flow
#### Text Capture
1. User enters optional **Title**.
2. User enters **Text** (optionally including `#tags`).
3. User taps "Save".
4. System creates a new Idea and parses tags.
5. A confirmation modal appears:
   - "Develop further" -> Navigates to Develop screen.
   - "Come back later" -> Stays in Inbox.

#### Audio Capture
1. User taps "Record".
2. System captures audio from microphone.
3. User taps "Stop".
4. System immediately:
   - Saves audio file locally.
   - **Transcribes** audio to text.
   - Creates a new Idea with the transcribed text.
5. A confirmation modal appears.

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Text (Title, Body, Tags), Audio stream (Microphone).
- **Outputs**: New row in `ideas` table, local audio file stored (URI), confirmation modal.

### Data Model Usage
- **Table**: `ideas`
- **Fields**:
  - `id`: UUID
  - `text`: string (Main body or transcript)
  - `title`: string (User provided or derived)
  - `sourceType`: "text" | "audio"
  - `audioLocalPath`: string (URI for audio sources)
  - `transcriptStatus`: "DONE" | "FAILED"
  - `tags`: string[] (parsed from text)
  - `status`: "INBOX"

### External Services
- **Expo Audio**: For microphone recording and playback.
- **Transcription Service**: AI-based speech-to-text.

## 4. Business Rules & Constraints
- **Title**: Optional; fallback to text preview if missing.
- **Tags**: Extracted using regex `#tagname`.
- **Permissions**: Audio capture requires explicit microphone permissions.
- **Reliability**: Idea must be created even if transcription fails.
- **Initial State**: All ideas start in `INBOX` status.

## 5. Acceptance Criteria
- [ ] Saving text idea creates a record in `ideas` with `sourceType='text'`.
- [ ] Tags are correctly parsed into the `tags` array (e.g., "#sparkles" -> ["sparkles"]).
- [ ] Audio recording generates a valid URI in `audioLocalPath`.
- [ ] Transcription completion updates `text` and sets `transcriptStatus='DONE'`.
- [ ] Empty text input prevents saving.
- [ ] Failed transcription sets `transcriptStatus='FAILED'` but still saves the idea.

## 6. Implementation Status
- [x] Text capture with Title
- [x] Tag extraction (#tags)
- [x] Audio recording (Expo Audio)
- [x] Audio transcription (Service-based)
- [x] Confirmation flow
- [x] Local storage of audio files


