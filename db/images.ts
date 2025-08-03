import dayjs, { Dayjs } from "dayjs";
import { SQLiteDatabase } from "expo-sqlite";

export type ImageStatus = "pending" | "accepted" | "rejected" | "deleted";

export type RawImageModel = {
  id: number;
  original_path: string;
  has_date: boolean;
  original_date: string | null;
  new_path: string | null;
  new_date: string | null;
  status: ImageStatus;
  decision: string;
  updated_on: string | null;
};

export type ImageModel = {
  id: number;
  original_path: string;
  has_date: boolean;
  original_date: Dayjs;
  new_path: string | null;
  new_date: Dayjs | null;
  status: ImageStatus;
  decision: string;
  updated_on: Dayjs | null;
};

function rawToPacked(raw: RawImageModel): ImageModel {
  return {
    ...raw,
    original_date: dayjs(raw.original_date),
    new_date: raw.new_date ? dayjs(raw.new_date) : null,
    updated_on: raw.updated_on ? dayjs(raw.updated_on) : null,
  };
}

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
      // console.log("bulkUpsert", items);
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
        `SELECT * FROM images WHERE status='pending' AND original_date=? ORDER BY RANDOM() LIMIT ?;`,
        n,
        day.format("YYYY-MM-DD")
      );
    } else {
      images = await this.db.getAllAsync<RawImageModel>(
        `
        SELECT * FROM images WHERE status='pending' ORDER BY RANDOM() LIMIT ?;
      `,
        n
      );
    }

    return images.map<ImageModel>(rawToPacked);
  }

  async setStatus(id: number, status: ImageStatus) {
    await this.db.runAsync(`UPDATE images SET status = ?, updated_on = time('now') WHERE id = ?;`, status, id);
  }

  async getMissingOriginalDate(n: number) {
    const images = await this.db.getAllAsync<RawImageModel>(
      `SELECT * FROM images WHERE has_date = TRUE OR has_date = NULl AND original_date IS NULL ORDER BY RANDOM() LIMIT ?;`,
      n
    );
    return images.map<ImageModel>(rawToPacked);
  }

  async setOriginalDate(id: number, date: Dayjs) {
    await this.db.runAsync(
      `UPDATE images SET original_date = ?, has_date = TRUE WHERE id = ? AND original_date = NULL;`,
      date.format("YYYY-MM-DD"),
      id
    );
  }
}
