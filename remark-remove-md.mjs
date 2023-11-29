// remove-md-extension.mjs
import { visit } from "unist-util-visit";

export default function () {
  return (tree) => {
    visit(tree, "link", (node) => {
      if (node.url.endsWith(".md")) {
        node.url = node.url.slice(0, node.url.lastIndexOf("/") + 1);
      }
    });
  };
}
