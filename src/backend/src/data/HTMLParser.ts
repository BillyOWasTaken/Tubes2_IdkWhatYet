import { Tree, Node } from "../core/entities/Tree";
import { Parser } from "htmlparser2";
import { ParserError } from "../core/ErrorHandling";

// Asumsi: text tidak mennjadi bagian dari tree

const SELF_CLOSING = new Set([
    "area", "base", "br", "col", "embed", "hr", "img",
    "input", "link", "meta", "param", "source", "track", "wbr"
]);

// Source : https://github.com/fb55/htmlparser2

export class HTMLParser {
    parse(html: string): Tree {
        const stack: Node[] = [];
        let root: Node | null = null;

        const parser = new Parser(
            {
                // Attribute returns in Record<string, string>, bisa pakai metode hasClass untuk pencarian tag class
                onopentag: (name: string, attributes: any) => {
                    const newNode = new Node(name, attributes);

                    if (stack.length === 0) {
                        root = newNode;
                    } else {
                        const parent = stack[stack.length - 1];
                        if (parent) {
                            parent.addChild(newNode);
                        }
                    }
                    if (!SELF_CLOSING.has(name)) {
                        stack.push(newNode);
                    }
                },

                onclosetag: (name: string) => {
                    if (!SELF_CLOSING.has(name)) {
                        stack.pop();
                    }
                },
            },
            {
                decodeEntities: true
            }
        );

        parser.write(html);
        parser.end();

        if (!root) {
            throw new ParserError("[Parser] Gagal memuat DOM Tree");
        }

        return new Tree(root);
    }
}