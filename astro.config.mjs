import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";
import rehypeExternalLinks from "rehype-external-links";
import rehypeFigure from "rehype-figure";
import rehypeMermaid from "rehype-mermaid";

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
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
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
      [
        rehypeMermaid,
        {
          strategy: "inline-svg",
          mermaidConfig: {
            theme: "base",
            look: "handDrawn",
            themeVariables: {
              fontFamily: "'Inter', 'Noto Sans TC', sans-serif",
              primaryColor: "#22272e",
              primaryTextColor: "#e6edf3",
              primaryBorderColor: "#6b8aff",
              lineColor: "#6b8aff",
              secondaryColor: "#1c2128",
              secondaryBorderColor: "#5c6470",
              tertiaryColor: "#1c2128",
              tertiaryBorderColor: "#373e47",
              background: "#0f1419",
              mainBkg: "#22272e",
              textColor: "#e6edf3",
              nodeTextColor: "#e6edf3",
              edgeLabelBackground: "#1c2128",
              clusterBkg: "#1c2128",
              clusterBorder: "#373e47",
              actorBkg: "#22272e",
              actorBorder: "#6b8aff",
              actorTextColor: "#e6edf3",
              signalColor: "#adbac7",
              signalTextColor: "#e6edf3",
              labelBoxBkgColor: "#22272e",
              labelBoxBorderColor: "#6b8aff",
              labelTextColor: "#e6edf3",
              noteBkgColor: "#ed8936",
              noteTextColor: "#0f1419",
              noteBorderColor: "#ed8936",
              errorBkgColor: "#22272e",
              errorTextColor: "#e6edf3",
            },
          },
        },
      ],
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
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["mermaid"],
    },
  },
});