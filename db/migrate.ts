import { SQLiteDatabase } from "expo-sqlite";

const migrations: ((db: SQLiteDatabase) => Promise<void>)[] = [
  async (db: SQLiteDatabase) => {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE images (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        original_path TEXT NOT NULL,
        original_date DATE NOT NULL,
        new_path TEXT,
        new_date DATE,
        status TEXT NOT NULL,
        decision TEXT
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
