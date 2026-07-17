import { Idea, IdeaReview, ChatMessage } from '@sparkles/core';
import { googleAuthService } from './googleAuthService';

const BASE_URL = process.env.EXPO_PUBLIC_AI_URL;

/**
 * The AI service holds the provider API keys, so every AI call goes through it
 * rather than talking to a model provider from the device.
 */
function requireBaseUrl(): string {
    if (!BASE_URL) {
        throw new Error('AI is not configured. Set EXPO_PUBLIC_AI_URL to your Sparkles AI service.');
    }
    return BASE_URL;
}

/** The service rate-limits per user, so it needs to know who is asking. */
function userId(): string {
    const user = googleAuthService.getUser();
    return user?.email || 'local-stargazer';
}

async function post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${requireBaseUrl()}${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'x-user-id': userId(),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let message = `AI service error (${response.status})`;
        try {
            const parsed = await response.json();
            if (parsed?.error) message = parsed.error;
        } catch {
            // Keep the status-code message.
        }
        throw new Error(message);
    }

    return response.json() as Promise<T>;
}

export function isAiConfigured(): boolean {
    return !!BASE_URL;
}

export async function reviewIdea(idea: Idea, includePlan: boolean): Promise<IdeaReview> {
    return post<IdeaReview>('/review', {
        text: idea.text || idea.rawText || '',
        description: idea.description,
        includePlan,
    });
}

export async function brainstorm(idea: Idea, history: ChatMessage[]): Promise<string> {
    const { reply } = await post<{ reply: string }>('/brainstorm', {
        text: idea.text || idea.rawText || '',
        description: idea.description,
        history,
    });
    return reply;
}
