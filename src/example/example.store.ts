import { client } from "../db/dbConfig";

export interface ExampleData {
  id: number;
  message: string;
}

export class ExampleStore {
  static instance: ExampleStore | undefined;

  static get(): ExampleStore {
    if (ExampleStore.instance === undefined) {
      ExampleStore.instance = new ExampleStore();
    }

    return ExampleStore.instance;
  }

  async getAllExamples(): Promise<ExampleData[]> {
    const query = `
                SELECT *
                FROM logs.log
            `;

    const result = await client.query(query);

    return result.rows;
  }

  async getExampleById(id: number): Promise<ExampleData> {
    const query = {
      text: `
                SELECT *
                FROM logs.log
                WHERE id = $1
            `,
      values: [id],
    };

    const result = await client.query(query);

    return result.rows[0];
  }
}
