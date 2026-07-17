import { ChatTurn } from '@sparkles/core';
import { createChatTurn, getChatTurnsForIdea, deleteChatTurnsForIdea } from '@sparkles/db';
import * as Crypto from 'expo-crypto';

export async function fetchChatTurns(ideaId: string): Promise<ChatTurn[]> {
    return getChatTurnsForIdea(ideaId);
}

export async function saveChatTurn(
    ideaId: string,
    role: 'user' | 'assistant',
    text: string
): Promise<ChatTurn> {
    const bytes = await Crypto.getRandomBytesAsync(8);
    const suffix = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const turn: ChatTurn = {
        id: `chat_${Date.now()}_${suffix}`,
        ideaId,
        role,
        text,
        createdAt: Date.now(),
    };
    await createChatTurn(turn);
    return turn;
}

/** Discarding a spark should take its conversation with it. */
export async function removeChatForIdea(ideaId: string): Promise<void> {
    return deleteChatTurnsForIdea(ideaId);
}
