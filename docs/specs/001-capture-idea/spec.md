# Feature Specification: Capture Idea

**Feature ID:** 001-capture-idea
**Status:** Shipped
**Created:** 2026-05-06
**Input:** "Let me get a thought out of my head in under two seconds — typed or spoken — without deciding anything about it yet."

## 1. Goal & Context

Capture is the front door of Sparkles. If getting an idea in is slow or
demands decisions ("what folder? what tags?"), thoughts are lost. This feature
provides the fastest possible path from intent to a saved idea, by text or by
voice, deferring all organisation to later. It is the concrete expression of
Article I (local-first) and Article III (calm by default): capture must succeed
instantly, offline, with no friction.

## 2. User Experience

### User Flow — Text

1. User opens the capture surface (the app's default entry point).
2. Input is auto-focused; the keyboard is already up.
3. User types a thought. An optional title may be provided.
4. User taps **Save**.
5. The idea is persisted immediately and the user is returned to where they were.

### User Flow — Audio

1. User taps **Record**.
2. The app requests microphone permission the first time, then records.
3. User taps **Stop**.
4. The audio file is saved locally and the idea is created right away.
5. Transcription runs; when it completes, the idea's text is filled in from the
   transcript.

### Edge Cases

- **Empty input:** Save is disabled / rejected; nothing is written.
- **Offline:** Text capture is unaffected. Audio capture is unaffected; only the
  transcription step defers or fails.
- **Transcription fails:** The idea still exists with its audio; status reflects
  the failure so it can be retried.
- **Permission denied (mic):** Audio capture is unavailable; text capture is
  never blocked.

## 3. Requirements

- **FR-1:** The system MUST persist a new idea from non-empty text input on Save.
- **FR-2:** The system MUST allow an optional user-provided title.
- **FR-3:** The system MUST record audio and store the file locally on-device.
- **FR-4:** The system MUST create the idea record immediately on stop, before
  transcription completes.
- **FR-5:** The system MUST transcribe recorded audio into the idea's text and
  record whether transcription succeeded or failed.
- **FR-6:** The system MUST auto-focus the text input when the capture surface
  opens.
- **FR-7:** Every new idea MUST start in the initial (draft) status.

## 4. Business Rules & Constraints

- Title is optional; when absent, downstream surfaces fall back to a preview of
  the text.
- An idea MUST be created even if transcription fails — capture reliability
  outranks transcript completeness.
- Audio capture requires explicit, OS-level microphone permission.
- No network round-trip may sit between the user tapping Save and the idea being
  persisted locally.

## 5. Acceptance Criteria

- [ ] Saving text creates an `ideas` row with `sourceType='text'` and initial
      status.
- [ ] Empty text input cannot be saved.
- [ ] A recording produces a valid local `audioLocalPath`.
- [ ] Successful transcription updates `text` and sets `transcriptStatus='DONE'`.
- [ ] Failed transcription sets `transcriptStatus='FAILED'` but the idea survives.
- [ ] The capture input is focused and keyboard-ready on open.

## 6. Out of Scope

- Organising, linking, or clustering the idea (handled by 002–005).
- Editing an existing idea (handled by 002).
- Rich media beyond a single audio recording.
