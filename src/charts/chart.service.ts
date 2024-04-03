import { UUID } from "node:crypto";
import { ChartStore } from "./chart.store";

export class ChartService {
  static instance: ChartService | undefined;

  static getInstance(): ChartService {
    if (ChartService.instance === undefined) {
      ChartService.instance = new ChartService();
    }

    return ChartService.instance;
  }

  async getClassificationChartData(sessionID: UUID) {
    return await ChartStore.getInstance().getClassificationChartData(sessionID);
  }
}
