import { Router } from "express";
import { ChartService } from "./chart.service";

export function getChartRouter(): Router {
  const router = Router();

  router.get("/classificationChart", async (req, res) => {
    const data = await ChartService.getInstance().getClassificationChartData();


  });

  return router;
}
