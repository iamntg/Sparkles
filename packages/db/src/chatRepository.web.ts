import { ChatTurn } from '@sparkles/core';
import { getDb } from './db.web';

export async function createChatTurn(turn: ChatTurn): Promise<void> {
    const db = await getDb();
    await db.put('chat_turns', turn);
}

export async function getChatTurnsForIdea(ideaId: string): Promise<ChatTurn[]> {
    const db = await getDb();
    const turns: ChatTurn[] = await db.getAllFromIndex('chat_turns', 'idx_chat_turns_idea', ideaId);
    return turns.sort((a, b) => a.createdAt - b.createdAt);
}

export async function deleteChatTurnsForIdea(ideaId: string): Promise<void> {
    const db = await getDb();
    const turns: ChatTurn[] = await db.getAllFromIndex('chat_turns', 'idx_chat_turns_idea', ideaId);
    await Promise.all(turns.map(t => db.delete('chat_turns', t.id)));
}
