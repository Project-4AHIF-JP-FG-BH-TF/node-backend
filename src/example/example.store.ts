import {client} from "../db/dbConfig";

export class ExampleStore {

    static instance: ExampleStore | undefined;

    static get(): ExampleStore {
        if (ExampleStore.instance == undefined) {
            ExampleStore.instance = new ExampleStore();
        }

        return ExampleStore.instance;
    }

    private constructor() {
    }

    async getAllExamples(): Promise<ExampleData[]> {
        let query =
            `
                SELECT *
                FROM logs.log
            `

        const result = await client.query(query);

        return result.rows;
    }

    async getExampleById(id: number): Promise<ExampleData> {
        let query = {
            text: `
                SELECT *
                FROM logs.log
                WHERE id = $1
            `,
            values: [id]
        }

        const result = await client.query(query);

        return result.rows[0];
    }
}

export interface ExampleData {
    id: number,
    message: string
}