import { getDb } from './db';

// Basic migration system
export async function runMigrations() {
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS ideas (
      id TEXT PRIMARY KEY,
      createdAt INTEGER,
      updatedAt INTEGER,
      sourceType TEXT,
      text TEXT,
      title TEXT,
      status TEXT,
      transcriptStatus TEXT,
      audioLocalPath TEXT,
      constellationX REAL,
      constellationY REAL,
      constellationSeed INTEGER,
      deletedAt INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
    CREATE INDEX IF NOT EXISTS idx_ideas_updatedAt ON ideas(updatedAt);

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      fromIdeaId TEXT,
      toIdeaId TEXT,
      type TEXT,
      confidence REAL,
      createdAt INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_links_from ON links(fromIdeaId);
    CREATE INDEX IF NOT EXISTS idx_links_to ON links(toIdeaId);

    CREATE TABLE IF NOT EXISTS review_sessions (
      id TEXT PRIMARY KEY,
      createdAt INTEGER,
      scope TEXT,
      resultJson TEXT
    );
  `);
}
