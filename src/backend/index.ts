import { DOMParser } from "./src/data/DOMParser";
import { serve } from "bun";

const parser = new DOMParser();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function toVisualNode(node) {
  const id = node.attributes?.id ? `#${node.attributes.id}` : "";
  const cls = node.attributes?.class
    ? "." + node.attributes.class.split(" ").join(".")
    : "";

  return {
    name: `${node.tag}${id}${cls}`,
    attributes: node.attributes,
    children: node.children?.map(toVisualNode) || [],
  };
}

serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (req.method === "GET" && url.pathname === "/") {
      return new Response("DOM API is running");
    }
    if (req.method === "POST" && url.pathname === "/api/parse") {
      try {
        const { html } = await req.json();
        const tree = parser.loadFromString(html);
         const maxDepth = tree.maxDepth;
        const visual = toVisualNode(tree.root);
       

        return new Response(JSON.stringify({ tree: visual, maxDepth: maxDepth }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response(
          JSON.stringify({ error: e.message || "Parse error" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (req.method === "POST" && url.pathname === "/api/url") {
        try {
            const { url: targetUrl } = await req.json();

            const tree = await parser.loadFromUrl(targetUrl);
            const visual = toVisualNode(tree.root);
           

            return new Response(JSON.stringify({ tree: visual, maxDepth: maxDepth}), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            });

        } catch (e) {
          return new Response(
            JSON.stringify({ error: e.message || "URL parse error" }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
});

console.log("DOM API server running on http://localhost:3000");