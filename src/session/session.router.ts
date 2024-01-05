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

  return router;
}
