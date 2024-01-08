import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { LogEntry, LogEntryRequestError } from "./logEntry";

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
    sortingOrderDESC: boolean,
  ): Promise<LogEntry[] | LogEntryRequestError> {
    try {
      const order = sortingOrderDESC ? "DESC" : "ASC";

      const query = {
        text: `
            SELECT *
            FROM loggaroo.log_entry
              WHERE session_id = $1
                AND file_name = ANY($2)
              ORDER BY creation_date ${order}
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
      return LogEntryRequestError.serverError;
    }
  }
}
