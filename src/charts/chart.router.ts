import { UUID } from "node:crypto";
import { Router } from "express";
import { ChartService } from "./chart.service";
import { RequestError } from "./chart";

export function getChartRouter(): Router {
  const router = Router();

  router.get("/classificationChart/:session", async (req, res) => {
    const sessionID: UUID = req.params.session as UUID;
    const regex =
      "^[0-9a-fA-F]{8}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{4}\\b-[0-9a-fA-F]{12}$";

    if (!sessionID.match(regex)) {
      res.status(500).end();
      return;
    }

    const data =
      await ChartService.getInstance().getClassificationChartData(sessionID);

    if (data === RequestError.wrongSessionToken) res.status(400).end();
    else res.status(200).json({ data }).end();
  });

  return router;
}
