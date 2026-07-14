# Feature Specification: AI Clusters

**Feature ID:** 005-ai-clusters
**Status:** Shipped
**Created:** 2026-05-06
**Input:** "Look at everything I've captured and group it into themes for me, so I can see the big-picture patterns I can't hold in my head."

## 1. Goal & Context

Linking (003) is manual and local; clustering is the AI-assisted, big-picture
complement. On request, Sparkles sends the user's idea text to an AI service that
returns titled thematic groups. This surfaces connections a user would not find
by hand and feeds the constellation's clustered layout (004). Because it is the
one feature that leaves the device, it is bound tightly by the constitution: it
is opt-in, authenticated, rate-limited, and stores nothing server-side.

## 2. User Experience

### User Flow

1. User taps **AI Cluster** (from the ideas surface / header).
2. **Auth gate:** if not signed in, the Google sign-in flow is triggered first
   (required for per-user rate limiting).
3. **Processing:** idea text is sent to the AI service; a "Thinking…" state shows.
4. **Result:** the app renders a list of clusters, each a title plus its idea
   snippets.
5. User taps a snippet to open that idea's Develop screen.

### Edge Cases

- **Not signed in:** clustering triggers auth, not an error.
- **Rate limit hit (429):** show a clear "daily limit reached" message.
- **Offline / service down:** show an error state with a retry option.
- **Fewer than one idea:** clustering is unavailable.

## 3. Requirements

- **FR-1:** The system MUST require a signed-in Google identity before clustering.
- **FR-2:** The system MUST send all idea text to the AI service and render the
  returned clusters (title + items).
- **FR-3:** The system MUST enforce a per-user limit of 10 cluster requests per
  rolling 24-hour period.
- **FR-4:** A `429` response MUST surface a "daily limit reached" message.
- **FR-5:** Tapping a clustered item MUST navigate to the correct Develop screen.
- **FR-6:** The system MUST show a loading state while processing and an error
  state (with retry) on failure.
- **FR-7:** The AI service MUST NOT persist idea content.

## 4. Business Rules & Constraints

- Authentication is mandatory for all AI features (usage attribution + cost).
- Rate limit: strictly 10 requests / user / 24h, enforced server-side by
  `x-user-id`.
- Ideas are processed in-memory only; no server-side storage (Article II).
- The provider is pluggable (OpenAI default, Claude selectable) via
  `AI_PROVIDER`; the app is agnostic to which is used.
- Cluster results are ephemeral — regenerated per request, not yet persisted
  locally.

## 5. Acceptance Criteria

- [ ] Tapping AI Cluster while signed out triggers Google auth first.
- [ ] A successful call renders clusters with `title` and `items`.
- [ ] The 11th request within 24h returns `429` and shows the limit message.
- [ ] Tapping an item navigates to the correct Develop screen.
- [ ] A loading state is visible during processing.
- [ ] Offline / service-down shows an error with a retry affordance.

## 6. Out of Scope

- Persisting cluster results between runs (backlog).
- Choosing a subset of ideas to cluster (backlog — currently all ideas).
- The daily digest variant (tracked separately).
