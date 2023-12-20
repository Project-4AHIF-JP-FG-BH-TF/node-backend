import express from "express";
import {client} from "./config";

const port = 3000;
const app = express();

app.get("/", (req, res) => {
    res.send("moin");
})

app.get("/person/", async (req, res) => {
    let query = `
        SELECT *
        FROM person
    `

    const result = await client.query(query);
    await client.end();

    res.send(result.rows)
    res.end();
})

app.listen(port, async () => {
    console.log("backend running on port: " + port);

    await client.connect();
})