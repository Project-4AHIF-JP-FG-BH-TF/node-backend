import { UUID } from "node:crypto";
import { LogEntryStore } from "./logEntry.store";
import {
  LogEntry,
  LogEntryRequestData,
  LogEntryRequestError,
} from "./logEntry";

export class LogEntryService {
  static instance: LogEntryService | undefined;

  static getInstance(): LogEntryService {
    if (LogEntryService.instance === undefined) {
      LogEntryService.instance = new LogEntryService();
    }

    return LogEntryService.instance;
  }

  async get(
    sessionID: UUID,
    logEntryData: LogEntryRequestData,
  ): Promise<LogEntry[] | LogEntryRequestError> {
    try {
      const files: string[] = logEntryData.files;
      const from: number = logEntryData.from;
      const count: number = logEntryData.count;
      const sortingOrderDESC = logEntryData.sortingOrderDESC;

      const ip = logEntryData.filters.ip;
      const text = logEntryData.filters.text;
      const regex = logEntryData.filters.regex;
      const classification = logEntryData.filters.classification;
      const date = logEntryData.filters.date;

      if (from < 0 || count < 0) {
        return LogEntryRequestError.wrongBodyData;
      }

      if (
        typeof sortingOrderDESC !== "boolean" &&
        typeof sortingOrderDESC !== "undefined"
      ) {
        return LogEntryRequestError.wrongBodyData;
      }

      return await LogEntryStore.getInstance().get(
        sessionID,
        files,
        from,
        count,
        sortingOrderDESC === undefined ? false : sortingOrderDESC,
        ip,
        text,
        regex,
        classification,
        date,
      );
    } catch (e) {
      return LogEntryRequestError.wrongBodyData;
    }
  }
}
