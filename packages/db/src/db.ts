import * as SQLite from 'expo-sqlite';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('sparkles.db');
  }
  return _db;
}

export async function closeDb() {
  if (_db) {
    await _db.closeAsync();
    _db = null;
  }
}
