import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import {
  LogEntry,
  LogEntryRequestData,
  LogEntryRequestError,
  RangeDate,
} from "./logEntry";

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
    logEntryRequestData: LogEntryRequestData,
  ): Promise<LogEntry[] | LogEntryRequestError> {
    try {
      logEntryRequestData.order =
        logEntryRequestData.order === undefined
          ? "ASC"
          : logEntryRequestData.order;

      const queryParams: any[] = [sessionID, logEntryRequestData.files];
      let queryString = `
      SELECT *
            FROM loggaroo.log_entry
              WHERE session_id = $1
                AND file_name = ANY($2)
                `;

      if (logEntryRequestData.filters?.ip) {
        queryParams.push(logEntryRequestData.filters.ip);
        queryString += "AND service_ip = $" + queryParams.length;
      }

      if (logEntryRequestData.filters?.text) {
        queryParams.push(logEntryRequestData.filters.text);

        //todo regex nullable
        if (logEntryRequestData.filters.regex) {
          queryString += "AND content ~ $" + queryParams.length;
        } else {
          queryString += "AND content = $" + queryParams.length;
        }
      }

      if (logEntryRequestData.filters?.classification) {
        queryParams.push(logEntryRequestData.filters.classification);
        queryString += "AND service_ip = $" + queryParams.length;
      }

      if (
        logEntryRequestData.filters?.date?.to ||
        logEntryRequestData.filters?.date?.from
      ) {
        if (logEntryRequestData.filters.date.from === undefined) {
          queryParams.push(logEntryRequestData.filters.date.to);
          queryString += `AND creation_date <= $${queryParams.length}`;
        } else if (logEntryRequestData.filters.date.to === undefined) {
          queryParams.push(logEntryRequestData.filters.date.from);
          queryString += `AND creation_date >= $${queryParams.length}`;
        } else {
          queryParams.push(logEntryRequestData.filters.date.from);
          queryParams.push(logEntryRequestData.filters.date.to);

          queryString += `AND creation_date BETWEEN $${
            queryParams.length - 1
          } AND $${queryParams.length}`;
        }
      }

      queryString += `
              ORDER BY creation_date ${logEntryRequestData.order}
              OFFSET $${queryParams.length + 1}
              LIMIT $${queryParams.length + 2}
              `;

      queryParams.push(logEntryRequestData.from, logEntryRequestData.count);

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
