import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { LogEntryStore } from "../entry/logEntry.store";
import { FilteredRequestData } from "../entry/logEntry";
import { ClassificationChartData, RequestError } from "./chart";

export class ChartStore {
  static instance: ChartStore | undefined;

  static getInstance(): ChartStore {
    if (ChartStore.instance === undefined) {
      ChartStore.instance = new ChartStore();
    }

    return ChartStore.instance;
  }

  async getClassificationChartData(
    sessionID: UUID,
    filters: FilteredRequestData,
  ) {
    let queryParams: any[] = [sessionID, filters.files];
    let queryString = `
                SELECT classification, COUNT(*) AS count
                FROM loggaroo.log_entry
                WHERE session_id = $1
                    AND file_name = ANY ($2)
            `;

    if (filters.filters) {
      const filteredQueryData = LogEntryStore.getInstance().applyFilters(
        filters.filters,
        queryString,
        queryParams,
      );

      queryParams = filteredQueryData.queryParams;
      queryString = filteredQueryData.queryString;
    }

    queryString += "GROUP BY classification";

    const query = {
      text: queryString,
      values: queryParams,
    };

    const result = await DatabaseService.getInstance()
      .getClient()
      .query<ClassificationChartData>(query);

    return result.rows.length === 0
      ? RequestError.wrongSessionToken
      : result.rows;
  }

  async getClassChartData(sessionID: UUID, filters: FilteredRequestData) {
    let queryParams: any[] = [sessionID, filters.files];
    let queryString = `
                SELECT java_class, COUNT(*) AS count
                FROM loggaroo.log_entry
                WHERE session_id = $1
                    AND file_name = ANY ($2)
            `;

    if (filters.filters) {
      const filteredQueryData = LogEntryStore.getInstance().applyFilters(
        filters.filters,
        queryString,
        queryParams,
      );

      queryParams = filteredQueryData.queryParams;
      queryString = filteredQueryData.queryString;
    }

    queryString += "GROUP BY java_class";

    const query = {
      text: queryString,
      values: queryParams,
    };

    const result = await DatabaseService.getInstance()
      .getClient()
      .query<ClassificationChartData>(query);

    return result.rows.length === 0
      ? RequestError.wrongSessionToken
      : result.rows;
  }

  async getClassificationTimeChartData(
    sessionID: UUID,
    filters: FilteredRequestData,
  ) {
    const dates = await this.getTimeStamps(sessionID, filters);

    if (filters.filters === undefined) {
      filters.filters = {
        classification: undefined,
        date: undefined,
        ip: undefined,
        regex: undefined,
        text: undefined,
      };
    }

    const obj: { [key: string]: { [key: string]: number } } = {};

    const promises = [];

    for (let i = 0; i < dates.length; i++) {
      filters.filters!.date = { from: dates[i], to: dates[i + 1] };

      promises.push(this.getClassificationChartData(sessionID, filters));
    }

    for (let i = 0; i < promises.length; i++) {
      const data = await promises[i];

      if (data === RequestError.wrongSessionToken) {
        break;
      }

      const newData: { [key: string]: number } = {};

      for (const dataKey of data) {
        newData[dataKey.classification] = dataKey.count;
      }

      obj[dates[i].toISOString()] = newData;
    }

    return obj;
  }

  async getTimeStamps(sessionID: UUID, filters: FilteredRequestData) {
    let queryParams: any[] = [sessionID, filters.files];
    let queryString = `
                SELECT min(creation_date) as min, max(creation_date) as max
                FROM loggaroo.log_entry
                WHERE session_id = $1
                    AND file_name = ANY ($2)
            `;

    if (filters.filters) {
      const filteredQueryData = LogEntryStore.getInstance().applyFilters(
        filters.filters,
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
      .query<{ min: Date; max: Date }>(query);

    const rows = result.rows[0];

    const totalDuration = rows.max.getTime() - rows.min.getTime();
    const intervalLength = totalDuration / 99;
    const equalSpacedData = [rows.min];

    for (let i = 1; i < 99; i++) {
      const newTime = new Date(
        equalSpacedData[equalSpacedData.length - 1].getTime() + intervalLength,
      );
      equalSpacedData.push(newTime);
    }

    return equalSpacedData;
  }
}
