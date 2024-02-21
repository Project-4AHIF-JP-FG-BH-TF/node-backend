import { UUID } from "node:crypto";
import { Router } from "express";
import { FilesService } from "./files.service";
import { RequestError } from "./files";

export function getFilesRouter(): Router {
  const router = Router();

  router.get("/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const files: String[] | RequestError =
      await FilesService.getInstance().get(sessionID);

    if (files === RequestError.serverError) {
      res.status(500).end();
    } else if (files === RequestError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json({ files }).end();
    }
  });

  return router;
}
