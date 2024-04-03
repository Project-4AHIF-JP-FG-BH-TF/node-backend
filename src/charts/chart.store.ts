import { UUID } from "node:crypto";
import { DatabaseService } from "../db/dbConfig";
import { ClassificationChartData, RequestError } from "./chart";

export class ChartStore {
  static instance: ChartStore | undefined;

  static getInstance(): ChartStore {
    if (ChartStore.instance === undefined) {
      ChartStore.instance = new ChartStore();
    }

    return ChartStore.instance;
  }

  async getClassificationChartData(sessionID: UUID) {
    const queryParams: any[] = [sessionID];

    const queryString = `
                SELECT classification, COUNT(*) AS count
                FROM loggaroo.log_entry
                WHERE session_id = $1
                GROUP BY classification
            `;

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
