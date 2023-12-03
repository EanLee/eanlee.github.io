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
import astroExpressiveCode from "astro-expressive-code";

const astroExpressiveCodeOptions = {
  // You can use any of the themes bundled with Shiki by name,
  // specify a path to JSON theme file, or pass an instance
  // of the `ExpressiveCodeTheme` class here:
  themes: ["dracula", "solarized-light"],
};

// https://astro.build/config
export default defineConfig({
  site: "https://eandev.com",
  redirects: {
    '/post/test/淺談單元測試的撰寫/': '/post/test/talking-writing-unit-tests/',
    '/post/series/message-queue/foreword/': '/post/series/message-queue/build-mq-foreword/',
    '/post/series/coding-skill/foreword/' : '/post/series/coding-skill/coding-skill-foreword/',
    '/post/container/flexible-opereate-docker-foreword/': '/post/series/flexibly-use-docker/flexibly-use-docker-foreword/',
    'post/container/container-vm-difference/': '/post/series/flexibly-use-docker/container-vm-difference/',
   },
  integrations: [
    astroExpressiveCode(astroExpressiveCodeOptions),
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
});
