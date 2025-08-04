import { SQLiteDatabase } from "expo-sqlite";

const migrations: ((db: SQLiteDatabase) => Promise<void>)[] = [
  async (db: SQLiteDatabase) => {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE images (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        original_path TEXT NOT NULL UNIQUE,
        checked_date BOOLEAN DEFAULT FALSE NOT NULL,  
        original_date DATETIME,
        new_path TEXT,
        new_date DATETIME,
        status TEXT NOT NULL,
        decision TEXT,
        updated_on DATETIME
      );
    `);
  },
];

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const MAX_DATABASE_VERSION = migrations.length;
  let value = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  let user_version = value?.user_version ?? 0;

  console.log({
    MAX_DATABASE_VERSION,
    user_version,
  });
  if (user_version >= MAX_DATABASE_VERSION) {
    return;
  }
  for (let i = user_version; i < MAX_DATABASE_VERSION; i++) {
    console.log(`Running migration ${i}`);
    await migrations[i](db);
  }

  await db.execAsync(`PRAGMA user_version = ${MAX_DATABASE_VERSION}`);
}
