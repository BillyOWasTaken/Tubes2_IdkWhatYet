import { Node } from "./Tree";
import { Tree } from "./Tree";

// root
const root = new Node("div", { id: "app" });

// header
const header = new Node("header", { class: "main-header" });
const h1 = new Node("h1");

header.addChild(h1);

// main
const main = new Node("main");

const section = new Node("section", { class: "content" });

const p = new Node("p", { class: "text" });
const span = new Node("span");

section.addChild(p);
section.addChild(span);
main.addChild(section);

// footer
const footer = new Node("footer");

// build tree
root.addChild(header);
root.addChild(main);
root.addChild(footer);

// export tree
export const tree = new Tree(root);