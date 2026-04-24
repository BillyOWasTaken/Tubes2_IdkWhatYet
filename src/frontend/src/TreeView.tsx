import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { Node } from "../../backend/src/core/entities/Tree";

export function TreeView({ root }: { root: Node }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const hierarchy = d3.hierarchy(root, d => d.children);
    
    const layout = d3.tree<Node>()
      .size([600, 900])  
      .nodeSize([120, 80]) 
      .separation((a, b) => {
        // Increase separation between nodes
        if (a.parent === b.parent) {
          return 1.5; // Siblings separation
        }
        return 1.5; // Non-siblings separation
      });
    
    layout(hierarchy);

    let minX = 99999, minY = 99999, maxX = -99999, maxY = -99999;
    hierarchy.descendants().forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    });

    const padding = 100;
    const width = maxX - minX + 2 * padding;
    const height = maxY - minY + 2 * padding;

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `${minX - padding} ${minY - padding} ${width} ${height}`);

    const g = svg.append("g");

    g.selectAll("line")
      .data(hierarchy.links())
      .enter()
      .append("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .each(function (d) {
        d.target.data.edgeEl = this as SVGLineElement;
      });

    g.selectAll("circle")
      .data(hierarchy.descendants())
      .enter()
      .append("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 12) 
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .each(function (d) {
        d.data.el = this as SVGCircleElement;
      });

    // truncate long text
    const truncateText = (text: string, maxLength: number = 25) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + "...";
    };

    const textElements = g.selectAll("text")
      .data(hierarchy.descendants())
      .enter()
      .append("text")
      .attr("x", d => d.x)
      .attr("y", d => d.y - 18)
      .text(d => {
        const name = d.data.tag;
        return truncateText(name);
      })
      .attr("fill", "black")
      .attr("font-size", 11)
      .attr("font-family", "Arial, sans-serif")
      .attr("text-anchor", "middle")

    textElements.each(function(d) {
      const bbox = this.getBBox();
      
      g.insert("rect", "circle")
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 2)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 4)
        .attr("fill", "white")
        .attr("fill-opacity", 0.9)
        .attr("rx", 4)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.5)
        .attr("data-for-node", d.data.id);
    });

  }, [root]);

  return (
    <svg 
      ref={ref} 
      style={{ 
        background: "transparent",
        display: "block",
        cursor: "grab",
        minWidth: "100%"
      }} 
    />
  );
}

export function highlight(node: any) {
  if (!node.el) return;

  d3.select(node.el)
    .interrupt()
    .transition()
    .duration(150)
    .attr("fill", "orange")
    .attr("stroke", "#ff8800")
    .attr("stroke-width", 3);
}

export function markMatch(node: any) {
  if (!node.el) return;

  d3.select(node.el)
    .interrupt()
    .transition()
    .duration(150)
    .attr("fill", "red")
    .attr("stroke", "#cc0000")
    .attr("stroke-width", 3);
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