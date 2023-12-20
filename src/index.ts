import * as express from "express";

const port = 3000;
const app = express();

app.get("/", (_req, res) => {
  res.send("moin");
});

app.listen(port, () => {
  console.log("backend running on port: " + port);
});
