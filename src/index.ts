import express from "express";
import { client } from "./db/dbConfig";
import cors from "cors";
import "dotenv/config";
import { getExampleRouter } from "./example/example.router";

const port = parseInt(process.env.BACKEND_PORT as string);
const server = express();

//enable json in body
server.use(express.json());

//enable cors
server.use(cors());

//add routers
server.use("/api/example/", getExampleRouter());

server.listen(port, async () => {
  await client.connect();
  console.log("backend running on port: " + port);
});
