import express from "express";
import { IGraphService } from "../../interfaces/IGraph";

export function graphApi(graphService: IGraphService): express.Router {
    const router = express();

    router.get("/api/graph", (req, res, next) => getGraph(req, res).catch(next));

    /**
     * Router controller that obtains the graph and returns it via JSON
     */
    async function getGraph(req: express.Request, res: express.Response) {
        const graph = await graphService.getGraph();
        res.json(graph);
    }

    return router;
}