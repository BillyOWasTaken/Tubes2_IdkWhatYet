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

// lca binary lifting

// Binary lifting tables
    private up: Map<Node, Map<number, Node | null>> = new Map();
    private depth: Map<Node, number> = new Map();
    private logBL: number = 0; //max disesuaikan dengan depth tree

    private calculateTreeSize(root: Node): number {
        let size = 1;
        for (const child of root.children){
            size+= this.calculateTreeSize(child);
        }
        return size;
    }


    private dfsBinaryLifting(node: Node, parent: Node | null, currentDepth: number): void{
        this.depth.set(node, currentDepth);

        // ancestor map
        const ancestors = new Map<number, Node | null>();
        ancestors.set(0, parent); // immediate parent/ 2^0
        this.up.set(node, ancestors);

        // recursive for child
        for (const child of node.children){
            this.dfsBinaryLifting(child, node, currentDepth+1);
        }
    }

    preprocess(root: Node, maxNodes?: number): void{
        //max log value (ceil(log2(maxDepth))+1)
        const maxPossibleNodes = maxNodes || this.calculateTreeSize(root);
        this.logBL = Math.floor(Math.log2(maxPossibleNodes)) + 2;

        //dfs untuk mengisi immediate parent
        this.dfsBinaryLifting

        // binary lifting table diisi
        for (let k = 1; k = this.logBL; k++){
            for (const [node, ancestors] of this.up){
                const midAncestor = ancestors.get(k - 1);
                if (midAncestor && this.up.get(midAncestor)){
                    const ancestorValue = this.up.get(midAncestor)?.get(k-1) || null;
                    ancestors.set(k, ancestorValue);
                } else {
                    ancestors.set(k, null);
                }
            }
        }

    } 

    // kembalikan ancestor ke-2^(k - eksponensekarang) sebuah simpul
    private getAncestor(node: Node, k: number): Node | null{
        const ancestors = this.up.get(node);
        if (!ancestors) {
            return null;
        } else {
        return ancestors.get(k) || null;
        }
        
    }
    
    // kembalikan ancestor (k - eksponensekarang) sebuah simpul
    private kthAncestor(node: Node, k: number): Node | null {
        let current: Node | null = node;

        for (let i = 0; i < this.logBL; i++){
            if (k & (1 << i)) {
                if (!current) return null;
                current = this.getAncestor(current, i);
            }
        }
        return current;
    }

    // kedalaman simpul (Perlu Preprocess)
    getNodeDepth(node: Node): number{
        if (this.depth.has(node)){
            return this.depth.get(node)!;
        }
        return -1;
    }

    // hapus Binary Lifting Table
    resetBinaryLifting(): void{
        this.up.clear();
        this.depth.clear();
        this.logBL = 0;
    }

    findLCA(node1: Node | null, node2: Node | null):  Node| null {
        if (!node1 || !node2) return null;
        if (node1 === node2) return node1;

        //cek pohon yang sama
        if (!this.depth.has(node1) || !this.depth.has(node2)){
            console.warn("Panggil preprocess terlebih dahulu");
            return null;
        }

        // buat node1 yang lebih jauh dari akar 
        let [deep, shallow] = this.depth.get(node1)! > this.depth.get(node2)!
        ? [node1, node2]
        : [node2, node1];
    

        // angkat node1 ke kedalaman sama dengan node2
        let depthDiff = this.depth.get(deep)! - this.depth.get(shallow)!;
        deep = this.kthAncestor(deep, depthDiff)!;

        // jika sama kembalikan simpul
        if(deep === shallow) return deep;

        //  angkat kedua simpul dari pangkat 2 tertinggi ke bawah
        for (let k = this.logBL; k >= 0; k--){
                const deepAncestor = this.getAncestor(deep, k);
                const shallowAncestor = this.getAncestor(shallow, k);

                if (deepAncestor && shallowAncestor && deepAncestor !== shallowAncestor) {
                        deep = deepAncestor;
                        shallow = shallowAncestor;
                }        
        }

        return this.getAncestor(deep, 0);

    
}
    // idk, call both 
    preprocessAndFindLCA(root: Node, node1: Node, node2: Node, maxNodes?: number): Node | null{
        this.preprocess(root, maxNodes);
        return this.findLCA(node1, node2);
    }
}