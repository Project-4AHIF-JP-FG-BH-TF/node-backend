import express from "express";
import winston from "winston";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import { getExampleRouter } from "./example/example.router";
import { getSessionRouter } from "./session/session.router";
import { getLogEntryRouter } from "./entry/logEntry.router";
import { DatabaseService } from "./db/dbConfig";
import { getFilesRouter } from "./files/files.router";

const port = parseInt(process.env.BACKEND_PORT as string);
const server = express();

const { combine, timestamp, prettyPrint, json } = winston.format;
const logger = winston.createLogger({
  level: "http",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    json(),
    prettyPrint(),
  ),
  transports: [new winston.transports.Console()],
});

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message) => logger.http(message.trim()),
    },
  },
);

// enable logging
server.use(morganMiddleware);

// enable json in body
server.use(express.json());

// enable cors
server.use(cors());

// add routers
server.use("/api/example/", getExampleRouter());
server.use("/api/session/", getSessionRouter());
server.use("/api/log", getLogEntryRouter());
server.use("/api/files", getFilesRouter());

server.listen(port, async () => {
  await DatabaseService.getInstance().getClient().connect();
  console.log("backend running on port: " + port);
});
