import {ChartStore} from "./chart.store";
import {ClassificationChartData} from "./chart";

export class ChartService {
    static instance: ChartService | undefined;

    static getInstance(): ChartService {
        if (ChartService.instance === undefined) {
            ChartService.instance = new ChartService();
        }

        return ChartService.instance;
    }

    async getClassificationChartData(): Promise<ClassificationChartData> {
        return await ChartStore.getInstance().getClassificationChartData();
    }
}