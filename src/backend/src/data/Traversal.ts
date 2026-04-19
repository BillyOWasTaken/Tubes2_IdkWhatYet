import type { Node } from "../core/entities/Tree";
import { CSSSelector } from "./CSSSelector";

// BFS dan DFS sederhana
/**
 * TO DO:
 * Lowest Common Ancestor
 * added dls, just a dfs with limit and tracking for current depth for now
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

    dls(node: Node, query: string, result: Node[] = [], limit: number, currentDepth: number = 0): Node[] {
        if (this.selector.matchQuery(node, query)) {
            result.push(node);
        }
        
        if (currentDepth >= limit){
            return result;
        }

        for (const child of node.children) {
            this.dls(child, query, result, limit, currentDepth+1);
        }
        
        return result;
    }

}