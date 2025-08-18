import dayjs, { Dayjs } from "dayjs";
import { SQLiteDatabase } from "expo-sqlite";

export type ImageStatus = "pending" | "accepted" | "rejected" | "deleted" | "draft" | "updated";

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
  original_date: Dayjs | null;
  new_path: string | null;
  new_date: Dayjs | null;
  status: ImageStatus;
  decision: string;
  updated_on: Dayjs | null;
};

export function rawToPacked(raw: RawImageModel): ImageModel {
  return {
    ...raw,
    original_date: raw.original_date ? dayjs(raw.original_date) : null,
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
      try {
        images = await this.db.getAllAsync<RawImageModel>(
          `SELECT * FROM images WHERE status = 'pending' AND DATE(original_date) = ? ORDER BY RANDOM() LIMIT ?;`,
          day.format("YYYY-MM-DD"),
          n
        );
      } catch (error) {
        console.error("Error fetching images with specific date:", error);
        throw error;
      }
    } else {
      images = await this.db.getAllAsync<RawImageModel>(
        `
        SELECT * FROM images WHERE status='pending' ORDER BY RANDOM() LIMIT ?;
      `,
        n
      );
    }

    return images.map(rawToPacked);
  }

  async getOne(id: number) {
    const raw = await this.db.getFirstAsync<RawImageModel>(`SELECT * FROM images WHERE id = ?;`, id);
    if (!raw) return undefined;
    return rawToPacked(raw);
  }

  async setStatus(id: number, status: ImageStatus) {
    console.debug("Setting status for image", id, "to", status);
    await this.db.runAsync(`UPDATE images SET status = ?, updated_on = time('now') WHERE id = ?;`, status, id);
    const o = await this.getOne(id);
    console.debug("Updated image:", o);
  }

  async getMissingOriginalDate(n: number) {
    try {
      const images = await this.db.getAllAsync<RawImageModel>(
        `SELECT * FROM images WHERE checked_date = FALSE AND original_date IS NULL LIMIT ?;`,
        n
      );
      return images.map(rawToPacked);
    } catch (error) {
      console.error("Error getting images with missing original date:", error);
      throw error;
    }
  }

  async setOriginalDate(id: number, date: Dayjs) {
    await this.db.runAsync(
      `UPDATE images SET original_date = ?, checked_date = TRUE WHERE id = ? AND original_date = NULL;`,
      date.toISOString(),
      id
    );
  }

  async upsertOriginalDates(updates: ImageModel[]) {
    console.debug("upsertOriginalDates", updates.length);
    if (updates.length === 0) return;
    const r = await this.db.getAllAsync(`PRAGMA table_info(images);`);
    console.debug("Table info:", r);
    const placeholders = updates.map(() => "(?, ?, ?, ?, ?)").join(", ");
    const values = updates.flatMap(({ id, original_path, original_date, status }) => [
      id,
      original_path,
      original_date?.toISOString() ?? null,
      true,
      status,
    ]);

    const sql = `
    INSERT INTO images (id, original_path, original_date, checked_date, status)
    VALUES ${placeholders}
    ON CONFLICT(id) DO UPDATE SET
      original_date = CASE
        WHEN images.original_date IS NULL THEN excluded.original_date
        ELSE images.original_date
      END,
      checked_date = TRUE;
  `;

    const res = await this.db.runAsync(sql, ...values);
  }

  async clearStatus(status: string) {
    try {
      await this.db.runAsync("UPDATE images SET status = 'pending' WHERE status = ?;", status);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async setNewDate(id: number, date: Dayjs, status: ImageStatus = "draft") {
    await this.db.runAsync(`UPDATE images SET new_date = ?, status = ? WHERE id = ?;`, date.toISOString(), status, id);
  }
}
