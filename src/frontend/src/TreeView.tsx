import * as d3 from "d3";
import {Node} from "./Tree";
import { useEffect, useRef } from "react";

function buildHierarchy(root: Node) {
  return d3.hierarchy(root, (d) => d.children);
}

export function TreeView({ root }: { root: Node }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;

    const g = svg.append("g").attr("transform", "translate(50,50)");

    const hierarchy = buildHierarchy(root);
    const treeLayout = d3.tree<Node>().size([height - 100, width - 100]);

    treeLayout(hierarchy);

    g.selectAll("line")
      .data(hierarchy.links())
      .enter()
      .append("line")
      .attr("x1", d => d.source.y)
      .attr("y1", d => d.source.x)
      .attr("x2", d => d.target.y)
      .attr("y2", d => d.target.x)
      .attr("stroke", "#999");

    const nodes = g.selectAll("circle")
      .data(hierarchy.descendants())
      .enter()
      .append("circle")
      .attr("cx", d => d.y)
      .attr("cy", d => d.x)
      .attr("r", 10)
      .attr("fill", "steelblue")
      .each(function (d) {
        d.data["_el"] = this;
      });

    // 🏷 LABELS
    g.selectAll("text")
      .data(hierarchy.descendants())
      .enter()
      .append("text")
      .attr("x", d => d.y + 15)
      .attr("y", d => d.x)
      .text(d => d.data.tag)
      .attr("font-size", "12px");

  }, [root]);

  return <svg ref={ref} width={900} height={700} />;
}