import {ClassificationChartData} from "./chart";

export class ChartStore {
    static instance: ChartStore | undefined;

    static getInstance(): ChartStore {
        if (ChartStore.instance === undefined) {
            ChartStore.instance = new ChartStore();
        }

        return ChartStore.instance;
    }

    async getClassificationChartData(): Promise<ClassificationChartData> {
        return {} as ClassificationChartData;
    }
}