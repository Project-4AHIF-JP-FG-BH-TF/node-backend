import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { ClassificationChartData, RequestError } from "./chart";
import { LogEntryStore } from "../entry/logEntry.store";
import { Filters} from "../entry/logEntry";

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
    filters: Filters,
  ) {
    let queryParams: any[] = [sessionID];
    let queryString = `
                SELECT classification, COUNT(*) AS count
                FROM loggaroo.log_entry
                WHERE session_id = $1
            `;

    if (filters) {
      const filteredQueryData = LogEntryStore.getInstance().applyFilters(
        filters,
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
