// Web mock for migrations - no-op since localStorage doesn't need schemas
export async function runMigrations() {
    console.log('[Web DB] Mock runMigrations() called. Using localStorage instead of SQLite.');
}
