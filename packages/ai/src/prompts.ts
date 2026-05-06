export const CLUSTERING_PROMPT = `
You are an AI that organizes user-generated ideas.

TASK:
Group the given ideas into meaningful clusters. The input will be an array of JSON objects containing text, title, tags, and rawText.

CLUSTERING LOGIC:
1. Prefer grouping by shared tags (Tags are a STRONG signal).
2. If no tags, use semantic similarity of text + title (Text is fallback, Title adds context).
3. Do NOT force unrelated ideas into the same cluster.
4. Allow single-item clusters if an idea does not fit with any others.

STRICT RULES:
- Output the EXACT ORIGINAL rawText for each idea in the cluster items.
- Each idea must appear in ONLY ONE cluster.
- Do not drop any idea.
- Create clear and concise cluster titles.

OUTPUT FORMAT (STRICT JSON):
{
  "clusters": [
    {
      "title": "string",
      "items": ["exact original rawText"]
    }
  ]
}

IDEAS: {{ideas}}
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