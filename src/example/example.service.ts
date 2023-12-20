import { ExampleData, ExampleStore } from "./example.store";

export class ExampleService {
  static instance: ExampleService | undefined;

  static get(): ExampleService {
    if (ExampleService.instance === undefined) {
      ExampleService.instance = new ExampleService();
    }

    return ExampleService.instance;
  }

  async getAllExamples(): Promise<ExampleData[]> {
    return await ExampleStore.get().getAllExamples();
  }

  async getExampleById(id: number): Promise<ExampleData> {
    return await ExampleStore.get().getExampleById(id);
  }
}
