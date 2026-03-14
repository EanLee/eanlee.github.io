import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFigure from "rehype-figure";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import remarkRemoveMd from "./remark-adjust-md-link.mjs";

import robotsTxt from "astro-robots-txt";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://eandev.com",
  // redirects 已移至 public/_redirects（Cloudflare Pages 原生 HTTP 301）
  integrations: [sitemap(), robotsTxt(), tailwind({ applyBaseStyles: false })],
  compressHTML: true,
  build: {
    inlineStylesheets: "always",
  },
  markdown: {
    remarkPlugins: [remarkRemoveMd],
    rehypePlugins: [
      [rehypeFigure, { className: "my-figure" }],
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "append" }],
      [
        rehypeExternalLinks,
        {
          content: { type: "text", value: " 🔗" },
        },
      ],
    ],
    shikiConfig: {
      theme: "github-dark",
    },
  },
});
