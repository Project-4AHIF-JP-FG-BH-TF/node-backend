import { UUID } from "node:crypto";
import { Router } from "express";
import { LogEntryService } from "./logEntry.service";
import {
  FilteredRequestData,
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

    if (logEntryData.filters?.date) {
      const to = Date.parse(
        logEntryData.filters?.date?.to as unknown as string,
      );
      logEntryData.filters.date.to = !isNaN(to) ? new Date(to) : undefined;

      const from = Date.parse(
        logEntryData.filters?.date?.from as unknown as string,
      );

      logEntryData.filters.date.from = !isNaN(from)
        ? new Date(from)
        : undefined;
    }

    if (typeof (logEntryData.files as unknown) === "string") {
      // @ts-ignore
      logEntryData.files = [logEntryData.files];
    }

    if (logEntryData.files === undefined) logEntryData.files = [];

    if (
      !Number.isFinite(logEntryData.from) ||
      !Number.isFinite(logEntryData.count)
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

    const ipRequestData = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    ipRequestData.filters!.ip = undefined;

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

  router.get("/:session/classifications", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const request = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    request.filters!.classification = undefined;

    const classifications: string[] | RequestError =
      await LogEntryService.getInstance().getClassifications(
        sessionID,
        request,
      );

    if (classifications === RequestError.serverError) {
      res.status(500).end();
    } else if (classifications === RequestError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json({ classifications }).end();
    }
  });
  return router;
}

export function parseFilteredRequest(
  rawFilteredRequestData: FilteredRequestData,
): FilteredRequestData {
  if (typeof (rawFilteredRequestData.files as unknown) === "string") {
    // @ts-ignore
    rawFilteredRequestData.files = [rawFilteredRequestData.files];
  }

  if (rawFilteredRequestData.files === undefined)
    rawFilteredRequestData.files = [];

  if (rawFilteredRequestData.filters !== undefined) {
    // @ts-ignore
    rawFilteredRequestData.filters = JSON.parse(rawFilteredRequestData.filters);

    if (rawFilteredRequestData.filters?.date) {
      const to = Date.parse(
        rawFilteredRequestData.filters?.date?.to as unknown as string,
      );
      rawFilteredRequestData.filters.date.to = !isNaN(to)
        ? new Date(to)
        : undefined;

      const from = Date.parse(
        rawFilteredRequestData.filters?.date?.from as unknown as string,
      );
      rawFilteredRequestData.filters.date.from = !isNaN(from)
        ? new Date(from)
        : undefined;
    }
  }

  return rawFilteredRequestData;
}
