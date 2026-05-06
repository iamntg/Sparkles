import { getDb } from './db';
import { Link } from '@sparkles/core';

export async function createLink(link: Link): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO links (id, fromIdeaId, toIdeaId, type, confidence, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [link.id, link.fromIdeaId, link.toIdeaId, link.type, link.confidence, link.createdAt]
  );
}

export async function upsertLink(link: Link): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT OR REPLACE INTO links (id, fromIdeaId, toIdeaId, type, confidence, createdAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [link.id, link.fromIdeaId, link.toIdeaId, link.type, link.confidence, link.createdAt]
  );
}

export async function getLinksForIdea(ideaId: string): Promise<Link[]> {
  const db = await getDb();
  return await db.getAllAsync<Link>(
    `SELECT * FROM links WHERE fromIdeaId = ? OR toIdeaId = ? ORDER BY createdAt DESC`,
    [ideaId, ideaId]
  );
}

export async function getAllLinks(): Promise<Link[]> {
  const db = await getDb();
  return await db.getAllAsync<Link>(`SELECT * FROM links ORDER BY createdAt DESC`);
}

export async function deleteLink(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM links WHERE id = ?`, [id]);
}

export async function deleteLinksByIdea(ideaId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM links WHERE fromIdeaId = ? OR toIdeaId = ?`, [ideaId, ideaId]);
}
