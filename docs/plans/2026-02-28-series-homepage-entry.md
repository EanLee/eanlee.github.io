# 系列文章首頁入口 + isPartOf Schema 實作計畫

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在首頁新增系列文章展示區塊，建立 `/series/` 總覽落地頁，並為系列文章補上 `isPartOf` Schema。

**Architecture:** 抽取共用 `getSeriesData()` / `groupSeriesByEpic()` 工具函數至 `src/utils/series.ts`，供 `/series/index.astro`（總覽頁）與 `SeriesShowcase.astro`（首頁組件）共用；`BlogPost.astro` 的 isPartOf 修改獨立進行。

**Tech Stack:** Astro 5 (SSG), TypeScript, Schema.org JSON-LD, CSS design tokens (`var(--...)`)

**Build command:** `npm run build`（含 `astro check` TypeScript 驗證 + `pagefind` 搜尋索引重建）

---

## 實作順序

```
Task 1: src/consts.ts              ← EPIC_LABELS（其餘全部依賴）
Task 2: src/utils/series.ts        ← 共用資料邏輯（Task 4、5 依賴）
Task 3: BlogPost.astro             ← isPartOf Schema（獨立，與 1-2 無依賴）
Task 4: src/pages/series/index.astro ← 總覽落地頁（依賴 Task 1、2）
Task 5: src/components/SeriesShowcase.astro ← 首頁組件（依賴 Task 1、2）
Task 6: src/pages/index.astro      ← 插入 SeriesShowcase（依賴 Task 5）
```

---

## Task 1：`src/consts.ts` 加入 EPIC_LABELS

**Files:**
- Modify: `src/consts.ts`

### Step 1：在現有 exports 末尾加入

```typescript
// 在 ABOUT_ME 之後加入（檔案末尾）
export const EPIC_LABELS: Record<string, string> = {
  software:   "軟體開發",
  management: "管理經驗",
  reading:    "閱讀心得",
  growth:     "自我成長",
};
```

### Step 2：驗證 TypeScript 無錯誤

```bash
npx astro check
```

Expected: 無 error 輸出

### Step 3：Commit

```bash
git add src/consts.ts
git commit -m "chore: 新增 EPIC_LABELS 常數，集中管理 epic 顯示名稱"
```

---

## Task 2：新建 `src/utils/series.ts`

**Files:**
- Create: `src/utils/series.ts`

> `src/utils/` 已存在（含 `readingTime.ts`），直接新建即可。

### Step 1：建立檔案

完整內容如下：

```typescript
import type { CollectionEntry } from "astro:content";

export interface SeriesInfo {
  /** URL segment，例：`"build-automated-deploy"` */
  seriesPath: string;
  /** frontmatter `series` 欄位的值，例：`"從零打造 CI/CD 自動化部署"` */
  seriesTitle: string;
  /** epic 識別字，例：`"software"` */
  epic: string;
  /** 系列中的文章篇數 */
  count: number;
  /** 系列中最新文章的 date */
  latestDate: Date;
}

/**
 * 從所有部落格文章推導系列資訊列表，按文章數降序排列。
 *
 * post.id 路徑結構：
 *   "software/series/build-automated-deploy/article-slug/index.md"
 *   segments[-3] = "build-automated-deploy" → seriesPath
 */
export function getSeriesData(posts: CollectionEntry<"blog">[]): SeriesInfo[] {
  const seriesMap = new Map<string, SeriesInfo>();

  for (const post of posts) {
    if (!post.data.series) continue;

    const segments = post.id.split("/");
    const seriesPath = segments[segments.length - 3].toLowerCase();
    const epic = (post.data.epic || segments[0]).toLowerCase();

    if (!seriesMap.has(seriesPath)) {
      seriesMap.set(seriesPath, {
        seriesPath,
        seriesTitle: post.data.series,
        epic,
        count: 0,
        latestDate: post.data.date,
      });
    }

    const entry = seriesMap.get(seriesPath)!;
    entry.count++;
    if (post.data.date > entry.latestDate) {
      entry.latestDate = post.data.date;
    }
  }

  return Array.from(seriesMap.values()).sort((a, b) => b.count - a.count);
}

/**
 * 將系列列表按 epic 分組，回傳有序的 `[epic, SeriesInfo[]]` 陣列。
 * 已知 epic 按 EPIC_ORDER 排序，未知 epic 排在最後。
 */
export function groupSeriesByEpic(
  seriesList: SeriesInfo[]
): [string, SeriesInfo[]][] {
  const EPIC_ORDER = ["software", "management", "reading", "growth"];
  const grouped = new Map<string, SeriesInfo[]>();

  for (const series of seriesList) {
    if (!grouped.has(series.epic)) grouped.set(series.epic, []);
    grouped.get(series.epic)!.push(series);
  }

  return [...grouped.entries()].sort(([a], [b]) => {
    const ai = EPIC_ORDER.indexOf(a);
    const bi = EPIC_ORDER.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}
```

### Step 2：驗證 TypeScript

```bash
npx astro check
```

Expected: 無 error

### Step 3：Commit

```bash
git add src/utils/series.ts
git commit -m "feat: 新增 series 工具函數，提供 getSeriesData / groupSeriesByEpic"
```

---

## Task 3：`BlogPost.astro` 加入 isPartOf Schema

**Files:**
- Modify: `src/layouts/BlogPost.astro`（約第 98 行，`jsonLd` 物件末尾）

> `series` 和 `seriesPath` 變數已於第 18、29-31 行推導，直接使用。

### Step 1：在 `jsonLd` 物件的 `inLanguage` 之後加入 spread

找到此段（約第 96-98 行）：

```typescript
  wordCount: wordCount,
  inLanguage: "zh-TW",
};
```

改為：

```typescript
  wordCount: wordCount,
  inLanguage: "zh-TW",
  ...(series && seriesPath && {
    isPartOf: {
      "@type": "CollectionPage",
      "@id": new URL(`/series/${seriesPath}/`, Astro.site).href,
      name: series,
    },
  }),
};
```

### Step 2：驗證（build）

```bash
npm run build
```

Expected: build 成功，無 error

### Step 3：手動驗證 Schema 輸出

用瀏覽器開任一系列文章（例：`/post/software/series/build-automated-deploy/cicd_concept/`），
開 DevTools → 搜尋 `isPartOf`，確認 JSON-LD 中出現：

```json
"isPartOf": {
  "@type": "CollectionPage",
  "@id": "https://eandev.com/series/build-automated-deploy/",
  "name": "從零打造 CI/CD 自動化部署"
}
```

非系列文章不應出現 `isPartOf`。

### Step 4：Commit

```bash
git add src/layouts/BlogPost.astro
git commit -m "feat(seo): 系列文章 JSON-LD 加入 isPartOf，指向系列索引頁"
```

---

## Task 4：新建 `src/pages/series/index.astro`

**Files:**
- Create: `src/pages/series/index.astro`

> `src/pages/series/[...slug].astro` 已存在，此為同目錄下新增 `index.astro`，對應 URL `/series/`。

### Step 1：建立檔案

```astro
---
import { getCollection } from "astro:content";
import BaseHead from "../../components/BaseHead.astro";
import Header from "../../components/Header.astro";
import Footer from "../../components/Footer.astro";
import { SITE_TITLE, EPIC_LABELS } from "../../consts";
import { getSeriesData, groupSeriesByEpic } from "../../utils/series";

const allPosts = await getCollection("blog");
const seriesList = getSeriesData(allPosts);
const groupedSeries = groupSeriesByEpic(seriesList);

const formatDate = (date: Date) =>
  date.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit" });

// CollectionPage + ItemList Schema（與 /categories/ 頁面格式一致）
const collectionPageSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: `系列文章 - ${SITE_TITLE}`,
  description: "按主題組織的完整學習路徑",
  url: new URL("/series/", Astro.site).href,
  numberOfItems: seriesList.length,
  itemListElement: seriesList.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: new URL(`/series/${s.seriesPath}/`, Astro.site).href,
    name: s.seriesTitle,
  })),
};
---

<!doctype html>
<html lang="zh-TW">
  <head>
    <BaseHead
      title={`系列文章 - ${SITE_TITLE}`}
      description="按主題組織的完整學習路徑，從 CI/CD、Docker 到系統架構設計"
    />
    <script type="application/ld+json" set:html={JSON.stringify(collectionPageSchema)} />
  </head>
  <body>
    <Header />
    <main class="series-index">
      <div class="container">
        <h1>系列文章</h1>
        <p class="subtitle">按主題組織的完整學習路徑</p>

        {groupedSeries.map(([epic, series]) => (
          <section class="epic-group">
            <h2 class="epic-title">{EPIC_LABELS[epic] ?? epic}</h2>
            <div class="series-grid">
              {series.map((s) => (
                <a href={`/series/${s.seriesPath}/`} class="series-card">
                  <h3 class="card-title">{s.seriesTitle}</h3>
                  <div class="card-meta">
                    <span>{s.count} 篇</span>
                    <span>更新於 {formatDate(s.latestDate)}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  body {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .series-index {
    flex: 1;
  }

  .container {
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  h1 {
    font-size: var(--font-size-2xl);
    margin-bottom: var(--spacing-xs);
  }

  .subtitle {
    color: var(--color-text-muted);
    margin-bottom: var(--spacing-2xl);
  }

  .epic-group {
    margin-bottom: var(--spacing-2xl);
  }

  .epic-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-muted);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .series-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }

  .series-card {
    display: block;
    padding: var(--spacing-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--color-text);
    background: var(--color-bg-secondary);
    transition:
      box-shadow var(--transition-normal),
      transform var(--transition-normal);
  }

  .series-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .card-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
    color: var(--color-text);
  }

  .card-meta {
    display: flex;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  @media (max-width: 768px) {
    .series-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .series-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

### Step 2：驗證（build + 頁面存在）

```bash
npm run build
```

Expected: 無 error，`dist/series/index.html` 存在

```bash
ls dist/series/
```

Expected: 看到 `index.html` 和各系列目錄

### Step 3：啟動 dev server 目視確認

```bash
npm run dev
```

瀏覽器開 `http://localhost:4321/series/`，確認：
- 顯示「系列文章」標題
- 系列按 epic 分組（目前只有「軟體開發」）
- 每張卡顯示系列名、篇數、更新日期
- 點卡片跳到對應 `/series/{slug}/` 頁面

### Step 4：Commit

```bash
git add src/pages/series/index.astro
git commit -m "feat: 新增系列文章總覽頁 /series/"
```

---

## Task 5：新建 `src/components/SeriesShowcase.astro`

**Files:**
- Create: `src/components/SeriesShowcase.astro`

### Step 1：建立檔案

```astro
---
import type { CollectionEntry } from "astro:content";
import { EPIC_LABELS } from "../consts";
import { getSeriesData, groupSeriesByEpic } from "../utils/series";

interface Props {
  posts: CollectionEntry<"blog">[];
}

const { posts } = Astro.props;
const seriesList = getSeriesData(posts);
const groupedSeries = groupSeriesByEpic(seriesList);

const formatDate = (date: Date) =>
  date.toLocaleDateString("zh-TW", { year: "numeric", month: "2-digit" });
---

<section class="series-showcase">
  <div class="section-header">
    <h2 class="section-title">系列文章</h2>
    <a href="/series/" class="view-all">全部系列 →</a>
  </div>

  {groupedSeries.map(([epic, series]) => (
    <div class="epic-group">
      <h3 class="epic-label">{EPIC_LABELS[epic] ?? epic}</h3>
      <div class="series-grid">
        {series.map((s) => (
          <a href={`/series/${s.seriesPath}/`} class="series-card">
            <span class="card-title">{s.seriesTitle}</span>
            <div class="card-meta">
              <span>{s.count} 篇</span>
              <span>更新於 {formatDate(s.latestDate)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  ))}

  <p class="tags-entry">
    也可以用 <a href="/tags/">標籤</a> 探索文章
  </p>
</section>

<style>
  .series-showcase {
    width: 100%;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }

  .section-title {
    font-size: var(--font-size-xl);
    font-weight: 700;
    margin: 0;
  }

  .view-all {
    font-size: var(--font-size-sm);
    color: var(--color-primary);
    text-decoration: none;
  }

  .view-all:hover {
    text-decoration: underline;
  }

  .epic-group {
    margin-bottom: var(--spacing-xl);
  }

  .epic-label {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: var(--spacing-xs);
    margin-bottom: var(--spacing-md);
  }

  .series-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
  }

  .series-card {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--color-text);
    background: var(--color-bg-secondary);
    transition:
      box-shadow var(--transition-normal),
      transform var(--transition-normal);
  }

  .series-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .card-title {
    font-size: var(--font-size-base);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.4;
  }

  .card-meta {
    display: flex;
    gap: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
  }

  .tags-entry {
    margin-top: var(--spacing-md);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    text-align: right;
  }

  .tags-entry a {
    color: var(--color-primary);
  }

  @media (max-width: 768px) {
    .series-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .series-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

### Step 2：驗證 TypeScript

```bash
npx astro check
```

Expected: 無 error

### Step 3：Commit

```bash
git add src/components/SeriesShowcase.astro
git commit -m "feat: 新增 SeriesShowcase 首頁組件，展示系列文章入口"
```

---

## Task 6：`index.astro` 插入 SeriesShowcase

**Files:**
- Modify: `src/pages/index.astro`

### Step 1：加入 import（frontmatter 區）

找到現有 import 群組（約第 11 行），在最後一個 import 後加入：

```typescript
import SeriesShowcase from "../components/SeriesShowcase.astro";
```

### Step 2：插入組件（template 區）

找到此段（約第 163-168 行）：

```astro
        <!-- Category Grid -->
        <CategoryGrid allPosts={allPosts} />

        <!-- Follow CTA -->
        <FollowCTA />
```

改為：

```astro
        <!-- Category Grid -->
        <CategoryGrid allPosts={allPosts} />

        <!-- Series Showcase -->
        <SeriesShowcase posts={allPosts} />

        <!-- Follow CTA -->
        <FollowCTA />
```

> `allPosts` 已在 frontmatter 第 14 行用 `getCollection("blog")` 取得，直接傳入，不重複呼叫。

### Step 3：驗證（build）

```bash
npm run build
```

Expected: 無 error

### Step 4：dev server 目視確認首頁

```bash
npm run dev
```

瀏覽器開 `http://localhost:4321/`，捲動確認：
- CategoryGrid 之後出現「系列文章」區塊
- 顯示 6 個系列卡片，按 epic 分組
- 每張卡有系列名、篇數、更新日期
- 「全部系列 →」點擊跳到 `/series/`
- 「標籤」連結跳到 `/tags/`
- FollowCTA 仍在 SeriesShowcase 之後

### Step 5：Commit

```bash
git add src/pages/index.astro
git commit -m "feat: 首頁插入 SeriesShowcase，新增系列文章探索入口"
```

---

## 完成後驗證清單

- [ ] `/series/` 頁面存在且顯示正常
- [ ] `/series/` 頁面有 CollectionPage JSON-LD（DevTools 檢查）
- [ ] 系列文章頁有 isPartOf JSON-LD（DevTools 檢查）
- [ ] 首頁 SeriesShowcase 顯示全部 6 個系列
- [ ] 「全部系列 →」連到 `/series/`
- [ ] 「標籤」連到 `/tags/`
- [ ] 手機版（480px）卡片單欄顯示
- [ ] TypeScript 無 error（`npx astro check`）
- [ ] Build 成功（`npm run build`）
