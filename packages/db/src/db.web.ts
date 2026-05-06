import { openDB, IDBPDatabase } from 'idb';

let _db: IDBPDatabase | null = null;

export async function getDb(): Promise<IDBPDatabase> {
  if (!_db) {
    _db = await openDB('sparkles', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('ideas')) {
          const ideaStore = db.createObjectStore('ideas', { keyPath: 'id' });
          ideaStore.createIndex('idx_ideas_status', 'status');
          ideaStore.createIndex('idx_ideas_updatedAt', 'updatedAt');
        }
        
        if (!db.objectStoreNames.contains('links')) {
          const linkStore = db.createObjectStore('links', { keyPath: 'id' });
          linkStore.createIndex('idx_links_from', 'fromIdeaId');
          linkStore.createIndex('idx_links_to', 'toIdeaId');
        }

        if (!db.objectStoreNames.contains('review_sessions')) {
          db.createObjectStore('review_sessions', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('tags')) {
          const tagStore = db.createObjectStore('tags', { keyPath: 'id' });
          tagStore.createIndex('name', 'name', { unique: true });
        }
      },
    });
  }
  return _db;
}

export async function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
