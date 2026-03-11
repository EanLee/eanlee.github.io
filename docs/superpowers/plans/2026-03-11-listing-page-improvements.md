# Listing Page Improvements Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修復 EpicLayout、SeriesLayout、categories 三個版型的 SEO、CSS 設計令牌、視覺卡片、響應式斷點問題，以及為系列文章加入序號標示和補充 JSON-LD 結構化資料。

**Architecture:** 直接修改三個版型檔案（不含 Cover Image，Cover Image 方案待後續討論）。CSS 統一以 EpicLayout 為基準，所有硬編碼值替換為 design-tokens。SEO 修改限於 meta description、title 格式與 JSON-LD 補充。

**Tech Stack:** Astro 5 SSG、TypeScript、CSS Design Tokens (`src/styles/design-tokens.css`)

**Build check command:** `npm run build`（完整）、`npx astro check`（型別檢查）

**Design tokens 關鍵值（已確認）：**
```
--spacing-xs: 0.25rem   --spacing-sm: 0.5rem    --spacing-md: 1rem
--spacing-lg: 1.5rem    --spacing-xl: 2rem       --spacing-2xl: 3rem
--font-size-xs: 0.75rem --font-size-sm: 0.875rem --font-size-base: 1rem
--font-size-xl: 1.25rem --font-size-2xl: 1.5rem  --font-size-4xl: 2.25rem
--font-weight-medium: 500  --font-weight-semibold: 600  --font-weight-bold: 700
--radius-md: 8px        --radius-lg: 12px
--transition-normal: 0.2s ease   --transition-slow: 0.3s ease
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3)   --shadow-lg: 0 10px 15px rgba(0,0,0,0.5)
--card-bg: #1c2128      --card-border: #373e47
--container-xl: 1120px  --color-border-light: #5c6470
```

**CLAUDE.md 標準斷點：**
```
1024px → 大平板
768px  → 小平板/大手機（sidebar 隱藏點）
480px  → 標準手機
414px  → 小手機（Pixel 7）
```

---

## 檔案異動清單

| 檔案 | 動作 | 影響 |
|------|------|------|
| `src/layouts/SeriesLayout.astro` | 修改 | SEO description、CSS tokens、斷點、卡片視覺、序號、JSON-LD |
| `src/layouts/EpicLayout.astro` | 修改 | CSS tokens 剩餘硬編碼、斷點、卡片視覺、JSON-LD |
| `src/pages/categories/[...category].astro` | 修改 | SEO description+title、CSS tokens、斷點、卡片視覺、JSON-LD ListItem |

---

## Chunk 1：SEO Meta 修正

### Task 1：修正 SeriesLayout meta description

**Files:**
- Modify: `src/layouts/SeriesLayout.astro:59`

- [ ] **Step 1：定位目前的 BaseHead 呼叫**

  在 `SeriesLayout.astro` 第 59 行：
  ```astro
  <BaseHead title={`${seriesTitle} | ${SITE_TITLE}`} description={SITE_DESCRIPTION} />
  ```

- [ ] **Step 2：替換為動態 description**

  ```astro
  <BaseHead
    title={`${seriesTitle} | ${SITE_TITLE}`}
    description={`${seriesTitle} 系列文章，共 ${seriesPosts.length} 篇。${seriesPosts[0]?.data.description ?? ''}`}
  />
  ```

- [ ] **Step 3：型別檢查**

  ```bash
  npx astro check
  ```
  預期：無錯誤

- [ ] **Step 4：Commit**

  ```bash
  git add src/layouts/SeriesLayout.astro
  git commit -m "fix(seo): SeriesLayout meta description 改為動態內容"
  ```

---

### Task 2：修正 Category meta description 與 title 格式

**Files:**
- Modify: `src/pages/categories/[...category].astro:95`

- [ ] **Step 1：定位目前的 BaseHead 呼叫**

  在第 95 行：
  ```astro
  <BaseHead title={pageTitle + " - " + SITE_TITLE} description={SITE_DESCRIPTION} />
  ```

- [ ] **Step 2：替換**

  ```astro
  <BaseHead
    title={`${formattedCategory} | ${SITE_TITLE}`}
    description={`探索「${formattedCategory}」分類下的 ${categoryCount} 篇技術文章，涵蓋實作經驗與深度分析。`}
  />
  ```

- [ ] **Step 3：型別檢查**

  ```bash
  npx astro check
  ```

- [ ] **Step 4：Commit**

  ```bash
  git add src/pages/categories/[...category].astro
  git commit -m "fix(seo): Category meta description 改為動態內容，title 格式統一為管線"
  ```

---

## Chunk 2：CSS 設計令牌標準化 + 斷點修正 + 卡片視覺

> **注意：** 三個檔案的 `<style>` 區塊各自修改。每個 Task 只動一個檔案。

### Task 3：SeriesLayout CSS 完整替換

**Files:**
- Modify: `src/layouts/SeriesLayout.astro` — `<style>` 區塊（第 151–337 行）

- [ ] **Step 1：找到 `<style define:vars={{ accentColor }}>` 區塊，整個替換**

  將 SeriesLayout 的整個 `<style>` 區塊替換為以下內容：

  ```css
  <style define:vars={{ accentColor }}>
    body {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .series-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      flex: 1;
    }

    .main-content {
      display: grid;
      grid-template-columns: 300px minmax(0, 1fr);
      gap: var(--spacing-xl);
      margin: var(--spacing-xl) 0 var(--spacing-2xl);
      max-width: var(--container-xl);
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
    }

    .sidebar-area {
      width: 300px;
    }

    .widget-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .content-area {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      width: 100%;
    }

    .page-header {
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
    }

    .page-header h1 {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--spacing-sm) 0;
      color: var(--accentColor);
    }

    .page-header p {
      font-size: var(--font-size-base);
      color: var(--text-muted);
      margin: 0;
    }

    .posts-list {
      width: 100%;
      margin-bottom: var(--spacing-xl);
    }

    .post-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: transform var(--transition-slow), box-shadow var(--transition-slow);
      margin-bottom: var(--spacing-lg);
      position: relative;
    }

    .post-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .post-sequence {
      position: absolute;
      top: var(--spacing-sm);
      left: var(--spacing-sm);
      min-width: 2rem;
      height: 2rem;
      padding: 0 var(--spacing-xs);
      background-color: var(--accentColor);
      color: var(--color-bg-primary);
      border-radius: var(--radius-sm);
      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .post-content {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .post-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: calc(var(--spacing-md) - var(--spacing-xs));
      padding-bottom: calc(var(--spacing-md) - var(--spacing-xs));
      border-bottom: 1px dashed var(--card-border);
    }

    .post-date {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .post-tags {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    .post-tags svg {
      color: var(--accentColor);
    }

    .tag-list {
      font-size: var(--font-size-xs);
    }

    .tag-link {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color var(--transition-normal);
    }

    .tag-link:hover {
      color: var(--accentColor);
    }

    .post-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      margin: calc(var(--spacing-md) - var(--spacing-xs)) 0;
    }

    .post-title a {
      color: var(--text-primary);
      text-decoration: none;
      transition: color var(--transition-normal);
    }

    .post-title a:hover {
      color: var(--accentColor);
    }

    .post-description {
      font-size: var(--font-size-base);
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: calc(var(--spacing-md) + var(--spacing-xs));
    }

    .read-more {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: calc(var(--font-size-base) - 0.05rem);
      font-weight: var(--font-weight-medium);
      color: var(--accentColor);
      text-decoration: none;
      transition: color var(--transition-normal);
    }

    .read-more:hover {
      opacity: 0.8;
    }

    .no-posts {
      width: 100%;
      text-align: center;
      padding: var(--spacing-3xl, 4rem) var(--spacing-xl);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      color: var(--text-muted);
    }

    .series-blocks {
      margin-top: var(--spacing-xl);
    }

    .other-series-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      margin: 0 0 var(--spacing-lg) 0;
      padding-bottom: calc(var(--spacing-sm) + var(--spacing-xs));
      border-bottom: 2px solid var(--accentColor);
      color: var(--text-primary);
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 250px minmax(0, 1fr);
      }
      .sidebar-area {
        width: 250px;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      .sidebar-area {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .post-content {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 414px) {
      .post-content {
        padding: var(--spacing-sm) var(--spacing-md);
      }
    }
  </style>
  ```

- [ ] **Step 2：型別檢查**

  ```bash
  npx astro check
  ```
  預期：無錯誤

- [ ] **Step 3：Commit**

  ```bash
  git add src/layouts/SeriesLayout.astro
  git commit -m "style(series): CSS 全面替換為設計令牌，統一響應式斷點"
  ```

---

### Task 4：SeriesLayout HTML 加入序號

**Files:**
- Modify: `src/layouts/SeriesLayout.astro` — posts-list 的 map 迴圈

- [ ] **Step 1：找到 `seriesPosts.map(post => (` 這行，改為帶 index 的版本**

  **Before（第 80 行附近）：**
  ```astro
  {seriesPosts.map(post => (
    <article class="post-card">
      <div class="post-content">
  ```

  **After：**
  ```astro
  {seriesPosts.map((post, index) => (
    <article class="post-card">
      <div class="post-sequence">{String(index + 1).padStart(2, '0')}</div>
      <div class="post-content">
  ```

- [ ] **Step 2：型別檢查**

  ```bash
  npx astro check
  ```

- [ ] **Step 3：Commit**

  ```bash
  git add src/layouts/SeriesLayout.astro
  git commit -m "feat(series): 系列文章卡片加入序號標示"
  ```

---

### Task 5：EpicLayout CSS 修正

**Files:**
- Modify: `src/layouts/EpicLayout.astro` — `<style>` 區塊（第 129–394 行）

- [ ] **Step 1：在現有 CSS 基礎上補充以下修正**

  #### 加入卡片背景、邊框與 hover 效果（`.post-card` 區塊）

  **Before：**
  ```css
  .post-card {
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: transform var(--transition-slow);
    margin-bottom: var(--spacing-lg);
  }
  ```

  **After：**
  ```css
  .post-card {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: transform var(--transition-slow), box-shadow var(--transition-slow);
    margin-bottom: var(--spacing-lg);
  }

  .post-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  ```

  #### 修正斷點（`@media` 區塊）

  **Before：**
  ```css
  @media (max-width: 1200px) {
    .main-content {
      grid-template-columns: 250px minmax(0, 1fr);
    }
    .sidebar-area {
      width: 250px;
    }
  }

  @media (max-width: 992px) {
    .main-content {
      grid-template-columns: 1fr;
    }
    .sidebar-area {
      display: none;
    }
    .title-section {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }
  }

  @media (max-width: 768px) {
    .article-count {
      font-size: var(--font-size-xs);
      padding: var(--spacing-xs);
    }
  }
  ```

  **After：**
  ```css
  @media (max-width: 1024px) {
    .main-content {
      grid-template-columns: 250px minmax(0, 1fr);
    }
    .sidebar-area {
      width: 250px;
    }
  }

  @media (max-width: 768px) {
    .main-content {
      grid-template-columns: 1fr;
    }
    .sidebar-area {
      display: none;
    }
    .title-section {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }
    .article-count {
      font-size: var(--font-size-xs);
      padding: var(--spacing-xs);
    }
  }

  @media (max-width: 480px) {
    .post-content {
      padding: var(--spacing-md);
    }
  }

  @media (max-width: 414px) {
    .post-content {
      padding: var(--spacing-sm) var(--spacing-md);
    }
  }
  ```

- [ ] **Step 2：型別檢查**

  ```bash
  npx astro check
  ```

- [ ] **Step 3：Commit**

  ```bash
  git add src/layouts/EpicLayout.astro
  git commit -m "style(epic): 補上卡片背景/邊框/hover，統一響應式斷點"
  ```

---

### Task 6：Category CSS 完整替換

**Files:**
- Modify: `src/pages/categories/[...category].astro` — `<style>` 區塊（第 184–390 行）

- [ ] **Step 1：整個替換 `<style define:vars={{ accentColor }}>` 區塊**

  ```css
  <style define:vars={{ accentColor }}>
    body {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .category-container {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      flex: 1;
    }

    .main-content {
      display: grid;
      grid-template-columns: 300px minmax(0, 1fr);
      gap: var(--spacing-xl);
      margin: var(--spacing-xl) 0 var(--spacing-2xl);
      max-width: var(--container-xl);
      margin-left: auto;
      margin-right: auto;
      padding-left: var(--spacing-md);
      padding-right: var(--spacing-md);
    }

    .sidebar-area {
      width: 300px;
    }

    .widget-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xl);
    }

    .content-area {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      width: 100%;
    }

    .page-header {
      margin-bottom: var(--spacing-xl);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border-light);
    }

    .title-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--spacing-sm);
    }

    .page-header h1 {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-bold);
      margin: 0;
      color: var(--accentColor);
    }

    .article-count {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: var(--font-size-sm);
      color: var(--text-muted);
      background-color: rgba(var(--color-gray-light), 0.1);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-radius: var(--radius-md);
      font-weight: var(--font-weight-medium);
    }

    .article-count svg {
      color: var(--accentColor);
    }

    .page-header p {
      font-size: var(--font-size-base);
      color: var(--text-muted);
      margin: 0;
    }

    .posts-list {
      width: 100%;
      margin-bottom: var(--spacing-xl);
    }

    .post-card {
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      transition: transform var(--transition-slow), box-shadow var(--transition-slow);
      margin-bottom: var(--spacing-lg);
    }

    .post-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .post-content {
      padding: var(--spacing-md) var(--spacing-lg);
    }

    .post-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: calc(var(--spacing-md) - var(--spacing-xs));
      padding-bottom: calc(var(--spacing-md) - var(--spacing-xs));
      border-bottom: 1px dashed var(--card-border);
    }

    .post-date {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .post-tags {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    .post-tags svg {
      color: var(--accentColor);
    }

    .tag-list {
      font-size: var(--font-size-xs);
    }

    .tag-link {
      color: var(--text-secondary);
      text-decoration: none;
      transition: color var(--transition-normal);
    }

    .tag-link:hover {
      color: var(--accentColor);
    }

    .post-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      margin: calc(var(--spacing-md) - var(--spacing-xs)) 0;
    }

    .post-title a {
      color: var(--text-primary);
      text-decoration: none;
      transition: color var(--transition-normal);
    }

    .post-title a:hover {
      color: var(--accentColor);
    }

    .post-description {
      font-size: var(--font-size-base);
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: calc(var(--spacing-md) + var(--spacing-xs));
    }

    .read-more {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: calc(var(--font-size-base) - 0.05rem);
      font-weight: var(--font-weight-medium);
      color: var(--accentColor);
      text-decoration: none;
      transition: color var(--transition-normal);
    }

    .read-more:hover {
      opacity: 0.8;
    }

    .no-posts {
      width: 100%;
      text-align: center;
      padding: var(--spacing-3xl, 4rem) var(--spacing-xl);
      background-color: var(--color-bg-secondary);
      border-radius: var(--radius-md);
      color: var(--text-muted);
    }

    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 250px minmax(0, 1fr);
      }
      .sidebar-area {
        width: 250px;
      }
    }

    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
      }
      .sidebar-area {
        display: none;
      }
      .title-section {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
      }
    }

    @media (max-width: 480px) {
      .post-content {
        padding: var(--spacing-md);
      }
    }

    @media (max-width: 414px) {
      .post-content {
        padding: var(--spacing-sm) var(--spacing-md);
      }
    }
  </style>
  ```

- [ ] **Step 2：型別檢查**

  ```bash
  npx astro check
  ```

- [ ] **Step 3：Commit**

  ```bash
  git add src/pages/categories/[...category].astro
  git commit -m "style(category): CSS 全面替換為設計令牌，統一響應式斷點，補上卡片視覺"
  ```

---

## Chunk 3：JSON-LD 結構化資料

### Task 7：EpicLayout 加入 CollectionPage JSON-LD

**Files:**
- Modify: `src/layouts/EpicLayout.astro` — frontmatter 與 `<head>`

- [ ] **Step 1：在 frontmatter 區塊（`---` 內）尾端加入 JSON-LD 建構邏輯**

  在 `const epicPosts = source?.sort(...)` 之後加入：

  ```typescript
  // 輔助：取得 cover image URL（支援 Astro image() 物件與字串）
  function getCoverUrl(post: any, site: URL): string | null {
    const cover = post.data.coverImage ?? post.data.cover;
    if (!cover) return null;
    if (typeof cover === 'string') return new URL(cover, site).href;
    if (cover?.src) return new URL(cover.src, site).href;
    return null;
  }

  const epicJsonLd = Astro.site ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": new URL(`/${epicName}/`, Astro.site).href,
        "name": `${epicTitle} | ${SITE_TITLE}`,
        "description": epicDescription,
        "url": new URL(`/${epicName}/`, Astro.site).href,
        "inLanguage": "zh-TW",
        "numberOfItems": epicPosts.length,
        "itemListElement": epicPosts.slice(0, 10).map((post: any, index: number) => {
          const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
          const coverUrl = getCoverUrl(post, Astro.site!);
          return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Article",
              "@id": new URL(`/post/${path}/`, Astro.site).href,
              "url": new URL(`/post/${path}/`, Astro.site).href,
              "name": post.data.title,
              "description": post.data.description,
              "datePublished": post.data.date.toISOString(),
              ...(coverUrl ? { "image": { "@type": "ImageObject", "url": coverUrl } } : {})
            }
          };
        })
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "首頁", "item": Astro.site.href },
          { "@type": "ListItem", "position": 2, "name": epicTitle, "item": new URL(`/${epicName}/`, Astro.site).href }
        ]
      }
    ]
  } : null;
  ```

- [ ] **Step 2：在 `<head>` 的 `<BaseHead />` 之後加入 JSON-LD script**

  ```astro
  {epicJsonLd && (
    <script type="application/ld+json" set:html={JSON.stringify(epicJsonLd)} />
  )}
  ```

- [ ] **Step 3：型別檢查**

  ```bash
  npx astro check
  ```

  > 若遇到 `any` 型別警告，可在 frontmatter 頂部加入 `import type { CollectionEntry } from 'astro:content';` 並將 `any` 替換為 `CollectionEntry<'blog'>`。

- [ ] **Step 4：Commit**

  ```bash
  git add src/layouts/EpicLayout.astro
  git commit -m "feat(seo): EpicLayout 加入 CollectionPage + BreadcrumbList JSON-LD"
  ```

---

### Task 8：SeriesLayout 加入 ItemList JSON-LD

**Files:**
- Modify: `src/layouts/SeriesLayout.astro` — frontmatter 與 `<head>`

- [ ] **Step 1：在 `const seriesGroups = ...` 之後加入 JSON-LD 建構邏輯**

  > 注意：SeriesLayout 的 `seriesName` 是系列識別名稱，`seriesTitle` 是顯示標題。

  ```typescript
  function getCoverUrl(post: any, site: URL): string | null {
    const cover = post.data.coverImage ?? post.data.cover;
    if (!cover) return null;
    if (typeof cover === 'string') return new URL(cover, site).href;
    if (cover?.src) return new URL(cover.src, site).href;
    return null;
  }

  const seriesJsonLd = Astro.site ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "@id": new URL(`/series/${seriesName}/`, Astro.site).href,
        "name": seriesTitle,
        "url": new URL(`/series/${seriesName}/`, Astro.site).href,
        "inLanguage": "zh-TW",
        "numberOfItems": seriesPosts.length,
        "itemListOrder": "https://schema.org/ItemListOrderAscending",
        "itemListElement": seriesPosts.map((post: any, index: number) => {
          const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
          const coverUrl = getCoverUrl(post, Astro.site!);
          return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Article",
              "@id": new URL(`/post/${path}/`, Astro.site).href,
              "url": new URL(`/post/${path}/`, Astro.site).href,
              "name": post.data.title,
              "description": post.data.description,
              "datePublished": post.data.date.toISOString(),
              ...(coverUrl ? { "image": { "@type": "ImageObject", "url": coverUrl } } : {})
            }
          };
        })
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "首頁", "item": Astro.site.href },
          { "@type": "ListItem", "position": 2, "name": "系列文章", "item": new URL("/series/", Astro.site).href },
          { "@type": "ListItem", "position": 3, "name": seriesTitle, "item": new URL(`/series/${seriesName}/`, Astro.site).href }
        ]
      }
    ]
  } : null;
  ```

- [ ] **Step 2：在 `<head>` 的 `<BaseHead />` 之後加入 JSON-LD script**

  ```astro
  {seriesJsonLd && (
    <script type="application/ld+json" set:html={JSON.stringify(seriesJsonLd)} />
  )}
  ```

- [ ] **Step 3：型別檢查**

  ```bash
  npx astro check
  ```

- [ ] **Step 4：Commit**

  ```bash
  git add src/layouts/SeriesLayout.astro
  git commit -m "feat(seo): SeriesLayout 加入 ItemList + BreadcrumbList JSON-LD"
  ```

---

### Task 9：Category JSON-LD ListItem 修正

**Files:**
- Modify: `src/pages/categories/[...category].astro` — frontmatter 第 73–89 行

- [ ] **Step 1：找到現有 `categoryJsonLd` 物件，替換 `itemListElement` 的內容**

  **Before（第 73-89 行）：**
  ```typescript
  const categoryJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${formattedCategory} - 伊恩的開發狂想`,
    description: `探索「${formattedCategory}」分類下的 ${categoryCount} 篇文章`,
    url: new URL(`/categories/${category}/`, Astro.site).href,
    numberOfItems: categoryCount,
    itemListElement: filteredPosts.slice(0, 10).map((post, index) => {
      const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
      return {
        "@type": "ListItem",
        position: index + 1,
        url: new URL(`/post/${path}/`, Astro.site).href,
        name: post.data.title,
      };
    }),
  };
  ```

  **After：**
  ```typescript
  function getCoverUrl(post: any, site: URL): string | null {
    const cover = post.data.coverImage ?? post.data.cover;
    if (!cover) return null;
    if (typeof cover === 'string') return new URL(cover, site).href;
    if (cover?.src) return new URL(cover.src, site).href;
    return null;
  }

  const categoryJsonLd = Astro.site ? {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": new URL(`/categories/${category}/`, Astro.site).href,
        "name": `${formattedCategory} | 伊恩的開發狂想`,
        "description": `探索「${formattedCategory}」分類下的 ${categoryCount} 篇技術文章`,
        "url": new URL(`/categories/${category}/`, Astro.site).href,
        "inLanguage": "zh-TW",
        "numberOfItems": categoryCount,
        "itemListElement": filteredPosts.slice(0, 10).map((post, index) => {
          const path = post.id.slice(0, post.id.lastIndexOf("/")).toLowerCase();
          const coverUrl = getCoverUrl(post, Astro.site!);
          return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Article",
              "@id": new URL(`/post/${path}/`, Astro.site).href,
              "url": new URL(`/post/${path}/`, Astro.site).href,
              "name": post.data.title,
              "description": post.data.description,
              "datePublished": post.data.date.toISOString(),
              ...(coverUrl ? { "image": { "@type": "ImageObject", "url": coverUrl } } : {})
            }
          };
        })
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "首頁", "item": Astro.site.href },
          { "@type": "ListItem", "position": 2, "name": "分類", "item": new URL("/categories/", Astro.site).href },
          { "@type": "ListItem", "position": 3, "name": formattedCategory, "item": new URL(`/categories/${category}/`, Astro.site).href }
        ]
      }
    ]
  } : null;
  ```

- [ ] **Step 2：確認 `<script type="application/ld+json">` 對應的變數名稱還正確**

  `<head>` 中應為：
  ```astro
  {categoryJsonLd && (
    <script type="application/ld+json" set:html={JSON.stringify(categoryJsonLd)} />
  )}
  ```

  若原本是 `set:html={JSON.stringify(categoryJsonLd)}`（無條件判斷）也沒問題，保留即可。

- [ ] **Step 3：型別檢查**

  ```bash
  npx astro check
  ```

- [ ] **Step 4：Commit**

  ```bash
  git add src/pages/categories/[...category].astro
  git commit -m "fix(seo): Category JSON-LD 補上 item 包裝、image 欄位與 BreadcrumbList"
  ```

---

## Chunk 4：最終驗證

### Task 10：完整 Build 驗證

- [ ] **Step 1：執行完整 build**

  ```bash
  npm run build
  ```

  預期：無錯誤，正常完成。

- [ ] **Step 2：啟動 Preview 並視覺檢查**

  ```bash
  npm run preview
  ```

  檢查清單：
  - [ ] Series 頁面卡片有序號（01、02...）
  - [ ] Epic / Category / Series 頁面卡片有背景色和邊框
  - [ ] Hover 卡片時有浮起動畫與陰影
  - [ ] 1024px 寬度時 sidebar 縮至 250px（非隱藏）
  - [ ] 768px 寬度時 sidebar 完全隱藏
  - [ ] 414px 手機寬度版面正常

- [ ] **Step 3：用瀏覽器 DevTools 確認 JSON-LD**

  開啟 Epic / Series / Category 頁面，在 Console 執行：
  ```javascript
  JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)
  ```
  預期：回傳結構正確的 JSON 物件，包含 `@graph` 陣列。

- [ ] **Step 4：確認 meta description 不再是固定全域值**

  檢查 SeriesLayout 和 Category 頁面的 `<meta name="description">` 是否包含動態內容（篇數、第一篇文章摘要等）。
