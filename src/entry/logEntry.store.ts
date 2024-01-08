import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { LogEntry, LogEntryRequestError, RangeDate } from "./logEntry";

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
    ip: string | undefined,
    text: string | undefined,
    regex: string | undefined,
    classification: string | undefined,
    date: RangeDate | undefined,
  ): Promise<LogEntry[] | LogEntryRequestError> {
    try {
      const order = sortingOrderDESC ? "DESC" : "ASC";

      const queryParams: any[] = [sessionID, files];
      let queryString = `
      SELECT *
            FROM loggaroo.log_entry
              WHERE session_id = $1
                AND file_name = ANY($2)
                `;

      if (ip) {
        queryParams.push(ip);
        queryString += "AND service_ip = $" + queryParams.length;
      }

      if (text) {
        queryParams.push(text);
        queryString += "AND content = $" + queryParams.length;
      }

      if (regex) {
        queryParams.push(regex);
        queryString += "AND content ~ $" + queryParams.length;
      }

      if (classification) {
        queryParams.push(classification);
        queryString += "AND service_ip = $" + queryParams.length;
      }

      if (date) {
        queryParams.push(date.from);

        if (date.to) queryParams.push(date.to);
        else queryParams.push(new Date(Date.now()).toISOString().split("T")[0]);

        queryString += `AND creation_date BETWEEN $${
          queryParams.length - 1
        } AND $${queryParams.length}`;
      }

      queryString += `
              ORDER BY creation_date ${order}
              OFFSET $${queryParams.length + 1}
              LIMIT $${queryParams.length + 2}
              `;

      queryParams.push(from, count);

      const query = {
        text: queryString,
        values: queryParams,
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
