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
    // Existing redirects
    "/post/security/using-iis-create-and-complete-csr/":
      "/post/software/using-iis-create-and-complete-csr/",
    "/post/devops/gitlab-and-runner-on-same-host-using-docker/":
      "/post/software/gitlab-and-runner-on-same-host-using-docker/",
    
    // New redirects for legacy blog structure
    // Series articles - coding skill
    "/post/series/coding-skill/oop-practice/": "/post/software/series/coding-skill/oop-practice/",
    "/post/series/coding-skill/coding-basic-skills/": "/post/software/series/coding-skill/coding-basic-skills/",
    
    // Series articles - build automated deploy (handle both versions)
    "/post/series/build-automated-deploy/cicd_concept/": "/post/software/series/build-automated-deploy/cicd_concept/",
    "/post/series/build_automated_deploy/cicd_concept/": "/post/software/series/build-automated-deploy/cicd_concept/",
    "/post/series/build-automated-deploy/yaml/": "/post/software/series/build-automated-deploy/yaml/",
    "/post/series/build-automated-deploy/ci-azure-pipeline-and-jenkins/": "/post/software/series/build-automated-deploy/ci-azure-pipeline-and-jenkins/",
    "/post/series/build-automated-deploy/version_control/": "/post/software/series/build-automated-deploy/version_control/",
    "/post/series/build-automated-deploy/docker-operate/": "/post/software/series/build-automated-deploy/docker-operate/",
    "/post/series/build-automated-deploy/github-action-travis-ci/": "/post/software/series/build-automated-deploy/github-action-travis-ci/",
    "/post/series/build-automated-deploy/container-intro/": "/post/software/series/build-automated-deploy/container-intro/",
    "/post/series/build_automated_deploy/container_intro/": "/post/software/series/build-automated-deploy/container-intro/",
    "/post/series/build-automated-deploy/build-docker-image/": "/post/software/series/build-automated-deploy/build-docker-image/",
    "/post/series/build-automated-deploy/integration-ci-and-unit-test/": "/post/software/series/build-automated-deploy/integration-ci-and-unit-test/",
    "/post/series/build-automated-deploy/git-remote-repositories/": "/post/software/series/build-automated-deploy/git-remote-repositories/",
    "/post/series/build-automated-deploy/build-ci-cd-from-scratch/": "/post/software/series/build-automated-deploy/build-ci-cd-from-scratch/",
    "/post/series/build-automated-deploy/container-build-execution-environment-required-ci/": "/post/software/series/build-automated-deploy/container-build-execution-environment-required-ci/",
    "/post/series/build-automated-deploy/cd-dropbox/": "/post/software/series/build-automated-deploy/cd-dropbox/",
    
    // Series articles - flexibly use docker
    "/post/series/flexibly-use-docker/container-vm-difference/": "/post/software/series/flexibly-use-docker/container-vm-difference/",
    "/post/series/flexibly-use-docker/install-docker/": "/post/software/series/flexibly-use-docker/install-docker/",
    "/post/series/flexibly-use-docker/flexibly-use-docker-foreword/": "/post/software/series/flexibly-use-docker/flexibly-use-docker-foreword/",
    "/post/series/flexibly-use-docker/docker-base-command-and-argument/": "/post/software/series/flexibly-use-docker/docker-base-command-and-argument/",
    "/post/series/flexibly-use-docker/docker-build-use-multi-stage-build/": "/post/software/series/flexibly-use-docker/docker-build-use-multi-stage-build/",
    
    // Series articles - side project
    "/post/series/side-project/shorten-2-lets-encrypt-setting/": "/post/software/series/side-project/shorten-2-lets-encrypt-setting/",
    "/post/series/side-project/shorten-use-rabbitmq-process-analysis-event/": "/post/software/series/side-project/shorten-use-rabbitmq-process-analysis-event/",
    "/post/series/side-project/shorten-1-build-service-base-on-container/": "/post/software/series/side-project/shorten-1-build-service-base-on-container/",
    
    // Series articles - message queue
    "/post/series/message-queue/queue/": "/post/software/series/message-queue/queue/",
    "/post/series/message-queue/build-mq-foreword/": "/post/software/series/message-queue/build-mq-foreword/",
    
    // Software articles - direct mapping from different categories
    "/post/container/docker-postgresql-initialization-scripts/": "/post/software/docker-postgresql-initialization-scripts/",
    "/post/develop/dotnet-ef-postgresql-dbcontext/": "/post/software/dotnet-ef-postgresql-dbcontext/",
    "/post/troubleshooting/http-response-status-unexpected-note/": "/post/software/http-response-status-unexpected-note/",
    "/post/develop/dotnet-ef-core-customized-dbcontext-entity/": "/post/software/dotnet-ef-core-customized-dbcontext-entity/",
    "/post/devops/build-gitlab-on-private-environment/": "/post/software/build-gitlab-on-private-environment/",
    
    // Series overview pages to series URLs
    "/software/series/build-automated-deploy/": "/series/software/series/build-automated-deploy/",
    "/software/series/side-project/": "/series/software/series/side-project/"
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
