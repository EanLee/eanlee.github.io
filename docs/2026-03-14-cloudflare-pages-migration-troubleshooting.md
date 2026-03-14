# Cloudflare Pages 遷移疑難排解紀錄

**日期**：2026-03-14
**目的**：記錄從 GitHub Pages 遷移至 Cloudflare Pages 過程中遭遇的問題與根本原因，供部落格文章參考

---

## 背景：為什麼要遷移？

### 問題根源

Astro 靜態建置 + GitHub Pages 的 redirect 機制，**無法產生真正的 HTTP 301**。

官方文件說明（來源：https://docs.astro.build/en/reference/configuration-reference）：

> "For statically-generated sites **without an adapter installed**, redirects are handled using a client-side redirect with a `<meta http-equiv="refresh">` tag... **If building to HTML files the status code is not used by the server.**"

**實際產出的 HTML：**

```html
<!doctype html>
<title>Redirecting to: /post/software/talking-testing-report/</title>
<meta http-equiv="refresh" content="0;url=/post/software/talking-testing-report/">
<meta name="robots" content="noindex">
<link rel="canonical" href="https://eandev.com/post/software/talking-testing-report/">
```

**問題鏈：**

```
Astro build → 每個舊 URL 產生 index.html（HTTP 200）
    ↓
HTML 內含 meta refresh + robots: noindex
    ↓
Google 看到 HTTP 200 + noindex → 記錄為「已發現，因 noindex 未索引」
    ↓
Google Search Console 顯示大量 noindex 警告
    ↓
PageRank 無法正常傳遞給目標 URL
```

### 解法方向

Cloudflare Pages 支援 `public/_redirects` 檔案，在 **CDN edge 層**攔截請求並回傳真正的 HTTP 301，完全不經過靜態 HTML 檔案。

---

## Cloudflare 兩大產品的差異

這是遷移過程中最容易混淆的地方。

| | Cloudflare Workers | Cloudflare Pages |
|---|---|---|
| **用途** | 執行伺服器端程式碼（SSR、API、Edge Functions） | 托管靜態網站 |
| **部署指令** | `wrangler deploy` | `wrangler pages deploy dist` |
| **產物** | `.js` Worker 程式碼 | 靜態檔案資料夾 |
| **Astro 對應** | 需裝 `@astrojs/cloudflare` adapter | 純靜態，不需要 adapter |

**官方說明**（來源：https://developers.cloudflare.com/pages/functions/wrangler-configuration/）：

> "`wrangler deploy`: Deploys Workers directly to your account"
> "`wrangler pages deploy`: Deploys your Pages project with its configuration"

---

## 遷移過程中遭遇的三個錯誤

### 錯誤一：`npx wrangler deploy` 觸發 Workers 安裝流程

**Deploy command 填入**：`npx wrangler deploy`

**錯誤訊息**：
```
🛠️ Configuring project for Astro with "astro add cloudflare"
[vite] Error: Package subpath './app/manifest' is not defined by "exports"
[astro] Unable to load your Astro config
```

**根本原因**：

`wrangler deploy`（無 `pages` 子指令）是 **Cloudflare Workers** 的部署指令。Wrangler 偵測到 Astro 專案後，自動執行了：
1. 安裝 `@astrojs/cloudflare` adapter（版本 13.1.1）
2. 修改 `package.json` scripts
3. 建立 `wrangler.jsonc`

但 `@astrojs/cloudflare@13.1.1` 與目前的 `astro@5.12.8` 有版本不相容問題，導致 build 失敗。

**錯誤指令 vs 正確指令**：

```bash
# ❌ 錯誤：Workers 部署指令，會嘗試安裝 SSR adapter
npx wrangler deploy

# ✅ 正確：Pages 靜態部署指令，直接上傳 dist 資料夾
npx wrangler pages deploy dist --project-name=blog
```

---

### 錯誤二：`npx wrangler pages deploy dist --project-name=blog` 認證失敗

**Deploy command 填入**：`npx wrangler pages deploy dist --project-name=blog`

**錯誤訊息**：
```
✘ [ERROR] A request to the Cloudflare API failed.
  Authentication error [code: 10000]

📎 It looks like you are authenticating Wrangler via a custom API token
   set in an environment variable.
   Please ensure it has the correct permissions for this operation.
```

**根本原因**：

Cloudflare Pages **Git integration** 的設計是「build 完成後自動部署」，不需要手動跑 `wrangler pages deploy`。

當 Deploy command 欄位填入 `npx wrangler pages deploy` 時，Cloudflare 的 build 環境嘗試透過 `CLOUDFLARE_API_TOKEN` 環境變數進行 API 認證，但：
1. 這個 token 是 Cloudflare 內部提供給 build 環境的
2. 其權限範圍不包含「對自身 Pages 專案發起 API 部署請求」
3. 即使帳戶本身是 Super Admin，API token 的 scope 仍然受限

**官方文件確認**（來源：https://developers.cloudflare.com/pages/get-started/git-integration/）：

> "Your project build logs will output as Cloudflare Pages installs your project dependencies, builds the project, and **deploys it to Cloudflare's global network.**"

Cloudflare Pages Git integration 在 build 完成後會**自動**完成部署，Deploy command 欄位的用途是指定**輸出目錄**，不是執行額外的部署腳本。

---

### 錯誤三：Deploy command 欄位的用途混淆

**Cloudflare Pages 新版 UI** 將原本的「Build output directory」改版為「Deploy command」，placeholder 文字顯示 `npx wrangler deploy`，容易誤導使用者填入 wrangler 部署指令。

**正確用法**：

```
Build command:   pnpm run build
Deploy command:  dist          ← 就是 build 輸出目錄，不是 wrangler 指令
```

---

## 正確的 Cloudflare Pages Git Integration 架構

```
push to main
    ↓
Cloudflare Pages 抓取 repo 最新程式碼
    ↓
執行 Build command: pnpm run build
    ↓
讀取 Deploy command 指定的目錄（dist/）
    ↓
Cloudflare 自動將 dist/ 部署到全球 CDN
    ↓
讀取 dist/_redirects → 設定 edge 層 HTTP 301 規則
```

不需要 wrangler CLI，不需要額外 API token，不需要 GitHub Actions。

---

## `public/_redirects` 的作用機制

**檔案格式**：

```
# 語法：/來源路徑 /目標路徑 HTTP狀態碼
/old-path /new-path 301
/post/test/talking-testing-report/ /post/software/talking-testing-report/ 301
```

**官方規範**（來源：https://developers.cloudflare.com/pages/configuration/redirects/）：

- 放在 `public/` 資料夾，build 後會出現在 `dist/_redirects`
- Cloudflare 在 CDN edge 層解析此檔案，**在請求抵達靜態檔案之前**就攔截並回傳 HTTP 301
- 預設 status code 是 **302**，必須明確寫 `301`
- 最多 2,000 條靜態規則
- 順序重要：第一條符合的規則優先生效

**執行層級比較**：

```
# 舊做法（Astro meta refresh）
請求 → GitHub Pages → 讀 HTML 檔 → HTTP 200 + meta refresh + noindex

# 新做法（Cloudflare _redirects）
請求 → Cloudflare Edge → 比對 _redirects → HTTP 301（完成，不碰靜態檔案）
```

---

## 參考資料

| 主題 | 連結 |
|---|---|
| Astro redirects 靜態建置說明 | https://docs.astro.build/en/reference/configuration-reference |
| Astro 部署到 Cloudflare | https://docs.astro.build/en/guides/deploy/cloudflare/ |
| Cloudflare Pages `_redirects` 規範 | https://developers.cloudflare.com/pages/configuration/redirects/ |
| Cloudflare Pages Git integration | https://developers.cloudflare.com/pages/get-started/git-integration/ |
| Cloudflare Pages Build 設定 | https://developers.cloudflare.com/pages/configuration/build-configuration/ |
| Workers vs Pages 差異 | https://developers.cloudflare.com/pages/functions/wrangler-configuration/ |
| wrangler-action GitHub Action | https://github.com/cloudflare/wrangler-action |

---

## 關鍵觀念整理（部落格寫作要點）

1. **Astro 靜態 redirect 的本質**：不是 HTTP redirect，是 HTML 頁面
2. **GitHub Pages 的限制**：純靜態，沒有伺服器，無法產生 HTTP 301
3. **Cloudflare Workers vs Pages**：同公司兩個不同產品，`wrangler deploy` 指令完全不同
4. **`_redirects` 的層級**：在 CDN edge，比靜態檔案更早攔截，這是它能產生真正 301 的原因
5. **Cloudflare Pages Git integration 的自動化**：build 後自動部署，不需要額外指令
6. **API Token 的 scope 問題**：即使是 Super Admin，API token 的權限範圍仍然可能受限
