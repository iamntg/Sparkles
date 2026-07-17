import { openDB, IDBPDatabase } from 'idb';

let _db: IDBPDatabase | null = null;

export async function getDb(): Promise<IDBPDatabase> {
  if (!_db) {
    // v2 added the chat_turns store. Bump on every new store — the upgrade
    // callback only runs when the version increases.
    _db = await openDB('sparkles', 2, {
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

        if (!db.objectStoreNames.contains('chat_turns')) {
          const chatStore = db.createObjectStore('chat_turns', { keyPath: 'id' });
          chatStore.createIndex('idx_chat_turns_idea', 'ideaId');
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
