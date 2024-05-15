import { UUID } from "node:crypto";
import { Router } from "express";
import { FilteredRequestData } from "../entry/logEntry";
import { parseFilteredRequest } from "../entry/logEntry.router";
import { ChartService } from "./chart.service";
import { RequestError } from "./chart";

export function getChartRouter(): Router {
  const router = Router();

  router.get("/classificationChart/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const request = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    const regex =
      "^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$";

    if (!sessionID.match(regex)) {
      res.status(400).json({ message: "invalid uuid" }).end();
      return;
    }

    const data = await ChartService.getInstance().getClassificationChartData(
      sessionID,
      request,
    );

    if (data === RequestError.wrongSessionToken) res.status(400).end();
    else res.status(200).json({ data }).end();
  });

  router.get("/classChart/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const request = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    const regex =
      "^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$";

    if (!sessionID.match(regex)) {
      res.status(400).json({ message: "invalid uuid" }).end();
      return;
    }

    const data = await ChartService.getInstance().getClassChartData(
      sessionID,
      request,
    );

    if (data === RequestError.wrongSessionToken) res.status(400).end();
    else res.status(200).json({ data }).end();
  });

  router.get("/classificationTimeChart/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;

    const request = parseFilteredRequest(
      req.query as unknown as FilteredRequestData,
    );

    const regex =
      "^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$";

    if (!sessionID.match(regex)) {
      res.status(400).json({ message: "invalid uuid" }).end();
      return;
    }

    const data =
      await ChartService.getInstance().getClassificationTimeChartData(
        sessionID,
        request,
      );

    if (data === RequestError.wrongParamData) res.status(400).end();
    else res.status(200).json({ data }).end();
  });

  return router;
}
