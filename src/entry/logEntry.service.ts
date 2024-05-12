import { UUID } from "node:crypto";
import { LogEntryStore } from "./logEntry.store";
import {
  Counts,
  FilteredRequestData,
  LogEntry,
  LogEntryRequestData,
  RequestError,
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
  ): Promise<LogEntry[] | RequestError> {
    try {
      const from: number = logEntryData.from;
      const count: number = logEntryData.count;
      const order = logEntryData.order;

      if (from < 0 || count <= 0) {
        return RequestError.wrongBodyData;
      }

      // order
      if (typeof order !== "undefined" && order !== "ASC" && order !== "DESC") {
        return RequestError.wrongBodyData;
      }

      return await LogEntryStore.getInstance().get(sessionID, logEntryData);
    } catch (e) {
      return RequestError.wrongBodyData;
    }
  }

  async getIps(
    sessionID: UUID,
    ipRequestData: FilteredRequestData,
  ): Promise<string[] | RequestError> {
    const ips = await LogEntryStore.getInstance().getIps(
      sessionID,
      ipRequestData,
    );

    if (typeof ips === "number") {
      return ips;
    }

    ips.sort((a, b) => {
      return (a || "").localeCompare(b || "", undefined, {
        numeric: true,
      });
    });

    return ips;
  }

  async getClassifications(
    sessionID: UUID,
    classificationRequestData: FilteredRequestData,
  ): Promise<string[] | RequestError> {
    return await LogEntryStore.getInstance().getClassifications(
      sessionID,
      classificationRequestData,
    );
  }

  async getCount(
    sessionID: UUID,
    classificationRequestData: FilteredRequestData,
  ): Promise<Counts | RequestError> {
    return {
      all: await LogEntryStore.getInstance().getAllCount(
        sessionID,
        classificationRequestData,
      ),
      filtered: await LogEntryStore.getInstance().getFilterCount(
        sessionID,
        classificationRequestData,
      ),
    };
  }

  async getExported(
    sessionID: UUID,
    classificationRequestData: FilteredRequestData,
  ): Promise<string | RequestError> {
    let messages = await LogEntryStore.getInstance().getAll(
      sessionID,
      classificationRequestData,
    );

    if (
      messages == RequestError.serverError ||
      messages == RequestError.wrongBodyData
    ) {
      return messages;
    }

    let exportString = "";

    for (let message of messages) {
      if (message.sql_raw != undefined) {
        exportString += `${message.creation_date.toISOString()} ${message.classification.toUpperCase()} [${
          message.service_ip != null ? message.service_ip : ""
        }] [${message.user_id != null ? message.user_id : ""}] [${
          message.session_id != null ? message.session_id : ""
        }] [${message.java_class != null ? message.java_class : ""}] ${
          message.sql_raw
        }\n`;
        exportString += `${message.creation_date.toISOString()} ${message.classification.toUpperCase()} [${
          message.service_ip != null ? message.service_ip : ""
        }] [${message.user_id != null ? message.user_id : ""}] [${
          message.session_id != null ? message.session_id : ""
        }] [${message.java_class != null ? message.java_class : ""}] ${
          message.sql_data
        }\n`;
      } else {
        exportString += `${message.creation_date.toISOString()} ${message.classification.toUpperCase()} [${
          message.service_ip != null ? message.service_ip : ""
        }] [${message.user_id != null ? message.user_id : ""}] [${
          message.session_id != null ? message.session_id : ""
        }] [${message.java_class != null ? message.java_class : ""}] ${
          message.content
        }\n`;
      }
    }

    return exportString;
  }
}
