import React, { LegacyRef, MutableRefObject, RefObject } from "react";
import * as d3 from "d3";
import { Lnd } from "../interfaces/LndRestTypes";

interface D3Node {
    id: string;
    color: string;
    title: string;
}

interface D3Link {
    id: string;
    source: string;
    target: string;
}

export class Graph extends React.Component {
    protected svgRef: SVGElement | any;
    protected svg: any;
    protected simulation: any;
    protected nodes: D3Node[] | undefined;
    protected links: D3Link[] | undefined;
    protected nodeElements: any;
    protected linkElements: any;

    shouldComponentUpdate() {
        return false;
    }

    render() {
        return <svg ref={elem => (this.svgRef = elem)} />;
    }

    createGraph(graph: Lnd.Graph) {
        // map the graph nodes into simple objects that d3 will use
        // during rendering
        const nodes: D3Node[] = graph.nodes.map(n => ({
            id: n.pub_key,
            color: n.color,
            title: n.alias,
        }));

        const links: D3Link[] = graph.edges.map(e => ({
            id: e.channel_id,
            source: e.node1_pub,
            target: e.node2_pub,
        }));

        this.nodes = nodes;

        // map the graph channels into simple objects that d3 will use
        // during rendering
        this.links = links;

        // construct the initial svg container
        const width = this.svgRef.parentElement ? this.svgRef.parentElement.clientWidth : 0;
        const height = this.svgRef.parentElement ? this.svgRef.parentElement.clientHeight : 0;
        this.svg = d3
            .select(this.svgRef)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "background-color: #f0f0f0");

        // construct container for links
        this.svg
            .append("g")
            .attr("class", "links")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round");

        // construct container for nodes
        this.svg
            .append("g")
            .attr("class", "nodes")
            .attr("stroke", "#999")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.5);

        // construct the initial simulation but start it at the end since
        // the draw method will take care of adding elements and starting
        // the simulation
        this.simulation = d3
            .forceSimulation()
            .force("charge", d3.forceManyBody().strength(-200).distanceMax(1000))
            .force("center", d3.forceCenter())
            .force("x", d3.forceX())
            .force("y", d3.forceY())
            .on("tick", () => {
                this.linkElements
                    .attr("x1", (d: { source: { x: any; }; }) => d.source.x)
                    .attr("y1", (d: { source: { y: any; }; }) => d.source.y)
                    .attr("x2", (d: { target: { x: any; }; }) => d.target.x)
                    .attr("y2", (d: { target: { y: any; }; }) => d.target.y);

                this.nodeElements.attr("transform", (d: { x: string; y: string; }) => "translate(" + d.x + "," + d.y + ")");
            })
            .alpha(0);

        this.draw();
    }

    updateGraph(update: Lnd.GraphUpdate) {
        // Updates existing nodes or adds new ones if they don't already
        // exist in the graph
        for (const nodeUpdate of update.result.node_updates) {
            if (this.nodes?.length) {
                const node = this.nodes.find(p => p.id === nodeUpdate.identity_key);
                if (node) {
                    node.title = nodeUpdate.alias;
                    node.color = nodeUpdate.color;
                } else {
                    this.nodes.push({
                        id: nodeUpdate.identity_key,
                        color: nodeUpdate.color,
                        title: nodeUpdate.alias,
                    });
                }
            }
        }

        // Adds new channels to the graph. Note that for the purposes of
        // our visualization we only care that a link exists. We will end
        // up receiving two updates, one from each node and we just add
        // the first one.
        for (const channelUpdate of update.result.channel_updates) {
            if (this.links?.length) {
                const channel = this.links.find(p => p.id === channelUpdate?.chan_id);
                if (!channel) {
                    this.links.push({
                        source: channelUpdate.advertising_node,
                        target: channelUpdate.connecting_node,
                        id: channelUpdate.chan_id,
                    });
                }
            }
        }

        // Exercise: Remove closed channels from `this.links`.

        this.draw();
    }

    draw() {
        // constructs the node elements
        this.nodeElements = this.svg
            .select(".nodes")
            .selectAll("g")
            .data(this.nodes)
            .join(
                (enter: { append: (arg0: string) => { (): any; new(): any; attr: { (arg0: string, arg1: string): { (): any; new(): any; attr: { (arg0: string, arg1: (val: any) => any): any; new(): any; }; }; new(): any; }; }; }) => {
                    const result = enter
                        .append("g")
                        .attr("class", "node")
                        .attr("fill", val => val.color);
                    result
                        .append("circle")
                        .attr("r", 0)
                        .call((enter: { transition: () => { (): any; new(): any; attr: { (arg0: string, arg1: number): any; new(): any; }; }; }) => enter.transition().attr("r", 10));
                    result
                        .append("text")
                        .text((d: { title: any; }) => d.title)
                        .attr("stroke", "#000000")
                        .attr("stroke-width", 1)
                        .attr("text-anchor", "middle")
                        .attr("x", 0)
                        .attr("y", 35);
                    return result;
                },
                (update: any) => update,
                (exit: { remove: () => any; }) => exit.remove(),
            );

        // constructs the link elements
        this.linkElements = this.svg
            .select(".links")
            .selectAll("line")
            .data(this.links)
            .join("line");

        // restarts the simulation with the latest data
        this.simulation
            .nodes(this.nodes)
            .force(
                "link",
                d3
                    .forceLink(this.links)
                    .id((node: any) => node.id)
                    .distance(100),
            )
            .alpha(1)
            .restart();
    }
}