import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import {
  Filters,
  Ip,
  IpRequestData,
  LogEntry,
  LogEntryRequestData,
  RequestError,
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
  ): Promise<LogEntry[] | RequestError> {
    try {
      logEntryRequestData.order =
        logEntryRequestData.order === undefined
          ? "ASC"
          : logEntryRequestData.order;

      let queryParams: any[] = [sessionID, logEntryRequestData.files];
      let queryString = `
                SELECT *
                FROM loggaroo.log_entry
                WHERE session_id = $1
                  AND file_name = ANY ($2)
            `;

      if (logEntryRequestData.filters) {
        const filteredQueryData = this.applyFilters(
          logEntryRequestData.filters,
          queryString,
          queryParams,
        );

        queryParams = filteredQueryData.queryParams;
        queryString = filteredQueryData.queryString;
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
      return RequestError.serverError;
    }
  }

  async getIps(
    sessionID: UUID,
    ipRequestData: IpRequestData,
  ): Promise<string[] | RequestError> {
    try {
      let queryParams: any[] = [sessionID, ipRequestData.files];
      let queryString = `
                SELECT DISTINCT service_ip
                FROM loggaroo.log_entry
                WHERE session_id = $1
                  AND file_name = ANY ($2)
            `;

      if (ipRequestData.filters) {
        const filteredQueryData = this.applyFilters(
          ipRequestData.filters,
          queryString,
          queryParams,
        );

        queryParams = filteredQueryData.queryParams;
        queryString = filteredQueryData.queryString;
      }

      const query = {
        text: queryString,
        values: queryParams,
      };

      const result = await DatabaseService.getInstance()
        .getClient()
        .query<Ip>(query);

      return result.rows.map((e) => e.service_ip);
    } catch (e) {
      console.log(e);
      return RequestError.serverError;
    }
  }

  applyFilters(filters: Filters, queryString: string, queryParams: any[]) {
    queryParams = [...queryParams];

    if (filters?.ip) {
      queryParams.push(filters.ip);
      queryString += "AND service_ip = $" + queryParams.length;
    }

    if (filters?.text) {
      queryParams.push(filters.text);

      if (filters.regex) {
        queryString += "AND content ~ $" + queryParams.length;
      } else {
        queryString += "AND content = $" + queryParams.length;
      }
    }

    if (filters?.classification) {
      queryParams.push(filters.classification);
      queryString += "AND classification = $" + queryParams.length;
    }

    if (filters?.date?.to || filters?.date?.from) {
      if (filters.date.from === undefined) {
        queryParams.push(filters.date.to);
        queryString += `AND creation_date <= $${queryParams.length}`;
      } else if (filters.date.to === undefined) {
        queryParams.push(filters.date.from);
        queryString += `AND creation_date >= $${queryParams.length}`;
      } else {
        queryParams.push(filters.date.from);
        queryParams.push(filters.date.to);

        queryString += `AND creation_date BETWEEN $${
          queryParams.length - 1
        } AND $${queryParams.length}`;
      }
    }

    return { queryString, queryParams };
  }
}
