import { getDb } from './db.web';

export async function runMigrations() {
    console.log('[Web DB] Initializing IndexedDB schema...');
    await getDb();
    console.log('[Web DB] IndexedDB ready.');
}
