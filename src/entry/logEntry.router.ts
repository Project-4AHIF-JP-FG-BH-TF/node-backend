import {Router} from "express";

export function getLogEntryRouter(): Router {
    const router = Router();

    router.get("/", async (_req, res) => {

    });

    return router;
}