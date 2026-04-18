import type { Node } from "../core/entities/Tree";
import { CSSSelector } from "./CSSSelector";

// BFS dan DFS sederhana
/**
 * TO DO:
 * Lowest Common Ancestor
 * Belum bisa ngasih top n kemunculan, not sure harus DLS or no
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
}