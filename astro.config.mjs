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
  redirects: {
    "/post/security/using-iis-create-and-complete-csr/":
      "/post/software/using-iis-create-and-complete-csr/",
      "/post/devops/gitlab-and-runner-on-same-host-using-docker/":
      "/post/software/gitlab-and-runner-on-same-host-using-docker/"
  },
  integrations: [
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
        rehypeExternalLinks,
        {
          content: { type: "text", value: " 🔗" },
        },
      ],
    ],
  },
});
