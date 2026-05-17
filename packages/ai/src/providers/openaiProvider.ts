import OpenAI from 'openai';
import { AIProvider, ClusterResult, DailyDigestResult } from '../types';
import { CLUSTERING_PROMPT, SUMMARIZATION_PROMPT, DAILY_DIGEST_PROMPT } from '../prompts';

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async clusterIdeas(ideas: any[]): Promise<ClusterResult> {
    if (!ideas || ideas.length === 0) {
      return { clusters: [] };
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: CLUSTERING_PROMPT,
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
          content: SUMMARIZATION_PROMPT,
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

  async generateDailyDigest(ideas: any[]): Promise<DailyDigestResult> {
    if (!ideas || ideas.length === 0) {
      return { summary: '', clusters: [] };
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: DAILY_DIGEST_PROMPT,
        },
        {
          role: 'user',
          content: JSON.stringify(ideas),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    try {
      const result = JSON.parse(content) as DailyDigestResult;
      return result;
    } catch (error) {
      throw new Error('Failed to parse OpenAI Daily Digest response as JSON');
    }
  }
}
