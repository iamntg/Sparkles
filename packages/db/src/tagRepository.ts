import { getDb } from './db';

export type Tag = {
  id: string;
  name: string;
  usageCount: number;
  createdAt: number;
};

export async function incrementTagsUsage(tags: string[]): Promise<void> {
  if (!tags || tags.length === 0) return;
  const db = await getDb();
  
  for (const tag of tags) {
    const name = tag.toLowerCase();
    const existing = await db.getFirstAsync<Tag>(`SELECT * FROM tags WHERE name = ?`, [name]);
    
    if (existing) {
      await db.runAsync(`UPDATE tags SET usageCount = usageCount + 1 WHERE id = ?`, [existing.id]);
    } else {
      const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.runAsync(
        `INSERT INTO tags (id, name, usageCount, createdAt) VALUES (?, ?, ?, ?)`,
        [id, name, 1, Date.now()]
      );
    }
  }
}

export async function searchTags(prefix: string, limit: number = 5): Promise<Tag[]> {
  const db = await getDb();
  const searchPrefix = prefix.toLowerCase() + '%';
  return await db.getAllAsync<Tag>(
    `SELECT * FROM tags WHERE name LIKE ? ORDER BY usageCount DESC LIMIT ?`,
    [searchPrefix, limit]
  );
}
