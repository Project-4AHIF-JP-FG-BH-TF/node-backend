export type ClassificationChartData = {
  classification: string;
  count: number;
};

export enum RequestError {
  wrongSessionToken,
  wrongParamData
}
