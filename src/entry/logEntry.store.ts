import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { LogEntry, LogEntryError } from "./logEntry";

export class LogEntryStore {
  static instance: LogEntryStore | undefined;

  static getInstance(): LogEntryStore {
    if (LogEntryStore.instance === undefined) {
      LogEntryStore.instance = new LogEntryStore();
    }

    return LogEntryStore.instance;
  }

  async get(
    sessionID: UUID,
    files: string[],
    from: number,
    count: number,
  ): Promise<LogEntry[] | LogEntryError> {
    try {
      const query = {
        text: `
            SELECT *
            FROM loggaroo.log_entry
              WHERE session_id = $1
                AND file_name IN $2
              OFFSET $3
              LIMIT $4  
        `,
        values: [sessionID, files, from, count],
      };

      const result = await DatabaseService.getInstance()
        .getClient()
        .query<LogEntry>(query);

      return result.rows;
    } catch (e) {
      console.log(e);
      return LogEntryError.serverError;
    }
  }
}
