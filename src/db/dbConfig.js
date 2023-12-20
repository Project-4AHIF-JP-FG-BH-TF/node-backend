"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
var pg_1 = require("pg");
require("dotenv/config");
exports.client = new pg_1.Client({
    host: process.env.HOST,
    port: parseInt(process.env.PORT),
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
});
