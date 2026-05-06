export const CLUSTERING_PROMPT = `
You are an AI that organizes user-generated ideas.

TASK:
Group the given ideas into meaningful clusters.

STRICT RULES:
- ONLY use the exact ideas provided
- DO NOT modify, rephrase, or invent ideas
- Each idea must appear in ONLY ONE cluster
- Do not drop any idea
- Create clear and concise cluster titles

OUTPUT FORMAT (STRICT JSON):
{
  "clusters": [
    {
      "title": "string",
      "items": ["exact idea text"]
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