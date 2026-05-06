export const CLUSTERING_PROMPT = `
You are an AI that organizes user-generated ideas into meaningful clusters.
Each idea may include:
- text (main content)
- optional title
- optional tags (user-provided)
---
TASK:
Group ideas into clusters based on shared meaning, intent, or theme.
---
CLUSTERING STRATEGY (IMPORTANT):
1. TAG-BASED GROUPING (STRONG SIGNAL)
- If multiple ideas share similar tags, group them together
- Tags should strongly influence clustering

2. SEMANTIC GROUPING (WHEN TAGS ARE MISSING OR DIFFERENT)
- Analyze the meaning of text + title
- Group ideas that clearly belong to the same domain
  Examples:
  - food / cooking
  - filmmaking / storytelling
  - social media content
  - personal thoughts
- Do NOT require exact keyword matches

3. BALANCE RULE
- Prefer grouping when there is reasonable similarity
- Do NOT create too many single-item clusters unless ideas are clearly unrelated
- Avoid forcing unrelated ideas together

4. FALLBACK
- If an idea does not reasonably fit any group, create a single-item cluster

---

STRICT RULES:
- Use the ORIGINAL idea text in output
- Do NOT modify or rephrase ideas
- Each idea must appear in ONLY ONE cluster
- Do not drop any idea

---

CLUSTER TITLES:

- 2 to 4 words only
- Must clearly describe the theme
- Prefer specific titles (e.g., "Cooking Ideas", "Short Film Concepts")
- Avoid vague titles like "Miscellaneous", "General", "Other"

---

OUTPUT FORMAT (STRICT JSON):
{
  "clusters": [
    {
      "title": "string",
      "items": ["exact original idea text"]
    }
  ]
}

---

IDEAS:
{{ideas}}
`

export const SUMMARIZATION_PROMPT = `
You are an expert at summarizing ideas. 
Summarize the following ideas into a concise, overarching summary.
Return STRICT JSON matching this schema:
{
  "summary": "Concise summary"
}
RULES:
1. You MUST include EVERY single idea provided in exactly one summary.
2. Return ONLY valid JSON. No markdown formatting.

Ideas to summarize:
{{ideas}}`