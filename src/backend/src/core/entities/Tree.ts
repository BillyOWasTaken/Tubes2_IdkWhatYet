import { InvalidTreeError } from "../ErrorHandling";

export class Tree{
    root: Node | null;
    maxDepth: number = 0;

    constructor(root: Node) {
        this.root = root;
        this.maxDepth = root.depth;
    }

    updateMaxDepth(depth: number): void {
        if (depth > this.maxDepth) this.maxDepth = depth;
    }

    printTree(): void {
        if (!this.root) {
            console.log("Tree is empty");
            return;
        }

        const traverse = (node: Node, indent: string) => {
            const attrString = Object.entries(node.attributes)
                .map(([key, value]) => `${key}="${value}"`)
                .join(" ");

            console.log(
                `${indent}<${node.tag}${attrString ? " " + attrString : ""}> (depth=${node.depth})`
            );

            this.updateMaxDepth(node.depth);

            for (const child of node.children) {
                traverse(child, indent + "  ");
            }
        };

        traverse(this.root, "");
    }

    validate(): void {
        // Apakah root kosong
        if (!this.root) {
            throw new InvalidTreeError("[TREE] Tree kosong");
        }
        
        // Apakah ada tag html
        if (this.root.tag !== "html") {
            throw new InvalidTreeError("[TREE] Root harus <html>");
        }
        
        /// Apakah ada body
        const body = this.root.children.find(c => c.tag === "body");

        if (!body) {
            throw new InvalidTreeError("[TREE] <body> tidak ditemukan");
        }
        
        for (const child of this.root.children) {
            if (child.tag !== "head" && child.tag !== "body") {
                throw new InvalidTreeError("[TREE] Invalid tag di <html>");
            }
        }
    }
}

export class Node {
    /**
     * tag: identitas sederhana
     * attributes: pair dictionary dengan isi dari tag
     * parent: apakah root atau ada parent sebelumnya
     * children: array anak dari node tertentu
     */
    tag: string;
    attributes: Record<string, string>;
    parent: Node | null;
    children: Node[] = [];
    depth:  number = 0;
    
    //Konstruktor untuk membuat node baru dengan array kosong sebagai anaknya
    constructor(tag: string, attributes: Record<string, string> = {}, parent: Node | null = null) {
        this.tag = tag;
        this.attributes = attributes;
        this.parent = parent;
    }

    addChild(child: Node): void{
        child.parent = this;
        child.depth = this.depth + 1;
        this.children.push(child);
    }

    getAttribute(name: string): string | undefined {
        return this.attributes[name];
    }

    get id(): string {
        return this.attributes["id"] ?? "";
    }

    get classes(): string[] {
        const cls = this.attributes["class"];
        if (cls) return cls.trim().split(/\s+/);
        else return [];
    }

    hasClass(name: string): boolean {
        return this.classes.includes(name);
    }

    get previousSibling(): Node | null {
        if (!this.parent) return null;

        const index = this.parent.children.indexOf(this);

        if (index<=0) return null;
        else return this.parent.children[index - 1] || null;
    }

    get nextSibling(): Node | null {
        if (!this.parent) return null;

        const index = this.parent.children.indexOf(this);

        if (index >= this.parent.children.length - 1) return null;
        else return this.parent.children[index + 1] || null;
    }

    get siblings(): Node[] {
        if (!this.parent) return [];
        return this.parent.children.filter((sibling) => sibling !== this);
        // filter function bisa dilihat penggunaannya pada GeekforGeeks
    }  
    
    hasAncestor(tag: string): boolean {
        let current = this.parent;
        
        while (current) {
            if (current.tag == tag) return true;
            current = current.parent;
        }
        return false;
    }
}