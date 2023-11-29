import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFigure from "rehype-figure";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import remarkRemoveMd from "./remark-remove-md.mjs";

import robotsTxt from "astro-robots-txt";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://eandev.com",
  integrations: [mdx(), sitemap(), robotsTxt(), tailwind()],
  markdown: {
    remarkPlugins: [remarkRemoveMd],
    rehypePlugins: [
      [rehypeFigure, { className: "my-figure" }],
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      [
        "rehype-toc",
        {
          headings: ["h1", "h2", "h3"],
          cssClasses: {
            toc: "toc-post",
            link: "toc-link",
          },
        },
      ],
      [
        rehypeExternalLinks,
        {
          content: { type: "text", value: " 🔗" },
        },
      ],
    ],
  },

  //   build: {
  //     // 示例：在构建过程中生 成`page.html` 而不是 `page/index.html`。
  //     format: "directory",
  //   },
});
