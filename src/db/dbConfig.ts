import { Client } from "pg";
import "dotenv/config";

export class DatabaseService {
  private static instance: DatabaseService | undefined;
  private readonly client: Client;

  private constructor() {
    this.client = new Client({
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

  getClient(): Client {
    return this.client;
  }
}
