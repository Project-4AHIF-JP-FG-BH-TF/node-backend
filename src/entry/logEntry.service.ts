import { LogEntryStore } from "./logEntry.store";
import { UUID } from "node:crypto";
import { LogEntry, LogEntryData, LogEntryError } from "./logEntry";

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
    logEntryData: LogEntryData,
  ): Promise<LogEntry[] | LogEntryError> {
    try {
      let files: string[] = logEntryData.files;
      let from: number = logEntryData.from;
      let count: number = logEntryData.count;

      return await LogEntryStore.getInstance().get(
        sessionID,
        files,
        from,
        count,
      );
    } catch (e) {
      return LogEntryError.wrongBodyData;
    }
  }
}
