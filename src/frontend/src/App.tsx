import { useState, useRef } from "react"; // Add useRef import
import { Traversal } from "../../backend/src/data/Traversal";
import { Node } from "../../backend/src/core/entities/Tree";
import { TreeView, highlight, markMatch, highlightEdge } from "./TreeView";
import * as d3 from "d3";

let nextNodeId = 1;

type VisualNode = {
  name: string;
  id?: string;
  attributes?: Record<string, string>;
  children?: VisualNode[];
};

function toNode(v: VisualNode, parent: Node | null = null): Node {
  const node = new Node(v.name, v.attributes || {}, parent);
  (node as any).uniqueId = `node_${nextNodeId++}`;
  (node as any).originalTag = v.name;
  
  if (v.children) {
    for (const child of v.children) {
      node.addChild(toNode(child, node));
    }
  }
  return node;
}

function findNodeByUniqueId(root: Node | null, uniqueId: string): Node | null {
  if (!root) return null;
  if ((root as any).uniqueId === uniqueId) return root;
  
  for (const child of root.children) {
    const found = findNodeByUniqueId(child, uniqueId);
    if (found) return found;
  }
  return null;
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
  
  // LCA states
  const [lcaMode, setLcaMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
  const [lcaResult, setLcaResult] = useState<Node | null>(null);

  // IMPORTANT: Use useRef to persist the same traversal instance
  const traversalRef = useRef(new Traversal());

  async function handleParse() {
    nextNodeId = 1;
    
    const endpoint = inputMode === "html"
      ? "http://localhost:3000/api/parse"
      : "http://localhost:3000/api/url";

    const body = inputMode === "html" ? { html } : { url: urlInput };

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
    
    // Use the same traversal instance
    if (root) {
      console.log("Starting preprocessing with traversal instance:", traversalRef.current);
      traversalRef.current.preprocess(root, data.maxDepth);
      
      // Verify depth map was populated
      const testDepth = traversalRef.current.getNodeDepth(root);
      console.log("Root depth after preprocessing:", testDepth);
      console.log("Root uniqueId:", (root as any).uniqueId);
      
      // Log all depth map keys
      console.log("Depth map after preprocessing:", (traversalRef.current as any).depth);
    }
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

  const handleNodeClick = (clickedNode: Node) => {
    if (!lcaMode) return;
    
    console.log("Using traversal instance:", traversalRef.current);
    
    // Find the actual node in the tree
    const actualNode = findNodeByUniqueId(rootNode, (clickedNode as any).uniqueId);
    if (!actualNode) {
      console.error("Could not find node in tree");
      return;
    }
    
    const nodeDepth = traversalRef.current.getNodeDepth(actualNode);
    console.log(`Clicked node: ${actualNode.tag}, Depth: ${nodeDepth}, UniqueId: ${(actualNode as any).uniqueId}`);
    
    if (selectedNodes.length < 2 && !selectedNodes.includes(actualNode)) {
      const newSelected = [...selectedNodes, actualNode];
      setSelectedNodes(newSelected);
      
      if (actualNode.el) {
        d3.select(actualNode.el)
          .attr("fill", "yellow")
          .attr("stroke", "orange")
          .attr("stroke-width", 3);
      }
      
      if (newSelected.length === 2) {
        console.log("Finding LCA for:", newSelected[0].tag, newSelected[1].tag);
        
        // Use the same traversal instance
        const lca = traversalRef.current.findLCA(newSelected[0], newSelected[1]);
        console.log("LCA result:", lca?.tag);
        
        setLcaResult(lca);
        
        if (lca && lca.el) {
          d3.select(lca.el)
            .attr("fill", "purple")
            .attr("stroke", "darkviolet")
            .attr("stroke-width", 4);
        }
      }
    } else if (selectedNodes.includes(actualNode)) {
      const newSelected = selectedNodes.filter(n => n !== actualNode);
      setSelectedNodes(newSelected);
      
      if (actualNode.el) {
        d3.select(actualNode.el)
          .attr("fill", "white")
          .attr("stroke", "black")
          .attr("stroke-width", 1.5);
      }
      
      if (newSelected.length < 2) {
        setLcaResult(null);
        resetColors(rootNode!);
        newSelected.forEach(n => {
          if (n.el) {
            d3.select(n.el)
              .attr("fill", "yellow")
              .attr("stroke", "orange")
              .attr("stroke-width", 3);
          }
        });
      }
    }
  };

  const resetLCA = () => {
    if (rootNode) {
      resetColors(rootNode);
    }
    setSelectedNodes([]);
    setLcaResult(null);
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
      highlight(node);
      highlightEdge(node);
    };

    const onMatch = (node: Node) => {
      if (matchMode === "all" || (matchMode === "topn" && matchCount < topN)) {
        markMatch(node);
        matchCount++;
      }
    };

    if (mode === "dfs") {
      await traversalRef.current.dfsAnimated(rootNode, query, 150, onVisit, onMatch);
    } else if (mode === "bfs") {
      await traversalRef.current.bfsAnimated(rootNode, query, 150, onVisit, onMatch);
    } else {
      await traversalRef.current.dlsAnimated(rootNode, query, topN, 0, 0, 150, onVisit, onMatch);
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
  
        <button  onClick={() => {
              if (lcaMode) {
                resetLCA();
                setLcaMode(false);
              } else {
                setLcaMode(true);
                resetLCA();
                alert("LCA Mode: Click on two nodes to find their Lowest Common Ancestor");
              }
            }}
            style={{ 
              backgroundColor: lcaMode ? "#908989" : "#fafafa", 
              color: "black",
            }}
          >
            {lcaMode ? "Exit LCA Mode" : "Find LCA"}
          </button>
        </div>
  

      {lcaMode && (
        <div style={{ 
          textAlign: "center", 
          padding: "10px", 
          backgroundColor: "#e3f2fd", 
          borderRadius: "4px",
          marginBottom: "10px"
        }}>
          <strong>LCA Mode Active:</strong> 
          {selectedNodes.length === 0 && " Select first node"}
          {selectedNodes.length === 1 && ` Selected: ${selectedNodes[0].tag} - Select second node`}
          {selectedNodes.length === 2 && (
            <>
              <div>Selected: {selectedNodes[0].tag} and {selectedNodes[1].tag}</div>
              {lcaResult && (
                <div style={{ marginTop: "5px", color: "#9c27b0", fontWeight: "bold" }}>
                  Lowest Common Ancestor: {lcaResult.tag} 
                  (Depth: {traversalRef.getNodeDepth(lcaResult)})
                </div>
              )}
            </>
          )}
          <button 
            onClick={resetLCA}
            style={{ marginLeft: "10px", padding: "2px 10px", cursor: "pointer" }}
          >
            Reset Selection
          </button>
        </div>
      )}

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
            <TreeView 
              root={rootNode} 
              onNodeClick={lcaMode ? handleNodeClick : undefined}
              lcaMode={lcaMode} />
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