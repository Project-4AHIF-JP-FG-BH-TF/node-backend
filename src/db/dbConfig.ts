import { Client } from "pg";
import "dotenv/config";

export const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string),
  database: process.env.DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_KPASSWORD as string,
});
