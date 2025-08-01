import { Dayjs } from "dayjs";
import { SQLiteDatabase } from "expo-sqlite";

export type CardStatus = "pending" | "accepted" | "rejected" | "deleted";

export type ImageModel = {
  id: number;
  original_path: string;
  original_date: Dayjs;
  new_path: string | null;
  new_date: Dayjs | null;
  status: CardStatus;
  decision: string;
};

export class ImageRepository {
  db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async bulkUpsert(values: { original_path: string; status: CardStatus }[]) {
    for (let i = 0; i < values.length; i += 50) {
      const items = values
        .slice(i, i + 50)
        .map((v) => `('${v.original_path}', '${v.status}')`)
        .join(",");
      console.log("bulkUpsert", items);
      await this.db.execAsync(`
        INSERT INTO images (original_path, status)
        VALUES 
          ${items}
        ON CONFLICT(original_path) DO NOTHING;
      `);
    }
  }

  async getNPending(n: number) {
    const images = await this.db.getAllAsync<ImageModel>(`
        SELECT * FROM images WHERE status='pending' ORDER BY RANDOM() LIMIT ${n};
      `);
    return images;
  }

  async setStatus(id: number, status: CardStatus) {
    await this.db.runAsync(`UPDATE images SET status = ? WHERE id = ?;`, status, id);
  }
}
