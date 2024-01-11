import { UUID } from "node:crypto";
import { Router } from "express";
import { LogEntryService } from "./logEntry.service";
import {
  IpRequestData,
  LogEntry,
  LogEntryRequestData,
  RequestError,
} from "./logEntry";

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

    const logs: LogEntry[] | RequestError =
      await LogEntryService.getInstance().get(sessionID, logEntryData);

    if (logs === RequestError.serverError) {
      res.status(500).end();
    } else if (logs === RequestError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json({ logs }).end();
    }
  });

  router.get("/:session/ips", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const ipRequestData: IpRequestData = req.query as unknown as IpRequestData;

    // @ts-ignore
    ipRequestData.filters = JSON.parse(ipRequestData.filters);

    if (ipRequestData.files === undefined || ipRequestData.files.length === 0) {
      res.status(400).end();
      return;
    }

    const ips: string[] | RequestError =
      await LogEntryService.getInstance().getIps(sessionID, ipRequestData);

    if (ips === RequestError.serverError) {
      res.status(500).end();
    } else if (ips === RequestError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json({ ips }).end();
    }
  });

  return router;
}
