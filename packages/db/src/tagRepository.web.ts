import { getDb } from './db.web';
import { Tag } from './tagRepository';

export async function incrementTagsUsage(tags: string[]): Promise<void> {
  if (!tags || tags.length === 0) return;
  const db = await getDb();

  for (const tag of tags) {
    const name = tag.toLowerCase();
    const existing = await db.getFromIndex('tags', 'name', name);
    
    if (existing) {
      existing.usageCount += 1;
      await db.put('tags', existing);
    } else {
      const id = `tag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.put('tags', {
        id,
        name,
        usageCount: 1,
        createdAt: Date.now()
      });
    }
  }
}

export async function searchTags(prefix: string, limit: number = 5): Promise<Tag[]> {
  const db = await getDb();
  const searchPrefix = prefix.toLowerCase();
  const tags = await db.getAll('tags');
  
  return tags
    .filter(tag => tag.name.startsWith(searchPrefix))
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
