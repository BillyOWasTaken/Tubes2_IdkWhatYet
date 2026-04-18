import { Node } from "../core/entities/Tree";


// Hanya basic selector sesuai di spek yah ges yak O - O
// Kelas dipakai langsung di BFS-DFS for easier purposes.

/**
 * Selector yang sudah diimplementasi:
 * Tag
 * Class
 * ID
 * Attribute
 * Child
 * Descendant
 * Adjacent
 * General sibling
 * Universal
 */
export class CSSSelector {
    splitLast(selector: string, combinator: string): [string, string] | null {
        const idx = selector.lastIndexOf(combinator);
        if (idx === -1) return null;
        return [
            selector.slice(0, idx).trim(),
            selector.slice(idx + combinator.length).trim()
        ];
    }

    matchQuery(node: Node, selector: string): boolean {
        if (!selector) return false;

        // Child combinator
        const childSplit = this.splitLast(selector, ">");
        if (childSplit) {
            const [parentPart, childPart] = childSplit;
            return node.parent !== null && this.matchQuery(node.parent, parentPart) && this.matchBasic(node, childPart);
        }

        const adjacentSplit = this.splitLast(selector, "+");
        if (adjacentSplit) {
            const [siblingPart, nodePart] = adjacentSplit;
            return node.previousSibling !== null && this.matchQuery(node.previousSibling, siblingPart) && this.matchBasic(node, nodePart);
        }

        const siblingSplit = this.splitLast(selector, "~");
        if (siblingSplit) {
            const [siblingPart, nodePart] = siblingSplit;
            return node.siblings.some(sib => this.matchQuery(sib, siblingPart)) && this.matchBasic(node, nodePart);
        }

        const descendantSplit = this.splitLast(selector, " ");
        if (descendantSplit) {
            const [ancestorPart, nodePart] = descendantSplit;
            return node.hasAncestor(n => this.matchQuery(n, ancestorPart)) && this.matchBasic(node, nodePart);
        }

        return this.matchBasic(node, selector);   
    }

    matchBasic(node: Node, selector: string): boolean {
        if (selector === "*") return true;

        if (selector.startsWith("#")) {
            return node.id === selector.slice(1);
        }

        // Multi-class
        if (selector.startsWith(".")) {
            return selector.slice(1).split(".").every(c => node.hasClass(c));
        }

        // Attribute selector 
        if (selector.includes("[")) {
            const attrMatch = selector.match(/^(\w+)?\[(\w+)(?:=(.+))?\]$/);
            if (!attrMatch) return false;
            const [, tag, attr, value] = attrMatch;
            if (!attr) return false;
            if (tag && node.tag !== tag) return false;
            return node.getAttribute(attr) === value;
        }

        // tag.class
        const tagClassMatch = selector.match(/^(\w+)\.(.+)$/);
        if (tagClassMatch) {
            const [, tag, cls] = tagClassMatch;
            if (!cls) return false;
            return node.tag === tag && cls.split(".").every(c => node.hasClass(c));
        }

        return node.tag === selector;
    }
}