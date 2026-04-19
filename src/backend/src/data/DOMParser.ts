import { Node, Tree } from "../core/entities/Tree" 
import { ParserError } from "../core/ErrorHandling"
import { HTMLParser } from "./HTMLParser"
import { Traversal } from "./Traversal"
import { WebScraper } from "./WebScrapper"

export class DOMParser {
    private scraper = new WebScraper();
    private parser = new HTMLParser();
    private traversal = new Traversal();
    private currentTree: Tree | null = null;  

    loadFromString(html: string): Tree 
    {
        this.currentTree = this.parser.parse(html);
        return this.currentTree;
    }

    async loadFromUrl(url: string): Promise<Tree> 
    {
        const html = await this.scraper.scrap(url);
        return this.loadFromString(html)
    }

    query(selector: string, method: "DLS" | "BFS" | "DFS" = "BFS", minDepth: number = 0, maxDepth: number = 0): Node[] 
    {
        if (!this.currentTree || !this.currentTree.root){
            throw new ParserError("[DOMParser] Tree kosong atau belum loaded. Bila belum loaded, load String atau URL terlebih dahulu.")
        }
        if (method === "BFS") 
        {
            return this.traversal.bfs(this.currentTree.root, selector);
        }
        else if (method = "DFS")
        {
            return this.traversal.dfs(this.currentTree.root, selector);
        }
        
        else
        {
            return this.traversal.dls(this.currentTree.root, selector, maxDepth, minDepth);
        }
        
    }
    getTree(): Tree | null 
    {
        return this.currentTree;
    }
}

