import { Router } from "express";
import { UUID } from "node:crypto";
import { LogEntryService } from "./logEntry.service";
import { LogEntry, LogEntryData, LogEntryError } from "./logEntry";

export function getLogEntryRouter(): Router {
  const router = Router();

  router.get("/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;
    const logEntryData: LogEntryData = req.body;

    const log: LogEntry[] | LogEntryError =
      await LogEntryService.getInstance().get(sessionID, logEntryData);

    if (log == LogEntryError.serverError) {
      res.status(500).end();
    } else if (log === LogEntryError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json({ log }).end();
    }
  });

  return router;
}
