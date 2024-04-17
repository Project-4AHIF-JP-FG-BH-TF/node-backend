export type ClassificationChartData = {
  classification: string;
  count: number;
};

export enum RequestError {
  wrongSessionToken,
}

export type ClassificationTimeChartData = {
  data: {
    timestamp: Date,
    classifications: {
      classification: string, count: number
    }[]
  }[]
}

export type X = {
  timestamp: Date;
  classification: string;
  count: number;
}