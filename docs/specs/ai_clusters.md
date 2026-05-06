# Feature: AI Clusters

## 1. Goal & Context
Use AI to analyze all captured ideas and group them into logical themes (clusters) to help users find hidden connections and high-level patterns.

## 2. User Experience (UX)
### User Flow
1. User taps "AI Cluster" from the Inbox header.
2. **Auth Check**: If not logged in, system prompts user to login with Google (required for rate limiting).
3. **Processing**: System sends all idea text to the AI Service.
4. **Result**: System displays a list of Clusters, each with a Title and a list of associated Idea snippets.
5. **Navigation**: User can tap an idea snippet to navigate to its Develop screen.

## 3. Technical Specification
### Inputs & Outputs
- **Inputs**: Full list of ideas (Text, Titles, Tags), User ID (via `x-user-id` header).
- **Outputs**: JSON object containing an array of clusters, rendered cluster cards in the UI.

### Data Model Usage
- **Ephemeral Storage**: Results are not currently persisted in the local database; they are re-generated on each request.
- **Service Integration**: Communicates with the external `ai-service` via HTTPS.

### External Services
- **AI Backend**: Node.js/Express service providing the `/cluster` endpoint.
- **LLM Provider**: GPT-4o-mini (via backend) for the actual clustering logic.

## 4. Business Rules & Constraints
- **Authentication**: Mandatory for AI features to track usage and control costs.
- **Rate Limiting**: Strictly enforced at 10 requests per user per 24-hour period.
- **Data Privacy**: Ideas are processed in-memory by the AI service and are not stored permanently on the backend.
- **Minimum Data**: Requires at least one idea to trigger the clustering process.

## 5. Acceptance Criteria
- [ ] Tapping "AI Cluster" without being logged in triggers the Google Auth flow.
- [ ] Successful clustering returns a valid JSON array of objects with `title` and `items`.
- [ ] Receiving a `429` status code displays the "Daily limit reached" message to the user.
- [ ] Tapping an item within a cluster navigates to the correct Develop screen.
- [ ] Loading state is visible while the AI is processing the request.
- [ ] Error states (offline, service down) are handled with a retry option.

## 6. Implementation Status
- [x] AI Clustering logic (Backend service)
- [x] Cluster visualization UI
- [x] Google Auth integration for AI
- [x] Per-user Rate Limiting (10 req/day)
- [x] Navigation from Cluster to Idea
- [ ] Persistence of cluster results
- [ ] Multi-select ideas for clustering