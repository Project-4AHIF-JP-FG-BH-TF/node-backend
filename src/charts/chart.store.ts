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
}
