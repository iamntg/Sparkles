import { getDb } from './db';
import { ChatTurn } from '@sparkles/core';

export async function createChatTurn(turn: ChatTurn): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO chat_turns (id, ideaId, role, text, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [turn.id, turn.ideaId, turn.role, turn.text, turn.createdAt]
  );
}

export async function getChatTurnsForIdea(ideaId: string): Promise<ChatTurn[]> {
  const db = await getDb();
  return db.getAllAsync<ChatTurn>(
    `SELECT * FROM chat_turns WHERE ideaId = ? ORDER BY createdAt ASC`,
    [ideaId]
  );
}

export async function deleteChatTurnsForIdea(ideaId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM chat_turns WHERE ideaId = ?`, [ideaId]);
}
