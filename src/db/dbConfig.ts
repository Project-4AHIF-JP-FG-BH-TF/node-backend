import { Client } from 'pg'
import 'dotenv/config'

export const client = new Client({
    host: process.env.HOST,
    port: parseInt(process.env.PORT as string),
    database: process.env.DATABASE,
    user: process.env.USER,
    password: (process.env.PASSWORD as string)
});

