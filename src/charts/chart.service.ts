import { UUID } from "node:crypto";
import { FilteredRequestData } from "../entry/logEntry";
import { ChartStore } from "./chart.store";

export class ChartService {
  static instance: ChartService | undefined;

  static getInstance(): ChartService {
    if (ChartService.instance === undefined) {
      ChartService.instance = new ChartService();
    }

    return ChartService.instance;
  }

  async getClassificationChartData(
    sessionID: UUID,
    filters: FilteredRequestData,
  ) {
    return await ChartStore.getInstance().getClassificationChartData(
      sessionID,
      filters,
    );
  }
}
