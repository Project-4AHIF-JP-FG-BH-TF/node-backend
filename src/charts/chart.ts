import { Classification } from "../entry/logEntry";

export type ClassificationChartData = {
  classification: Classification;
  count: number;
};

export enum RequestError {
  wrongSessionToken,
}
