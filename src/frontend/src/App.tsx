import { useState } from "react";
import { Traversal } from "../../backend/src/data/Traversal";
import { Node } from "../../backend/src/core/entities/Tree";
import { TreeView, highlight, markMatch, highlightEdge } from "./TreeView";
import * as d3 from "d3";

type VisualNode = {
  name: string;
  attributes?: Record<string, string>;
  children?: VisualNode[];
};

function toNode(v: VisualNode, parent: Node | null = null): Node {
  const node = new Node(v.name, v.attributes || {}, parent);

  if (v.children) {
    for (const child of v.children) {
      node.addChild(toNode(child, node));
    }
  }

  return node;
}


export default function App() {
  const [html, setHtml] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [inputMode, setInputMode] = useState<"html" | "url">("html"); 
  const [rootNode, setRootNode] = useState<Node | null>(null);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"dfs" | "bfs" | "dls">("dfs");
  const [log, setLog] = useState<string[]>([]);
  const [visitedCount, setVisitedCount] = useState(0);
  const [time, setTime] = useState(0);
  const [matchMode, setMatchMode] = useState<"all" | "topn">("all");
  const [topN, setTopN] = useState(5);
  const [maxDepth, setMaxDepth] = useState<number | null>(null);

  const traversal = new Traversal();

async function handleParse() {

    const endpoint =
      inputMode === "html"
        ? "http://localhost:3000/api/parse"
        : "http://localhost:3000/api/url";

    const body =
      inputMode === "html"
        ? { html }
        : { url: urlInput };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();


    if (data.error) throw new Error(data.error);

    const root = toNode(data.tree);
    setRootNode(root);
    setMaxDepth(data.maxDepth);
    console.log("Parsed tree with max depth:", data.maxDepth);

}

  const resetColors = (node: Node) => {
    if (node.el) {
      d3.select(node.el).attr("fill", "steelblue");
    }
    if (node.edgeEl) {
      d3.select(node.edgeEl)
        .attr("stroke", "#555")
        .attr("stroke-width", 1.5);
    }
    node.children.forEach(resetColors);
  };

  const handleRun = async () => {
    if (!rootNode) return;

    resetColors(rootNode);

    let count = 0;
    const logs: string[] = [];
    const start = performance.now();
    let matchCount = 0;

    const onVisit = (node: Node) => {
      count++;
      logs.push(`Visited: <${node.tag}>`);
      highlight(node);
      highlightEdge(node);
    };

    const onMatch = (node: Node) => {
      logs.push(`Match: <${node.tag}>`);
      if (matchMode === "all" || (matchMode === "topn" && matchCount < topN)) {
        markMatch(node);
        matchCount++;
      }
    };

    if (mode === "dfs") {
      await traversal.dfsAnimated(rootNode, query, 150, onVisit, onMatch);
    } else if (mode === "bfs") {
      await traversal.bfsAnimated(rootNode, query, 150, onVisit, onMatch);
    } else {
      await traversal.dlsAnimated(rootNode, query, topN, 0, 0, 150, onVisit, onMatch);
    }

    const end = performance.now();

    setVisitedCount(count);
    setLog(logs);
    setTime(end - start);
  };

  return (
    <div style={{ padding: 20, background: "#ffffff", color: "black" }}>
      <h1>DOM Traversal Visualizer</h1>

        <div style={{ marginTop: 10 }}>
        <label>
          <input
            type="radio"
            value="html"
            checked={inputMode === "html"}
            onChange={() => setInputMode("html")}
          />
          HTML
        </label>

        <label style={{ marginLeft: 10 }}>
          <input
            type="radio"
            value="url"
            checked={inputMode === "url"}
            onChange={() => setInputMode("url")}
          />
          URL
        </label>
      </div>
        {inputMode === "html" ? (
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={6}
            cols={80}
            placeholder="Paste HTML here..."
          />
        ) : (
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter URL..."
            style={{ width: "400px" }}
          />
        )}
        <button disabled={inputMode === "html" ? !html.trim() : !urlInput.trim()} onClick={handleParse} style={{ marginLeft: 10 }}>
            Parse
          </button>


      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center"}}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="CSS selector"
        />

        <select value={mode} onChange={(e) => setMode(e.target.value as any)}>
          <option value="dfs">DFS</option>
          <option value="bfs">BFS</option>
          <option value="dls">DLS</option>
        </select>

        <span>
          <label>
            <input
              type="radio"
              value="all"
              checked={matchMode === "all"}
              onChange={() => setMatchMode("all")}
            />
            All matches
          </label>
          <label style={{ marginLeft: 8 }}>
            <input
              type="radio"
              value="topn"
              checked={matchMode === "topn"}
              onChange={() => setMatchMode("topn")}
            />
            Top
            <input
              type="number"
              min={1}
              value={topN}
              onChange={e => setTopN(Number(e.target.value))}
              style={{ width: 50, marginLeft: 4 }}
              disabled={matchMode !== "topn"}
            />
          </label>
        </span>

        <button onClick={handleRun}>Run</button>
      </div>


      {rootNode && (
        <>
          <div style={{ margin: "10px 0 4px 0", fontWeight: 500 }}>
            Max tree depth: {maxDepth ?? "-"}
          </div>
          <div 
            style={{ 
              overflow: "auto", 
              maxWidth: "100%", 
              maxHeight: "70vh",
              border: "1px solid #ddd",
              borderRadius: "4px",
              background: "#fafafa"
            }}
          >
            <TreeView root={rootNode} />
          </div>
        </>
      )}

      <div>
        Time: {time.toFixed(2)} ms | Visited: {visitedCount} nodes
      </div>

      <div style={{ maxHeight: 200, overflow: "auto" }}>
        {log.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    </div>
  );
}