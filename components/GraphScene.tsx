import React, { useEffect, useRef } from "react";
// import { useSocket } from "../../hooks/UseSocket";
// import { useApi } from "../../hooks/UseApi";
import { Lnd } from "../interfaces/LndRestTypes";
import { Graph } from "./Graph";
import axios from 'axios';


export const GraphScene = () => {
    // const api = useApi();
    const graphRef = useRef<Graph>(null);

    useEffect(() => {
        const getGraph = async () => {
            const res = await axios.get('http://127.0.0.1:8001/api/graph', { headers: { credentials: "include" } });
            console.log('Res ===', res.data);
            const d: Lnd.Graph = res.data;
            if(graphRef.current) graphRef.current.createGraph(d);
        }
        getGraph();
    }, []);

    // useSocket("graph", (update: Lnd.GraphUpdate) => {
    //     // Exercise: Call `graphRef.current.updateGraph` with the update
    // });

    return (
        <div className="container-fluid h-100">
            <div className="row h-100">
                <div className="col h-100">{<Graph ref={graphRef} />}</div>
            </div>
        </div>
    );
};
