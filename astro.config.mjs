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
    // ── 舊分頁路由（純數字）→ 首頁 ────────────────────────────────────
    "/2": "/",
    "/3": "/",
    "/4": "/",
    "/5": "/",
    "/6": "/",
    "/2/": "/",
    "/3/": "/",
    "/4/": "/",
    "/5/": "/",
    "/6/": "/",
    "/7/": "/",

    // ── 文章：/post/{舊分類}/{slug}/ → /post/software/{slug}/ ──────────
    // test
    "/post/test/talking-testing-report/": "/post/software/talking-testing-report/",
    "/post/test/what-does-load-testing-do/": "/post/software/what-does-load-testing-do/",
    "/post/test/fluent-assertions-object-graph-comparison/": "/post/software/fluent-assertions-object-graph-comparison/",
    // develop
    "/post/develop/di-service-provider-httpcontextaccessor/": "/post/software/di-service-provider-httpcontextaccessor/",
    "/post/develop/ef-core-cli-note/": "/post/software/ef-core-cli-note/",
    "/post/develop/di-encapsulate-service-and-use-external-parameters/": "/post/software/di-encapsulate-service-and-use-external-parameters/",
    "/post/develop/dfcore-dbcontext-hasqueryfilter/": "/post/software/dfcore-dbcontext-hasqueryfilter/",
    "/post/develop/develop-assistant-chatgpt/": "/post/software/develop-assistant-chatgpt/",
    "/post/develop/dotnet-ef-sqlserver/": "/post/software/dotnet-ef-sqlserver/",
    "/post/develop/post-redirect-get/": "/post/software/post-redirect-get/",
    "/post/develop/dotnet-ef-postgresql-dbcontext/": "/post/software/dotnet-ef-postgresql-dbcontext/",
    "/post/develop/dotnet-ef-core-customized-dbcontext-entity/": "/post/software/dotnet-ef-core-customized-dbcontext-entity/",
    // security
    "/post/security/aspnet-core-authenticaiton-jwt/": "/post/software/aspnet-core-authenticaiton-jwt/",
    "/post/security/https-and-ssl-tls/": "/post/software/https-and-ssl-tls/",
    "/post/security/using-iis-create-and-complete-csr/": "/post/software/using-iis-create-and-complete-csr/",
    // container
    "/post/container/aspnet-webapi-containerized/": "/post/software/aspnet-webapi-containerized/",
    "/post/container/distroless-container-image-and-sbom-security/": "/post/software/distroless-container-image-and-sbom-security/",
    "/post/container/docker-postgresql-initialization-scripts/": "/post/software/docker-postgresql-initialization-scripts/",
    // devops
    "/post/devops/manual-adjuest-nlog-post-to-loki/": "/post/software/manual-adjuest-nlog-post-to-loki/",
    "/post/devops/gitlab-and-runner-on-same-host-using-docker/": "/post/software/gitlab-and-runner-on-same-host-using-docker/",
    "/post/devops/build-gitlab-on-private-environment/": "/post/software/build-gitlab-on-private-environment/",
    // architecture
    "/post/architecture/system-loading-limit-reroute/": "/post/software/system-loading-limit-reroute/",
    "/post/architecture/cloud/mvp-vaification/": "/post/software/series/cloud/mvp-vaification/",
    // troubleshooting
    "/post/troubleshooting/use-https-redirection-cause-infinite-redirection/": "/post/software/use-https-redirection-cause-infinite-redirection/",
    "/post/troubleshooting/http-response-status-unexpected-note/": "/post/software/http-response-status-unexpected-note/",
    // nouns
    "/post/nouns/problem-and-solution-domain/": "/post/software/problem-and-solution-domain/",
    "/post/nouns/redundancy/": "/post/software/redundancy/",
    // pattern
    "/post/pattern/producer-consumers/": "/post/software/talking-pattern-producer-consumers/",
    // experiences
    "/post/experiences/multi-dimensional-thinking-for-system-architecture/": "/post/software/thinking-multi-dimensional-thinking-for-system-architecture/",
    "/post/experiences/unexpected-request/": "/post/software/unexpected-request/",
    // projectmanagement → management
    "/post/projectmanagement/concepts-of-project-management-from-elimination-games/": "/post/management/concepts-of-project-management-from-elimination-games/",
    // 特殊：含 .md 副檔名的舊 URL
    "/post/software/the-importance-of-log-design-and-troubleshooting/log-and-error-handling-the-foundation-of-buildin-observable-systems.md":
      "/post/software/log-and-error-handling-the-foundation-of-buildin-observable-systems/",

    // ── Series 頁面：中文名稱 / 舊路徑 ─────────────────────────────────
    "/series/持續優化程式碼品質/": "/",
    "/series/縮網址服務實作記錄/": "/series/side-project/",
    // 舊的 /software/series/ 前綴
    "/software/series/message-queue/": "/series/message-queue/",
    "/software/series/build-automated-deploy/": "/series/build-automated-deploy/",
    "/software/series/side-project/": "/series/side-project/",

    // ── 舊 /post/series/{slug} 路徑（含 build_automated_deploy 底線版）
    "/post/series/build_automated_deploy/build-ci-cd-from-scratch": "/post/software/series/build-automated-deploy/build-ci-cd-from-scratch/",
    "/post/series/message-queue/foreword/": "/post/software/series/message-queue/build-mq-foreword/",

    // ── 舊 Series 文章 → /post/software/series/{series}/{slug}/ ────────
    // coding-skill
    "/post/series/coding-skill/oop-practice/": "/post/software/series/coding-skill/oop-practice/",
    "/post/series/coding-skill/coding-basic-skills/": "/post/software/series/coding-skill/coding-basic-skills/",
    // build-automated-deploy
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
    // flexibly-use-docker
    "/post/series/flexibly-use-docker/container-vm-difference/": "/post/software/series/flexibly-use-docker/container-vm-difference/",
    "/post/series/flexibly-use-docker/install-docker/": "/post/software/series/flexibly-use-docker/install-docker/",
    "/post/series/flexibly-use-docker/flexibly-use-docker-foreword/": "/post/software/series/flexibly-use-docker/flexibly-use-docker-foreword/",
    "/post/series/flexibly-use-docker/docker-base-command-and-argument/": "/post/software/series/flexibly-use-docker/docker-base-command-and-argument/",
    "/post/series/flexibly-use-docker/docker-build-use-multi-stage-build/": "/post/software/series/flexibly-use-docker/docker-build-use-multi-stage-build/",
    // side-project
    "/post/series/side-project/shorten-2-lets-encrypt-setting/": "/post/software/series/side-project/shorten-2-lets-encrypt-setting/",
    "/post/series/side-project/shorten-use-rabbitmq-process-analysis-event/": "/post/software/series/side-project/shorten-use-rabbitmq-process-analysis-event/",
    "/post/series/side-project/shorten-1-build-service-base-on-container/": "/post/software/series/side-project/shorten-1-build-service-base-on-container/",
    // message-queue
    "/post/series/message-queue/queue/": "/post/software/series/message-queue/queue/",
    "/post/series/message-queue/build-mq-foreword/": "/post/software/series/message-queue/build-mq-foreword/",
  },
  integrations: [
    sitemap(),
    robotsTxt(),
    tailwind({ applyBaseStyles: false }),
  ],
  compressHTML: true,
  build: {
    inlineStylesheets: 'always',
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
      theme: 'github-dark'
    }
  },
});
