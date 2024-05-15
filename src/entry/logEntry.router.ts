import { UUID } from "node:crypto";
import { Router } from "express";
import { LogEntryService } from "./logEntry.service";
import { create } from "tar";
import {
  Counts,
  FilteredRequestData,
  LogEntry,
  LogEntryRequestData,
  RequestError,
} from "./logEntry";
import path from "node:path";
import * as fs from "node:fs";
import { Compressor } from "xz";
import { tmpdir } from "node:os";

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

  router.get("/:session/count", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const request = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    const counts: Counts | RequestError =
      await LogEntryService.getInstance().getCount(sessionID, request);

    if (counts === RequestError.serverError) {
      res.status(500).end();
    } else if (counts === RequestError.wrongBodyData) {
      res.status(400).end();
    } else {
      res.status(200).json(counts).end();
    }
  });

  router.get("/:session/export.tar.xz", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const request = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    const exportedFiles: string | RequestError =
      await LogEntryService.getInstance().getExported(sessionID, request);

    if (exportedFiles === RequestError.serverError) {
      res.status(500).end();
    } else if (exportedFiles === RequestError.wrongBodyData) {
      res.status(400).end();
    }

    let date = new Date();
    let fileName = `export-${date.toString()}.txt"`;

    fs.writeFileSync(path.join(tmpdir(), fileName), exportedFiles as string);
    fs.writeFileSync(
      path.join(tmpdir(), "filters.json"),
      JSON.stringify(request),
    );

    await create(
      {
        file: path.join(tmpdir(), "export.tar"),
        // gzip: false,
      },
      [path.join(tmpdir(), fileName), path.join(tmpdir(), "filters.json")],
    );

    const readStream = fs.createReadStream(path.join(tmpdir(), "export.tar"));
    const writeStream = fs.createWriteStream(
      path.join(tmpdir(), "export.tar.xz"),
    );

    let compression = new Compressor({ preset: 9 });

    readStream
      .pipe(compression) // compress with xz
      .pipe(writeStream) // write to file
      .on("finish", () => {
        res.status(200).sendFile(path.join(tmpdir(), "export.tar.xz"), () => {
          fs.unlinkSync(path.join(tmpdir(), fileName));
          fs.unlinkSync(path.join(tmpdir(), "filters.json"));
          fs.unlinkSync(path.join(tmpdir(), "export.tar"));
          fs.unlinkSync(path.join(tmpdir(), "export.tar.xz"));
        });
      });
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
