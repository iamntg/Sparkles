import Anthropic from '@anthropic-ai/sdk';
import { AIProvider, ClusterResult, DailyDigestResult, ReviewInput, IdeaReview, ChatMessage } from '../types';
import {
  CLUSTERING_PROMPT,
  SUMMARIZATION_PROMPT,
  DAILY_DIGEST_PROMPT,
  buildReviewPrompt,
  buildBrainstormPrompt,
} from '../prompts';

function parseJsonFromText(text: string): any {
  try {
    return JSON.parse(text.trim());
  } catch {}

  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {}
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch {}
  }

  throw new Error('Could not extract valid JSON from Claude response');
}

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.CLAUDE_MODEL || 'claude-opus-4-8';
  }

  private getTextContent(response: Anthropic.Message): string {
    const textBlock = response.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in Claude response');
    }
    return textBlock.text;
  }

  async clusterIdeas(ideas: any[]): Promise<ClusterResult> {
    if (!ideas || ideas.length === 0) {
      return { clusters: [] };
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: CLUSTERING_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(ideas) }],
    });

    const text = this.getTextContent(response);
    try {
      return parseJsonFromText(text) as ClusterResult;
    } catch {
      throw new Error('Failed to parse clustering response as JSON');
    }
  }

  async summarizeIdeas(ideas: string[]): Promise<string> {
    if (!ideas || ideas.length === 0) {
      return '';
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: SUMMARIZATION_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(ideas) }],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock?.type === 'text' ? textBlock.text : '';
  }

  async generateDailyDigest(ideas: any[]): Promise<DailyDigestResult> {
    if (!ideas || ideas.length === 0) {
      return { summary: '', clusters: [] };
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: DAILY_DIGEST_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(ideas) }],
    });

    const text = this.getTextContent(response);
    try {
      return parseJsonFromText(text) as DailyDigestResult;
    } catch {
      throw new Error('Failed to parse daily digest response as JSON');
    }
  }

  async reviewIdea(idea: ReviewInput, includePlan: boolean): Promise<IdeaReview> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system: buildReviewPrompt(includePlan),
      messages: [{ role: 'user', content: JSON.stringify(idea) }],
    });

    const text = this.getTextContent(response);
    try {
      return parseJsonFromText(text) as IdeaReview;
    } catch {
      throw new Error('Failed to parse idea review response as JSON');
    }
  }

  async brainstorm(idea: ReviewInput, history: ChatMessage[]): Promise<string> {
    if (!history.length) {
      return '';
    }

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 400,
      system: buildBrainstormPrompt(idea.text, idea.description),
      messages: history.map(m => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: m.text,
      })),
    });

    return this.getTextContent(response).trim();
  }
}
