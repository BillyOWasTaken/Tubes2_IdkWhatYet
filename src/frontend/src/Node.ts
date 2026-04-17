class Node {
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

    constructor(tag: string, attributes: Record<string, string> = {}, parent: Node | null = null) {
        this.tag = tag;
        this.attributes = attributes;
        this.parent = parent;
    }
}