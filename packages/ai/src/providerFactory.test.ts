import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getAIProvider } from './providerFactory';
import { OpenAIProvider } from './providers/openaiProvider';
import { ClaudeProvider } from './providers/claudeProvider';

const ORIGINAL_ENV = { ...process.env };

describe('getAIProvider', () => {
    beforeEach(() => {
        // The SDK clients require *some* key at construction time.
        process.env.OPENAI_API_KEY = 'test-openai-key';
        process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
        delete process.env.AI_PROVIDER;
    });

    afterEach(() => {
        process.env = { ...ORIGINAL_ENV };
        vi.restoreAllMocks();
    });

    it('defaults to OpenAI when AI_PROVIDER is unset', () => {
        expect(getAIProvider()).toBeInstanceOf(OpenAIProvider);
    });

    it('returns OpenAI when AI_PROVIDER=openai', () => {
        process.env.AI_PROVIDER = 'openai';
        expect(getAIProvider()).toBeInstanceOf(OpenAIProvider);
    });

    it('returns Claude when AI_PROVIDER=claude', () => {
        process.env.AI_PROVIDER = 'claude';
        expect(getAIProvider()).toBeInstanceOf(ClaudeProvider);
    });

    it('is case-insensitive about the provider name', () => {
        process.env.AI_PROVIDER = 'ClAuDe';
        expect(getAIProvider()).toBeInstanceOf(ClaudeProvider);
    });

    it('falls back to OpenAI (with a warning) for an unknown provider', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        process.env.AI_PROVIDER = 'gemini';

        expect(getAIProvider()).toBeInstanceOf(OpenAIProvider);
        expect(warn).toHaveBeenCalled();
    });
});
