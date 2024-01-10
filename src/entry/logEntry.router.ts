import { UUID } from "node:crypto";
import { Router } from "express";
import { LogEntryService } from "./logEntry.service";
import {
  LogEntry,
  LogEntryRequestData,
  LogEntryRequestError,
} from "./logEntry";
import {parse} from "dotenv";

export function getLogEntryRouter(): Router {
  const router = Router();

  router.get("/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const logEntryData: LogEntryRequestData =
      req.query as unknown as LogEntryRequestData;

    // @ts-ignore
    logEntryData.filters = JSON.parse(logEntryData.filters);
    logEntryData.from = parseInt(String(logEntryData.from));
    logEntryData.count = parseInt(String(logEntryData.count));

    if (
      !Number.isFinite(logEntryData.from) ||
      !Number.isFinite(logEntryData.count) ||
      logEntryData.files === undefined ||
      logEntryData.files.length === 0
    ) {
      res.status(400).end();
      return;
    }

    const logs: LogEntry[] | LogEntryRequestError =
      await LogEntryService.getInstance().get(sessionID, logEntryData);

    if (logs === LogEntryRequestError.serverError) {
      res.status(500).end();
    } else if (logs === LogEntryRequestError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json({ logs }).end();
    }
  });

  return router;
}
