import { ExampleStore } from "./example.store";
import { ExampleData } from "./types/example";

export class ExampleService {
  static instance: ExampleService | undefined;

  static getInstance(): ExampleService {
    if (ExampleService.instance === undefined) {
      ExampleService.instance = new ExampleService();
    }

    return ExampleService.instance;
  }

  async getAllExamples(): Promise<ExampleData[]> {
    return await ExampleStore.getInstance().getAllExamples();
  }

  async getExampleById(id: number): Promise<ExampleData> {
    return await ExampleStore.getInstance().getExampleById(id);
  }
}
