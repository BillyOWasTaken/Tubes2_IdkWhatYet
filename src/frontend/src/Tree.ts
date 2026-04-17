export class Tree{
    root: Node | null;

     constructor(root: Node) {
        this.root = root
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
    
    //Konstruktor untuk membuat node baru dengan array kosong sebagai anaknya
    constructor(tag: string, attributes: Record<string, string> = {}, parent: Node | null = null) {
        this.tag = tag;
        this.attributes = attributes;
        this.parent = parent;
    }

    addChild(child: Node): void{
        child.parent = this;
        this.children.push(child);
    }

    getAttribute(name: string): string | undefined {
        return this.attributes[name];
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