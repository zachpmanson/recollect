import { useSQLiteContext } from "expo-sqlite";
import { ImageRepository } from "./images";

export default function useDb() {
  const db = useSQLiteContext();
  async function run(query: string, ...args: any[]) {
    try {
      const result = db.runAsync(query, args);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  async function exec(query: string) {
    try {
      const result = db.execAsync(query);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  return {
    db,
    run,
    exec,
    repositories: {
      image: new ImageRepository(db),
    },
  };
}
