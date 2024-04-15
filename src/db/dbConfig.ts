import { Pool, types } from "pg";
import "dotenv/config";

export class DatabaseService {
  private static instance: DatabaseService | undefined;
  private readonly client: Pool;

  private constructor() {
    // fix weird time parsing behavior happening because of timezones
    types.setTypeParser(1114, function (stringValue) {
      return new Date(Date.parse(stringValue + "+0000"));
    });

    this.client = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      database: process.env.DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD as string,
    });
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  getClient(): Pool {
    return this.client;
  }
}
