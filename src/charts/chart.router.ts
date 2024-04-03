import { UUID } from "node:crypto";
import { Router } from "express";
import { ChartService } from "./chart.service";
import { RequestError } from "./chart";
import { Filters } from "../entry/logEntry";

export function getChartRouter(): Router {
  const router = Router();

  router.get("/classificationChart/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;
    let filters = req.query.filters;

    const regex =
      "^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$";

    if (!sessionID.match(regex)) {
      res.status(500).end();
      return;
    }

    let parsedFilters;
    if (filters !== undefined) {
      // @ts-ignore
      parsedFilters = JSON.parse(filters) as Filters;

      if (parsedFilters?.date) {
        const to = Date.parse(parsedFilters?.date?.to as unknown as string);
        parsedFilters.date.to = !isNaN(to) ? new Date(to) : undefined;

        const from = Date.parse(parsedFilters?.date?.from as unknown as string);
        parsedFilters.date.from = !isNaN(from) ? new Date(from) : undefined;
      }
    }

    const data = await ChartService.getInstance().getClassificationChartData(
      sessionID,
      filters === undefined ? ({} as Filters) : parsedFilters!,
    );

    if (data === RequestError.wrongSessionToken) res.status(400).end();
    else res.status(200).json({ data }).end();
  });

  return router;
}
