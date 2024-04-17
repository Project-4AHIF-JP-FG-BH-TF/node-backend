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

    let obj: { [key: string]: ClassificationChartData[] } = {};

    for (let i = 0; i < dates.length; i++) {
      //date null
      filters.filters!.date!.from = dates[i];
      filters.filters!.date!.to = dates[i + 1];

      let data = await this.getClassificationChartData(sessionID, filters);

      if (data === RequestError.wrongSessionToken) return data;
      else obj[dates[i].toISOString()] = data;
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

    let totalDuration = rows.max.getTime() - rows.min.getTime();
    let intervalLength = totalDuration / 99;
    let equalSpacedData = [rows.min];

    for (let i = 1; i < 99; i++) {
      let newTime = new Date(
        equalSpacedData[equalSpacedData.length - 1].getTime() + intervalLength,
      );
      equalSpacedData.push(newTime);
    }

    return equalSpacedData;
  }
}
