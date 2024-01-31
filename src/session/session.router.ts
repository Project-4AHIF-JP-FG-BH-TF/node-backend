import { UUID } from "node:crypto";
import { Router } from "express";
import { SessionService } from "./session.service";

export function getSessionRouter(): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    const uuid = await SessionService.getInstance().createNew();

    if (uuid) {
      res.status(200).json({ uuid }).end();
    } else {
      res.status(500).end();
    }
  });

  router.post("/:id", async (req, res) => {
    const uuid = await SessionService.getInstance().refresh(
      req.params.id as UUID,
    );

    if (uuid) {
      res.status(200).json({ uuid }).end();
    } else {
      res.status(404).end();
    }
  });

  return router;
}
