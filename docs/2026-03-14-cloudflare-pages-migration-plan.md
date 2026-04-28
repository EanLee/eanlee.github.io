# 遷移計畫：GitHub Pages → Cloudflare Pages

**日期**：2026-03-14
**目的**：解決 Astro 靜態建置無法產生真正 HTTP 301 redirect，導致 Google Search Console 出現 noindex 問題

---

## 官方文件參考

| 主題 | 連結 |
|---|---|
| Astro 部署到 Cloudflare | https://docs.astro.build/en/guides/deploy/cloudflare/ |
| Cloudflare Pages `_redirects` 規範 | https://developers.cloudflare.com/pages/configuration/redirects/ |
| Cloudflare Pages Git 整合 | https://developers.cloudflare.com/pages/get-started/git-integration/ |
| Cloudflare Pages 自訂網域 | https://developers.cloudflare.com/pages/configuration/custom-domains/ |
| Cloudflare Pages Build 設定 | https://developers.cloudflare.com/pages/configuration/build-configuration/ |
| wrangler-action GitHub Action | https://github.com/cloudflare/wrangler-action |

---

## 根本原因

| | 現況 | 遷移後 |
|---|---|---|
| Redirect 機制 | HTTP 200 + `<meta http-equiv="refresh">` + `noindex` | 真正 HTTP 301 |
| GSC 呈現 | 「已發現，因 noindex 未索引」 | 正常轉址，PageRank 完整傳遞 |
| 部署目標 | GitHub Pages | Cloudflare Pages |

Astro 官方文件確認（來源：<https://docs.astro.build/en/reference/configuration-reference>）：
> "For statically-generated sites **without an adapter installed**, redirects are handled using a client-side redirect with a `<meta http-equiv="refresh">` tag... **If building to HTML files the status code is not used by the server.**"

---

## 變動清單

### 1. 新增 `public/_redirects`

將 `astro.config.mjs` 裡所有 redirect 規則搬到此檔，格式：

```
/old-path /new-path 301
```

**官方規範**（來源：https://developers.cloudflare.com/pages/configuration/redirects/）：

> "Place `_redirects` as a plain text file in your project's static asset directory (`public/`). This file will not itself be served as a static asset, but will instead be parsed by Cloudflare Pages."

> ⚠️ "302 is used as the **default** status code." → 必須明確寫 `301`，否則預設為 302

**限制**：
- 最多 2,000 條靜態 redirect + 100 條動態 redirect
- 每條規則最多 1,000 字元
- 順序重要：**第一條符合的規則優先生效**
- 靜態 redirect 必須排在動態 redirect 之前
- Redirect 執行優先於 Headers 規則

完整 `_redirects` 內容：

```
# ── 舊分頁路由（純數字）→ 首頁 ──────────────────────────────────────
/2 / 301
/3 / 301
/4 / 301
/5 / 301
/6 / 301
/7 / 301

# ── 舊搜尋端點 ────────────────────────────────────────────────────────
/search-index.json / 301

# ── 文章：/post/{舊分類}/{slug}/ → /post/software/{slug}/ ────────────
# test
/post/test/talking-testing-report/ /post/software/talking-testing-report/ 301
/post/test/what-does-load-testing-do/ /post/software/what-does-load-testing-do/ 301
/post/test/fluent-assertions-object-graph-comparison/ /post/software/fluent-assertions-object-graph-comparison/ 301
# develop
/post/develop/di-service-provider-httpcontextaccessor/ /post/software/di-service-provider-httpcontextaccessor/ 301
/post/develop/ef-core-cli-note/ /post/software/ef-core-cli-note/ 301
/post/develop/di-encapsulate-service-and-use-external-parameters/ /post/software/di-encapsulate-service-and-use-external-parameters/ 301
/post/develop/dfcore-dbcontext-hasqueryfilter/ /post/software/dfcore-dbcontext-hasqueryfilter/ 301
/post/develop/develop-assistant-chatgpt/ /post/software/develop-assistant-chatgpt/ 301
/post/develop/dotnet-ef-sqlserver/ /post/software/dotnet-ef-sqlserver/ 301
/post/develop/post-redirect-get/ /post/software/post-redirect-get/ 301
/post/develop/dotnet-ef-postgresql-dbcontext/ /post/software/dotnet-ef-postgresql-dbcontext/ 301
/post/develop/dotnet-ef-core-customized-dbcontext-entity/ /post/software/dotnet-ef-core-customized-dbcontext-entity/ 301
# security
/post/security/aspnet-core-authenticaiton-jwt/ /post/software/aspnet-core-authenticaiton-jwt/ 301
/post/security/https-and-ssl-tls/ /post/software/https-and-ssl-tls/ 301
/post/security/using-iis-create-and-complete-csr/ /post/software/using-iis-create-and-complete-csr/ 301
# container
/post/container/aspnet-webapi-containerized/ /post/software/aspnet-webapi-containerized/ 301
/post/container/distroless-container-image-and-sbom-security/ /post/software/distroless-container-image-and-sbom-security/ 301
/post/container/docker-postgresql-initialization-scripts/ /post/software/docker-postgresql-initialization-scripts/ 301
# devops
/post/devops/manual-adjuest-nlog-post-to-loki/ /post/software/manual-adjuest-nlog-post-to-loki/ 301
/post/devops/gitlab-and-runner-on-same-host-using-docker/ /post/software/gitlab-and-runner-on-same-host-using-docker/ 301
/post/devops/build-gitlab-on-private-environment/ /post/software/build-gitlab-on-private-environment/ 301
# architecture
/post/architecture/system-loading-limit-reroute/ /post/software/system-loading-limit-reroute/ 301
/post/architecture/cloud/mvp-vaification/ /post/software/series/cloud/mvp-vaification/ 301
# troubleshooting
/post/troubleshooting/use-https-redirection-cause-infinite-redirection/ /post/software/use-https-redirection-cause-infinite-redirection/ 301
/post/troubleshooting/http-response-status-unexpected-note/ /post/software/http-response-status-unexpected-note/ 301
# nouns
/post/nouns/problem-and-solution-domain/ /post/software/problem-and-solution-domain/ 301
/post/nouns/redundancy/ /post/software/redundancy/ 301
# pattern
/post/pattern/producer-consumers/ /post/software/talking-pattern-producer-consumers/ 301
# experiences
/post/experiences/multi-dimensional-thinking-for-system-architecture/ /post/software/thinking-multi-dimensional-thinking-for-system-architecture/ 301
/post/experiences/unexpected-request/ /post/software/unexpected-request/ 301
# projectmanagement → management
/post/projectmanagement/concepts-of-project-management-from-elimination-games/ /post/management/concepts-of-project-management-from-elimination-games/ 301
# 特殊：含 .md 副檔名
/post/software/the-importance-of-log-design-and-troubleshooting/log-and-error-handling-the-foundation-of-buildin-observable-systems.md /post/software/log-and-error-handling-the-foundation-of-buildin-observable-systems/ 301
# 舊命名修正
/post/software/dfcore-dbcontext-hasqueryfilter/ /post/software/efcore-dbcontext-hasqueryfilter/ 301

# ── Series 頁面 ───────────────────────────────────────────────────────
/series/持續優化程式碼品質/ / 301
/series/縮網址服務實作記錄/ /series/side-project/ 301
/series/series/build-automated-deploy/ /series/build-automated-deploy/ 301
/series/series/flexibly-use-docker /series/flexibly-use-docker/ 301
/series/series/flexibly-use-docker/ /series/flexibly-use-docker/ 301
/software/series/message-queue/ /series/message-queue/ 301
/software/series/build-automated-deploy/ /series/build-automated-deploy/ 301
/software/series/side-project/ /series/side-project/ 301

# ── 舊 /post/series/{slug} 路徑 ──────────────────────────────────────
/post/series/build_automated_deploy/build-ci-cd-from-scratch /post/software/series/build-automated-deploy/build-ci-cd-from-scratch/ 301
/post/series/message-queue/foreword/ /post/software/series/message-queue/build-mq-foreword/ 301

# ── 舊 Series 文章 ────────────────────────────────────────────────────
# coding-skill
/post/series/coding-skill/oop-practice/ /post/software/series/coding-skill/oop-practice/ 301
/post/series/coding-skill/coding-basic-skills/ /post/software/series/coding-skill/coding-basic-skills/ 301
# build-automated-deploy
/post/series/build-automated-deploy/cicd_concept/ /post/software/series/build-automated-deploy/cicd_concept/ 301
/post/series/build_automated_deploy/cicd_concept/ /post/software/series/build-automated-deploy/cicd_concept/ 301
/post/series/build-automated-deploy/yaml/ /post/software/series/build-automated-deploy/yaml/ 301
/post/series/build-automated-deploy/ci-azure-pipeline-and-jenkins/ /post/software/series/build-automated-deploy/ci-azure-pipeline-and-jenkins/ 301
/post/series/build-automated-deploy/version_control/ /post/software/series/build-automated-deploy/version_control/ 301
/post/series/build-automated-deploy/docker-operate/ /post/software/series/build-automated-deploy/docker-operate/ 301
/post/series/build-automated-deploy/github-action-travis-ci/ /post/software/series/build-automated-deploy/github-action-travis-ci/ 301
/post/series/build-automated-deploy/container-intro/ /post/software/series/build-automated-deploy/container-intro/ 301
/post/series/build_automated_deploy/container_intro/ /post/software/series/build-automated-deploy/container-intro/ 301
/post/series/build-automated-deploy/build-docker-image/ /post/software/series/build-automated-deploy/build-docker-image/ 301
/post/series/build-automated-deploy/integration-ci-and-unit-test/ /post/software/series/build-automated-deploy/integration-ci-and-unit-test/ 301
/post/series/build-automated-deploy/git-remote-repositories/ /post/software/series/build-automated-deploy/git-remote-repositories/ 301
/post/series/build-automated-deploy/build-ci-cd-from-scratch/ /post/software/series/build-automated-deploy/build-ci-cd-from-scratch/ 301
/post/series/build-automated-deploy/container-build-execution-environment-required-ci/ /post/software/series/build-automated-deploy/container-build-execution-environment-required-ci/ 301
/post/series/build-automated-deploy/cd-dropbox/ /post/software/series/build-automated-deploy/cd-dropbox/ 301
# flexibly-use-docker
/post/series/flexibly-use-docker/container-vm-difference/ /post/software/series/flexibly-use-docker/container-vm-difference/ 301
/post/series/flexibly-use-docker/install-docker/ /post/software/series/flexibly-use-docker/install-docker/ 301
/post/series/flexibly-use-docker/flexibly-use-docker-foreword/ /post/software/series/flexibly-use-docker/flexibly-use-docker-foreword/ 301
/post/series/flexibly-use-docker/docker-base-command-and-argument/ /post/software/series/flexibly-use-docker/docker-base-command-and-argument/ 301
/post/series/flexibly-use-docker/docker-build-use-multi-stage-build/ /post/software/series/flexibly-use-docker/docker-build-use-multi-stage-build/ 301
# side-project
/post/series/side-project/shorten-2-lets-encrypt-setting/ /post/software/series/side-project/shorten-2-lets-encrypt-setting/ 301
/post/series/side-project/shorten-use-rabbitmq-process-analysis-event/ /post/software/series/side-project/shorten-use-rabbitmq-process-analysis-event/ 301
/post/series/side-project/shorten-1-build-service-base-on-container/ /post/software/series/side-project/shorten-1-build-service-base-on-container/ 301
# message-queue
/post/series/message-queue/queue/ /post/software/series/message-queue/queue/ 301
/post/series/message-queue/build-mq-foreword/ /post/software/series/message-queue/build-mq-foreword/ 301
```

---

### 2. 修改 `astro.config.mjs`

移除整個 `redirects: { ... }` 區塊，防止 Astro build 繼續產生含 `noindex` 的 meta refresh HTML 頁面。其他設定不變。

---

### 3. 替換 `.github/workflows/github-action.yml`

**官方文件**：https://github.com/cloudflare/wrangler-action

#### 現況 workflow 問題

- 使用 GitHub Pages 專用 Actions（`configure-pages`、`upload-pages-artifact`、`deploy-pages`）需全部移除
- 現有 build 指令的 `--site "${{ steps.pages.outputs.origin }}"` 會把 site 覆蓋成 `https://eanlee.github.io`，與實際 `eandev.com` 不符

#### 新 workflow

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy dist --project-name=eandev-com
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

> `gitHubToken` 是可選的，加上後可在 GitHub UI 看到 Deployment 狀態標記。

#### 需要在 GitHub repo Secrets 新增

前往 GitHub repo → **Settings → Secrets and variables → Actions**：

| Secret 名稱 | 取得位置 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token，選 **Cloudflare Pages: Edit** 權限範本 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 後台右側邊欄 Account ID |

---

### 4. Cloudflare Pages 後台建立專案

**官方文件**：https://developers.cloudflare.com/pages/get-started/git-integration/

步驟：
1. 登入 [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. 授權 GitHub → 選 `eanlee/eanlee.github.io` repo
4. Build 設定：
   ```
   Project name:       eandev-com
   Production branch:  main
   Framework preset:   Astro
   Build command:      npm run build
   Build output dir:   dist
   ```
5. **Save and Deploy**（第一次手動觸發）

> ⚠️ 官方提醒：「Switching to Direct Upload after Git integration deployment is not possible.」選定方式後無法切換。

---

### 5. DNS 與自訂網域設定

**官方文件**：https://developers.cloudflare.com/pages/configuration/custom-domains/

**目前 DNS 狀況**：Squarespace Domains + Google Cloud DNS（NS-CLOUD-B1~B4.GOOGLEDOMAINS.COM）

#### Apex domain 的強制要求

官方說明：
> "For apex domains (example.com), your site must be a **Cloudflare zone**. Configure your nameservers to point to Cloudflare's nameservers."

→ `eandev.com` 要設定自訂網域，**nameserver 必須換到 Cloudflare**，無其他選項。

> ⚠️ 官方警告：「Manually adding a custom CNAME record without first associating the domain in the Cloudflare Pages dashboard will result in your domain failing to resolve and display a **522 error**.」

#### 執行步驟

1. 到 Cloudflare 新增站台，輸入 `eandev.com`
2. Cloudflare 自動掃描現有 DNS 記錄（A record 185.199.x.153 會自動帶入）
3. **先到 Squarespace Domains 後台換 nameserver**，換成 Cloudflare 提供的兩組
4. 等 DNS 傳播完成（通常 5 分鐘～數小時）
5. 回到 Cloudflare Pages → 你的專案 → **Custom domains** → **Set up a domain** → 輸入 `eandev.com`
6. Cloudflare 自動建立所需 DNS 記錄與 SSL 憑證

---

## 官方注意事項

### Astro 官方警告（來源：https://docs.astro.build/en/guides/deploy/cloudflare/）

> ⚠️ **Auto Minify 問題**：「Client-side hydration may fail as a result of Cloudflare's **Auto Minify** setting.」
> → 部署完成後，到 Cloudflare → Speed → Optimization → 確認關閉 Auto Minify（HTML/CSS/JS）。

### Cloudflare Pages _redirects 注意事項（來源：https://developers.cloudflare.com/pages/configuration/redirects/）

> ⚠️ **預設為 302**：不寫 status code 時預設 302，必須明確標註 `301`。
>
> ⚠️ **不支援 Query string 匹配**：如 `/path?foo=bar` 的 source 無法使用。
>
> ⚠️ **不適用 Pages Functions**：「Redirects defined in the `_redirects` file are not applied to requests served by Pages Functions.」
>
> ✅ **支援萬用字元 `*`**：可用 `:splat` 接收，例如 `/old/* /new/:splat 301`。

---

## 不受影響的部分

| 項目 | 說明 |
|---|---|
| `npm run build` 指令 | 完全不變（含 `pagefind`） |
| Astro 靜態輸出模式 | 不變，不需裝 adapter |
| `astro.config.mjs` 其他設定 | site、integrations、markdown 等全部不變 |
| `public/` 其他靜態檔案 | 全部不變（CNAME、ads.txt、robots.txt 等） |
| SEO、sitemap | 不變 |
| SSL 憑證 | Cloudflare 自動處理，無需手動操作 |

---

## 執行順序

```
Step 1  Cloudflare 後台建立 Pages 專案（Connect to Git）
Step 2  本地：新增 public/_redirects
Step 3  本地：移除 astro.config.mjs 的 redirects 區塊
Step 4  本地：替換 .github/workflows/github-action.yml
Step 5  GitHub repo 新增 Secrets（CLOUDFLARE_API_TOKEN、CLOUDFLARE_ACCOUNT_ID）
Step 6  push 到 main，確認 GitHub Actions 成功，eandev-com.pages.dev 正常
Step 7  Squarespace Domains 換 nameserver 到 Cloudflare
Step 8  Cloudflare Pages → Custom Domains → 新增 eandev.com
Step 9  確認 eandev.com 正常，關閉 Auto Minify
Step 10 停用 GitHub Pages（repo Settings → Pages → None）
```

---

## 風險評估

| 風險 | 說明 | 緩解方式 |
|---|---|---|
| DNS 切換期間短暫不可用 | nameserver 傳播需時 | 選低流量時段，通常 < 30 分鐘 |
| Auto Minify 破壞 hydration | Cloudflare 預設可能啟用 | Step 9 確認關閉 |
| pagefind 搜尋功能 | 靜態搜尋索引，與 hosting 無關 | 不受影響 |
| 先加 CNAME 再設 Pages 會 522 | 官方明確警告 | 嚴格按 Step 8 順序操作 |
| GitHub Pages 同時啟用 | 兩邊同時運行不衝突 | 確認 Cloudflare 正常後再 Step 10 |
