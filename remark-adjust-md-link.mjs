// remove-md-extension.mjs
import { visit } from "unist-util-visit";

export default function () {
  return (tree) => {
    visit(tree, "link", (node) => {
      if (node.url.startsWith("http") === false) {
        // 因為轉換過來同 content 內的 .md 檔案名必為 index.md, 所以直接去掉 index.md
        node.url = node.url.toLowerCase().replace("index.md", "");
      }
    });
  };
}
