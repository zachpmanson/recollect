import dayjs, { Dayjs } from "dayjs";
import { SQLiteDatabase } from "expo-sqlite";

export type ImageStatus = "pending" | "accepted" | "rejected" | "deleted";

export type RawImageModel = {
  id: number;
  original_path: string;
  original_date: string;
  new_path: string | null;
  new_date: string | null;
  status: ImageStatus;
  decision: string;
  updated_on: string | null;
};

export type ImageModel = {
  id: number;
  original_path: string;
  original_date: Dayjs;
  new_path: string | null;
  new_date: Dayjs | null;
  status: ImageStatus;
  decision: string;
  updated_on: Dayjs | null;
};

export class ImageRepository {
  db: SQLiteDatabase;

  constructor(db: SQLiteDatabase) {
    this.db = db;
  }

  async bulkUpsert(values: { original_path: string; status: ImageStatus }[]) {
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

  async getNPending(n: number, day?: Dayjs) {
    let images: RawImageModel[];
    if (day) {
      images = await this.db.getAllAsync<RawImageModel>(
        `SELECT * FROM images WHERE status='pending' AND original_date=? ORDER BY RANDOM() LIMIT ${n};`,
        day.format("YYYY-MM-DD")
      );
    } else {
      images = await this.db.getAllAsync<RawImageModel>(`
        SELECT * FROM images WHERE status='pending' ORDER BY RANDOM() LIMIT ${n};
      `);
    }

    return images.map<ImageModel>((i) => ({
      ...i,
      original_date: dayjs(i.original_date),
      new_date: i.new_date ? dayjs(i.new_date) : null,
      updated_on: i.updated_on ? dayjs(i.updated_on) : null,
    }));
  }

  async setStatus(id: number, status: ImageStatus) {
    await this.db.runAsync(`UPDATE images SET status = ?, updated_on = 'now' WHERE id = ?;`, status, id);
  }
}
