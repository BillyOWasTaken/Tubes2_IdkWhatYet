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

    bfs(root: Node, query: string): Node[] {
        const queue: Node[] = [root];
        const result: Node[] = [];

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (this.selector.matchQuery(current, query)) {
                result.push(current);
            }

            for (const child of current.children) {
                queue.push(child);
            }
        }

        return result;
    }

    dfs(node: Node, query: string, result: Node[] = []): Node[] {
        if (this.selector.matchQuery(node, query)) {
            result.push(node);
        }

        for (const child of node.children) {
            this.dfs(child, query, result);
        }

        return result;
    }

    dls(node: Node, query: string, maxDepth: number, minDepth: number = 0, currentDepth: number = 0, result: Node[] = []): Node[] {
        if (currentDepth >= minDepth && this.selector.matchQuery(node, query)) {
            result.push(node);
        }
        
        if (currentDepth >= maxDepth){
            return result;
        }

        for (const child of node.children) {
            this.dls(child, query, maxDepth, minDepth, currentDepth+1, result);
        }
        
        return result;
    }
}