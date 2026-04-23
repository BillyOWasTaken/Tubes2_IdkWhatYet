import type { Node } from "../core/entities/Tree";
import { CSSSelector } from "./CSSSelector";

// BFS dan DFS sederhana
/**
 * TO DO:
 * Lowest Common Ancestor
 * added dls, just a dfs with limit and tracking for current depth for now
 * added minDepth with default at zero, limit as maxDepth 
 */

export class Traversal {
    private selector = new CSSSelector();  

    async bfsAnimated(root: Node, query: string, delay: number, onVisit?: (node: Node) => void, onMatch?: (node: Node) => void) {
        const queue: Node[] = [root];

        while (queue.length > 0) {
            const current = queue.shift()!;

            onVisit?.(current);

            if (this.selector.matchQuery(current, query)) {
            onMatch?.(current);
            }

            await new Promise(r => setTimeout(r, delay));

            for (const child of current.children) {
            queue.push(child);
            }
        }
    }

    async dfsAnimated(node: Node, query: string, delay: number, onVisit?: (node: Node) => void, onMatch?: (node: Node) => void, result: Node[] = []): Promise<Node[]> {
        onVisit?.(node);

        if (this.selector.matchQuery(node, query)) {
            result.push(node);
            onMatch?.(node);
        }

        await new Promise(res => setTimeout(res, delay));

        for (const child of node.children) {
            await this.dfsAnimated(child, query, delay, onVisit, onMatch, result);
        }

        return result;
        }

async dlsAnimated(node: Node, query: string, maxDepth: number, minDepth: number, currentDepth: number, delay: number, onVisit?: (node: Node) => void, onMatch?: (node: Node) => void) {
    
    onVisit?.(node);

    if (
        currentDepth >= minDepth &&
        this.selector.matchQuery(node, query)
    ) {
        onMatch?.(node);
    }

    await new Promise(r => setTimeout(r, delay));

    if (currentDepth >= maxDepth) return;

    for (const child of node.children) {
        await this.dlsAnimated(
        child,
        query,
        maxDepth,
        minDepth,
        currentDepth + 1,
        delay,
        onVisit,
        onMatch
        );
    }
}
}