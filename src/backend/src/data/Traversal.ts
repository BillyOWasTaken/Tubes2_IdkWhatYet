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

// lca binary lifting

// Binary lifting tables
    private up: Map<string, Map<number, string | null>> = new Map();
    private depth: Map<string, number> = new Map();;
    private nodeByUniqueId: Map<string, Node> = new Map();
    private logBL: number = 0; //max disesuaikan dengan depth tree

    private calculateTreeSize(root: Node): number {
        let size = 1;
        for (const child of root.children){
            size+= this.calculateTreeSize(child);
        }
        return size;
    }


    private dfsBinaryLifting(node: Node, parentUniqueId: string | null, currentDepth: number): void{

        const uniqueId = (node as any).uniqueId;
        
        // Store node reference for later retrieval
        this.nodeByUniqueId.set(uniqueId, node);
        this.depth.set(uniqueId, currentDepth);
        console.log(`Setting depth for ${node.tag} (${uniqueId}) to ${currentDepth}`);

        
        // ancestor map
        const ancestors = new Map<number, string | null>();
        ancestors.set(0, parentUniqueId); // immediate parent/ 2^0
        this.up.set(uniqueId, ancestors);

        // recursive for child
        for (const child of node.children){
            this.dfsBinaryLifting(child, uniqueId, currentDepth+1);
        }
    }

    preprocess(root: Node, maxNodes?: number): void{
        //max log value (ceil(log2(maxDepth))+1)
        const maxPossibleNodes = maxNodes || this.calculateTreeSize(root);
        this.logBL = Math.floor(Math.log2(maxPossibleNodes)) + 2;

        //dfs untuk mengisi immediate parent
        this.dfsBinaryLifting(root, null, 0);

        // binary lifting table diisi
        for (let k = 1; k <= this.logBL; k++){
            for (const [uniqueId, ancestors] of this.up){
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
    private getAncestor(uniqueId: string, k: number): string| null{
        const ancestors = this.up.get(uniqueId);
        if (!ancestors) {
            return null;
        } else {
        return ancestors.get(k) || null;
        }
        
    }
    
    // kembalikan ancestor (k - eksponensekarang) sebuah simpul
    private kthAncestor(uniqueId: string, k: number): string | null {
        let current: string | null = uniqueId;

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
        
        if (!node) return -1;
        const uniqueId = (node as any).uniqueId;
        if (!uniqueId) return -1;
        const depth = this.depth.get(uniqueId);
        return depth !== undefined ? depth : -1;
    
    }

    // hapus Binary Lifting Table
    resetBinaryLifting(): void{
        this.up.clear();
        this.depth.clear();
        this.nodeByUniqueId.clear();
        this.logBL = 0;
    }

    findLCA(node1: Node | null, node2: Node | null):  Node| null {
        if (!node1 || !node2) return null;
        
        const id1 = (node1 as any).uniqueId;
        const id2 = (node2 as any).uniqueId;

        if (id1 === id2) return node1;
        
        console.log("Finding LCA for IDs:", id1, id2);
        console.log("Depth map keys:", Array.from(this.depth.keys()));

        //cek pohon yang sama
        if (!this.depth.has(id1) || !this.depth.has(id2)){
            console.warn("Panggil preprocess terlebih dahulu");
            return null;
        }

        const depth1 = this.depth.get(id1)!;
        const depth2 = this.depth.get(id2)!;

        let deepId = depth1 > depth2 ? id1 : id2;
        let shallowId = depth1 > depth2 ? id2 : id1;
    

        // angkat node1 ke kedalaman sama dengan node2
        let depthDiff = Math.abs(depth1 - depth2);
        deepId = this.kthAncestor(deepId, depthDiff)!;

        // jika sama kembalikan simpul
        if (deepId === shallowId) {
            return this.nodeByUniqueId.get(deepId) || null;
        }

        //  angkat kedua simpul dari pangkat 2 tertinggi ke bawah
        for (let k = this.logBL; k >= 0; k--){
                const deepAncestor = this.getAncestor(deepId, k);
                const shallowAncestor = this.getAncestor(shallowId, k);

                if (deepAncestor && shallowAncestor && deepAncestor !== shallowAncestor) {
                        deepId = deepAncestor;
                        shallowId = shallowAncestor;
                }        
        }

        const lcaId = this.getAncestor(deepId, 0);
        const lcaNode = lcaId ? this.nodeByUniqueId.get(lcaId) || null : null;
        
        return lcaNode;

    
}
    // idk, call both 
    preprocessAndFindLCA(root: Node, node1: Node, node2: Node, maxNodes?: number): Node | null{
        this.preprocess(root, maxNodes);
        return this.findLCA(node1, node2);
    }
}