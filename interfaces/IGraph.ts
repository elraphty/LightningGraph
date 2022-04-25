import { Lnd } from "./LndRestTypes";

export interface IGraphService {
    getGraph(): Promise<Lnd.Graph>;
    subscribeGraph(): Promise<void>;
    on(event: "update", handler: (update: Lnd.GraphUpdate) => void): void;
}