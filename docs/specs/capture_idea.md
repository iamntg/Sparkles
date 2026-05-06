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