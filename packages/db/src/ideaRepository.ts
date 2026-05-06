import { getDb } from './db';
import { Idea, IdeaStatus } from '@sparkles/core';

export async function createIdea(idea: Idea): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO ideas (
      id, createdAt, updatedAt, sourceType, text, title, status, 
      transcriptStatus, audioLocalPath, constellationX, constellationY, constellationSeed, deletedAt, rawText, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      idea.id, idea.createdAt, idea.updatedAt, idea.sourceType, idea.text, idea.title, idea.status,
      idea.transcriptStatus || null, idea.audioLocalPath || null, idea.constellationX || null,
      idea.constellationY || null, idea.constellationSeed || null, idea.deletedAt || null,
      idea.rawText || null, idea.tags ? JSON.stringify(idea.tags) : null
    ]
  );
}

function parseIdeaRow(row: any): Idea {
  if (row.tags && typeof row.tags === 'string') {
    try {
      row.tags = JSON.parse(row.tags);
    } catch (e) {
      row.tags = [];
    }
  }
  return row as Idea;
}

export async function getIdea(id: string): Promise<Idea | null> {
  const db = await getDb();
  const result = await db.getFirstAsync<any>(`SELECT * FROM ideas WHERE id = ?`, [id]);
  return result ? parseIdeaRow(result) : null;
}

export async function getAllIdeas(): Promise<Idea[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<any>(`SELECT * FROM ideas WHERE deletedAt IS NULL ORDER BY updatedAt DESC`);
  return rows.map(parseIdeaRow);
}

export async function updateIdea(idea: Idea): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE ideas SET 
      updatedAt = ?, text = ?, title = ?, status = ?, transcriptStatus = ?, 
      audioLocalPath = ?, constellationX = ?, constellationY = ?, constellationSeed = ?, deletedAt = ?,
      rawText = ?, tags = ?
     WHERE id = ?`,
    [
      idea.updatedAt, idea.text, idea.title, idea.status, idea.transcriptStatus || null,
      idea.audioLocalPath || null, idea.constellationX || null, idea.constellationY || null,
      idea.constellationSeed || null, idea.deletedAt || null, 
      idea.rawText || null, idea.tags ? JSON.stringify(idea.tags) : null,
      idea.id
    ]
  );
}

export async function upsertIdea(idea: Idea): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO ideas (
      id, createdAt, updatedAt, sourceType, text, title, status, 
      transcriptStatus, audioLocalPath, constellationX, constellationY, constellationSeed, deletedAt, rawText, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      idea.id, idea.createdAt, idea.updatedAt, idea.sourceType, idea.text, idea.title, idea.status,
      idea.transcriptStatus || null, idea.audioLocalPath || null, idea.constellationX || null,
      idea.constellationY || null, idea.constellationSeed || null, idea.deletedAt || null,
      idea.rawText || null, idea.tags ? JSON.stringify(idea.tags) : null
    ]
  );
}

export async function deleteIdea(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`UPDATE ideas SET deletedAt = ? WHERE id = ?`, [Date.now(), id]);
}
