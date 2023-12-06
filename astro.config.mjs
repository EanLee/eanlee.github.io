import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

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
  redirects: {
    "/post/test/淺談單元測試的撰寫/": "/post/test/talking-writing-unit-tests/",
    "/post/series/message-queue/foreword/":
      "/post/series/message-queue/build-mq-foreword/",
    "/post/series/coding-skill/foreword/":
      "/post/series/coding-skill/coding-skill-foreword/",
    "/post/container/flexible-opereate-docker-foreword/":
      "/post/series/flexibly-use-docker/flexibly-use-docker-foreword/",
    "/post/container/container-vm-difference/":
      "/post/series/flexibly-use-docker/container-vm-difference/",
    "/post/projectmanagement/從消除遊戲學到的專案管理二三事/":
      "/post/projectmanagement/concepts-of-project-management-from-elimination-games/",
  },
  integrations: [
    mdx(),
    sitemap(),
    robotsTxt(),
    tailwind({ applyBaseStyles: false }),
  ],
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
