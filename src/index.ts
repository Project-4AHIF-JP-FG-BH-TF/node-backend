import express from "express";
import cors from "cors";
import "dotenv/config";
import { getExampleRouter } from "./example/example.router";
import { DatabaseService } from "./db/dbConfig";
import { getSessionRouter } from "./session/session.router";

const port = parseInt(process.env.BACKEND_PORT as string);
const server = express();

// enable json in body
server.use(express.json());

// enable cors
server.use(cors());

// add routers
server.use("/api/example/", getExampleRouter());
server.use("/api/session/", getSessionRouter());

server.listen(port, async () => {
  await DatabaseService.getInstance().getClient().connect();
  console.log("backend running on port: " + port);
});
