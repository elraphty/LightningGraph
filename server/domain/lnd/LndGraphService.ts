import { IGraphService } from "../../../interfaces/IGraph";
import { LndRestClient } from "./LndRestClient";
import { Lnd } from "../../../interfaces/LndRestTypes";
import { EventEmitter } from "stream";

export class LndGraphService extends EventEmitter implements IGraphService {
    constructor(readonly lnd: LndRestClient) {
        super();
    }

    public async getGraph(): Promise<Lnd.Graph> {
        return await this.lnd.getGraph();
    }

    public async subscribeGraph(): Promise<void> {
        // Exercise: subscribe to the Lnd graph updates using `subscribeGraph`
        // and emit a "update" event using `this.emit`.
    }
}
