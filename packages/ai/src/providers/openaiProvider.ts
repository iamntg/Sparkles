import OpenAI from 'openai';
import { AIProvider, ClusterResult } from '../types';

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async clusterIdeas(ideas: string[]): Promise<ClusterResult> {
    if (!ideas || ideas.length === 0) {
      return { clusters: [] };
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert at organizing and clustering ideas. 
Group the provided ideas into logical themes.
Return STRICT JSON matching this schema:
{
  "clusters": [
    {
      "title": "Theme Name",
      "items": ["Exact original idea text 1", "Exact original idea text 2"]
    }
  ]
}
RULES:
1. You MUST include EVERY single idea provided in exactly one cluster.
2. DO NOT hallucinate or modify the original text of the ideas.
3. Return ONLY valid JSON. No markdown formatting.`,
        },
        {
          role: 'user',
          content: JSON.stringify(ideas),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    try {
      const result = JSON.parse(content) as ClusterResult;
      return result;
    } catch (error) {
      throw new Error('Failed to parse OpenAI response as JSON');
    }
  }

  async summarizeIdeas(ideas: string[]): Promise<string> {
    if (!ideas || ideas.length === 0) {
      return '';
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Summarize the following ideas into a concise, overarching summary.',
        },
        {
          role: 'user',
          content: JSON.stringify(ideas),
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content || '';
  }
}
