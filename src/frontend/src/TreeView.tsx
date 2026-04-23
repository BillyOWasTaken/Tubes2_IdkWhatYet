import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { Node } from "../../backend/src/core/entities/Tree";

export function TreeView({ root }: { root: Node }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const g = svg.append("g").attr("transform", "translate(50,50)");

    const hierarchy = d3.hierarchy(root, d => d.children);
    const layout = d3.tree<Node>().size([500, 700]);

    layout(hierarchy);

    g.selectAll("line")
      .data(hierarchy.links())
      .enter()
      .append("line")
      .attr("x1", d => d.source.y)
      .attr("y1", d => d.source.x)
      .attr("x2", d => d.target.y)
      .attr("y2", d => d.target.x)
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .each(function (d) {
        d.target.data.edgeEl = this as SVGLineElement;
      });

    g.selectAll("circle")
      .data(hierarchy.descendants())
      .enter()
      .append("circle")
      .attr("cx", d => d.y)
      .attr("cy", d => d.x)
      .attr("r", 10)
      .attr("fill", "steelblue")
      .each(function (d) {
        d.data.el = this as SVGCircleElement;
      });

    g.selectAll("text")
      .data(hierarchy.descendants())
      .enter()
      .append("text")
      .attr("x", d => d.y + 15)
      .attr("y", d => d.x)
      .text(d => d.data.tag)
      .attr("fill", "white")
      .attr("font-size", 12);

  }, [root]);

  return <svg ref={ref} width={900} height={600} style={{ background: "#111" }} />;
}

export function highlight(node: any) {
  if (!node.el) return;

  d3.select(node.el)
    .interrupt()
    .transition()
    .duration(150)
    .attr("fill", "orange");
}

export function markMatch(node: any) {
  if (!node.el) return;

  d3.select(node.el)
    .interrupt()
    .transition()
    .duration(150)
    .attr("fill", "red");
}

export function highlightEdge(node: any) {
  if (!node.edgeEl) return;

  d3.select(node.edgeEl)
    .interrupt()
    .transition()
    .duration(150)
    .attr("stroke", "orange")
    .attr("stroke-width", 3);
}