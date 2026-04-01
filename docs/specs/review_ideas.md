# Feature: AI Review Sessions

## Goal
Define the structure and future pipeline for AI-driven idea clustering and summarization.

## User Flow
1. User enables AI Review (toggle)
2. User taps "Review Ideas"
3. System shows placeholder response

## Inputs
- UI toggle state
- User trigger action

## Outputs
- Temporary UI alerts

## Data Model Usage
Table:
- `review_sessions`

Fields:
- id
- createdAt
- scope
- resultJson

## Rules
- Feature must only run on explicit user trigger
- No background execution

## State Transitions
- No state transition in this feature

## Edge Cases
- Feature not implemented → always fallback response

## Gaps / TODOs
- No real implementation
- Toggle not persisted
- No connection to database
- No AI logic exists

## Future Direction
- Persist settings
- Implement clustering + summarization
- Store results in review_sessions table