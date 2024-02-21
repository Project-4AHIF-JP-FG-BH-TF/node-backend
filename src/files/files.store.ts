import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { RequestError } from "./files";

export class FilesStore {
  static instance: FilesStore | undefined;

  static getInstance(): FilesStore {
    if (FilesStore.instance === undefined) {
      FilesStore.instance = new FilesStore();
    }

    return FilesStore.instance;
  }

  async get(sessionID: UUID): Promise<String[] | RequestError> {
    try {
      const query = {
        text: `
                    SELECT file_name
                    FROM loggaroo.file
                    WHERE session_id = $1
                `,
        values: [sessionID],
      };

      const result = await DatabaseService.getInstance()
        .getClient()
        .query<{ file_name: String }>(query);

      return result.rows.map((e) => e.file_name);
    } catch (e) {
      console.log(e);
      return RequestError.serverError;
    }
  }
}
