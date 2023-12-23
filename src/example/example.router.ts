import { Router } from "express";
import { ExampleService } from "./example.service";

export function getExampleRouter(): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    const examples = await ExampleService.getInstance().getAllExamples();

    res.status(200).json(examples).end();
  });

  router.get("/:id", async (req, res) => {
    const id = Number.parseInt(req.params.id);

    const example = await ExampleService.getInstance().getExampleById(id);

    res.status(200).json(example).end();
  });

  return router;
}
