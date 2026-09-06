import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFigure from "rehype-figure";

import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import remarkRemoveMd from "./remark-adjust-md-link.mjs";
import { remarkReadingTime } from "./remark-reading-time.mjs";
import { remarkChatDialogue } from "./remark-chat-dialogue.mjs";
import { customLanguages } from "./shiki-languages.mjs";

import robotsTxt from "astro-robots-txt";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://eandev.com",
  output: "static",
  integrations: [
    sitemap(),
    robotsTxt({
      policy: [
        { userAgent: "*", allow: "/" },
        { userAgent: "GPTBot", allow: "/" },
        { userAgent: "ClaudeBot", allow: "/" },
        { userAgent: "Google-Extended", allow: "/" },
        { userAgent: "PerplexityBot", allow: "/" },
        { userAgent: "ChatGPT-User", allow: "/" },
      ],
      sitemap: "https://eandev.com/sitemap-index.xml",
    }),
    tailwind({ applyBaseStyles: false }),
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: "always",
  },
  markdown: {
    remarkPlugins: [remarkRemoveMd, remarkReadingTime, remarkChatDialogue],
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
      langs: customLanguages,
    },
  },
});