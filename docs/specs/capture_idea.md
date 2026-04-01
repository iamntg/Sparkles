# Feature: Capture Idea

## Goal
Allow users to quickly capture a new idea and store it in an initial state for later decision-making.

## User Flow
1. User enters text in the input field
2. User taps "Save"
3. System creates a new Idea
4. A confirmation modal appears:
   - "Develop further"
   - "Come back later"

## Inputs
- Text string from user input

## Outputs
- New row inserted into `ideas` table
- Input field is cleared
- Confirmation modal is displayed

## Data Model Usage
Table: `ideas`
Fields:
- id
- text
- title (derived from text)
- createdAt
- updatedAt
- status = INBOX

## Rules
- Input must not be empty or whitespace-only
- Title is derived from text (first line or first 40 chars)
- Idea must always be created in `INBOX` state

## State Transitions
- New Idea → `INBOX`

## Edge Cases
- Empty input → prevent save
- Audio input → not implemented
- Very large text → no limit enforced

## Gaps / TODOs
- Audio recording and transcription not implemented
- No metadata (tags, categories) captured at creation
- No validation for very large inputs

## Future Direction
- Add audio capture with transcription
- Allow quick tagging during capture
- Add optional auto-save drafts before explicit save

-----

## Audio Capture Flow

### User Flow
1. User taps "Record"
2. Recording starts
3. User taps "Stop"
4. Audio is saved locally
5. User can play back the recorded audio
6. System transcribes audio into text (mock for now)
7. Idea is created using transcribed text
8. Confirmation modal is shown

### Inputs
- Audio recording from device microphone

### Outputs
- Local audio file saved (URI)
- New Idea row created with audio metadata

### Data Model Usage (Additional Fields)
- sourceType = "audio"
- audioLocalPath = string
- transcriptStatus = "DONE" | "FAILED"

### Rules
- Recording must be explicitly started and stopped
- Playback should be available before saving
- Idea is created only after recording is completed
- Audio file must be stored locally and referenced via URI

### Edge Cases
- User cancels recording → no idea created
- Recording fails → show error
- Playback fails → allow retry
- Transcription fails → save idea with empty text and FAILED status

### Gaps / TODOs
- No waveform visualization
- No background transcription
- No retry mechanism for failed transcription