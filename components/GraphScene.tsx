import React, { useEffect, useRef } from "react";
import { useSocket } from "../hooks/useSocket";
import { Lnd } from "../interfaces/LndRestTypes";
import { Graph } from "./Graph";
import axios from 'axios';


export const GraphScene = () => {
    const graphRef = useRef<Graph>(null);

    useEffect(() => {
        const getGraph = async () => {
            const res = await axios.get('http://127.0.0.1:8001/api/graph', { headers: { credentials: "include" } });
            const d: Lnd.Graph = res.data;

            if(graphRef.current) graphRef.current.createGraph(d);
        }
        getGraph();
    }, []);

    useSocket("graph", (update: Lnd.GraphUpdate) => {
        if(graphRef.current) graphRef.current.updateGraph(update);
    });

    return (
        <div className="container-fluid h-100">
            <div className="row h-100">
                <div className="col h-100">{<Graph ref={graphRef} />}</div>
            </div>
        </div>
    );
};
