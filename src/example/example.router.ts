import {Router} from "express";
import {ExampleService} from "./example.service";

export function getExampleRouter(): Router {
    let router = Router();

    router.get("/", async (req, res) => {
        let examples = await ExampleService.get().getAllExamples();

        res.status(200).json(examples).end();
    })

    return router;
}